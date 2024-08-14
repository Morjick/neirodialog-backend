import { Get, JsonController, Post, Req, UseBefore } from "routing-controllers"
import { IUserOpenData } from "~/data/entities/UserEntity"
import { IResponse } from "~/data/interfaces"
import { Reposity } from "~/data/reposityes"
// import { AdminMiddleware } from "~/middleware/admin.middleware"
import { AuthMiddleware } from "~/middleware/auth.middleware"
import { IsDillerMiddleware } from "~/middleware/diller.middleware"

@JsonController('/orders')
export class OrderControlelr {
  @Post('/create-order')
  @UseBefore(AuthMiddleware)
  async create (@Req() request) {
    const user: IUserOpenData = request.user

    const result = await Reposity.orders.createOrder({ userID: user.id })

    return result
  }

  @Get('/get-orders')
  @UseBefore(IsDillerMiddleware)
  async getOrders (@Req() request): Promise<IResponse<any>> {
    try {
      const user = request.user || null
      const diller = request.diller || null

      const reposity = Reposity.orders
      const result = await reposity.getList({
        user, diller,
      })

      return result
    } catch (e) {
      return {
        status: 501,
        message: 'Ошибка при получении заказов',
        error: e,
      }
    }
  }
}
