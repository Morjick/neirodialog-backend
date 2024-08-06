import multer from "multer"
import {
  JsonController,
  Post,
  UploadedFile,
} from "routing-controllers"
import { createRandomString } from "~/libs/createRandomString"
import * as path from "path"

export const staticDirectoryPath = path.join(__dirname, '../', 'data', 'static')

export const fileUploadOptions = {
  storage: multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {

      cb(null, staticDirectoryPath)
    },
    filename: (req: any, file: any, cb: any) => {
      const fileNameDots = String(file.originalname).split(".")
      const fileExtention = fileNameDots[fileNameDots.length - 1]

      const uniqueString = `${Date.now()}-${createRandomString(12)}.${fileExtention}`
      cb(null, uniqueString)
    },
  }),
  limits: {
    fieldNameSize: 255,
    fileSize: 1024 * 1024 * 2,
  },
}

@JsonController("/static")
export class StaticControlelr {
  @Post("/upload-file")
  uploadFile(@UploadedFile("file", { options: fileUploadOptions }) file: any) {
    try {
      return {
        status: 200,
        message: "Изображение было загружено",
        body: {
          path: file.filename,
        },
      }
    } catch (e) {
      console.log("error on upload file", e)
    }
  }
}
