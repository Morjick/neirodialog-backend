import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript'
import { TOrderStatus } from '~/data/entities/orders/OrderEntity'

export interface IOrderItemModel {
  id: number
  status: TOrderStatus
  count: number
  hash: string
  date: string
  productID: number
}

@Table
export class OrderItem extends Model<IOrderItemModel> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number

  @Column({ type: DataType.ENUM('created', 'processing', 'assemble', 'sent', 'received'), defaultValue: 'created' })
  status: TOrderStatus

  @Column({ type: DataType.INTEGER, defaultValue: 1 })
  count: number

  @Column({ type: DataType.STRING, unique: true })
  hash: string

  @Column({ type: DataType.STRING })
  date: string

  @Column({ type: DataType.INTEGER, allowNull: false })
  productID: number
}
