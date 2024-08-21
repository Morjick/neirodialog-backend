import { Body, Delete, Get, JsonController, Params, Patch, Post, QueryParams, Req, UseBefore } from "routing-controllers"
import {
  AddToCartContract,
  ChangeSectionForProductContract,
  CreateCommentContract,
  CreateDillerContract,
  CreateProductContract,
  CreateProductSectionContract,
  CreatePromocodeContract,
} from "~/data/contracts/product.contracts"
import { DillerEntity } from "~/data/entities/DillerEntity"
import { IUserModel, UserEntity } from "~/data/entities/UserEntity"
import { ProductEntity } from "~/data/entities/products/ProductEntity"
import { SectionEntity } from "~/data/entities/products/SectionEntity"
import { GlobalReposities, IGlobalReposisies, Reposity } from "~/data/reposityes"
import { IPromocodesOptions } from "~/data/reposityes/product.reposity"
import { AdminMiddleware } from "~/middleware/admin.middleware"
import { AuthMiddleware, IsAuthMiddleware } from "~/middleware/auth.middleware"
import { DillerMiddleware } from "~/middleware/diller.middleware"

@JsonController('/products')
export class ProductsController {
  public reposities: IGlobalReposisies = GlobalReposities

  @Post('/create-section')
  @UseBefore(AdminMiddleware)
  async createSection (@Body() body: CreateProductSectionContract, @Req() request) {
    const user: IUserModel = request.user
    const Section = new SectionEntity({ autorID: user.id, name: body.name })
    
    const sectionItem = await Section.create()

    if (sectionItem.status == 200 || sectionItem.status == 201) {
      this.reposities.sections.addSection(Section)
    }

    return sectionItem
  }

  @Get('/get-sections')
  async getSections () {
    return {
      status: 200,
      message: 'Разделы были получены',
      body: {
        sections: this.reposities.sections.getList(),
      }
    }
  }

  @Delete('/delete-sections/:id')
  @UseBefore(AdminMiddleware)
  async deleteSections (@Params() params) {
    const { id } = params

    return await this.reposities.sections.deleteSection(id)
  }

  @Post('/create-diller')
  @UseBefore(AdminMiddleware)
  async createDiller (@Body() body: CreateDillerContract, @Req() request) {
    const user: IUserModel = request.user

    const diller = new DillerEntity()
    const response = await diller.create({
      ...body,
      autorID: user.id,
    })

    if (response.status > 201) return response

    this.reposities.diller.addDiller(diller)

    return {
      status: 201,
      message: 'Диллер был создан',
      body: {
        diller,
      }
    }
  }

  @Get('/get-dillers')
  async getDillers () {
    const list = this.reposities.diller.getList()

    return {
      status: 200,
      message: 'Список диллеров получен',
      body: {
        dillers: list,
      }
    }
  }

  @Post('/create-product')
  @UseBefore(DillerMiddleware)
  async createProduct (@Body() body: CreateProductContract, @Req() request) {
    const user = request.user
    const diller = request.diller

    const Product = new ProductEntity()

    const product = await Product.create(body, diller, user)

    if (product.status == 200 || product.status == 201) {
      await Reposity.products.addProduct(product.body.product.id)
    }

    return {
      status: product.status,
      message: product.message,
      error: product.error,
      body: product.body,
    }
  }

  @Delete('/delete-product/:id')
  @UseBefore(AdminMiddleware)
  async deleteProduct (@Params() params) {
    const { id } = params

    return await this.reposities.products.deleteProduct(id)
  }

  @Patch('/update-product/:id')
  @UseBefore(DillerMiddleware)
  async updateProduct (@Params() params, @Req() request, @Body() body: CreateProductContract) {
    try {
      const id = params.id
      const user: IUserModel = request.user
      const diller: DillerEntity = request.diller

      if (!diller || !id) return {
        status: 301,
        message: 'Не удалось установить диллера или найти продукт',
        error: 'Invalid'
      }

      return await Reposity.products.updateProduct(body, diller, user, id)
    } catch (e) {
      return {
        status: 501,
        message: 'Не удалось изменить продукт',
        error: 'Unexeption'
      }
    }
  }

