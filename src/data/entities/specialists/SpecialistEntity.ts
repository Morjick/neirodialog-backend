import { createRandomString } from "~/libs/createRandomString"
import { IUserOpenData, UserEntity } from "../UserEntity"
import { SpecialisationEntity } from "./SpecialisationEntity"
import { SpecialistModel } from "~/data/database/models/specialist/SpecialistModel"

export interface ISpecialistModel {
  id: number
  hash: string
  userID: number
  specialisationsID: number[]
}

export interface ICreateSpecialist {
  user: UserEntity
  specialisationsID?: number[]
}

export class SpecialistEntity {
  public id: number
  public hash: string
  public userID: number
  public specialisationsID: number[]
  public specialisations: SpecialisationEntity[] = []
  public user: IUserOpenData
  
  constructor () {
    this.hash = createRandomString()
    this.specialisations = []
    this.specialisationsID = []
  }

  public async findByID (id: number) {
    const result = await SpecialistModel.findByPk(id)
    const specialisation = result.dataValues
    
    for (const property in specialisation) {
      this[property] = specialisation[property]
    }
  }

  public async create (data: ICreateSpecialist) {
    try {
      const result = await SpecialistModel.create({
        hash: createRandomString(),
        userID: data.user.id,
        specialisationsID: data.specialisationsID || [],
      })

      await this.findByID(result.dataValues.id)
      this.setUser(data.user)

      return {
        status: 200,
        message: 'Специалист был создан',
        body: {}
      }
    } catch(e) {
      return {
        status: 501,
        message: 'При создании специалиста произошла ошибка',
        error: e,
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

  private async updateSpecialisations () {
    this.specialisationsID = this.specialisations.map((el) => el.id)
    await SpecialistModel.update({ specialisationsID: this.specialisationsID }, { where: { id: this.id } })
  }
}
