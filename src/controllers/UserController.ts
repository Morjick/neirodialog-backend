import { secretKey } from './../data/database/index'
import { createRandomString } from '../libs/createRandomString'
import { UserModel } from '../data/database/models/UserModel'
import { CreateUserContracts, LoginUserContract } from './../data/contracts/user.contracts'
import {
  JsonController,
  Body,
  Post,
  Get,
  UseBefore,
  Req,
} from 'routing-controllers'
import { IsValidPassword } from '../libs/isValidVassword'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { checkToken } from '../libs/checkToken'
import { AuthMiddleware } from '~/middleware/auth.middleware'
import { GlobalReposities, IGlobalReposisies } from '~/data/reposityes'

@JsonController('/user')
export class UserController {
  public reposities: IGlobalReposisies = GlobalReposities
  
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

    return {
      status: 200,
      message: 'Пользователь авторизован',
      body: {
        token,
        user: user.dataValues
      }
    }
  }

  @Post('/check-token')
  async checkToken (@Body() body) {
    const { token } = body

    const isValid = await checkToken(token)

    return {
      status: isValid.status,
      message: isValid.message,
      error: isValid.error || null,
      body: {},
    }
  }

  @Get('/get-cart')
  @UseBefore(AuthMiddleware)
  async getBasket (@Req() request) {
    const user = this.reposities.users.findByID(request.user.id)
    const cart = await user.getBasket()

    return {
      status: 200,
      message: 'Корзина получена',
      body: {
        cart,
      }
    }
  }
}
