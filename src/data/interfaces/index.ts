export type TErrorType = 'Unauthorized' | 'Unexepted' | 'PermissionDied' | 'NotFound' | 'Invalid' | 'IsExist' | 'BadRequest'
export type TToastType = 'warning' | 'error' | 'cool'

export interface IResponseError {
  message: string
  type: TErrorType
}

export interface IResponse<BodyResponse> {
  status: number
  message: string
  body?: BodyResponse
  error?: string | any
  toast?: TToastType
  exeption?: IResponseError
}
