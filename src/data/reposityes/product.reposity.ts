import { ProductModel } from "../database/models/products/ProductModel"
import { DillerEntity } from "../entities/DillerEntity"
import { UserEntity } from "../entities/UserEntity"
import { ProductEntity } from "../entities/products/ProductEntity"
import { SectionEntity } from "../entities/products/SectionEntity"

export class ProductReposity {
  public list: ProductEntity[] = []
  public showedProducts: ProductEntity[] = []

  constructor () {}

  async buildReposity () {
    const products = await ProductModel.findAll()

    products.forEach(async (el) => {
      const product = new ProductEntity()
      await product.findByID(el.dataValues.id)

      this.list.push(product)

      if (product.isShow) {
        this.showedProducts.push(product)
      }
    })

    console.log('Product Reposity init')
  }

  getProducts () {
    return this.showedProducts
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
}
