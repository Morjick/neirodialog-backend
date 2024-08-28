import { Sequelize } from "sequelize-typescript"
import { UserModel } from "./models/UserModel"
import { createRootUser } from "./scripts/createRootUser"
import { SectionModel } from "./models/products/SectionModel"
import { DillerModel } from "./models/DillerModel"
import { createMainDiller } from "./scripts/createMainDiller"
import { ProductModel } from "./models/products/ProductModel"
import { CommentModel } from "./models/products/CommentModel"
import { NewsModel } from "./models/news/NewsModel"
import { SpecialisationModel } from "./models/specialist/SpecialisationModel"
import { SpecialistModel } from "./models/specialist/SpecialistModel"
import { BasketModel } from "./models/user/BasketModel"
import { ApplicationReviewModel } from "./models/applications/ReviewsModel"
import { PromocodeModel } from "./models/products/PromocodeModel"
import { OrderItem } from "./models/orders/OrderItem"
import { Order } from "./models/orders/OrderModel"
import { DocumentModel } from "./models/documents/Document"
import { SlotModel } from "./models/specialist/SlotModel"
import { Pages } from "./models/pages/PagesModel"
import { createDefaultPages } from "./scripts/createDefaultPages"

export interface DataBaseConstructorInterface {
  HOST: string | number
  USER: string
  PASWORD: string
  DB: string
  PORT: string | number
}

export const secretKey = process.env.JWT_SECRET_KEY

export const startNeirodialogDataBase = async (data: DataBaseConstructorInterface) => {
  const dataBaseConfig = {
    HOST: data.HOST,
    USER: data.USER,
    PASSWORD: data.PASWORD,
    DB: data.DB,
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }

  const database = new Sequelize(
    dataBaseConfig.DB,
    dataBaseConfig.USER,
    String(dataBaseConfig.PASSWORD),
    {
      host: String(dataBaseConfig.HOST),
      dialect: 'postgres',
      pool: {
        max: dataBaseConfig.pool.max,
        min: dataBaseConfig.pool.min,
        acquire: dataBaseConfig.pool.acquire,
        idle: dataBaseConfig.pool.idle,
      },
      logging: false,
      port: Number(data.PORT),
      models: [
        UserModel,
        SectionModel,
        DillerModel,
        ProductModel,
        CommentModel,
        NewsModel,
        SpecialisationModel,
        SpecialistModel,
        BasketModel,
        ApplicationReviewModel,
        PromocodeModel,
        OrderItem,
        Order,
        DocumentModel,
        SlotModel,
        Pages,
      ],
    }
  )

  try {
    await database.authenticate()
    await database.sync({ alter: true })

    await createRootUser()
    await createMainDiller()
    await createDefaultPages()
  } catch (e) {
    console.error('Ошибка при подключении к базе данных', e)
    throw new Error(e)
  }
}
