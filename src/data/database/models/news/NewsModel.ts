import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript'
import { INewsModel } from '~/data/entities/news/NewsEntity'

@Table
export class NewsModel extends Model<INewsModel> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number

  @Column({ type: DataType.STRING, unique: true })
  title: string

  @Column({ type: DataType.STRING })
  description: string

  @Column({ type: DataType.TEXT })
  body: string

  @Column({ type: DataType.INTEGER })
  autorID: number

  @Column({ type: DataType.ARRAY(DataType.STRING) })
  tags: string[]

  @Column({ type: DataType.BOOLEAN })
  published: boolean

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  slug: string

  @Column({ type: DataType.INTEGER })
  whatches: number

  @Column({ type: DataType.ARRAY(DataType.INTEGER) })
  commentsID: number[]

  @Column({ type: DataType.STRING })
  avatar: string
}
