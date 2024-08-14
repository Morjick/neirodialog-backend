import { PromocodeModel } from "~/data/database/models/products/PromocodeModel"
import { IUserOpenData, UserEntity } from "../UserEntity"
import { GlobalReposities, IGlobalReposisies } from "~/data/reposityes"
import { createRandomString } from "~/libs/createRandomString"
import { EventEmitter } from 'events'

export interface ICreatePromocode {
  title: string
  discount: number
  minPrice?: number
  autorID: number
  limit: number
}

export type TEmit = 'delete' | 'update' | 'init'

const reposities: IGlobalReposisies = GlobalReposities

export class PromocodeEntity {
  public id: number
  public title: string
  public discount: number
  public minPrice: number
  public autorID: number
  public autor: IUserOpenData
  public hash: string

  public emitter = null

  private limit: number = 0

  constructor () {
    this.emitter = new EventEmitter()
  }

  public get isActive (): boolean {
    return Boolean(this.limit > 0)
  }

  public async findByID (id: number) {
    const promocode = await PromocodeModel.findByPk(id)

    this.title = promocode.title
    this.id = promocode.id
    this.discount = promocode.discount
    this.minPrice = promocode.minPrice
    this.autorID = promocode.autorID
    this.hash = promocode.hash

    try {
      const user = reposities.users.findByID(promocode.autorID)

      this.autor = await user.getAutor()
    } catch {
      const user = new UserEntity({ userID: promocode.autorID })
      await user.findUserForID()

      this.autor = await user.getAutor()
    }

    this.emit('init', this)
    return this
  }

  public async create (data: ICreatePromocode) {
    try {
      this.minPrice = data.minPrice || 0

      const hash = createRandomString()

      const result = await PromocodeModel.create({
        autorID: data.autorID,
        title: data.title,
        discount: data.discount,
        minPrice: data.minPrice || 0,
        limit: data.limit,
        hash,
      })

      await this.findByID(result.id)

      return {
        status: 201,
        message: 'Промокод создан',
        body: {
          hash: this.hash,
        }
      }
    } catch (error) {
      return {
        status: 501,
        message: 'Ошибка при создании промокода',
        error,
      }
    }
  }

  public async updateLimit (limit: number) {
    try {
      this.limit = limit
      await PromocodeModel.update({ limit: this.limit }, { where: { id: this.id } })

      this.emit('update', { id: this.id })

      return {
        status: 200,
        message: 'Лимиты промокода обновлены',
      }
    } catch (e) {
      return {
        status: 501,
        message: 'Не удалось обновить лимит промокода',
        error: e,
      }
    }
  }

  public async use () {
    this.limit--

    await PromocodeModel.update({ limit: this.limit, }, { where: { id: this.id } })
    
  }

  public async delete () {
    await PromocodeModel.destroy({ where: { id: this.id } })
    this.emit('delete')
  }

  private emit<DataType> (action: TEmit, data?: DataType) {
    if (action === 'init' && !data) return

    this.emitter.emit(action, data || {})
  }
}
