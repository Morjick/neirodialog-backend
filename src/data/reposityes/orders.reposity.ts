import { OrderItem } from "../database/models/orders/OrderItem"
import { Order } from "../database/models/orders/OrderModel"
import { DillerEntity } from "../entities/DillerEntity"
import { IOrderCreate, OrderEntity } from "../entities/orders/OrderEntity"
import { OrderItemEntity } from "../entities/orders/OrderItemEntity"
import { IUserModel } from "../entities/UserEntity"
import { IResponse } from "../interfaces"

interface IGetOrderListParams {
  user?: IUserModel | null
  diller?: DillerEntity | null
}

export class OrderReposity {
  items: OrderItemEntity[] = []
  list: OrderEntity[] = []
  stack = []

  constructor () {
    this.items = []
    this.list = []
    this.stack = []
  }

  public async buildReposity () {
    const [items,] = await Promise.all([
      await OrderItem.findAll({ attributes: ['id'] }),
    ])
    const itemsID = items.map((el) => el.dataValues.id)

    await this.addOrderItemsToList(itemsID)

    console.log('Order Items Reposity init')

    return this
  }

  public async buildOrders () {
    const orders = await Order.findAll()

    await Promise.all([
      orders.map(async (item) => {
        const order = new OrderEntity()

        order.emitter.on('init', (element) => {
          this.list.push(element)
        })

        await order.findByID(item.id)
      }),
    ])

    console.log('Orders Reposity init')
  }

  public async createOrder (data: IOrderCreate) {
    const response = await OrderEntity.create(data)

    if (response.status <= 249) {
      const order = response.body.order
      const itemsID: number[] = response.body.itemsID

      this.addOrderItemsToList(itemsID)
      this.addOrderToList(order.id)
    }

    return response
  }

  public async getList (params?: IGetOrderListParams): Promise<IResponse<any>> {
    try {
      if (!params || !params.user) return {
        status: 301,
        message: 'Нет доступа для просмотра заказов',
        error: 'Unauthorized'
      }

      const isAdminPermission: boolean = params.user.role == 'ADMIN' || params.user.role == 'ROOT'
      const isDillerPermission: boolean = !!params.diller

      if (isAdminPermission) {
        const orders = this.list.filter((el) => Boolean(el))

        return {
          status: 200,
          message: 'Вам предоставлен список всех заказов',
          body: {
            list: orders,
            details: {
              totalCount: orders.length,
            }
          }
        }
      }

      if (isDillerPermission) {
        const orders = this.list
          .filter((el) => el.dillersID.includes(params.diller.id))
          .map((order) => order.items.filter((item) => item.product.dillerID == params.diller.id ))

        return {
          status: 200,
          message: 'Актуальные заказы',
          body: {
            list: orders,
            details: {
              totalCount: orders.length,
            }
          }
        }
      }

      const orders = this.list.filter((el) => el.userID == params.user.id)
      this.list = this.list.filter((el) => Boolean(el))

      return {
        status: 200,
        message: 'Ваши заказы получены',
        body: {
          list: orders,
          details: {
            totalCount: orders.length,
          }
        }
      }
    } catch (e) {
      console.log(e)
      return {
        status: 501,
        message: 'Ошибка при получении списка заказов',
        error: e
      }
    }
  }

  public async addOrderItemsToList (itemsID: number[]) {
    await Promise.all(
      itemsID.map(async (id) => {
        const orderItem = new OrderItemEntity()

        orderItem.emitter.on('init', (element: OrderItemEntity) => {
          if (!element) return
          this.items.push(element)
        })

        orderItem.emitter.on('update', (element: OrderItemEntity) => {
          if (!element) return

          try {
            const itemIndex = this.items.findIndex(el => el.id == element.id)
  
            if (!itemIndex || itemIndex < 0) return
            this.items[itemIndex] = element
          } catch (e) {
            console.log('error on update item: ', e)
          }
        })

        await orderItem.findByID(id)
      })
    )
  }

  public async addOrderToList (id: number) {
    const order = new OrderEntity()
    
    order.emitter.on('init', (element: OrderEntity) => {
      order.syncData()
      this.list.push(element)
      this.processingOrder(order)
    })

    await order.findByID(id)
  }

  private processingOrder (order: OrderEntity) {
    order.items.forEach(async (item) => {
      if (item.productType !== 'electronic') return

      const mail = {
        title: 'Отправляем ваш заказ на почту и дублируем в профиле',
        message: 'ЛОЛ',
        documents: item.documents,
      }

      if (item.documents.length) {
        await item.updateStatus('sent')
      }
      
      return mail
    })
  }
}
