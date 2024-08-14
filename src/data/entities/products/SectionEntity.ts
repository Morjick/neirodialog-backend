import getTransplit from "~/libs/getTranslate"
import { IUserOpenData, UserEntity } from "../UserEntity"
import { SectionModel } from "~/data/database/models/products/SectionModel"

export interface IProductSectionConstructor {
  name: string
  autorID: number
  slug?: string
  id?: number
}

export class SectionEntity {
  public id: number = 0
  public name: string = ''
  public slug: string = ''
  private autor: IUserOpenData = null
  private autorID: number = null

  constructor (data: IProductSectionConstructor) {
    if (!data.name) {
      throw new Error('Property field "name" for SectionEntity')
    }
    
    this.name = data.name
    this.id = data.id || 0
    this.slug = data.slug || getTransplit(this.name)
    this.autorID = data.autorID
    this.findAutor()
  }

  private async findAutor () {
    const user = new UserEntity({ userID: this.autorID })
    this.autor = await user.getAutor()
  }

  public getAutor (): IUserOpenData {
    return this.autor
  }

  public async create () {
    try {
      const isSectionExists = await SectionModel.findOne({ where: { name: this.name } })
      if (isSectionExists) return {
        status: 402,
        message: 'Раздел с таким именем уже существует',
        error: 'Раздел с таким именем уже существует',
      }

      const model = await SectionModel.create({ name: this.name, slug: this.slug, autorID: this.autorID })

      return {
        status: 200,
        message: 'Раздел создан',
        body: {
          section: model.dataValues
        }
      }
    } catch (error) {
      return {
        status: 501,
        message: 'Ошибка при создании раздела',
        error,
      }
    }
  }

  public static async delete (id: number) {
    try {
      await SectionModel.destroy({ where: { id } })

      return {
        status: 200,
        message: 'Раздел удалён',
      }
    } catch (e) {
      return {
        status: 501,
        message: 'Ошибка при удалении раздела',
        error: e,
      }
    }
  }
}
