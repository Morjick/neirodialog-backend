import { EventEmitter } from 'events'
import { createRandomString } from "~/libs/createRandomString"
import { IUserOpenData, UserEntity } from "../UserEntity"
import { SpecialisationEntity } from "./SpecialisationEntity"
import { SpecialistModel } from "~/data/database/models/specialist/SpecialistModel"
import { IResponse } from "~/data/interfaces"
import { Reposity } from '~/data/reposityes'
import { UpdateSpecialistContract } from '~/data/contracts/specialist,contracts'
import { CalendarEntity } from './CalendarEntity'

export type TEmitterAction = 'update'

export interface ISpecialistModel {
  id: number
  hash: string
  userID: number
  specialisationsID: number[]
  description: string
  body: string
}

export interface ICreateSpecialist {
  user: UserEntity
  specialisationsID?: number[]
  description: string
  body: string
}

export interface ICreateSpecialistResponse {
  result: ISpecialistModel
}

export class SpecialistEntity {
  public id: number
  public hash: string
  public userID: number
  public specialisationsID: number[]
  public specialisations: SpecialisationEntity[] = []
  public user: IUserOpenData

  public calendar: CalendarEntity
  public emitter = null

  private tries = 0
  
  constructor () {
    this.hash = createRandomString()
    this.specialisations = []
    this.specialisationsID = []

    this.emitter = new EventEmitter()
  }

  public async findByID (id: number) {
    const result = await SpecialistModel.findByPk(id)
    const specialistModel = result.dataValues
    
    for (const property in specialistModel) {
      this[property] = specialistModel[property]
    }

    const user = Reposity.users.findByID(this.userID)
    this.setUser(user)

    const specialisations = []
    this.specialisationsID.forEach((specialisationID) => {
      const specialisation = Reposity.specialists.getSpecialisationByID(specialisationID)
      specialisations.push(specialisation)
    })

    this.specialisations = specialisations.filter((el) => Boolean(el))

    const calendar = new CalendarEntity()
    await calendar.init(this.id)

    this.calendar = calendar
  }

  public static async create (data: ICreateSpecialist): Promise<IResponse<ICreateSpecialistResponse>> {
    try {
      const result = await SpecialistModel.create({
        hash: createRandomString(),
        userID: data.user.id,
        specialisationsID: data.specialisationsID || [],
        description: data.description || '',
        body: data.body || '',
      })

      return {
        status: 201,
        message: 'Специалист был создан',
        body: {
          result,
        }
      }
    } catch(e) {
      return {
        status: 501,
        message: 'При создании специалиста произошла ошибка',
        error: new Error(e),
        exeption: {
          type: 'Unexepted',
          message: new Error().message
        }
      }
    }
  }

  public addSpecialisation (specialisation: SpecialisationEntity) {
    this.specialisations = [...this.specialisations, specialisation]
    this.updateSpecialisations()
  }

  public removeSpecialisation (slug: string) {
    this.specialisations = this.specialisations.filter((el) => el.slug !== slug)
    this.updateSpecialisations()
  }

  public async setUser (user: UserEntity) {
    this.user = await user.getAutor()
  }

  public async getsSpecialisations () {
    try {
      const specialisations = []
      this.specialisationsID.forEach((specialisationID) => {
        const specialisation = Reposity.specialists.getSpecialisationByID(specialisationID)
        if (!specialisation) throw new Error()
        specialisations.push(specialisation)
      })
  
      this.specialisations = specialisations.filter((el) => Boolean(el))
      this.emit('update', this)
    } catch (e) {
      this.tries = this.tries + 1
      if (this.tries >= 5) return
      else this.getsSpecialisations()
    }
  }

  public async update (body: UpdateSpecialistContract) {
    await SpecialistModel.update({ ...body }, { where: { id: this.id } })
    await this.findByID(this.id)

    this.emit('update', this)
  }

  private async updateSpecialisations () {
    this.specialisationsID = this.specialisations.map((el) => el.id)
    await SpecialistModel.update({ specialisationsID: this.specialisationsID }, { where: { id: this.id } })

    this.emit('update', this)
  }

  private emit (action: TEmitterAction, body: any) {
    if (!body) return

    this.emitter.emit(action, body)
  }
}
