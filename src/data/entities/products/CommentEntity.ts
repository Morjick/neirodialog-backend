import { CommentModel } from "~/data/database/models/products/CommentModel"
import { IUserOpenData, UserEntity } from "../UserEntity"
import { CreateCommentContract } from "~/data/contracts/product.contracts"
import { obscense } from "~/libs/obscense"

export type TCommentStatus = 'published' | 'moderation'

export interface IProductCommentModel {
  id: number
  autorID: number
  message: string
  status: TCommentStatus
  productID: number
}

// comments for product
export class CommentEntity {
  id: number
  autorID: number
  message: string
  status: TCommentStatus
  autor: IUserOpenData
  productID: number

  constructor () {}

  public async findByID (commentID: number) {
    const result = await CommentModel.findByPk(commentID)
    const comment: IProductCommentModel = result.dataValues
    if (!comment) return

    this.id = comment.id
    this.autorID = comment.autorID
    this.message = comment.message
    this.status = comment.status
    this.productID = comment.productID

    const autor = new UserEntity({ userID: this.autorID })
    this.autor = await autor.getAutor()
  }

  public async create (data: CreateCommentContract, autorID: number) {
    const isValid = obscense(data.message)
    const commentStatus: TCommentStatus = isValid ? 'published' : 'moderation'

    const result = await CommentModel.create({
      status: commentStatus,
      autorID,
      message: data.message,
      productID: data.productID,
    })

    await this.findByID(result.dataValues.id)
  }
}
