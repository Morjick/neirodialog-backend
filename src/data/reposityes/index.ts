import { UserReposity } from './user.reposity'
import { DillerReposity } from "./diller.reposity"
import { NewsReposity } from "./news.reposity"
import { ProductReposity } from "./product.reposity"
import { SectionReposity } from "./section.reposity"
import { OrderReposity } from './orders.reposity'
import { CommentReposity } from './comments.reposity'
import { SpecialistReposity } from './specialist.reposity'

export interface IGlobalReposisies {
  diller: DillerReposity
  products: ProductReposity
  sections: SectionReposity
  news: NewsReposity
  users: UserReposity
  orders: OrderReposity
  comments: CommentReposity
  specialist: SpecialistReposity
}


export const GlobalReposities: IGlobalReposisies = {
  diller: null,
  products: null,
  sections: null,
  news: null,
  users: null,
  orders: null,
  comments: null,
  specialist: null,
}

export const createReposities = async () => {
  const dillerReposity = new DillerReposity()
  const productReposity = new ProductReposity()
  const sections = new SectionReposity()
  const newsReposity = new NewsReposity()
  const userReposity = new UserReposity()
  const orderReposity = new OrderReposity()
  const commentReposity = new CommentReposity()
  const specialistReposity = new SpecialistReposity()

  GlobalReposities.users = await userReposity.init()
  GlobalReposities.diller = await dillerReposity.init()
  GlobalReposities.sections = await sections.init()
  GlobalReposities.comments = await commentReposity.init()
  GlobalReposities.products = await productReposity.buildReposity()
  GlobalReposities.news  = await newsReposity.init()
  GlobalReposities.orders = await orderReposity.buildReposity()
  await GlobalReposities.orders.buildOrders()
  GlobalReposities.specialist = await specialistReposity.init()
}

export class Reposity {
  static get orders () {
    return GlobalReposities.orders
  }

  static get sections () {
    return GlobalReposities.sections
  }

  static get products () {
    return GlobalReposities.products
  }

  static get users () {
    return GlobalReposities.users
  }

  static get diller () {
    return GlobalReposities.diller
  }

  static get news () {
    return GlobalReposities.news
  }

  static get global () {
    return GlobalReposities
  }

  static get comments () {
    return GlobalReposities.comments
  }

  static get specialists () {
    return GlobalReposities.specialist
  }
}
