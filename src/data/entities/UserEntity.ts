import { EventEmitter } from 'events'
import { IRolePermissions, Permissions } from "~/libs/Permissions"
import { UserModel, UserRoleType } from "../database/models/UserModel"
import { BasketEntity, IBasketItemModel } from "./user/BasketEntity"
import { OrderEntity } from "./orders/OrderEntity"
import { OrderItemEntity } from "./orders/OrderItemEntity"
import { Reposity } from "../reposityes"
import { UpdateUserContracts } from '../contracts/user.contracts'
import { IResponse } from '../interfaces'

export type TEmitterAction = 'update'

export interface IUserEntityConstructor {
  userID: number
}

export interface IUserModel {
  id: number
  firstname: string
  lastname: string | null
  phone: string | null
  email: string
  avatar: string
  hash: string
  password: string
  role: UserRoleType
  basketID: number
}

export interface IUserOpenData {
  id: number
  firstname: string
  lastname: string
  fullname: string
  avatar: string
  hash: string
}

export interface IUserProfile {
  user: IUserModel
  orders: OrderEntity[]
  basket: BasketEntity
  library: OrderItemEntity[]
}

export class UserEntity {
  public id = 0

  private user: IUserModel = null
  private basketID: number
  private basket: BasketEntity
  private permissions: IRolePermissions = null

  public emitter = null

  constructor (data: IUserEntityConstructor) {
    this.id = data.userID
    this.emitter = new EventEmitter()

    this.findUserForID()
  }

  public async findUserForID  () {
    try {
      if (!this.id) return

      const user = await UserModel.findOne({ where: { id: this.id } })
      this.user = user.dataValues
      this.basketID = this.user.basketID

      this.permissions = Permissions.getRolePermissions(this.user.role || 'USER')
      
      return this.user
    } catch (e) {
      console.log(e)
      return 
    }
  }

  public async initCart () {
    if (!this.id || !this.user?.id) {
      const user = await UserModel.findOne({ where: { id: this.id } })
      this.user = user.dataValues
      this.basketID = this.user.basketID
    }
    const basket = new BasketEntity()

    if (this.basketID) {
      await basket.findByID(this.basketID)
    } else {
      await basket.create(this.user.id)

      await UserModel.update({ basketID: basket.id }, { where: { id: this.id } })
    }

    this.basket = basket
    this.basketID = this.basket.id
    return this.basket
  }

  public getRole (): UserRoleType {
    return this.user.role
  }

  public getFullName (): string {
    return (this.user.firstname + (this.user.lastname || '')).toString()
  }

  public async getUser (): Promise<IUserModel> {
    if (!this.user) return await this.findUserForID()

    return this.user
  }

  public async getAutor (): Promise<IUserOpenData> {
    try {
      if (!this.user) await this.findUserForID()

      return {
        firstname: this.user.firstname,
        lastname: this.user.lastname,
        fullname: `${this.user.firstname} ${this.user.lastname}`,
        id: this.user.id,
        avatar: this.user.avatar,
        hash: this.user.hash
      }
    } catch (e) {
      console.log('Error for get autor with ID ', this.id)
      return
    }
  }

  public async addToCart (data: IBasketItemModel) {
    const result = await this.basket.addProduct(data)

    return result
  }

  public async getBasket () {
    if (!this.basket) return await this.initCart()
    
    this.basket.getPrice
    return this.basket
  }

  public async updateUser (body: UpdateUserContracts): Promise<IResponse<any>> {
    try {
      await UserModel.update({ ...body }, { where: { id: this.id } })
      this.emit('update', this)
  
      return {
        status: 200,
        message: 'Данные о пользователе обновлены'
      }
    } catch (error) {
      return {
        status: 501,
        message: 'Ошибка при попытке обновить пользователя',
        error: new Error(error),
        exeption: {
          type: 'Unexepted',
          message: new Error(error).message
        }
      }
    }
  }

  public get profile (): IUserProfile {
    const orders = Reposity.orders.getPersonalList(this.id)
    const library = Reposity.orders.getUserLibrary(this.id)

    return {
      user: this.user,
      basket: this.basket,
      orders,
      library,
    }
  }

  public get rolePermissions () {
    return this.permissions
  }

  private emit (action: TEmitterAction, body: any) {
    if (!body) return

    this.emitter.emit(action, body)
  }
}
