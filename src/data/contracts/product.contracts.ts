import { IsEmail, IsNotEmpty, IsNumber, IsString, Max, MaxLength, Min, MinLength } from "class-validator"
import { TDillerProductTypePermission } from "../entities/DillerEntity"
import { IProductFeatures, TProductType } from "../entities/products/ProductEntity"

export class CreateProductSectionContract {
  @IsString({ message: 'Имя раздела должно быть строкой' })
  @MinLength(4, { message: 'Минимальная длинна имени - 4 символа' })
  @MaxLength(40, { message: 'Максимальная длинна имени - 40 символов' })
  name: string
}

export class CreateDillerContract {
  @IsString({ message: 'Имя раздела должно быть строкой' })
  @MinLength(4, { message: 'Минимальная длинна имени - 4 символа' })
  @MaxLength(40, { message: 'Максимальная длинна имени - 40 символов' })
  name: string

  @IsEmail({}, { message: 'Email не корректен' })
  email: string

  @IsNumber({}, { message: 'Идентификатор директора должен быть числом' })
  directorID: number

  @IsNotEmpty({ message: 'Укажите тип продуктов доступных для создания' })
  productTypePermission: TDillerProductTypePermission
  
  availableProductsCount?: number

  availableCommandLength?: number

  description?: string

  avatar?: string
}

export class CreateProductContract {
  description: string
  body: string
  countInStock?: number
  features: IProductFeatures
  discount: number
  avatar: string
  images: string[]
  videos: string[]
  sectionID: number
  autorID: number
  dillerID: number
  isShow: boolean
  tags: string[]
  documentsID?: number[]

  @IsString({ message: 'Имя продукта должно быть строкой' })
  @MinLength(4, { message: 'Минимальная длинна имени - 4 символа' })
  name: string

  @IsNotEmpty({ message: 'Не удалось установить тип' })
  type: TProductType

  @IsNumber({}, { message: 'Цена должна быть числом' })
  @IsNotEmpty({ message: 'Укажите цену' })
  price: number
}

export class ChangeSectionForProductContract {
  @IsNotEmpty({ message: 'Укажите ID продукта' })
  @IsNumber({}, { message: 'ID продукта должно быть числом' })
  productID: number
  
  @IsNotEmpty({ message: 'Укажите ID раздела' })
  @IsNumber({}, { message: 'ID раздела должно быть числом' })
  sectionID: number
}

export class CreateCommentContract {
  @IsString({ message: 'Укажите сообщение' })
  message: string

  @IsNotEmpty({ message: 'Укажите ID продукта' })
  @IsNumber({}, { message: 'ID продукта должно быть числом' })
  productID: number
}

export class AddToCartContract {
  @IsString({ message: 'Укажите slug на продукт' })
  @IsNotEmpty({ message: 'Укажите slug на продукт' })
  slug: string

  @IsNotEmpty({ message: 'Укажите колличество продукта' })
  count: number
}

export class CreatePromocodeContract {
  @IsString({ message: 'Укажите заголовок продукта' })
  @IsNotEmpty({ message: 'Укажите заголовок продукта' })
  title: string

  @IsNumber({}, { message: 'Укаджите скидку (какой процент скидки будет выдан при применении)' })
  @Min(1, { message: 'Минимальная скидка - 1%' })
  @Max(100, { message: 'Максимальная скидка - 100%' })
  discount: number

  minPrice?: number

  @IsNumber({}, { message: 'Укажите лиимит на применение промокода' })
  limit: number
}
