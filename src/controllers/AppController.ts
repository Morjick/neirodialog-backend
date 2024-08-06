import { Body, Get, JsonController, Post, UseBefore } from "routing-controllers"
import { CreateAppReviewContract } from "~/data/contracts/app.contracts"
import { ApplicationReviewModel } from "~/data/database/models/applications/ReviewsModel"
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
}
