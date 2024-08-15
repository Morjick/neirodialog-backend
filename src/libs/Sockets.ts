import { Socket } from "socket.io"
import { checkToken, ICheckTokenResponse } from "./checkToken"
import { IUserModel } from "~/data/entities/UserEntity"

export interface IGetUserResponse extends ICheckTokenResponse {
  user?: IUserModel | null
}

export interface IAuthHandshake {
  user: IUserModel
  token: string
}

export class Sockets {
  public static getTokenFromSocket (socket: Socket): string | null {
    const headers = socket?.request?.headers

    if (!headers) return null

    return headers.authorization || null
  }

  public static async getUser (socket: Socket): Promise<IGetUserResponse> {
    const token = this.getTokenFromSocket(socket)

    const response: ICheckTokenResponse = await checkToken(token)
    const handshake = { token, ...response }

    return handshake
  }
}
