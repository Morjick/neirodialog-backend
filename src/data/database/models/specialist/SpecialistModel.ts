import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript'
import { ISpecialistModel } from '~/data/entities/specialists/SpecialistEntity'

@Table
export class SpecialistModel extends Model<ISpecialistModel> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number

  @Column({ type: DataType.STRING })
  hash: string

  @Column({ type: DataType.INTEGER })
  userID: number

  @Column({ type: DataType.ARRAY(DataType.INTEGER) })
  specialisationsID: number[]
}
