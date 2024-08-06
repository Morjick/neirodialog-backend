import { UserRoleType } from "../database/models/UserModel"
import { ProductModel } from "../database/models/products/ProductModel"
import { DillerEntity } from "../entities/DillerEntity"
import { IUserModel, UserEntity } from "../entities/UserEntity"
import { ProductEntity, TProductType } from "../entities/products/ProductEntity"
import { SectionEntity } from "../entities/products/SectionEntity"

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

  constructor () {}

  async buildReposity () {
    const products = await ProductModel.findAll()

    await Promise.all(
      products.map(async (el) => {
        const product = new ProductEntity()
        await product.findByID(el.dataValues.id)
  
        this.list.push(product)
  
        if (product.isShow) {
          this.showedProducts.push(product)
        }
      })
    )

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

  findProduct (slug: string) {
    return this.list.find(item => item.slug === slug)
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
}
