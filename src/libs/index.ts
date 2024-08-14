import { createRandomNumber } from "./createRandomNumber"
import { createRandomString } from "./createRandomString"
import getTransplit from "./getTranslate"

export class Libs {
  constructor () {}

  public static getDate (): string {
    return new Date().toLocaleString('ru')
  }

  public static randomString (length: number = 20): string {
    return createRandomString(length)
  }

  public static randomNumber (min: number = 1, max: number = 1000) {
    return createRandomNumber(min, max)
  }

  public static transplit (text: string) {
    return getTransplit(text)
  }
}
