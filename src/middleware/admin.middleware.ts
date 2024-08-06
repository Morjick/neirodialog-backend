import { checkToken } from "~/libs/checkToken"

export const AdminMiddleware = async (
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

    const isRole = user.role == 'ADMIN' || user.role == 'ROOT'

    if (!isRole || !ok) {
      throw new Error('Не удалось проверить токен на валидность или определить роль')
    }

    request.user = user
    next()
  } catch (e) {
    console.log('admin-middleware error: ', e)
    const error = response.status(403).json({
      ok: false,
      status: 403,
      message: 'Для этого метода у вас недостаточно прав',
      error: e,
    })
    next(error)
  }
}
