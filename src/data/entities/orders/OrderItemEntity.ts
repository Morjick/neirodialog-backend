import { EventEmitter } from 'events'
import { TOrderStatus } from './OrderEntity'
import { ProductEntity, TProductType } from '../products/ProductEntity'
import { Reposity } from '~/data/reposityes'
import { createRandomString } from '~/libs/createRandomString'
import { Libs } from '~/libs'
import { IOrderItemModel, OrderItem } from '~/data/database/models/orders/OrderItem'
import { IResponse } from '~/data/interfaces'

export interface ICreateOrderItem {
  count: number
  productID: number
}

interface ICreateOrderItemResponse {
  item: IOrderItemModel
}

type TAction = 'init' | 'update'

export class OrderItemEntity {
  public id: number
  public status: TOrderStatus
  public productType: TProductType
  public productID: number
  public product: ProductEntity
  public count: number
  public hash: string
  public date: string

  public emitter = null

  private setProductInterval = null

  constructor () {
    this.emitter = new EventEmitter()

    this.emitter
  }

  public async findByID (id: number): Promise<IResponse<any>> {
    try {
      const item = await OrderItem.findByPk(id)

      if (!item) return {
        status: 404,
        message: 'Предмет заказа не найден',
        error: 'NotFound',
      }

      this.id = item.id
      this.status = item.status
      this.productID = item.productID
      this.count = item.count
      this.hash = item.hash
      this.date = item.date

      this.setProduct()

      this.emit('init', this)

      return {
        status: 200,
        message: 'Предмет заказа получен',
        body: {
          item,
        }
      }
    } catch (e) {
      return {
        status: 501,
        message: 'Ошибка при поиске предмета заказа',
        error: e,
      }
    }
  }

  private setProduct () {
    let tryes = 0

    this.setProductInterval = setInterval(() => this.setProduct(), 10000)

    try {
      if (tryes > 5) {
        clearInterval(this.setProductInterval)
        this.setProductInterval = null
        return
      }

      this.product = Reposity.products.getProductByID(this.productID)
      this.productType = this.product?.type || null

      if (!this.product || !this.productType) throw new Error('Не удалось установить продукт')
      clearInterval(this.setProductInterval)
    } catch {
      tryes++
    }
  }

  public async updateStatus (status: TOrderStatus) {
    this.status = status
    this.emit('update', this)

    OrderItem.update({ status: this.status }, { where: { id: this.id } })
  }

  public static async create (data: ICreateOrderItem): Promise<IResponse<ICreateOrderItemResponse>> {
    try {
      const hash = createRandomString(20)
      const date = Libs.getDate()

      // const product = reposities.products.findProductByID(data.productID)
      const product = new ProductEntity()
      await product.findByID(data.productID)

      if (product.countInStock && product.countInStock > data.count) return {
        status: 301,
        message: 'Товара больше, чем на складе',
        error: 'UnLimited'
      }

      const item = await OrderItem.create({
        hash,
        date,
        count: data.count,
        productID: data.productID,
      })

      return {
        status: 201,
        message: 'Предмет добавлен к заказу',
        body: {
          item,
        }
      }
    } catch (e) {
      console.log(e)
      return {
        status: 501,
        message: `Не удалось создать заказ: ошибка при формировании продукта с ID ${data.productID}`,
        error: e,
      }
    }
  }

  public get documents () {
    return this.product.documents
  }

  private emit (action: TAction, body?: any) {
    if (!body) return
    this.emitter.emit(action, body)
  }
}
