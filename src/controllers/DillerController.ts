import { Body, Delete, Get, JsonController, Params, Patch, Post, Req, UseBefore } from "routing-controllers"
import { CreateDillerContract, UpdateCommandContract, UpdateDillerContract } from "~/data/contracts/product.contracts"
import { DillerEntity } from "~/data/entities/DillerEntity"
import { IUserModel } from "~/data/entities/UserEntity"
import { IResponse } from "~/data/interfaces"
import { Reposity } from "~/data/reposityes"
import { AdminMiddleware } from "~/middleware/admin.middleware"
import { DillerMiddleware } from "~/middleware/diller.middleware"

@JsonController('/dillers')
export class DillerController {
  @Post('/create-diller')
  @UseBefore(AdminMiddleware)
  async createDiller (@Body() body: CreateDillerContract, @Req() request) {
    const user: IUserModel = request.user

    const diller = new DillerEntity()
    const response = await diller.create({
      ...body,
      autorID: user.id,
    })

    if (response.status > 201) return response

    Reposity.diller.addDiller(diller)

    return {
      status: 201,
      message: 'Диллер был создан',
      body: {
        diller,
      }
    }
  }

  @Get('/get-dillers')
  async getDillers () {
    const list = Reposity.diller.getList()

    return {
      status: 200,
      message: 'Список диллеров получен',
      body: {
        dillers: list,
      }
    }
  }

  @Patch('/update-diller/:id')
  @UseBefore(DillerMiddleware)
  async updateDiller (@Params() params, @Body() body: UpdateDillerContract, @Req() request): Promise<IResponse<any>> {
    try {
      const user: IUserModel = request.user
      const dillerID = params.id

      const userEntity = Reposity.users.findByID(user.id)

      return await Reposity.diller.update(body, userEntity, dillerID)
    } catch (e) {
      return {
        status: 501,
        message: 'Не удалось изменить диллера',
        error: e,
        exeption: {
          message: 'Ошибка при попытке изменить диллера',
          type: 'Unexepted'
        }
      }
    }
  }

  @Post('/person')
  @UseBefore(DillerMiddleware)
  async updatePerson (@Body() body: UpdateCommandContract, @Req() request): Promise<IResponse<any>> {
    try {
      const userModel: IUserModel = request.user
      const diller: DillerEntity = request.diller
      const user = await Reposity.users.findByID(userModel.id).getAutor()

      return await Reposity.diller.updateCommand(body, user, diller.id)
    } catch (e) {
      return {
        status: 501,
        message: 'Не удалось изменить персонал диллера',
        exeption: {
          type: 'Unexepted',
          message: new Error(e).message
        }
      }
    }
  }

  @Get('/get-dillers/:slug')
  async getDillerDetail (@Params() params): Promise<IResponse> {
    const { slug } = params
    const diller = Reposity.diller.findForSlug(slug)

    if (!diller) return {
      status: 404,
      message: 'Диллер не найден',
      exeption: {
        type: 'NotFound',
        message: `Diller with slug="${slug}" not found`
      }
    }

    return {
      status: 200,
      message: 'Диллер получен',
      body: {
        diller,
      }
    }
  }

  @Delete('/delete-diller/:slug')
  @UseBefore(AdminMiddleware)
  async deleteDiller (@Req() request, @Params() params): Promise<IResponse> {
    try {
      const userModel = request.user
      const slug = params.slug

      const user = Reposity.users.findByID(userModel.id)
      const diller = Reposity.diller.findForSlug(slug)

      if (!user || !diller) return {
        status: 404,
        message: 'Диллер или пользователь не найдены',
        exeption: {
          type: 'NotFound',
          message: 'Diller or user not found'
        }
      }

      return await Reposity.diller.deleteDiller(diller.id)
    } catch (e) {
      return {
        status: 501,
        message: 'Не удалось удалить диллера',
        exeption: {
          type: 'Unexepted',
          message: 'Diller is not deleted'
        }
      }
    }
  }
}
