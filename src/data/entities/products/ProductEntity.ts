import { ProductModel } from "~/data/database/models/products/ProductModel"
import { IUserModel, IUserOpenData, UserEntity } from "../UserEntity"
import { DillerEntity } from "../DillerEntity"
import { CreateCommentContract, CreateProductContract } from "~/data/contracts/product.contracts"
import getTransplit from "~/libs/getTranslate"
import { SectionEntity } from "./SectionEntity"
import { CommentEntity } from "./CommentEntity"
import { GlobalReposities, IGlobalReposisies } from "~/data/reposityes"

export type TProductType = 'electronic' | 'physical'

export interface IProductFeatures {
  weight: number
  size: string
  ageRestrictions: number
}

export interface IProductModel {
  id: number
  name: string
  description: string
  body: string
  isShow: boolean
  slug: string
  type: TProductType
  countInStock: number
  features: string
  price: number
  discount: number
  avatar: string
  images: string[]
  videos: string[]
  sectionID: number
  autorID: number
  dillerID: number
  autor: IUserOpenData
  diller: DillerEntity
  tags: string[]
  commentsID: number[]
}

const reposities: IGlobalReposisies = GlobalReposities

export class ProductEntity {
  id: number
  name: string
  description: string
  body: string
  isShow: boolean
  slug: string
  type: TProductType
  countInStock: number
  features: IProductFeatures
  price: number
  discount: number
  avatar: string
  images: string[]
  videos: string[]
  sectionID: number
  autorID: number
  dillerID: number
  autor: IUserOpenData
  diller: DillerEntity
  totalPrice: number
  tags: string[]
  commentsID: number[]
  section: SectionEntity = null
  comments: CommentEntity[]

  constructor () {}

  async findByID (productID: number) {
    const response = await ProductModel.findByPk(productID)
    const product = response.dataValues

    for (const property in product) {
      this[property] = product[property]
    }

    const Autor = new UserEntity({ userID: product.autorID })
    const Diller = new DillerEntity()
    await Diller.getFromID(this.dillerID)

    this.totalPrice = this.discount ? this.price - (this.price / this.discount * 100) : this.price
    this.autor = await Autor.getAutor()
    this.diller = Diller
    this.features = JSON.parse(product.features)
    this.commentsID = product.commentsID || []
    this.comments = []

    this.commentsID.forEach((item) => {
      const comment = new CommentEntity()
      comment.findByID(item)

      this.comments.push(comment)
    })

    if (this.sectionID) {
      this.section = reposities.sections.getList().find((el) => el.id == this.sectionID)
    }
  }

  async create (data: CreateProductContract, diller: DillerEntity, user: IUserModel) {
    try {
      if (!user || !diller) return {
        status: 401,
        message: 'Не удалось установить автора',
        error: 'AutorExeption',
      }

      const isProductTypeAccessed = diller.accessProductType(data.type)
      if (!isProductTypeAccessed) return {
        status: 301,
        message: 'Вы не можете создаваать продукт такого типа',
        error: 'Вы не можете создаваать продукт такого типа',
      }

      const isProductNameExists = await ProductModel.findOne({ where: { name: data.name } })
      if (isProductNameExists) return {
        status: 301,
        message: 'Товар с таким именем уже существует',
        error: 'Товар с таким именем уже существует',
      }

      const slug = getTransplit(data.name)

      const product = await ProductModel.create({
        slug,
        name: data.name,
        type: data.type,
        price: data.price,
        autorID: user.id,
        dillerID: diller.id,
        discount: data.discount || 0,
        isShow: data.isShow || false,
      })
  
      return {
        status: 201,
        message: 'Продукт был успешно создан',
        body: {
          slug,
          product: product.dataValues,
        }
      } 
    } catch (e) {
      if (e?.name === 'SequelizeUniqueConstraintError') return {
        status: 301,
        message: 'Товар с таким именем уже существует',
        error: 'Товар с таким именем уже существует',
      }
      console.log(e)

      return {
        status: 501,
        message: 'При создании продукта произошла ошибка',
        error: e
      }
    }
  }

  async changeSection (section: SectionEntity) {
    this.sectionID = section.id
    this.section = section

    ProductModel.update({ sectionID: this.sectionID }, { where: { id: this.id } })
  }

  async addComment (data: CreateCommentContract, autorID: number) {
    const comment = new CommentEntity()
    await comment.create(data, autorID)

    this.commentsID.push(comment.id)
    this.comments = [...this.comments, comment]

    await ProductModel.update({ commentsID: this.commentsID }, { where: { id: this.id } })

    return {
      status: 201,
      message: comment.status == 'published' ? 'Комментарий был опубликован' : 'Комментарий отправлен на модерацию',
    }
  }
}
