import { Socket } from "socket.io"
import { checkToken, ICheckTokenResponse } from "./checkToken"
import { IUserOpenData } from "~/data/entities/UserEntity"
import { Reposity } from "~/data/reposityes"
import { IRolePermissions, Permissions } from "./Permissions"

export interface IGetUserResponse {
  user?: IUserOpenData | null
  rolePermissions: IRolePermissions
  token: string | null
  ok: boolean
  socket?: Socket
}

export interface IAuthHandshake {
  user: IUserOpenData
  token: string
}

export class Sockets {
  public static getTokenFromSocket (socket: Socket): string | null {
    const headers = socket?.request?.headers

    if (!headers) return null

    return headers.authorization || null
  }

  public static async getUser (socket: Socket): Promise<IGetUserResponse> {
    try {
      const token = this.getTokenFromSocket(socket)

      const response: ICheckTokenResponse = await checkToken(token)
      const user = Reposity.users.findByID(response.user.id)
      const rolePermissions = user.rolePermissions    
  
      const handshake = {
        token: token || null,
        rolePermissions: rolePermissions || Permissions.getRolePermissions('USER'),
        user: await user.getAutor() || null,
        ok: true,
        socket,
      }
  
      return handshake
    } catch {
      return {
        token: null,
        rolePermissions: Permissions.getRolePermissions('USER'),
        user: null,
        ok: false,
      }
    }
  }
}
