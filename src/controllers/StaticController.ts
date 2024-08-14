import multer from "multer"
import {
  Body,
  JsonController,
  Post,
  Req,
  UploadedFile,
  UseBefore,
} from "routing-controllers"
import { createRandomString } from "~/libs/createRandomString"
import * as path from "path"
import { StaticCreateDocument } from "~/data/contracts/app.contracts"
import { DillerMiddleware } from "~/middleware/diller.middleware"
import { DocumentModel, TDocumentExtention } from "~/data/database/models/documents/Document"
import { IResponse } from "~/data/interfaces"

export const imageDirectoryPath = path.join(__dirname, '../', 'data', 'static', 'images')
export const docsDirectoryPath = path.join(__dirname, '../', 'data', 'static', 'docs')

export const fileUploadOptions = {
  storage: multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {

      cb(null, imageDirectoryPath)
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

export const docsUploadOptions = {
  storage: multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {

      cb(null, docsDirectoryPath)
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
          path: `images/${file.filename}`,
        },
      }
    } catch (e) {
      console.log("error on upload file", e)
    }
  }

  @Post("/upload-docs")
  uploadDoc(@UploadedFile("document", { options: docsUploadOptions }) file: any) {
    try {
      return {
        status: 200,
        message: "Документ был загружен",
        body: {
          path: `docs/${file.filename}`,
        },
      }
    } catch (e) {
      console.log("error on upload file", e)
    }
  }

  @Post('/create-document')
  @UseBefore(DillerMiddleware)
  async createDocument (@Body() body: StaticCreateDocument, @Req() request): Promise<IResponse<any>> {
    try {
      const user = request.user
      const diller = request.diller

      const splitedName = body.href.split('.')
      const extention: TDocumentExtention = splitedName[splitedName.length - 1] as TDocumentExtention
      const date = new Date().toLocaleString('ru')

      const result = await DocumentModel.create({
        ...body,
        extention,
        autorID: user.id,
        dillerID: diller.id,
        name: body.href,
        date,
      })

      return {
        status: 200,
        message: 'Документ создан',
        body: {
          result
        }
      }
    } catch (e) {
      return {
        status: 501,
        message: 'Ошибка при создании документа',
        error: e,
      }
    }
  }
}
