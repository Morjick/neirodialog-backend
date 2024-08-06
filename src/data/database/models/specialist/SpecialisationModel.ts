import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript'
import { ISpecialisationModel } from '~/data/entities/specialists/SpecialisationEntity'

@Table
export class SpecialisationModel extends Model<ISpecialisationModel> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  name: string
  
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  slug: string

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  minOld: number

  @Column({ type: DataType.INTEGER, defaultValue: 100 })
  maxOld: number
}
