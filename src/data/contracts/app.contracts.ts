import { IsNotEmpty, IsString } from "class-validator"
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

export class StaticCreateDocument {
  @IsString({ message: 'Ссылка на документ должно быть строкой' })
  @IsNotEmpty({ message: 'Укажите ссылку на документ' })
  href: string

  @IsString({ message: 'Название документа должен быть строкой' })
  @IsNotEmpty({ message: 'Укажите название документа' })
  title: string
}

export class UpdatePageContract {
  @IsString({ message: 'Укажите тело страницы' })
  body: string
}
