import { Body, Get, JsonController, Params, Patch, Post, QueryParams, Req, UseBefore } from "routing-controllers"
import {
  CreateSpecialisationContract,
  CreateSpecialistContract,
  UpdateSpecialisationContract,
  UpdateSpecialistContract,
} from "~/data/contracts/specialist,contracts"
import { ICreateSpecialist } from "~/data/entities/specialists/SpecialistEntity"
import { IUserModel } from "~/data/entities/UserEntity"
import { IResponse } from "~/data/interfaces"
import { Reposity } from "~/data/reposityes"
import { AdminMiddleware } from "~/middleware/admin.middleware"

@JsonController('/specialists')
export class SpecialistsController {
  @Get('/specialisations')
  async getSpecialisations (): Promise<IResponse> {
    const specialisations = Reposity.specialists.specialistations

    return {
      status: 200,
      message: 'Список специализаций получен',
      body: {
        specialisations,
      }
    }
  }

  @Post('/specialisations')
  @UseBefore(AdminMiddleware)
  async createSpecialisations (@Body() body: CreateSpecialisationContract, @Req() request): Promise<IResponse> {
    try {
      const userModel: IUserModel = request.user
      const user = Reposity.users.findByID(userModel.id)

      if (!user.rolePermissions.specialist.includes('create')) return {
        status: 301,
        message: 'У вас нет доступа к созданию спецификаций',
        exeption: {
          type: 'PermissionDied',
          message: 'Have not permission "create" in specialist permissions'
        }
      }

      return await Reposity.specialists.createSpecialisation({ ...body, autorID: user.id }, user.id)
    } catch (error) {
      return {
        status: 501,
        message: 'Не удалось создать специализацию',
        exeption: {
          type: 'Unexepted',
          message: new Error(error).message
        }
      }
    }
  }

  @Patch('/specialisations/:slug')
  @UseBefore(AdminMiddleware)
  async updateSpecialisation (@Params() params, @Req() request, @Body() body: UpdateSpecialisationContract): Promise<IResponse> {
    try {
      const { slug } = params

      const userModel: IUserModel = request.user
      const user = Reposity.users.findByID(userModel.id)

      if (!user || !slug) return {
        status: 301,
        message: 'Не корректный запрос',
        exeption: {
          type: 'Invalid',
          message: 'Не удалось установить пользователя или ссылку спецификации'
        }
      }

      if (user.rolePermissions.specialist.includes('update')) return {
        status: 301,
        message: 'У вас нет доступа к изменению спецификации',
        exeption: {
          type: 'PermissionDied',
          message: 'Have not permission "update" in specialist permissions'
        }
      }

      return await Reposity.specialists.updateSpecialisation(body, slug)
    } catch (error) {
      return {
        status: 501,
        message: 'Не удалось изменить спецификацию',
        exeption: {
          type: 'Unexepted',
          message: new Error(error).message
        }
      }
    }
  }

  @Get('/specialists')
  async getSpecialists (@QueryParams() filters): Promise<IResponse> {
    try {
      const specialists = Reposity.specialists.getSpecialistList({ filters: filters, limit: filters.limit })

      return {
        status: 200,
        message: 'Список специалистов получен',
        body: {
          totalCount: specialists.length,
          specialists: specialists,
        }
      }
    } catch (e) {
      return {
        status: 501,
        message: 'Не удалось получить список специалистов',
        error: new Error(e),
        exeption: {
          type: 'Unexepted',
          message: new Error(e).message
        }
      }
    }
  }

  @Post('/specialists')
  @UseBefore(AdminMiddleware)
  async createSpecialist (@Body() body: CreateSpecialistContract, @Req() request): Promise<IResponse> {
    try {
      const userModel: IUserModel = request.user
      const user = Reposity.users.findByID(userModel.id)

      if (!user.rolePermissions.specialist.includes('add')) return {
        status: 301,
        message: 'У вас нет доступа для создания специалиста',
        exeption: {
          type: 'PermissionDied',
          message: 'Have not permission "add" in specialist permissions'
        }
      }

      const candidat = Reposity.users.findByID(body.userID)

      if (!candidat) return {
        status: 404,
        message: 'Пользователь с таким ID не найден',
        exeption: {
          type: 'NotFound',
          message: 'User not found'
        }
      }

      const createSpecialistData: ICreateSpecialist = {
        user: candidat,
        specialisationsID: body.specialisationsID || [],
        description: body.description || '',
        body: body.body || ''
      }

      return await Reposity.specialists.createSpecialist(createSpecialistData)
    } catch (error) {
      return {
        status: 501,
        message: 'Не удалось создать специалиста',
        error: new Error(error),
        exeption: {
          type: 'Unexepted',
          message: new Error(error).message
        }
      }
    }
  }

  @Patch('/specialists/:id')
  @UseBefore(AdminMiddleware)
  async updateSpecialist (@Req() request, @Body() body: UpdateSpecialistContract, @Params() params): Promise<IResponse> {
    try {
      const { id } = params.id

      const requesterModel: IUserModel = request.user
      const requester = Reposity.users.findByID(requesterModel.id)
  
      const user = Reposity.users.findByID(id)

      if (!user || !requester) return {
        status: 404,
        message: 'Не удалось установить пользоваеля',
        exeption: {
          type: 'NotFound',
          message: 'User or Requester not found'
        }
      }
  
      const isRequesterHavePermissions = requester.rolePermissions.user.includes('update')
  
      if (!isRequesterHavePermissions && user.id !== requester.id) return {
        status: 301,
        message: 'У вас нет доступ для изменение данного специалиста',
        exeption: {
          type: 'PermissionDied',
          message: 'Have not permission "update" in users permissions'
        }
      }

      return await Reposity.specialists.updateSpecialist(body, user.id)
    } catch (error) {
      return {
        status: 501,
        message: 'Не удалось обновить специалиста',
        error: new Error(error),
        exeption: {
          type: 'Unexepted',
          message: new Error(error).message
        }
      }
    }
  }

  @Get('/check-specialist/:userID')
  async checkSpecialist (@Params() params): Promise<IResponse> {
    const userID = Number(params.userID)

    if (!userID || !Number.isInteger(userID)) return {
      status: 301,
      message: 'Не удалось установить userID',
      exeption: {
        type: 'Invalid',
        message: 'userID is not number'
      }
    }

    const user = Reposity.users.findByID(userID)

    if (!user) return {
      status: 404,
      message: 'Пользователь не найден',
      exeption: {
        type: 'NotFound',
        message: 'User not found'
      }
    }

    const specialist = Reposity.specialists.getSpecialistByUserID(userID)

    return {
      status: 200,
      message: 'Пользователь был проверен',
      body: {
        isSpecialist: !!specialist,
        specialist: specialist,
      }
    }
  }
}
