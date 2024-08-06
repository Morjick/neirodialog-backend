import { createRandomString } from '~/libs/createRandomString'
import * as bcrypt from 'bcrypt'
import { UserModel } from '../models/UserModel'

export const createRootUser = async () => {
  const hashPassword = await bcrypt.hash(process.env.ROOT_PASSWORD, 10)
  
  const isUserExists = await UserModel.findOne({ where: { role: 'ROOT' } })
  console.log(`Root User is exists`)

  if (isUserExists?.dataValues) return

  const hash = await createRandomString()

  const user = await UserModel.create({
    username: process.env.ROOT_NAME,
    password: String(hashPassword),
    role: 'ROOT',
    hash: hash,
    email: 'neirodialog@mail.ru',
    firstname: 'Neirodialog',
    lastname: 'Team',
  })
  console.log(`Root User has been created - ${user.dataValues.firstname}`)

  return user
}
