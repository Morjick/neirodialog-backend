import { CreateProductContract } from "../contracts/product.contracts"
import { UserRoleType } from "../database/models/UserModel"
import { ProductModel } from "../database/models/products/ProductModel"
import { PromocodeModel } from "../database/models/products/PromocodeModel"
import { DillerEntity } from "../entities/DillerEntity"
import { IUserModel, UserEntity } from "../entities/UserEntity"
import { ProductEntity, TProductType } from "../entities/products/ProductEntity"
import { ICreatePromocode, PromocodeEntity } from "../entities/products/PromocodeEntity"
import { SectionEntity } from "../entities/products/SectionEntity"

export type TPromocodeStatus = 'active' | 'deactive' | 'all'

export interface IProductFilters {
  type?: TProductType | 'any'
  search?: string
  minPrice?: number
  maxPrice?: number
  dillerIDs?: number[] | string
  autorIDs: number[] | string
}

export interface IGetProductsOptions {
  role?: UserRoleType
  user?: IUserModel | null
  filters?: IProductFilters
}

export interface IPromocodesOptions {
  status?: TPromocodeStatus
}

interface IOtherProducts {
  title: string
  description: string
  list: ProductEntity[]
  href: string
}

export interface IProductDetailsResponse {
  product: ProductEntity
  other: IOtherProducts[]
}

const defaultFilters: IProductFilters = {
  type: 'any',
  search: '',
  minPrice: 0,
  maxPrice: 1000000,
  dillerIDs: null,
  autorIDs: null
}

export class ProductReposity {
  public list: ProductEntity[] = []
  public showedProducts: ProductEntity[] = []
  public promocodes: PromocodeEntity[] = []

  constructor () {}

  async buildReposity () {
    const [products, promocodes] = await Promise.all([
      await ProductModel.findAll({ attributes: ['id'] }),
      await PromocodeModel.findAll({ attributes: ['id'] }),
    ])

    await Promise.all([
      products.map(async (el) => {
        const product = new ProductEntity()
        await product.findByID(el.dataValues.id)

        product.emitter.on('update', (product: ProductEntity) => {
          if (!product) return

          const productIndex = this.list.findIndex((el) => el.id == product.id)

          this.list[productIndex] = product
        })
  
        this.list.push(product)
  
        if (product.isShow) {
          this.showedProducts.push(product)
        }
      }),
      promocodes.map(async (el) => {
        const promocode = new PromocodeEntity()

        promocode.emitter.on('init', (element) => {
          this.promocodes.push(element)
        })

        await promocode.findByID(el.dataValues.id)
      }),
    ])

    console.log('Product Reposity init')
    return this
  }

  getProducts (options?: IGetProductsOptions): ProductEntity[] {
    const {
      role = 'USER',
      user = null,
      filters = defaultFilters,
    } = options

    const products = this.getListForRole(role, user)
      .filter((product) => {
        const dillersIDs = String(filters.dillerIDs).replace('[', '').replace(']', '').split(',').map((el) => Number(el)).filter((el) => !!el)
        const autorIDs = String(filters.autorIDs).replace('[', '').replace(']', '').split(',').map((el) => Number(el)).filter((el) => !!el)

        if ((filters.type && filters.type !== 'any') && product.type !== filters.type) return null

        if ((filters.minPrice && filters.minPrice > 0) && product.price < filters.minPrice) return null
        if ((filters.maxPrice && filters.maxPrice < 1000000) && product.price > filters.maxPrice) return null

        if ((filters.dillerIDs && dillersIDs.length) && !dillersIDs.includes(product.diller.id)) return null
        if ((filters.autorIDs && autorIDs.length) && !autorIDs.includes(product.autor.id)) return null

        if (filters.search) {
          const searchString = filters.search.toLowerCase()
          const tags = product.tags || []
          let isOk = false

          if (product.name.toLowerCase().includes(searchString)) isOk = true
          if (String(product.description).toLowerCase().includes(searchString)) isOk = true

          tags.forEach((tag) => {
            if (!tag) return
            if (String(tag).toLowerCase().includes(searchString)) isOk = true
          })

          if (!isOk) return null
        }

        return product
      })

    return products
  }

  getProductsForAutor (autorID: number) {
    return this.list.filter((item) => item.autorID === autorID)
  }

  getProductsForDiller (dillerID: number) {
    return this.list.filter(item => item.dillerID === dillerID)
  }

