import { secretKey } from './../data/database/index'
import { createRandomString } from '../libs/createRandomString'
import { UserModel } from '../data/database/models/UserModel'
import { CreateUserContracts, LoginUserContract, UpdateUserContracts } from './../data/contracts/user.contracts'
import {
  JsonController,
  Body,
  Post,
  Get,
  UseBefore,
  Req,
  Params,
  Patch,
  QueryParams,
} from 'routing-controllers'
import { IsValidPassword } from '../libs/isValidVassword'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { checkToken } from '../libs/checkToken'
import { AuthMiddleware } from '~/middleware/auth.middleware'
import { Reposity } from '~/data/reposityes'
import { IResponse } from '~/data/interfaces'
import { IUserModel } from '~/data/entities/UserEntity'
import { AdminMiddleware } from '~/middleware/admin.middleware'
import { Permissions } from '~/libs/Permissions'

@JsonController('/user')
export class UserController {
  
  @Post('/create-user')
  async createUser (@Body() userform: CreateUserContracts) {
    const isUserExists = await UserModel.findOne({ where: { email: userform.email } })

    if (isUserExists) return {
      status: 301,
      message: 'Пользователь с таким email уже существует',
      error: 'DataIsExists'
    }

    const isPasswordValid = await IsValidPassword(userform.password, userform.firstname)

    if (!isPasswordValid.ok) return {
      status: 301,
      message: isPasswordValid.message,
      error: isPasswordValid.warning,
    }

    const hash = createRandomString(15)
    const hashPassword = await bcrypt.hash(userform.password, 10)

    const user = await UserModel.create({
      email: userform.email,
      hash,
      password: hashPassword,
      firstname: userform.firstname,
    })

    await Reposity.users.addUserToList(user.dataValues.id)

    const token: string = await jwt.sign(
      {
        id: user.dataValues.id,
        name: user.dataValues.username,
      },
      secretKey,
      {
        expiresIn: '15d',
      }
    )

    return {
      status: 200,
      body: {
        user: user.dataValues,
        token,
      }
    }
  }

  @Post('/login')
  async login (@Body() body: LoginUserContract) {
    const user = await UserModel.findOne({ where: { email: body.email } })

    if (!user) return {
      status: 404,
      message: 'Пользовательн с таким email не найден',
      error: "Invalid",
    }

    const isPassword = await bcrypt.compare(
      body.password,
      user.dataValues.password
    )

    if (!isPassword) return {
      message: 'Пароль не совпадает',
      status: 301,
      error: "Invalid",
    }

    const token: string = await jwt.sign(
      {
        id: user.dataValues.id,
        name: user.dataValues.username,
      },
      secretKey,
      {
        expiresIn: '15d',
      }
    )

    const permissions = Permissions.getRolePermissions(user.dataValues.role)

    return {
      status: 200,
      message: 'Пользователь авторизован',
      body: {
        token,
        user: user.dataValues,
        permissions,
      }
    }
  }

  @Post('/check-token')
  async checkToken (@Body() body): Promise<IResponse<any>> {
    try {
      const { token } = body

      const isValid = await checkToken(token)
  
      const role = isValid.user?.role

      if (!role) throw new Error('Не удалось установить роль пользоватея')

      const permissions = Permissions.getRolePermissions(role)
  
      return {
        status: isValid.status,
        message: isValid.message,
        error: isValid.error || null,
        body: {
          permissions,
        },
      }
    } catch (e) {
      return {
        status: 401,
        message: 'Не удалось проверить токен',
        error: new Error(e),
        exeption: {
          type: 'Unexepted',
          message: new Error(e).message
        }
      }
    }
  }

  @Get('/get-cart')
  @UseBefore(AuthMiddleware)
  async getBasket (@Req() request) {
    const user = Reposity.users.findByID(request.user.id)
    const cart = await user.getBasket()

    return {
      status: 200,
      message: 'Корзина получена',
      body: {
        cart,
      }
    }
  }

  @Get('/user-list')
  @UseBefore(AdminMiddleware)
  async getList (@QueryParams() query, @Req() request): Promise<IResponse> {
    try {
      const userModel = request.user
      const user = Reposity.users.findByID(userModel.id)

      if (!user.rolePermissions.user.includes('read')) return {
        status: 403,
        message: 'У вас нет доступа для чтения списка пользователей',
        exeption: {
          type: 'PermissionDied',
          message: 'have not permission "read" in user permissions'
        }
      }

      const options = {
        search: query.search,
        role: query.role || null
      }

      const result = Reposity.users.getList(options)

      return {
        status: 200,
        message: 'Список пользователей получен',
        body: {
          totalCount: result.length,
          users: result,
        }
      }
    } catch (e) {
      const error = new Error(e)
      return {
        status: 501,
        message: 'Не удалось получить список пользователей',
        error: error,
        exeption: {
          type: 'Unexepted',
          message: error.message
        }
      }
    }
  }

  @Get('/profile')
  @UseBefore(AuthMiddleware)
  async getProfile (@Req() request): Promise<IResponse<any>> {
    try {
      const user: IUserModel = request.user
      const profile = Reposity.users.getProfile(user.id)
      
      return {
        status: 200,
        message: 'Профиль получен',
        body: {
          profile: profile,
        }
      }
    } catch (error) {
      return {
        status: 501,
        message: 'Неожиданная ошибка сервера',
        error: new Error(error),
        exeption: {
          type: 'Unexepted',
          message: new Error(error).message,
        }
      }
    }
  }

  @Get('/get-user/:id')
  @UseBefore(AdminMiddleware)
  async getUser (@Req() request, @Params() params): Promise<IResponse<any>> {
    try {
      const { id } = params

      if (!id) return {
        status: 301,
        message: 'Не корректный запрос',
        exeption: {
          type: 'Invalid',
          message: 'Have not param "id" in request'
        }
      }

      const adminModel: IUserModel = request.user
      const admin = Reposity.users.findByID(adminModel.id)

      if (!admin.rolePermissions.user.includes('read')) return {
        status: 301,
        message: 'Вы не имеете доступ к просмотру пользователей',
        exeption: {
          type: 'PermissionDied',
          message: 'Have not permission "read" in users permissions'
        }
      }

      const user = Reposity.users.findByID(id)

      return {
        status: 200,
        message: 'Пользователь получен',
        body: {
          user,
          profile: user.profile,
          permissions: user.rolePermissions,
        },
      }
    } catch (error) {
      return {
        status: 501,
        message: 'Не удалось получить пользователя',
        error: new Error(error),
        exeption: {
          message: new Error(error).message,
          type: 'Unexepted'
        }
      }
    }
  }

  @Patch('/update-user/:id')
  @UseBefore(AuthMiddleware)
  async updateUser (@Req() request, @Params() params, @Body() body: UpdateUserContracts): Promise<IResponse<any>> {
    try {
      const { id } = params
      const userModel: IUserModel = request.user
  
      if (!id || !userModel) return {
        status: 301,
        message: 'Не корректный запрос',
        exeption: {
          message: 'Invalid params in request',
          type: 'Invalid'
        }
      }

      const user = Reposity.users.findByID(userModel.id)

      if (user.id !== id && !user.rolePermissions.user.includes('update')) return {
        status: 301,
        message: 'Не удалось обновить пользователя',
        exeption: {
          type: 'Unexepted',
          message: 'Have not permission'
        }
      }

      return await Reposity.users.updateUser(body, id)
    } catch (error) {
      return {
        status: 501,
        message: 'Не удалось обновить пользователя',
        error: new Error(error),
        exeption: {
          type: 'Unexepted',
          message: new Error().message,
        }
      }
    }
  }
}
