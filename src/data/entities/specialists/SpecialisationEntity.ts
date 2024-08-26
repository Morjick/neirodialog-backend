import { EventEmitter } from 'events'
import { SpecialisationModel } from "~/data/database/models/specialist/SpecialisationModel"
import { IResponse } from "~/data/interfaces"
import getTransplit from "~/libs/getTranslate"

type TSpecialisationAction = 'deleted' | 'update'

export interface ISpecialisationModel {
  id: number
  name: string
  slug: string
  minOld: number
  maxOld: number
  autorID: number
}

export interface ICreateSpecialisation {
  name: string
  description: string
  body?: string
  minOld?: number
  maxOld?: number
  autorID: number
}

export interface IUpdateSpecialisation {
  name?: string
  description?: string
  body?: string
  minOld?: number
  maxOld?: number
}

export class SpecialisationEntity {
  id: number
  name: string
  slug: string
  minOld: number
  maxOld: number
  autorID: number

  public emitter = null

  constructor () {
    this.emitter = new EventEmitter()
  }

  public async create (data: ICreateSpecialisation): Promise<IResponse<any>> {
    try {
      if (!data.name || !data.autorID) return {
        status: 301,
        message: 'Не удалось создать специализацию',
        exeption: {
          type: 'Unexepted',
          message: 'Have not param "name" or param "autorID" in request'
        }
      }

      const specialisation = {
        name: data.name,
        autorID: data.autorID,
        description: data.description,
        body: data.body || '',
        minOld: data.minOld || 0,
        maxOld: data.maxOld || 200,
        slug: getTransplit(data.name),
      }

      const result = await SpecialisationModel.create(specialisation)

      await this.findByID(result.dataValues.id)

      return {
        status: 200,
        message: 'Специализация создана',
        body: {
          specialisation: result.dataValues,
        }
      }
    } catch (error) {
      return {
        status: 501,
        message: 'Не удалось создать специализацию',
        error: new Error(error),
        exeption: {
          type: 'Unexepted',
          message: new Error(error).message,
        }
      }
    }
  }

  public async update (data: IUpdateSpecialisation): Promise<IResponse<any>> {
    try {
      await SpecialisationModel.update({ ...data }, { where: { id: this.id } })
      await this.findByID(this.id)

      this.emit('update', this)

    } catch (error) {
      return {
        status: 501,
        message: 'Не удалось обновить спецификацию',
        exeption: {
          type: 'Unexepted',
          message: new Error(error).message
        }
      }
    }
  }

  async findByID (id: number) {
    const result = await SpecialisationModel.findByPk(id)
    const specialisation = result.dataValues

    this.minOld = specialisation.minOld
    this.maxOld = specialisation.maxOld
    this.name = specialisation.name
    this.slug = specialisation.slug
    this.id = specialisation.id
    this.autorID = specialisation.autorID
  }

  async delete () {
    await SpecialisationModel.destroy({ where: { id: this.id } })

    this.emit('deleted', this.id)
  }

  private emit (action: TSpecialisationAction, body: any) {
    if (!body) return 

    this.emitter(action, body)
  }
}
