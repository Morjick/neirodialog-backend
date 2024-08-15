import { TAddCommentType } from "../reposityes/comments.reposity"

export type TCommentAction = 'published' | 'moderation' | 'delete'

export interface IUpdateProductComment {
  status: TCommentAction
  type: TAddCommentType
  id: number
}
