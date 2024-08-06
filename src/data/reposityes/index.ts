import { UserReposity } from './user.reposity'
import { DillerReposity } from "./diller.reposity"
import { NewsReposity } from "./news.reposity"
import { ProductReposity } from "./product.reposity"
import { SectionReposity } from "./section.reposity"

export interface IGlobalReposisies {
  diller: DillerReposity
  products: ProductReposity
  sections: SectionReposity
  news: NewsReposity
  users: UserReposity
}


export const GlobalReposities: IGlobalReposisies = {
  diller: null,
  products: null,
  sections: null,
  news: null,
  users: null,
}

export const createReposities = async () => {
  const dillerReposity = new DillerReposity()
  const productReposity = new ProductReposity()
  const sections = new SectionReposity()
  const newsReposity = new NewsReposity()
  const userReposity = new UserReposity()

  GlobalReposities.users = await userReposity.init()
  GlobalReposities.diller = await dillerReposity.init()
  GlobalReposities.sections = await sections.init()
  GlobalReposities.products = await productReposity.buildReposity()
  GlobalReposities.news  = await newsReposity.init()
}
