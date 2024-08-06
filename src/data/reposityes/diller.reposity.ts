import { DillerModel } from "../database/models/DillerModel"
import { DillerEntity } from "../entities/DillerEntity"

export interface IAccessUserData {
  userID: number
  dillerName: string
}

export class DillerReposity {
  list: DillerEntity[] = []

  constructor () {}

  async init () {
    const dillerList = await DillerModel.findAll()

    dillerList.forEach(async (el) => {
      const diller = new DillerEntity()
      await diller.getFromID(el.dataValues.id)

      this.list.push(diller)
      return diller
    })

    console.log('Diller Reposity init')
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
}
