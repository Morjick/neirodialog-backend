import { Body, Delete, Get, JsonController, Params, Patch, Post, QueryParams, Req, UseBefore } from "routing-controllers"
import { CreateNewsContract, UpdatePublishedContract } from "~/data/contracts/news.contracts"
import { NewsEntity } from "~/data/entities/news/NewsEntity"
import { IUserModel } from "~/data/entities/UserEntity"
import { GlobalReposities, IGlobalReposisies } from "~/data/reposityes"
import { AdminMiddleware } from "~/middleware/admin.middleware"
import { IsAuthMiddleware } from "~/middleware/auth.middleware"

@JsonController('/news')
export class NewsController {
  public reposities: IGlobalReposisies = GlobalReposities

  @Get('/get-news')
  @UseBefore(IsAuthMiddleware)
  getNews (@Req() request, @QueryParams() filters) {
    const user: IUserModel | null = request.user

    const options = {
      role: user ? user.role : 'USER',
      filters,
    }

    const news = this.reposities.news.getList(options)

    return {
      status: 200,
      message: 'Новости получены',
      body: {
        news,
        totalCount: news.length,
      }
    }
  }

  @Get('/get-news/:slug')
  @UseBefore(IsAuthMiddleware)
  async getNewsItem (@Req() request, @Params() params, ) {
    const user: IUserModel | null = request.user
    const slug = params.slug

    const news = this.reposities.news.getNews(slug)

    const isHavePermissionsForRole = user?.role === 'ADMIN' || user?.role === 'ROOT'

    if (!news.published && !isHavePermissionsForRole) return {
      status: 404,
      message: 'Новость не найдена. Возможно, она была удалена',
      error: 'NotFound',
    }

    news.incrementWatches()

    return {
      status: 200,
      message: 'Новость получены',
      body: {
        news,
      }
    }
  }

  @Post('/create-news')
  @UseBefore(AdminMiddleware)
  async createNews (@Body() body: CreateNewsContract, @Req() request) {
    const user = request.user

    const news = new NewsEntity()
    const response = await news.create(body, user)

    if (response.error) return response

    this.reposities.news.addNews(news)

    return response
  }

  @Delete('/delete-news/:id')
  @UseBefore(AdminMiddleware)
  async deleteNews (@Params() params) {
    const { id } = params

    return this.reposities.news.delete(id)
  }

  @Patch('/update-news/:slug')
  @UseBefore(AdminMiddleware)
  async updateNews (@Body() body: CreateNewsContract, @Params() params) {
    const slug = params.slug

    const news = this.reposities.news.getNews(slug)
    await news.update(body)

    return {
      status: 200,
      message: 'Новость изменена',
      body: {
        news,
        slug,
      }
    }
  }

  @Post('/update-published')
  @UseBefore(AdminMiddleware)
  async updatePublished (@Body() body: UpdatePublishedContract) {
    const news = this.reposities.news.getNews(body.slug)

    if (body.published) {
      news.show()
    } else {
      news.hide()
    }

    return {
      status: 200,
      message: 'Новость изменена',
      body: {
        slug: news.slug,
      }
    }
  }
}
