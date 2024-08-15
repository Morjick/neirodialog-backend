import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript'

export type UserRoleType = 'USER' | 'ROOT' | 'ADMIN' | 'MODERATOR' | 'DILLER'

@Table
export class UserModel extends Model {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number

  @Column({ type: DataType.STRING })
  firstname: string

  @Column({ type: DataType.STRING })
  lastname: string

  @Column({ type: DataType.STRING })
  password: string

  @Column({ type: DataType.STRING, unique: true })
  email: string

  @Column({ type: DataType.STRING, unique: true })
  phone: string

  @Column({
    type: DataType.ENUM('USER', 'ADMIN', 'ROOT', 'MODERATOR', 'DILLER'),
    defaultValue: 'USER'
  })
  role: UserRoleType

  @Column({ type: DataType.STRING })
  avatar: string

  @Column({ type: DataType.STRING, unique: true })
  hash: string

  @Column({ type: DataType.INTEGER })
  basketID: number
}
