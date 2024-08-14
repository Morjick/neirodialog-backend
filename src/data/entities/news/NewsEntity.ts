import { NewsModel } from "~/data/database/models/news/NewsModel"
import { IUserOpenData, UserEntity } from "../UserEntity"
import getTransplit from "~/libs/getTranslate"

export interface INewsModel {
  id: number
  title: string
  description: string
  body: string
  published: boolean
  autorID: number
  slug: string
  whatches: number
  commentsID: number[]
  tags: string[]
  avatar: string
}

export interface ICreateNews {
  title: string
  description: string
  body: string
  published: boolean
  tags: string[]
  avatar: string  
}

export class NewsEntity {
  id: number
  title: string
  description: string
  body: string
  published: boolean
  autorID: number
  slug: string
  whatches: number
  commentsID: number[] = []
  tags: string[] = []
  avatar: string
  autor: IUserOpenData

  constructor () {
    this.tags = []
    this.commentsID = []
  }

  async findByID (newsID: number) {
    const result = await NewsModel.findOne({ where: { id: newsID } })
    const news: INewsModel = result.dataValues

    this.structurNews(news)
  }

  async create (data: ICreateNews, autor: UserEntity) {
    try {
      const slug = getTransplit(data.title)

      const isCandidatExists = await NewsModel.findOne({ where: { slug } })

      if (isCandidatExists) return {
        status: 400,
        message: 'Новость с таким именем не может быть создана',
        error: 'SlugIsNotUnique'
      }

      const result = await NewsModel.create({
        ...data,
        slug,
        tags: data.tags || [],
        autorID: autor.id,
        published: data.published || false,
      })

      const news: INewsModel = result.dataValues
      this.structurNews(news, autor)

      return {
        status: 201,
        message: 'Новость была создана',
        body: {
          news
        }
      }
    } catch (e) {
      return {
        status: 501,
        message: 'Ошибка при создании новости',
        error: e,
      }
    }
  }

  async update (data: ICreateNews) {
    await NewsModel.update({
      ...data,
      tags: data.tags || this.tags,
      published: data.published || false,
    }, { where: { id: this.id } })

    const result = await NewsModel.findByPk(this.id)

    const news: INewsModel = result.dataValues
    this.structurNews(news)
  }

  private async structurNews (news: INewsModel, autor?: UserEntity) {
    for (const property in news) {
      this[property] = news[property]
    }

    const user = autor?.getAutor ? await autor.getAutor() : await new UserEntity({ userID: news.autorID }).getAutor()
    this.autor = user

    this.whatches = news.whatches || 0
  }

  public incrementWatches () {
    this.whatches = this.whatches + 1
    NewsModel.update({ whatches: this.whatches }, { where: { id: this.id } })
  }

  public show () {
    this.published = true
    NewsModel.update({ published: this.published }, { where: { id: this.id } })
  }

  public hide () {
    this.published = false
    NewsModel.update({ published: this.published }, { where: { id: this.id } })
  }

  public static async delete (id: number) {
    try {
      await NewsModel.destroy({ where: { id } })

      return {
        status: 200,
        message: 'Новость удалена'
      }
    } catch (e) {
      return {
        status: 200,
        message: 'При удалении новости произошла ошибка',
        error: e,
      }
    }
  }
}
