import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript'
import { IBasketModel } from '~/data/entities/user/BasketEntity'

@Table
export class BasketModel extends Model<IBasketModel> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number

  @Column({ type: DataType.INTEGER })
  userID: number

  @Column({ type: DataType.JSON, defaultValue: JSON.stringify([]) })
  items: string
}
