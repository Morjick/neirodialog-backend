import { SpecialisationModel } from "~/data/database/models/specialist/SpecialisationModel"
import getTransplit from "~/libs/getTranslate"

export interface ISpecialisationModel {
  id: number
  name: string
  slug: string
  minOld: number
  maxOld: number
}

export interface ICreateSpecialisation {
  name: string
  minOld?: number
  maxOld?: number
} 

export class SpecialisationEntity {
  id: number
  name: string
  slug: string
  minOld: number
  maxOld: number

  constructor () {}

  async create (data: ICreateSpecialisation) {
    try {
      this.minOld = data.minOld
      this.maxOld = data.maxOld

      const specialisation = {
        name: data.name,
        minOld: this.minOld,
        maxOld: this.maxOld,
        slug: getTransplit(data.name)
      }

      const result = await SpecialisationModel.create(specialisation)

      return {
        ok: true,
        specialisation: result.dataValues,
      }
    } catch (e) {
      return {
        ok: false,
        error: e,
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
  }
}
