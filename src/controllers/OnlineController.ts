import { ConnectedSocket, OnConnect, OnDisconnect, SocketController } from "socket-controllers"
import { Socket } from "socket.io"
import { Service } from "typedi"
import { OrderItemEntity } from "~/data/entities/orders/OrderItemEntity"
import { IUserOpenData } from "~/data/entities/UserEntity"
import { Reposity } from "~/data/reposityes"
import { Sockets } from "~/libs/Sockets"

interface IConnectedUsers extends IUserOpenData {
  socket: Socket
}

@SocketController('/online')
@Service()
export class OnlineController {
  users: IConnectedUsers[] = []

  constructor () {
    Reposity.orders.emitter.on('change-status', (element: OrderItemEntity) => {
      this.changeStatusOrderItem(element)
    })
  }

  @OnConnect()
  async connect (@ConnectedSocket() socket: Socket) {
    const data = await Sockets.getUser(socket)

    if (data.ok && data.user) {
      socket.handshake.auth = data.user
      this.users = [...this.users, { ...data.user, socket, }]
    }
  }

  @OnDisconnect()
  async disconnect (@ConnectedSocket() socket: Socket) {
    const data = await Sockets.getUser(socket)

    if (data.user) {
      this.users = this.users.filter((el) => el.id !== data.user.id)
    }
  }

  async changeStatusOrderItem (orderItem: OrderItemEntity) {
    try {
      const order = Reposity.orders.findOrderByID(orderItem.orderID)
      if (!order) return

      const customer = Reposity.users.findByID(order.userID)
      const isCustomerOnline = this.users.find((user) => user.id == customer?.id)
  
      if (isCustomerOnline) {
        isCustomerOnline.socket.emit('change-order-status', JSON.stringify({
          message: `У заказа "${orderItem.product.name}" изменился статус. Вы можете отслеживать изменения в личном кабинете`,
          order: order.hash,
          item: orderItem.hash,
          status: orderItem.status,
        }))
      }
    } catch (e) {
    }
  }
}