  async addProduct (productID: number) {
    const product = new ProductEntity()
    await product.findByID(productID)

    this.list = [...this.list, product]
    if (product.isShow) {
      this.showedProducts.push(product)
    }
  }

  updateShowedList () {
    const showed = this.list.filter((el) => el.isShow)
    this.showedProducts = [...showed]
  }

  async changeSectionForProduct (productID: number, section: SectionEntity) {
    const product = this.list.find(el => el.id === productID)

    if (!product) return {
      status: 404,
      message: 'Продукт не был найден'
    }

    await product.changeSection(section)
    this.updateShowedList()

    return {
      status: 200,
      message: 'Продукт перенесён в другой отдел'
    }
  }

  accessPermissions (productID: number, diller: DillerEntity, user: UserEntity) {
    try {
      const product = this.list.find(el => el.id === productID)
      const role = user.getRole()

      if (!product) return {
        ok: false,
        message: 'Продукт не найден',
        status: 404,
      }

      if (role == 'ADMIN' || role == 'ROOT') return {
        status: 200,
        ok: true,
        message: 'Роль позволяет повлиять на продукт'
      }

      if (product.diller.id !== diller.id) return {
        status: 301,
        message: 'Нет доступа',
        ok: false,
      }

      return {
        ok: true,
        message: 'Доступ разрешён',
        status: 200,
      }
    } catch (e) {
      return {
        ok: false,
        message: 'Не удалось установить пользователя',
        status: 403,
        error: e,
      }
    }
  }

  findProduct (slug: string): IProductDetailsResponse {
    const product = this.list.find(item => item.slug === slug)

    const other: IOtherProducts[] = []

    const dillerProducts = this.publicList
      .filter(el => el.dillerID == product.dillerID)
      .filter((el, index) => index <= 5)

    const similarProducts = this.publicList
      .filter((el) => {
        if (el.sectionID == product.sectionID && el.type == product.type) return el

        const tags = el.tags || []
        let isIncludesTag = false
        tags.forEach((tag) => {
          const isInclude = product.tags.includes(tag)
          if (isInclude) isIncludesTag = true
        })

        if (isIncludesTag) return el

        return null
      })
      .filter(el => Boolean(el))
      .filter((el, index) => index <= 5)

    other.push({
      title: 'Другие продукты от того же продавца',
      description: `Продукты от ${product.diller.name}`,
      href: `dillerIDs=[${product.dillerID}]`,
      list: dillerProducts,
    })
    other.push({
      title: 'Похожие продукты',
      description: `Мы постарались подобрать для вас похожие продукты`,
      href: `type=${product.type}`,
      list: similarProducts,
    })

    return {
      product,
      other,
    }
  }

  findProductByID (id: number) {
    return this.list.find(item => item.id === id)
  }

  getListForRole (role: UserRoleType, user?: IUserModel): ProductEntity[] {
    if (role == 'ROOT' || role === 'ADMIN') return this.list

    if (role === 'DILLER') return this.list.map((product) => {
      const isDiller = user ? product.diller.accessUser(user.id) : false
      if (product.isShow || isDiller) return product
    })

    if (role === 'MODERATOR' || role === 'USER') return this.showedProducts

    return this.showedProducts
  }

  getPromocodes (options: IPromocodesOptions) {
    this.promocodes = this.promocodes.filter((el) => Boolean(el))
    let promo = []

    if (options.status == 'active') {
      promo = this.promocodes.filter((el) => el.isActive)
    } else if (options.status == 'deactive') {
      promo = this.promocodes.filter((el) => !el.isActive)
    } else {
      promo = this.promocodes
    }

    return promo
  }

  public getProductByID (id: number) {
    const product = this.list.find(el => el.id == id)

    return product || null
  }

  async createPromocode (body: ICreatePromocode) {
    const promocode = new PromocodeEntity()
    const result = await promocode.create(body)

    this.promocodes.push(promocode)

    return result
  }

  async deleteProduct (id: number) {
    this.list = this.list.filter((el) => el.id !== id)
    this.showedProducts = this.showedProducts.filter((el) => el.id !== id)

    return await ProductEntity.delete(id)
  }

  async updateProduct (data: CreateProductContract, diller: DillerEntity, user: IUserModel, productID: number) {
    const product = this.list.find(el => el.id == productID)

    return await product.update(data, diller, user)
  }

  public get publicList () {
    return this.list.filter((el) => el.isShow)
  }
}
