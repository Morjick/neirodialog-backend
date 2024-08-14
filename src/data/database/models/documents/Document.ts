import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript'

export type TDocumentExtention = 'doc' | 'docs' | 'xlsx' | 'txt'

export interface IDocumentModel {
  id: number
  title: string
  name: string
  date: string
  autorID: number
  dillerID: number
  extention: TDocumentExtention
}

@Table
export class DocumentModel extends Model<IDocumentModel> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number

  @Column({ type: DataType.STRING })
  title: string

  @Column({ type: DataType.STRING })
  name: string

  @Column({ type: DataType.STRING })
  date: string

  @Column({ type: DataType.INTEGER })
  autorID: number

  @Column({ type: DataType.INTEGER })
  dillerID: number

  @Column({ type: DataType.STRING })
  extention: TDocumentExtention
}
