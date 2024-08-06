export const createRandomString = (length: number = 20) => {
  let result = ''
  let stringLengthCounter = 0
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  while (stringLengthCounter < length) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
    stringLengthCounter++
  }

  return result
}
