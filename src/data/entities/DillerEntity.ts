import { EventEmitter } from 'events'
import { UserEntity } from '~/data/entities/UserEntity'
import { IUserOpenData } from "./UserEntity"
import { IProductModel, TProductType } from "./products/ProductEntity"
import { DillerModel } from '../database/models/DillerModel'
import getTransplit from '~/libs/getTranslate'
import { Reposity } from '../reposityes'
import { IResponse } from '../interfaces'
import { UpdateDillerContract } from '../contracts/product.contracts'
import { IDillerRolePermission, Permissions } from '~/libs/Permissions'

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
export type TCommandAction = 'add' | 'remove'
type TDillerEmitAction = 'create' | 'update'

export interface IDillerUser extends IUserOpenData {
  role: TDillerUserRole
  permissions: IDillerRolePermission
}

interface IUpdateCommandBody {
  adminsID: number[]
  managersID: number[]
} 

export interface IAddParticipant {
  userID: number
  role: TDillerUserRole
  action: TCommandAction
}

export class DillerEntity {
  public name: string
  public slug: string
  public email: string
  public id: number
  public productsID: number[] = []
  public products: IProductModel[]
  public description: string

  private directorID: number
  private director: IUserOpenData
  private adminsID: number[] = []
  private managersID: number[] = []
  private command: IDillerUser[] = []
  private productTypePermission: TDillerProductTypePermission
  private availableProductsCount: number
  private availableCommandLength: number
  private autorID: number

  public emitter = null

  constructor () {
    this.emitter = new EventEmitter()
  }

