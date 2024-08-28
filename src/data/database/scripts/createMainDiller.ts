import { DillerEntity } from "~/data/entities/DillerEntity"
import { DillerModel } from "../models/DillerModel"
import { UserModel } from "../models/UserModel"

export const createMainDiller = async () => {
  try {
    const rootUser = await UserModel.findOne({ where: { role: 'ROOT' } })
    if (!rootUser) {
      throw new Error('Root User not found')
    }

    const mainDillerIsExists = await DillerModel.findOne({ where: { name: 'Neirodialog' } })
    if (mainDillerIsExists) {
      console.log('Main Diller is exists')
      return
    }

    const Diller = new DillerEntity()
    const mainDiller = await Diller.create({
      email: rootUser.dataValues.email,
      name: 'Neirodialog',
      body: '',
      directorID: rootUser.dataValues.id,
      availableProductsCount: 1000,
      availableCommandLength: 100,
      productTypePermission: 'any',
      autorID: rootUser.dataValues.id,
      description: '',
    })
    console.log('Main Diller created')

    return mainDiller
  } catch (e) {
    console.warn('Error for build server in CreateMainDiller. Details: ', e)
  }
}
