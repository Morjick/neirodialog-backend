import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript'

@Table
export class PromocodeModel extends Model {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number

  @Column({ type: DataType.STRING })
  title: string
  
  @Column({ type: DataType.STRING, unique: true })
  hash: string

  @Column({ type: DataType.INTEGER })
  discount: number

  @Column({ type: DataType.INTEGER })
  minPrice: number

  @Column({ type: DataType.INTEGER })
  autorID: number

  @Column({ type: DataType.INTEGER, defaultValue: 1 })
  limit: number
}
