import { UpdateDillerContract } from "../contracts/product.contracts"
import { DillerModel } from "../database/models/DillerModel"
import { DillerEntity, IAddParticipant } from "../entities/DillerEntity"
import { IUserOpenData, UserEntity } from "../entities/UserEntity"
import { IResponse } from "../interfaces"

export interface IAccessUserData {
  userID: number
  dillerName: string
}

export class DillerReposity {
  list: DillerEntity[] = []

  constructor () {}

  async init () {
    const dillerList = await DillerModel.findAll({ attributes: ['id'] })

    await Promise.all(
      dillerList.map(async (el) => {
        const diller = new DillerEntity()
        await diller.getFromID(el.dataValues.id)

        diller.emitter.on('update', (diller: DillerEntity) => {
          if (!diller) return

          const dillerIndex = this.list.findIndex((el) => el.id == diller.id)
          this.list[dillerIndex] = diller
        })
  
        this.list.push(diller)
        return diller
      })
    )

    console.log('Diller Reposity init')

    return this
  }

  public findForName (name: string) {
    return this.list.find(diller => diller.name = name)
  }

  public addDiller (diller: DillerEntity) {
    this.list.push(diller)
  }

  public getList () {
    return this.list
  }

  public accessUser (data: IAccessUserData) {
    if (!data.dillerName || !data.userID) return false

    const diller = this.findForName(data.dillerName)
    const user = diller.accessUser(data.userID)

    return user ? diller : false
  }

  public async update(data: UpdateDillerContract, user: UserEntity, id: number) {
    const diller = this.list.find((el) => el.id == id)

    return diller.update(data, user)
  }

  public async updateCommand (body: IAddParticipant, userData: IUserOpenData, dillerID: number): Promise<IResponse<any>> {
    const diller = this.list.find((el) => el.id == dillerID)

    if (!diller) return {
      status: 404,
      message: 'Диллер с таким ID не найден',
      exeption: {
        type: 'NotFound',
        message: 'Диллер с таким ID не найден',
      }
    }

    return await diller.updateParticipant(body, userData)
  }
}
