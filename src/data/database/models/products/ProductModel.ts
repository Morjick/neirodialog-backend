import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript'
import { IProductModel, TProductType } from '~/data/entities/products/ProductEntity'

@Table
export class ProductModel extends Model<IProductModel> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number
  
  @Column({ type: DataType.STRING, unique: true })
  name: string

  @Column({ type: DataType.TEXT })
  description: string

  @Column({ type: DataType.TEXT })
  body: string

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  slug: string

  @Column({ type: DataType.ENUM('electronic', 'physical'), allowNull: false })
  type: TProductType

  @Column({ type: DataType.INTEGER })
  countInStock: number

  @Column({ type: DataType.BOOLEAN })
  isShow: boolean

  @Column({ type: DataType.JSON })
  features: string

  @Column({ type: DataType.INTEGER })
  price: number

  @Column({ type: DataType.INTEGER })
  discount: number

  @Column({ type: DataType.STRING })
  avatar: string

  @Column({ type: DataType.STRING })
  images: string[]

  @Column({ type: DataType.STRING })
  videos: string[]

  @Column({ type: DataType.INTEGER })
  sectionID: number

  @Column({ type: DataType.INTEGER, allowNull: false })
  autorID: number

  @Column({ type: DataType.INTEGER, allowNull: false })
  dillerID: number

  @Column({ type: DataType.ARRAY(DataType.STRING) })
  tags: string[]

  @Column({ type: DataType.ARRAY(DataType.INTEGER) })
  commentsID: number[]

  @Column({ type: DataType.ARRAY(DataType.INTEGER) })
  documentsID: number[]
}
