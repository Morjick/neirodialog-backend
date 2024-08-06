import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript'
import { UserModel } from '../UserModel'

@Table
export class SectionModel extends Model {
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

  @Column({ type: DataType.INTEGER })
  autorID: number

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.INTEGER })
  autor: UserModel
}
