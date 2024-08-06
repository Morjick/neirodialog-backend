import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript'
import { IProductCommentModel, TCommentStatus } from '~/data/entities/products/CommentEntity'

@Table
export class CommentModel extends Model<IProductCommentModel> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number

  @Column({ type: DataType.TEXT })
  message: string

  @Column({ type: DataType.INTEGER })
  autorID: number

  @Column({
    type: DataType.ENUM('published', 'moderation'),
    defaultValue: 'published',
  })
  status: TCommentStatus

  @Column({ type: DataType.INTEGER })
  productID: number
}
