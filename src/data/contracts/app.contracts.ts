import { IsNotEmpty } from "class-validator"
import { TReviewMessager } from "../database/models/applications/ReviewsModel"

export class CreateAppReviewContract {
  @IsNotEmpty({ message: 'Укажите имя' })
  name: string
  
  nickname: string
  
  @IsNotEmpty({ message: 'Напишите тело отзыва' })
  body: string

  @IsNotEmpty({ message: 'Укажите тип мессенджера' })
  messagerType: TReviewMessager

  @IsNotEmpty({ message: 'Укажите ссылку на один из мессенджеров' })
  messagerHref: string
}
