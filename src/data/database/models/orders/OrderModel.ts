import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript'
import { TOrderStatus } from '~/data/entities/orders/OrderEntity'

@Table
export class Order extends Model {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number

  @Column({ type: DataType.ARRAY(DataType.INTEGER), defaultValue: [] })
  items: number[]

  @Column({ type: DataType.STRING, unique: true, })
  hash: string

  @Column({ type: DataType.STRING, })
  date: string

  @Column({ type: DataType.INTEGER })
  userID: number

  @Column({ type: DataType.INTEGER })
  basketID: number
  
  @Column({ type: DataType.ENUM('created', 'processing', 'assemble', 'sent', 'received'), defaultValue: 'created' })
  status: TOrderStatus
}
