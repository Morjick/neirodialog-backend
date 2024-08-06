import { IsNotEmpty, IsString } from "class-validator"

export class CreateNewsContract {
  @IsString({ message: 'Заголовок должен быть строкой' })
  @IsNotEmpty({ message: 'Укажите заголовок' })
  title: string

  @IsNotEmpty({ message: 'Укажите описание новости' })
  description: string
  
  body: string
  
  published: boolean
  
  tags: string[]
  
  avatar: string  
}

export class UpdatePublishedContract {
  @IsNotEmpty({ message: 'Укажите статус публикации' })
  published: boolean
  
  @IsString({ message: 'Ссылка должна быть строкой' })
  @IsNotEmpty({ message: 'Укажите ссылку' })
  slug: string
}
