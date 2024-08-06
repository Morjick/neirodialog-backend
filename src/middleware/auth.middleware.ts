import { checkToken } from './../libs/checkToken'

export const AuthMiddleware = async (
  request: any,
  response: any,
  next?: (err?: any) => any
) => {
  try {
    const token = request.headers.authorization

    const { user, ok, error, message, status } = await checkToken(token)

    if (!ok) return response.status(status).json({
      status, error, message
    })

    if (!user || !ok) {
      throw new Error()
    }

    request.user = user
    next()
  } catch (e) {
    const error = response.status(401).json({
      ok: false,
      status: 401,
      message: 'Для этого запроса необходимо авторизоваться',
      error: 'Для этого запроса необходимо авторизоваться',
    })
    next(error)
  }
}

export const IsAuthMiddleware = async (
  request: any,
  response: any,
  next?: (err?: any) => any
) => {
  try {
    const token = request.headers.authorization

    const { user, ok } = await checkToken(token)

    request.user = ok ? user : null
    next()
  } catch (e) {
    const error = response.status(401).json({
      ok: false,
      status: 401,
      message: 'Ошибка авторизации',
      error: 'Ошибка авторизации',
    })
    next(error)
  }
}
