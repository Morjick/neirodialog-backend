import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, MaxLength, MinLength } from "class-validator"

export class CreateUserContracts {
  @MinLength(2, { message: 'Минимальаня длинна имени - 2 символа' })
  @MaxLength(15, { message: 'Максимальная длинна имени - 15 символов' })
  firstname: string

  @IsEmail({}, { message: 'Введите корректный email' })
  email: string

  @IsString()
  @IsNotEmpty({ message: 'Пароль является обязательным полем' })
  password: string
}

export class LoginUserContract {
  @IsEmail({}, { message: 'Введите корректный email' })
  email: string

  @IsString()
  @IsNotEmpty({ message: 'Пароль является обязательным полем' })
  password: string
}

export class UpdateUserContracts {
  @MinLength(2, { message: 'Минимальаня длинна имени - 2 символа' })
  @MaxLength(15, { message: 'Максимальная длинна имени - 15 символов' })
  fistname: string

  @MinLength(2, { message: 'Минимальаня длинна фамилии - 2 символа' })
  @MaxLength(15, { message: 'Максимальная длинна фамилии - 15 символов' })
  lastname: string

  @IsEmail({}, { message: 'Введите корректный email' })
  email: string
  
  @IsPhoneNumber('RU', { message: 'Номер телефона не корректен' })
  phone: string

  @IsString()
  @IsNotEmpty({ message: 'Не удалось установить аватар' })
  avatar: string
}
