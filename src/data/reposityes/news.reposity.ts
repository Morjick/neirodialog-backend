import { NewsModel } from "../database/models/news/NewsModel"
import { UserRoleType } from "../database/models/UserModel"
import { NewsEntity } from "../entities/news/NewsEntity"

export type TNewsSort = 'ASK' | 'DESC'

export interface INewsFilters {
  search?: string
  autorIDs: number[] | string
}

export interface GetNewsListOptions {
  role?: UserRoleType
  limit?: number
  order?: number
  sort?: TNewsSort
  filters?: INewsFilters
}

export class NewsReposity {
  list: NewsEntity[] = []

  constructor () {}

  async init () {
    const news = await NewsModel.findAll({ attributes: ['id'] })

    await Promise.all(
      news.map(async (el) => {
        const item = new NewsEntity()
        item.findByID(el.dataValues.id)
  
        this.list.push(item)
      })
    )

    console.log('News Reposity init')
    return this
  }

  getList (options?: GetNewsListOptions) {
    const filters = options?.filters || {
      search: '',
      autorIDs: [],
    }
    const limit = options.limit || 5

    const isHavePermissionsForRole = options?.role === 'ADMIN' || options?.role === 'ROOT'

    const list = [...this.list]
      .filter((el) => isHavePermissionsForRole ? el : el.published === true)
      .filter((news) => {
        const autorIDs = String(filters.autorIDs).replace('[', '').replace(']', '').split(',').map((el) => Number(el)).filter((el) => !!el)

        if ((filters.autorIDs && autorIDs.length) && !autorIDs.includes(news.autor.id)) return null

        if (filters.search) {
          const searchString = filters.search.toLowerCase()
          const tags = news.tags || []
          let isOk = false

          if (news.title.toLowerCase().includes(searchString)) isOk = true
          if (String(news.description).toLowerCase().includes(searchString)) isOk = true

          tags.forEach((tag) => {
            if (!tag) return
            if (String(tag).toLowerCase().includes(searchString)) isOk = true
          })

          if (!isOk) return null
        }

        return news
      })
      .sort((prev, el) => {
        if (prev.id < el.id) return -1
        if (prev.id > el.id) return +1

        return 0
      })
      .filter((el, ind) => ind < limit)

    return list
  }

  addNews (news: NewsEntity) {
    this.list = [...this.list, news]
  }

  getNews (slug: string) {
    return this.list.find((item) => item.slug === slug)
  }

  async delete (id: number) {
    const newsIndex = this.list.findIndex((el) => el.id == id)
    this.list[newsIndex] = null
    this.list = this.list.filter(el => Boolean(el))

    return await NewsEntity.delete(id)
  }
}