  @Get('/get-products')
  @UseBefore(IsAuthMiddleware)
  async getProducts (@Req() request, @QueryParams() filters) {
    const user: IUserModel | null = request.user

    const options = {
      role: user ? user.role : 'USER',
      user: user,
      filters,
    }

    const products = this.reposities.products.getProducts(options)

    return {
      status: 200,
      message: 'Список продуктов получен',
      body: {
        totalCount: products.length,
        products,
        sections: this.reposities.sections.getList(),
      }
    }
  }

  @Get('/get-products/:slug')
  async getProductItem (@Params() params, @Req() request) {
    const response = this.reposities.products.findProduct(params.slug)
    const product = response.product

    if (!product || !product.isShow) {
      const user: UserEntity = request.user

      if (product && user?.getRole() !== 'USER') {
        if (product) return {
          status: 200,
          message: 'Вам продукт показан, но для остальных пользователей он скрыт',
          toast: 'warning',
          body: response,
        }
      }

      return {
        status: 404,
        message: 'Продукт не был найден ',
        error: 'NotFound'
      }
    }

    return {
      status: 200,
      message: 'Продукты получены',
      body: response,
    }
  }

  @Post('/set-product-section')
  @UseBefore(DillerMiddleware)
  async changeSection (@Body() body: ChangeSectionForProductContract, @Req() request) {
    const user = this.reposities.users.findByID(request.user.id)
    const diller = request.diller

    const isHavePermissions = this.reposities.products.accessPermissions(body.productID, diller, user)
    if (!isHavePermissions.ok) return {
      status: isHavePermissions.status,
      message: isHavePermissions.message,
      error: 'У вас нет досутпа'
    }

    const section = this.reposities.sections.list.find(el => el.id === body.sectionID)
    const result = await this.reposities.products.changeSectionForProduct(body.productID, section)

    if (result.status !== 200) return {
      status: result.status,
      error: result.message,
      message: result.message,
    }

    return {
      status: 200,
      message: result.message,
      body: {
        section,
      }
    }
  }

  @Post('/add-comment')
  @UseBefore(AuthMiddleware)
  async addComments (@Body() body: CreateCommentContract, @Req() request) {
    const user = request.user
    const product = this.reposities.products.findProductByID(body.productID)

    if (!product) return {
      status: 404,
      message: 'Продукт не найден',
      error: 'NotFound'
    }

    const result = await product.addComment(body, user.id)

    return {
      status: 201,
      message: result.message,
    }
  }

  @Post('/add-to-cart')
  @UseBefore(AuthMiddleware)
  async addToCart (@Req() request, @Body() body: AddToCartContract) {
    const user = this.reposities.users.findByID(request.user.id)
    const { product } = this.reposities.products.findProduct(body.slug)

    if (!product) return {
      status: 404,
      message: 'Продукт не найден',
      error: 'NotFound'
    }
    
    const result = await user.addToCart({
      productID: product.id,
      count: body.count || 0
    })

    return {
      status: result.status,
      message: result.message,
      error: result.error,
      body: {
        basket: user.getBasket()
      },
    }
  }

  @Get('/promocodes')
  @UseBefore(IsAuthMiddleware)
  async getPromocodes (@Req() request) {
    const user: IUserModel = request.user

    const options: IPromocodesOptions = {
      status: user?.role === 'USER' ? 'active' : 'all'
    }

    const promocodes = this.reposities.products.getPromocodes(options)

    return {
      status: 200,
      message: 'Промокоды получены',
      body: {
        promocodes,
      },
    }
  }

  @Post('/create-promocode')
  @UseBefore(AdminMiddleware)
  async createPromocode (@Body() body: CreatePromocodeContract, @Req() request) {
    const user: IUserModel = request.user

    const result = await this.reposities.products.createPromocode({
      ...body,
      autorID: user.id
    })

    return {
      status: result.status,
      message: result.message,
      body: {
        ...result.body,
      },
    }
  }
}
