import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript'

export type TReviewMessager = 'telegram' | 'whatsapp' | 'vk'

export interface IApplicationReviewModel {
  id: number
  name: string
  nickname: string
  body: string
  date: string
  messagerType: TReviewMessager
  messagerHref: string
}

@Table
export class ApplicationReviewModel extends Model<IApplicationReviewModel> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number
  
  @Column({ type: DataType.STRING, allowNull: false })
  name: string

  @Column({ type: DataType.STRING, allowNull: false })
  nickname: string

  @Column({ type: DataType.TEXT })
  body: string

  @Column({ type: DataType.STRING })
  date: string

  @Column({ type: DataType.ENUM('telegram', 'whatsapp', 'vk') })
  messagerType: TReviewMessager

  @Column({ type: DataType.STRING })
  messagerHref: string

  @Column({ type: DataType.INTEGER })
  autorID: number
}
