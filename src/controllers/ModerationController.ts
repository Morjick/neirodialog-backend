import { ConnectedSocket, MessageBody, OnConnect, OnMessage, SocketController } from "socket-controllers"
import { Socket } from "socket.io"
import { Service } from "typedi"
import { IUpdateProductComment } from "~/data/contracts/moderation.contracts"
import { Reposity } from "~/data/reposityes"
import { Sockets } from "~/libs/Sockets"

@SocketController('/moderation')
@Service()
export class ModerationController {
  products = Reposity.comments.productsComment('moderation')

  private async getComments () {
    this.products = Reposity.comments.productsComment('moderation')
  }

  @OnConnect()
  async connect (@ConnectedSocket() socket: Socket) {
    try {
      await this.getComments()

      const data = await Sockets.getUser(socket)
  
      if (!data.ok) return socket.emit('connection-error', JSON.stringify({
        status: 401,
        message: 'Не удалось установить пользователя',
        error: 'Unauthorized'
      }))

      const isHavePermission = data.rolePermissions.moderation.includes('comments')
  
      if (!isHavePermission) return socket.emit('connection-error', JSON.stringify({
        status: 301,
        message: 'Нет доступа к методу',
        error: 'PermissionDenied'
      }))

      socket.handshake.auth = data.user

      socket.emit('update', JSON.stringify({
        comments: this.products,
      }))
    } catch (e) {
      socket.emit('unexceptional-error', JSON.stringify({
        details: new Error(e),
      }))
    }
  }

  @OnMessage('comments')
  async updateComments (@ConnectedSocket() socket: Socket, @MessageBody() messageString: string) {
    try {
      const body: IUpdateProductComment = JSON.parse(messageString)

      if (body.status !== 'delete' && body.status !== 'published') return socket.emit('error', JSON.stringify({
        message: 'Неправильно указан статус комментария',
        status: 301,
      }))

      const comment = Reposity.comments.findProductComment(body.id)

      Reposity.comments.updateComment(comment, { type: body.type })

      this.products = Reposity.comments.productsComment('moderation')

      socket.emit('comments:update', {
        products: this.products,
      })
    } catch (e) {
      socket.emit('error', JSON.stringify({
        message: new Error(e),
        status: 501,
      }))
    }
  }

}
