import { CommentModel } from "../database/models/products/CommentModel"
import { TCommentStatus } from "../entities/products/CommentEntity"

interface IAddCommentOptions {
  type: TAddCommentType
}

export type TAddCommentType = 'product'

export class CommentReposity {
  products: CommentModel[] = []

  public async init () {
    const productComments = await CommentModel.findAll()

    this.products = productComments

    return this
  }

  public productsComment (status: TCommentStatus = 'published') {
    this.products = this.products.filter((el) => Boolean(el))

    return this.products.filter((el) => el.status == status)
  }

  public addComment (comment: CommentModel, options: IAddCommentOptions) {
    if (!options || options.type == 'product') {
      this.products = [...this.products, comment].filter(el => Boolean(el))
    }
  }

  public updateComment (comment: CommentModel, options: IAddCommentOptions) {
    if (!options || options.type == 'product') {
      const commentIndex = this.products.findIndex((el) => el.id == comment.id)

      this.products[commentIndex] = comment
    }
  }

  public findProductComment (id: number) {
    return this.products.find((el) => el.id == id)
  }
}
