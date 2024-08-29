import { UpdateUserContracts } from "../contracts/user.contracts"
import { UserModel, UserRoleType } from "../database/models/UserModel"
import { UserEntity } from "../entities/UserEntity"
import { IResponse } from "../interfaces"

interface IUserSearchOptions {
  search?: string
  role?: UserRoleType
}

export class UserReposity {
  public list: UserEntity[] = []

  constructor () {}

  async init () {
    this.list = []
    const users = await UserModel.findAll({ attributes: ['id'] })

    await Promise.all(
      users.map(async (el) => {
        const User = new UserEntity({ userID: el.dataValues.id })
        await User.findUserForID()

        User.emitter.on('update', (user: UserEntity) => {
          if (!user) return

          const index = this.list.findIndex((el) => el.id == user.id)
          this.list[index] = user
        })
  
        this.list.push(User)
      })
    )

    console.log(`User Reposity init`)
    return this
  }

  findByID (id: number) {
    return this.list.find((el) => el.id === id)
  }

  async getList (options?: IUserSearchOptions) {
    const search = options?.search || ''
    const role = options?.role || null

    const list = this.list
      .filter((user) => {
        if (role && user.getRole() !== role) return null
        if (search && !user.getFullName().toLocaleLowerCase().includes(search.toLowerCase())) return null

        return user
      })

    const autorList = await Promise.all(list.map(async (el) => await el.getAutor()))

    return autorList
  }

  public async addUserToList (userID: number) {
    const User = new UserEntity({ userID: userID })
    await User.findUserForID()

    this.list.push(User)
  }

  public async getProfile (userID: number) {
    const user = this.list.find((el) => el.id == userID)

    return user.profile
  }

  public async updateUser (body: UpdateUserContracts, userID: number) {
    const user = this.findByID(userID)

    return user.updateUser(body)
  }

  public async updateUserRole (role: UserRoleType, admin: UserEntity, userID: number): Promise<IResponse> {
    const user = this.list.find((el) => el.id == userID)

    if (!user) return {
      status: 404,
      message: 'Пользователь не найден',
      exeption: {
        type: 'NotFound',
        message: `User with ID=${userID} not found`
      }
    }

    return await user.updateRole(role, admin)
  }
}
