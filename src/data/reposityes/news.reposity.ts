import { NewsModel } from "../database/models/news/NewsModel"
import { UserRoleType } from "../database/models/UserModel"
import { NewsEntity } from "../entities/news/NewsEntity"

export type TNewsSort = 'ASK' | 'DESC'

export interface GetNewsListOptions {
  role?: UserRoleType
  limit?: number
  order?: number
  sort?: TNewsSort
} 

export class NewsReposity {
  list: NewsEntity[] = []

  constructor () {}

  async init () {
    const news = await NewsModel.findAll()

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
    const limit = options.limit || 5

    const isHavePermissionsForRole = options?.role === 'ADMIN' || options?.role === 'ROOT'

    const list = this.list
      .filter((el) => isHavePermissionsForRole ? el : el.published === true)
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
}
