
export interface IResponse<BodyResponse> {
  status: number
  message: string
  body?: BodyResponse
  error?: string | any
}
