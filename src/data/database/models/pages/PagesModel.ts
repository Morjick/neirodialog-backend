import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript'

export interface IPagesModel {
  id: number
  body: string
  name: string
}

@Table
export class Pages extends Model<IPagesModel> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number

  @Column({ type: DataType.TEXT })
  body: string

  @Column({ type: DataType.STRING })
  name: string
}
