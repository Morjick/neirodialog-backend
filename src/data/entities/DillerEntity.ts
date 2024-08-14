import { UserEntity } from '~/data/entities/UserEntity'
import { IUserOpenData } from "./UserEntity"
import { IProductModel, TProductType } from "./products/ProductEntity"
import { DillerModel } from '../database/models/DillerModel'
import getTransplit from '~/libs/getTranslate'
import { GlobalReposities, IGlobalReposisies } from '../reposityes'

export type TDillerProductTypePermission = 'any' | 'physical' | 'electronic'

export interface ICreateDiller {
  name: string
  email: string
  description?: string
  availableProductsCount?: number
  availableCommandLength?: number
  directorID: number
  productTypePermission: TDillerProductTypePermission
  autorID: number
}

export type TDillerUserRole = 'MANAGER' | 'ADMIN' | 'DIRECTOR'

export interface IDillerUser extends IUserOpenData {
  role: TDillerUserRole
}

const reposities: IGlobalReposisies = GlobalReposities

export class DillerEntity {
  public name: string
  public slug: string
  public email: string
  public id: number
  public productsID: number[]
  public products: IProductModel[]
  public description: string

  private directorID: number
  private director: IUserOpenData
  private adminsID: number[]
  private managersID: number[]
  private command: IDillerUser[]
  private productTypePermission: TDillerProductTypePermission
  private availableProductsCount: number
  private availableCommandLength: number
  private autorID: number

  constructor () {}

  async create (data: ICreateDiller) {
    try {
      const User = new UserEntity({ userID: data.directorID })
      const director = await User.getAutor()

      if (!director) {
        console.log('Director is invalid for diller ', data.name)
        return
      }

      if (!director) return {
        status: 404,
        message: 'Пользователь не найден',
        error: 'User is not define'
      }

      const isEmailExists = await DillerModel.findOne({ where: { email: data.email } })
      if (isEmailExists) return {
        status: 400,
        message: 'Диллер с таким email уже существует',
        error: 'Email must be unique'
      }

      const slug = getTransplit(data.name)

      const isSlugExists = await DillerModel.findOne({ where: { slug } })
      if (isSlugExists) return {
        status: 400,
        message: 'Диллер с таким именем уже существует',
        error: 'Name must be unique'
      }
      this.availableProductsCount = data.availableProductsCount || 10
      this.availableCommandLength = data.availableCommandLength || 5

      this.slug = slug
      this.name = data.name
      this.email = data.email
      this.autorID = data.autorID
      this.productTypePermission = data.productTypePermission || 'any'
      this.description = data.description

      const diller = await DillerModel.create({
        name: this.name,
        slug,
        email: this.email,
        availableProductsCount: this.availableProductsCount,
        availableCommandLength: this.availableCommandLength,
        autorID: this.autorID,
        directorID: director.id,
        productTypePermission: this.productTypePermission,
        description: this.description,
      })

      return {
        status: 201,
        message: 'Диллер успешно создан',
        body: {
          diller: diller.dataValues
        }
      }
    } catch (e) {
      return {
        status: 501,
        message: Error(e).message,
        error: Error(e).message,
      }
    }
  }

  async getFromID (id: number) {
    const candidat = await DillerModel.findOne({ where: { id } })
    if (!candidat) return {
      status: 404,
      message: 'Диллер не найден',
      error: 'NotFound'
    }

    const diller = candidat.dataValues

    this.name = diller.name
    this.email = diller.email
    this.slug = diller.slug
    this.productsID = diller.productsID || []
    this.availableProductsCount = diller.availableProductsCount
    this.availableCommandLength = diller.availableCommandLength
    this.directorID = diller.directorID
    this.productTypePermission = diller.productTypePermission
    this.adminsID = diller.adminsID || []
    this.managersID = diller.managersID || []
    this.id = diller.id

    // this.director = await reposities.users.findByID(this.directorID).getAutor()
    const User = new UserEntity({ userID: this.directorID })
    this.director = await User.getAutor()

    return this.findCommand()
  }

  private async findCommand () {
    const comand: IDillerUser[] = []

    this.adminsID.forEach(async (id) => {
      // const user = await new UserEntity({ userID: id }).getAutor()
      const user = await reposities.users.findByID(id).getAutor()
      if (!user) return

      this.command.push({
        ...user,
        role: 'ADMIN'
      })
    })

    this.managersID.forEach(async (id) => {
      // const user = await new UserEntity({ userID: id }).getAutor()
      const user = await reposities.users.findByID(id).getAutor()
      if (!user) return

      this.command.push({
        ...user,
        role: 'MANAGER'
      })
    })

    comand.push({
      ...this.director,
      role: 'DIRECTOR'
    })

    this.command = comand
    return this
  }

  public getDirector (): IDillerUser {
    return {
      ...this.director,
      role: 'DIRECTOR'
    }
  }

  public accessProductType (type: TProductType): boolean {
    const isTypeAccess = this.productTypePermission == type || this.productTypePermission === 'any'
    const isProductCountAccess = this.productsID.length < this.availableProductsCount

    if (!isTypeAccess || !isProductCountAccess) return false

    return true
  }

  public accessUser (userID: number) {
    const user = this.command.find(el => el.id === userID)

    return !!user
  }

  public addProductToList (productID: number) {
    this.productsID = Array.isArray(this.productsID) ? [...this.productsID, productID] : [productID]
  }
}
