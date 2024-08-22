import { UserModel } from "../database/models/UserModel"
import { UserEntity } from "../entities/UserEntity"

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
  
        this.list.push(User)
      })
    )

    console.log(`User Reposity init`)
    return this
  }

  findByID (id: number) {
    return this.list.find((el) => el.id === id)
  }

  getList () {
    return this.list
  }

  public async addUserToList (userID: number) {
    const User = new UserEntity({ userID: userID })
    await User.findUserForID()

    this.list.push(User)
  }
}
