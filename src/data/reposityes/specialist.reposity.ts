import {  UpdateSpecialisationContract, UpdateSpecialistContract } from "../contracts/specialist,contracts"
import { SpecialisationModel } from "../database/models/specialist/SpecialisationModel"
import { SpecialistModel } from "../database/models/specialist/SpecialistModel"
import { ICreateSpecialisation, SpecialisationEntity } from "../entities/specialists/SpecialisationEntity"
import { ICreateSpecialist, SpecialistEntity } from "../entities/specialists/SpecialistEntity"
import { IResponse } from "../interfaces"

export type TSpecialistSort = 'ASK' | 'DESC'

export interface ISpecialistFilters {
  search?: string
  specialisations?: string[]
}

export interface IGetSpecialistOptions {
  limit?: number
  order?: number
  sort?: TSpecialistSort
  filters?: ISpecialistFilters
}

export class SpecialistReposity {
  specialistations: SpecialisationEntity[] = []
  list: SpecialistEntity[] = []
  
  constructor () {
    this.specialistations = []
    this.list = []
  }

  public async init () {
    const specialisationsID = await SpecialisationModel.findAll({ attributes: ['id'] })
    const specialistsID = await SpecialistModel.findAll({ attributes: ['id'] })

    await Promise.all([
      specialisationsID.map(async (specialisationModel) => {
        const specialisation = new SpecialisationEntity()
  
        await specialisation.findByID(specialisationModel.dataValues.id)

        this.specialistations.push(specialisation)
      }),
      specialistsID.map(async (specialistModel) => {
        const specialist = new SpecialistEntity()
        await specialist.findByID(specialistModel.dataValues.id)

        specialist.emitter.on('update', (el: SpecialistEntity) => {
          if (!el) return

          const index = this.list.findIndex(item => item.id == el.id)
          this.list[index] = el
        })

        this.list.push(specialist)
      })
    ])

    console.log('Specialist reposity init')

    return this
  }

  public getSpecialisationBySlug (slug: string) {
    return this.specialistations.find((el) => el.slug == slug)
  }

  public getSpecialisationByID (id: number) {
    return this.specialistations.find((el) => el.id == id)
  }

  public async createSpecialisation (body: ICreateSpecialisation, autorID: number) {
    const specialisation = new SpecialisationEntity()
    const result = await specialisation.create({ ...body, autorID })

    this.specialistations.push(specialisation)
    return result
  }

  public async updateSpecialisation (body: UpdateSpecialisationContract, slug: string) {
    const specialisation = this.specialistations.find((el) => el.slug == slug)
    return await specialisation.update(body)
  }

  public getSpecialistByID (id: number) {
    return this.list.find((el) => el.id == id)
  }

  public getSpecialistByUserID (userID: number) {
    return this.list.find((el) => el.userID == userID)
  }

  public getSpecialistList (options?: IGetSpecialistOptions): SpecialistEntity[] {
    const filters = options?.filters || {
      search: '',
      specialisations: []
    }

    const specialists = this.list
      .filter((specialist) => {
        const specialisationsSlug = String(filters.specialisations)
          .replace('[', '')
          .replace(']', '')
          .split(',')
          .map((el) => String(el))
          .filter((el) => !!el)
        
        const search = filters.search || ''
        const searchString = search.toLowerCase()

        if (filters.specialisations && specialisationsSlug.length) {
          const specs = specialist.specialisations
          let isSpecIncludes = false

          specs.forEach(el => {
            if (specialisationsSlug.includes(el.slug)) isSpecIncludes = true
          })

          return isSpecIncludes ? specialist : null
        }

        if (filters.search && searchString.length) {
          let isSearchValid = false

          if (specialist.user.fullname.includes(searchString)) {
            isSearchValid = true
          }

          specialist.specialisations.forEach((spec) => {
            if (spec.name.includes(searchString)) {
              isSearchValid = true
            }
          })

          return isSearchValid ? specialist : null
        }

        return specialist
      })

    return specialists
  }

  public async createSpecialist (data: ICreateSpecialist) {
    const result = await SpecialistEntity.create(data)

    if (result.status == 201) {
      const specialist = new SpecialistEntity()
      await specialist.findByID(result.body.result.id)
  
      this.list.push(specialist)
    }
    
    return result
  }

  public async updateSpecialist (data: UpdateSpecialistContract, specialistID: number): Promise<IResponse<any>> {
    const specialist = this.list.find((el) => el.id == specialistID)

    if (!specialist) return {
      status: 404,
      message: 'Специалист с таки ID не найден',
      exeption: {
        type: 'NotFound',
        message: 'Specialist not found'
      }
    }

    await specialist.update(data)

    return {
      status: 200,
      message: 'Специалист был обновлён'
    }
  }
}
