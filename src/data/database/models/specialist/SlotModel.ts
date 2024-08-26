import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript'
import { ISlotModel, TSlotDuration, TSlotStatus, TSlotType } from '~/data/entities/specialists/SlotEntity'

@Table
export class SlotModel extends Model<ISlotModel> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number

  @Column({ type: DataType.INTEGER })
  userID: number

  @Column({ type: DataType.INTEGER, allowNull: false })
  specialistID: number

  @Column({ type: DataType.STRING })
  comment: string

  @Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] })
  promocodes: string[]

  @Column({ type: DataType.STRING, allowNull: false })
  datemark: string

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isAutoAproove: boolean

  @Column({ type: DataType.INTEGER, defaultValue: 2 })
  limit: number

  @Column({ type: DataType.ARRAY(DataType.INTEGER), defaultValue: [] })
  peoplesID: number[]

  @Column({ type: DataType.ENUM('lecture', 'consultation', 'seminar', 'lesson'), defaultValue: 'lesson' })
  type: TSlotType

  @Column({ type: DataType.ENUM('10', '20', '30', '40', '60', '90'), defaultValue: '60' })
  duration: TSlotDuration

  @Column({ type: DataType.ENUM('created', 'start', 'end'), defaultValue: 'created' })
  status: TSlotStatus
}
