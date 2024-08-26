import { SlotModel } from "~/data/database/models/specialist/SlotModel"
import { IUserOpenData } from "../UserEntity"
import { SpecialistEntity } from "./SpecialistEntity"
import { Reposity } from "~/data/reposityes"
import { CreateSlotContract } from "~/data/contracts/specialist,contracts"
import { IResponse } from "~/data/interfaces"

export type TSlotType = 'lecture' | 'consultation' | 'seminar' | 'lesson'
export type TSlotDuration = 10 | 20 | 30 | 40 | 60 | 90
export type TSlotStatus = 'created' | 'start' | 'end'

export interface ISlotModel {
  id: number
  userID: number
  specialistID: number
  comment: string
  promocodes: string[]
  datemark: string
  isAutoAproove: boolean
  limit: number
  peoplesID: number[]
  type: TSlotType
  duration: TSlotDuration
  status: TSlotStatus
}

export class SlotEntity {
  public id: number
  public userID: number
  public specialistID: number
  public comment: string
  public promocodes: string[]
  public datemark: string
  public isAutoAproove: boolean
  public limit: number
  public peoplesID: number[]
  public type: TSlotType
  public duration: TSlotDuration
  public status: TSlotStatus

  public specialist: SpecialistEntity
  public user: IUserOpenData

  constructor () {}

  public async findByID (id: number) {
    const result = await SlotModel.findByPk(id)
    const slot = result.dataValues

    for (const property in slot) {
      this[property] = slot[property]
    }

    this.specialist = Reposity.specialists.getSpecialistByID(this.specialistID)

    const user = Reposity.users.findByID(this.userID)
    this.user = await user.getAutor()
  }

  public static async create (body: CreateSlotContract): Promise<IResponse<any>> {
    try {
      const slotData = {
        type: body.type,
        duration: body.duration,
        datemark: `${body.date} ${body.time}`,
        promocodes: body.promocodes || [],
        limit: body.limit || 2,
        isAutoAproove: body.isAutoAproove || false,
        comment: body.comment || '',
      }
  
      const result = await SlotModel.create(slotData)

      return {
        status: 201,
        message: 'Запись создана',
        body: {
          slot: result,
        }
      }
    } catch (error) {
      return {
        status: 501,
        message: 'Не удалось создать запись',
        error: new Error(error),
        exeption: {
          type: 'Unexepted',
          message: new Error(error).message
        }
      }
    }
  }
}
