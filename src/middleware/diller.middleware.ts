import { Reposity } from "~/data/reposityes"
import { checkToken } from "~/libs/checkToken"

export const DillerMiddleware = async (
  request: any,
  response: any,
  next?: (err?: any) => any
) => {
  try {
    const token = request.headers.authorization
    const dillerName = request.headers.diller

    const { user, ok } = await checkToken(token)

    if (!user || !ok) {
      throw new Error('Не удалось подтвердить авторизацию')
    }

    const diller = Reposity.diller.accessUser({ dillerName, userID: user.id })
    
    if (!diller) {
      throw new Error('Не удалось установить диллера')
    }
    
    request.user = user
    request.diller = diller
    next()
  } catch (e) {
    const error = response.status(403).json({
      ok: false,
      status: 403,
      message: Error(e).message,
      error: Error(e).message,
    })
    next(error)
  }
}

export const IsDillerMiddleware = async (
  request: any,
  response: any,
  next?: (err?: any) => any
) => {
  try {
    const token = request.headers.authorization
    const dillerName = request.headers.diller

    const { user, ok } = await checkToken(token)
    const diller = Reposity.diller.list.find((el) => el.name == dillerName)

    if (ok) {
      request.user = user
    }

    if (diller) {
      const isDiller = Reposity.diller.accessUser({
        userID: user.id,
        dillerName: diller.name
      })

      if (isDiller) {
        request.diller = diller
      }
    }


    next()
  } catch (e) {
    const error = response.status(403).json({
      ok: false,
      status: 403,
      message: Error(e).message,
      error: Error(e).message,
    })
    next(error)
  }
}
