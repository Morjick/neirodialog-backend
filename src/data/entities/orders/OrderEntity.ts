import { EventEmitter } from 'events'
import { BasketEntity } from "../user/BasketEntity"
import { Order } from '~/data/database/models/orders/OrderModel'
import { Reposity } from '~/data/reposityes'
import { IUserOpenData, UserEntity } from '../UserEntity'
import { OrderItemEntity } from './OrderItemEntity'
import { Libs } from '~/libs'
import { IResponse } from '~/data/interfaces'

export type TOrderStatus = 'created' | 'processing' | 'assemble' | 'sent' | 'received' | 'errored'
type TAction = 'init'

export interface IOrderCreate {
  userID: number
}

export interface IOrderModel {
  id: number
  date: string
  status: TOrderStatus
  userID: number
  basketID: number
  items: number[]
  hash: string
}

export class OrderEntity {
  id: number
  userID: number
  date: string
  basketID: number
  itemsID: number[]
  hash: string
  basket: BasketEntity
  status: TOrderStatus
  user: IUserOpenData
  items: OrderItemEntity[] = []

  emitter = null

  constructor () {
    this.itemsID = []

    this.emitter = new EventEmitter()
  }

  public async findByID (id: number) {
    const order = await Order.findByPk(id)

    this.id = order.id
    this.userID = order.userID
    this.date = order.date
    this.status = order.status
    this.userID = order.userID
    this.basketID = order.basketID
    this.itemsID = order.items || []
    this.hash = order.hash

    const user = new UserEntity({ userID: this.userID })
    await user.findUserForID()

    this.items = this.findItems

    this.emit('init', this)
  }
  
  public static async create (data: IOrderCreate): Promise<IResponse<any>> {
    try {
      const hash = Libs.randomString()
      const date = Libs.getDate()

      const reposity = Reposity.users
      const user = reposity.findByID(data.userID)

      const basket = await user.getBasket()

      if (!basket.isValidCart) return {
        status: 301,
        message: 'Невозможно создать заказ. Обратите внимание на предупреждения в корзине',
        error: basket.items
          .map((el) => { if (el.message && el.message.length) return el })
          .filter(el => Boolean(el))
      }

      const errors: IResponse<any>[] = []

      const [items] = await Promise.all([
        basket.items.map(async (item) => {
          const response = await OrderItemEntity.create({
            count: item.count,
            productID: item.productID,
          })
  
          if (response.error || response.status >= 250) {
            errors.push(response)
          } else {
            return response.body.item
          }
        })
      ])
      const itemsID: number[] = await Promise.all(
        items.map(async (el) => {
          const item = await el
          return item.id
        })
      )

      if (!itemsID.length) return {
        status: 401,
        message: 'Не удалось создать заказ: нет или ни удалось не был сформирован не один предмет',
        error: 'UnLimited'
      }

      const order = await Order.create({
        hash, date,
        basketID: basket.id,
        userID: user.id,
        items: itemsID || [],
        status: 'created'
      })

      return {
        status: 201,
        message: 'Заказ создан. Он скоро появится в профиле',
        body: {
          order,
          itemsID,
        },
        error: {
          list: errors,
        },
      }
    } catch (e) {
      console.log(e)
      return {
        status: 501,
        message: 'Ошибка при создании заказа',
        error: Error(e),
      }
    }
  }

  public syncData () {
    this.items = this.findItems
  }

  private emit (action: TAction, body?: any) {
    if (action == 'init' && !body) return
    this.emitter.emit(action, body)
  }

  public get dillersID (): number[] {
    return this.findItems.map((item) => item.product.dillerID)
  }

  private get findItems () {
    try {
      return this.itemsID.map((itemID) => Reposity.orders.items.find((element) => element.id == itemID))//.filter((el) => Boolean(el))
    } catch (e) {
      console.log('entity: ', this)
      console.log('error: ', e)
      return []
    }
  }
}
