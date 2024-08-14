import { secretKey } from './../data/database/index'
import * as jwt from 'jsonwebtoken'
import { type IUserModel } from '~/data/entities/UserEntity'
import { Reposity } from '~/data/reposityes'

export interface ICheckTokenResponse {
  message: string
  ok: boolean
  status: number
  error?: string
  user?: IUserModel
}

export const checkToken = async (token: string): Promise<ICheckTokenResponse> => {
  try {
    if (!token || !token.length) return {
      message: 'Не удалось подтвердить авторизацию',
      ok: false,
      status: 301,
      error: 'Нет токена авторизации',
    }

    const { id } = jwt.verify(token, secretKey, {
      secret: secretKey,
    })

    if (!id) {
      return {
        message: 'Не удалось подтвердить авторизацию',
        ok: false,
        status: 301,
      }
    }

    const reposity = Reposity.users

    const user = await reposity.list.find((el) => el.id == id).getUser()

    return {
      user,
      ok: true,
      status: 200,
      message: 'Авторизация подтверждена',
    }
  } catch (error) {
    if (error == 'TokenExpiredError: jwt expired') return {
      message: 'Срок действия токена истёк',
      error: 'TokenExpiredError: jwt expired',
      status: 401,
      ok: false,
    }
    
    return {
      message: 'Не удалось подтвердить авторизацию',
      ok: false,
      status: 401,
      error: 'Unauthorized'
    }
  }
}
