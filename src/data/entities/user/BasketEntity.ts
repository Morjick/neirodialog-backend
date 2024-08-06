import { BasketModel } from "~/data/database/models/user/BasketModel"
import { ProductEntity } from "../products/ProductEntity"

export interface IBasketItemModel {
  productID: number
  count: number
}

export interface IBasketModel {
  id: number
  userID: number
  items: string
}

export interface IBasketElement extends IBasketItemModel {
  product: ProductEntity
  message?: string
}

export class BasketEntity {
  public id: number
  public userID: number
  public totalPrice: number = 0
  public isValid = false

  public items: IBasketElement[]
  private basketString: string

  constructor () {}

  async create (userID: number) {
    const result = await BasketModel.create({
      userID: userID,
      items: JSON.stringify([])
    })

    this.syncData(result.dataValues)
  }

  async findByID (id: number) {
    const result = await BasketModel.findByPk(id)
    await this.syncData(result.dataValues)
  }

  private async syncData (data: IBasketModel) {
    this.id = data.id
    this.userID = data.userID
    this.basketString = data.items

    try {
      const list: IBasketItemModel[] = JSON.parse(data.items) || []

      const products: IBasketElement[] = await Promise.all(list.map(async (el) => {
        const product = new ProductEntity()
        await product.findByID(el.productID)

        if (!product || !product.id) return

        return {
          ...el,
          product
        }
      }))

      this.items = products
      this.isValid = this.isValidCart
      this.totalPrice = this.items.reduce((acc, el) => acc + (el.product.totalPrice * el.count), 0)
    } catch (e) {
      this.items = []
      this.totalPrice = 0
    }
  }

  private async updateModel () {
    const basketItems = this.items.map((el) => {
      return {
        productID: el.productID,
        count: el.count
      }
    })

    this.basketString = JSON.stringify(basketItems)

    this.isValid = this.isValidCart
    await BasketModel.update({ items: this.basketString }, { where: { id: this.id } })
  }

  public async addProduct (data: IBasketItemModel) {
    try {
      const productIndex = this.items.findIndex((el) => el.productID === data.productID)

      if (productIndex >= 0) {
        this.items[productIndex].count = data.count

        if (data.count <= 0) {
          this.items = this.items.filter((el, index) => index !== productIndex)
        }
      } else {
        const product = new ProductEntity()
        await product.findByID(data.productID)

        if (!product) return {
          status: 404,
          message: 'Не удалось добавить товар в корзину',
          error: 'NotFound'
        }

        this.items.push({
          ...data,
          product,
        })
      }

      this.totalPrice = this.items.reduce((acc, el) => acc + (el.product.totalPrice * el.count), 0)

      await this.updateModel()
      this.isValid = this.isValidCart

      return {
        status: 200,
        message: 'Продукт добавлен в корзину',
      }
    } catch (e) {
      return {
        status: 501,
        message: 'Не удалось добавить товар в корзину',
        error: e,
      }
    }
  }

  public get isValidCart (): boolean {
    let isValid = true

    this.items = this.items.map((item) => {
      if (!item.product.isShow) {
        isValid = false
        item.message = 'Данный товар снят с публикации'
      }

      if (item.product.type === 'physical') {
        if (!item.product.countInStock || item.product.countInStock < item.count) {
          isValid = false
          item.message = 'Товара в корзине больше, чем на складе'
        }
      }

      return item
    })

    return isValid
  }
}
