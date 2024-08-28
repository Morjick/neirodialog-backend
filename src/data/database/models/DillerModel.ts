import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript'
import { TDillerProductTypePermission } from '~/data/entities/DillerEntity'
import { UserModel } from './UserModel'

@Table
export class DillerModel extends Model {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number
  
  @Column({ type: DataType.STRING, unique: true })
  name: string

  @Column({ type: DataType.STRING, unique: true })
  slug: string
  
  @Column({ type: DataType.STRING, unique: true })
  email: string

  @Column({ type: DataType.TEXT })
  description: string

  @Column({ type: DataType.STRING })
  avatar: string

  @Column({ type: DataType.INTEGER })
  directorID: number

  @Column({ type: DataType.ARRAY(DataType.INTEGER) })
  adminsID: number[]
  
  @Column({ type: DataType.ARRAY(DataType.INTEGER) })
  managersID: number[]

  @Column({ type: DataType.ARRAY(DataType.INTEGER) })
  productsID: number[]

  @Column({ type: DataType.JSON })
  social: string

  @Column({ type: DataType.ARRAY(DataType.INTEGER) })
  documentsID: number[]
  
  @Column({ type: DataType.ENUM('any', 'physical', 'electronic') })
  productTypePermission: TDillerProductTypePermission

  @Column({ type: DataType.INTEGER })
  availableProductsCount: number

  @Column({ type: DataType.INTEGER })
  autorID: number

  @ForeignKey(() => UserModel)
  autor: UserModel
}
