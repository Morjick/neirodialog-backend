import { Body, Get, JsonController, Params, Patch, Post, Req, UseBefore } from "routing-controllers"
import { CreateAppReviewContract, UpdatePageContract } from "~/data/contracts/app.contracts"
import { ApplicationReviewModel } from "~/data/database/models/applications/ReviewsModel"
import { Pages } from "~/data/database/models/pages/PagesModel"
import { IResponse } from "~/data/interfaces"
import { Reposity } from "~/data/reposityes"
import { AdminMiddleware } from "~/middleware/admin.middleware"

@JsonController('/app')
export class AppControlelr {

  @Post('/add-review')
  async addReview (@Body() body: CreateAppReviewContract) {
    try {
      const date = new Date().toLocaleString('ru')

      const response = await ApplicationReviewModel.create({
        ...body,
        date,
      })

      return {
        status: 200,
        message: 'Отзыв оставлен',
        body: {
          response: response.dataValues,
        },
      }
    } catch (e) {
      return {
        status: 501,
        message: 'Ошибка сервера',
        error: e,
      }
    }
  }

  @Get('/get-reviews')
  @UseBefore(AdminMiddleware)
  async getAppReviews () {
    try {
      const reviews = await ApplicationReviewModel.findAll()

      return {
        status: 200,
        message: 'Отзывы получены',
        body: {
          reviews: reviews.map((el) => el.dataValues)
        }
      }
    } catch(e) {
      return {
        status: 501,
        message: 'Ошибка сервера',
        error: e,
      }
    }
  }

  @Get('/get-page/:name')
  async getPage (@Params() params): Promise<IResponse> {
    try {
      const name = params.name

      if (!name) return {
        status: 301,
        message: 'Не указано имя страницы',
        exeption: {
          type: 'Invalid',
          message: 'Have not param "name" in params'
        }
      }

      const page = await Pages.findOne({ where: { name } })

      if (!page) return {
        status: 404,
        message: 'Страница с таким именем не найдена',
        exeption: {
          type: 'NotFound',
          message: `Page "${name}" not found`
        }
      }

      return {
        status: 200,
        message: 'Страница получена',
        body: {
          page: page.dataValues,
        }
      }
    } catch (e) {
      const error = new Error(e)
      return {
        status: 501,
        message: 'Не удалось получить страницу',
        error,
        exeption: {
          type: 'Unexepted',
          message: error.message
        }
      }
    }
  }

  @Patch('/update-page/:name')
  @UseBefore(AdminMiddleware)
  async updatePage (@Params() params, @Body() body: UpdatePageContract, @Req() request): Promise<IResponse> {
    try {
      const name = params.name
      const userModel = request.user
      const user = Reposity.users.findByID(userModel.id)

      if (!name) return {
        status: 301,
        message: 'Не указано имя страницы',
        exeption: {
          type: 'Invalid',
          message: 'Have not param "name" in params'
        }
      }

      if (!user || !user.rolePermissions.moderation.includes('pages')) return {
        status: 403,
        message: 'У вас нет доступа к редактированию страниц',
        exeption: {
          type: 'PermissionDied',
          message: 'Have not permission "moderation page" in permissions'
        }
      }

      await Pages.update({ body: body.body }, { where: { name } })

      return {
        status: 200,
        message: 'Данные изменены',
      }
    } catch (e) {
      const error = new Error(e)
      return {
        status: 501,
        message: 'Не удалось ищменить страницу',
        error,
        exeption: {
          type: 'Unexepted',
          message: error.message
        }
      }
    }
  }
}