  async create (data: ICreateDiller) {
    try {
      const User = new UserEntity({ userID: data.directorID })
      const director = await User.getAutor()

      if (!director) {
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

  async update (data: UpdateDillerContract, user: UserEntity): Promise<IResponse<any>> {
    try {
      const isRolePermission = user.getRole() == 'ADMIN' || user.getRole() == 'ROOT'

      const commandAccess = this.accessUser(user.id)
      if (!commandAccess && !isRolePermission) return {
        status: 402,
        message: 'Ошибка доступа',
        exeption: {
          message: 'Ошибка доступа',
          type: 'PermissionDied'
        }
      }

      await DillerModel.update({ ...data }, { where: { id: this.id } })
      this.emit('update', this)

      return {
        status: 200,
        message: 'Диллер успешно изменён'
      }
    } catch (e) {
      return {
        status: 501,
        message: 'Ошибка при изменении диллера',
        exeption: {
          message: new Error(e).message,
          type: 'Unexepted'
        }
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

    const User = new UserEntity({ userID: this.directorID })
    this.director = await User.getAutor()

    return this.findCommand()
  }

  private async findCommand () {
    const comand: IDillerUser[] = []

    this.adminsID.forEach(async (id) => {
      const user = await Reposity.users.findByID(id)?.getAutor()
      if (!user) return

      this.command.push({
        ...user,
        role: 'ADMIN',
        permissions: Permissions.getDillerPermissions('ADMIN')
      })
    })

    this.managersID.forEach(async (id) => {
      const user = await Reposity.users.findByID(id)?.getAutor()
      if (!user) return

      this.command.push({
        ...user,
        role: 'MANAGER',
        permissions: Permissions.getDillerPermissions('MANAGER')
      })
    })

    comand.push({
      ...this.director,
      role: 'DIRECTOR',
      permissions: Permissions.getDillerPermissions('DIRECTOR')
    })

    this.command = comand

    return this
  }

  public getDirector (): IDillerUser {
    return {
      ...this.director,
      role: 'DIRECTOR',
      permissions: Permissions.getDillerPermissions('DIRECTOR')
    }
  }

  public accessProductType (type: TProductType): boolean {
    const isTypeAccess = this.productTypePermission == type || this.productTypePermission === 'any'
    const isProductCountAccess = this.productsID.length < this.availableProductsCount

    if (!isTypeAccess || !isProductCountAccess) return false

    return true
  }

  public accessUser (userID: number): boolean {
    const user = this.command.find(el => el.id === userID)

    return !!user
  }

  public addProductToList (productID: number) {
    this.productsID = Array.isArray(this.productsID) ? [...this.productsID, productID] : [productID]
  }

  public async updateParticipant (body: IAddParticipant, userData: IUserOpenData): Promise<IResponse<any>> {
    try {
      if (body.role == 'DIRECTOR') return {
        status: 301,
        message: 'Невозможно добавить или удалить директора',
        exeption: {
          type: 'BadRequest',
          message: 'cannot add or remove DIRECTOR role to diller'
        }
      }

      const user = Reposity.users.findByID(userData.id)
      if (!user) return {
        status: 404,
        message: 'Пользователь с таким ID не был найден',
        exeption: {
          type: 'NotFound',
          message: 'Пользователь, отправивший запрос, с таким ID не был найден'
        }
      }

      const isHaveRolePermissions = user.rolePermissions.dillers.includes('update')

      const participant = this.getUser(userData.id)

      if (!isHaveRolePermissions && !participant) return {
        status: 403,
        message: 'У вас нет доступа к этому действию или вы не являетесь причастны к этому диллеру',
        exeption: {
          message: `У пользователя нет разрешения на удаление или добавление выбранной роли}`,
          type: 'PermissionDied'
        }
      }

      const setComand = async (action: TCommandAction = 'add') => {
        let adminsID = this.adminsID
        let managersID = this.managersID

        if (body.role == 'ADMIN') {
          if (action == 'add') adminsID.push(body.userID)
          else adminsID = adminsID.filter((el) => el !== body.userID)
        }

        if (body.role == 'MANAGER') {
          if (action == 'add') managersID.push(body.userID)
          else managersID = managersID.filter((el) => el !== body.userID)
        }

        await this.updateCommand({ adminsID, managersID })

        return {
          status: 200,
          message: 'Диллер был успешно отредактирован'
        } 
      }

      if (isHaveRolePermissions && !participant) {
        return await setComand(body.action)
      }

      const participantPermissions = participant.permissions.command

      let isHaveDillerPermissions = false

      if (body.action == 'add') {
        isHaveDillerPermissions = body.role == 'ADMIN'
          ? participantPermissions.includes('add-admin')
          : participantPermissions.includes('add-manager')
      }

      if (body.action == 'remove') {
        isHaveDillerPermissions = body.role == 'ADMIN'
          ? participantPermissions.includes('delete-admin')
          : participantPermissions.includes('delete-manager')
      }

      if (!isHaveRolePermissions && !isHaveDillerPermissions) return {
        status: 403,
        message: 'У вас нет доступа к этому действию',
        exeption: {
          message: `У вас нет доступа на удаление или добавление пользователя с этой ролью`,
          type: 'PermissionDied'
        }
      }

      await setComand(body.action)

      await this.findCommand()

      return {
        status: 200,
        message: 'Диллер был успешно отредактирован'
      }
    } catch (e) {
      return {
        status: 501,
        message: 'Не удалось отредактировать диллера',
        error: 'Не удалось отредактировать диллера',
        exeption: {
          message: new Error(e).message,
          type: 'Unexepted'
        }
      }
    }
  }

  private async updateCommand (body: IUpdateCommandBody) {
    this.managersID = body.managersID || this.managersID
    this.adminsID = body.adminsID || this.adminsID

    await DillerModel.update({ managersID: this.managersID, adminsID: this.adminsID }, { where: { id: this.id } })

    this.emit('update', this)
    return await this.findCommand()
  }

  private getUser (userID: number): IDillerUser {
    return this.command.find(user => user.id == userID) || null
  }

  private emit (action: TDillerEmitAction, body: any) {
    if (!body) return

    this.emitter.emit(action, body)
  }
}
