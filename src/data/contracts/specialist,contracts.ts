import { IsNumber, IsString } from "class-validator"
import { TSlotDuration, TSlotType } from "../entities/specialists/SlotEntity"

export class CreateSpecialisationContract {
  @IsString({ message: 'Имя специализации должно быть строкой' })
  name: string

  @IsString({ message: 'Введите описание специализации' })
  description: string

  body?: string
  minOld?: number
  maxOld?: number
}

export class UpdateSpecialisationContract {
  name?: string
  description?: string
  body?: string
  minOld?: number
  maxOld?: number
}

export class CreateSpecialistContract {
  @IsNumber({}, { message: 'Укажите пользователя' })
  userID: number

  specialisationsID?: number[]

  description?: string
  body?: string
}

export class UpdateSpecialistContract {
  specialisationsID?: number[]
  description?: string
  body?: string
}

export class CreateSlotContract {
  comment?: string
  promocodes?: string[]
  isAutoAproove?: boolean
  limit?: number

  @IsString({ message: 'Укажите дату' })
  date: string

  @IsString({ message: 'Укажите время' })
  time: string

  @IsString({ message: 'Укажите продолжительность записи' })
  duration: TSlotDuration

  @IsString({ message: 'Укажите тип записи' })
  type: TSlotType
}
