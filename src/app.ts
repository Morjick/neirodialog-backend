import 'dotenv/config'
import * as path from 'path'
import compression from 'compression'
import swagger from 'swagger-ui-express'
import GlobalDocs from './data/docs/global.docs.json'
import fs from 'fs'

import { createExpressServer } from 'routing-controllers'
import { UserController } from './controllers/UserController'
import { GlobalResponseInterceptor } from './data/interceptors/GlobalResponseInterceptor'
import { ProductsController } from './controllers/ProductsController'
import { startNeirodialogDataBase } from './data/database'
import { createReposities } from './data/reposityes'
import { NewsController } from './controllers/NewsController'
import { AppControlelr } from './controllers/AppController'
import { StaticControlelr } from './controllers/StaticController'
import { OrderControlelr } from './controllers/OrderController'
import { SocketControllers } from 'socket-controllers'
import { ModerationController } from './controllers/ModerationController'
import Container from 'typedi'
import { DillerController } from './controllers/DillerController'
import { SpecialistsController } from './controllers/SpecialistsController'

const startServer = async () => {
  try {
    const port = process.env.PORT
    const socketPort = Number(process.env.SOCKET_PORT)

    const app = createExpressServer({
      controllers: [
        UserController,
        ProductsController,
        NewsController,
        AppControlelr,
        StaticControlelr,
        OrderControlelr,
        DillerController,
        SpecialistsController,
      ],
      interceptors: [GlobalResponseInterceptor],
      cors: {
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders:
          'Origin,X-Requested-With,Content-Type,Accept, Accept-Encoding,Accept-Language,Authorization,Content-Length,Host,Referer,User-Agent,diller',
        exposedHeaders:
          'Origin,X-Requested-With,Content-Type,Accept, Accept-Encoding,Accept-Language,Authorization,Content-Length,Host,Referer,User-Agent,diller',
        credentials: true,
        optionsSuccessStatus: 200,
      },
      classTransformer: true,
      validation: true,
    })

    new SocketControllers({
      port: socketPort,
      controllers: [ModerationController],
      container: Container,
    })

    await startNeirodialogDataBase({
      HOST: process.env.DB_HOST,
      USER: process.env.DB_USERNAME,
      PASWORD: process.env.DB_PASSWORD,
      DB: process.env.DB_NAME,
      PORT: process.env.DB_PORT,
    })

    await createReposities()

    const swaggerOptions = { explorer: true }
    
    app.use('/api-docs', swagger.serve, swagger.setup(GlobalDocs, swaggerOptions))

    app.get('/get-file/:directory/:path', async (req, res) => {
      try {
        const imagePath = req.params.path
        const directory = req.params.directory
  
        res.sendFile(`${imagePath}`, { root: path.join(__dirname, 'data', 'static', directory) })
      } catch (e) {
        console.log('error to send file', e)
  
        res.status(501).json({
          message: 'Ошибка в получении файла',
          status: 501,
          error: e,
        })
      }
    })

    console.log(`Server has been started on PORT - ${port}, socket port: ${socketPort}`)

    app.use(compression())

    app.listen(port)

  } catch (e) {
    const date = new Date().toLocaleString('ru')
    const error = new Error(e)

    const filename = `${date}-${error.name}.txt`

    fs.writeFileSync(`/data/static/logs/${filename}`, error.message)

    console.log('server error: ', e)
  }
}

startServer()
