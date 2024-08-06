import { createExpressServer } from 'routing-controllers'
import 'dotenv/config'
import { UserController } from './controllers/UserController'
import { GlobalResponseInterceptor } from './data/interceptors/GlobalResponseInterceptor'
import { ProductsController } from './controllers/ProductsController'
import { startNeirodialogDataBase } from './data/database'
import { createReposities } from './data/reposityes'
import { NewsController } from './controllers/NewsController'
import swagger from 'swagger-ui-express'
import GlobalDocs from './data/docs/global.docs.json'
import { AppControlelr } from './controllers/AppController'
import { StaticControlelr } from './controllers/StaticController'
import * as path from 'path'

const startServer = async () => {
  try {
    const port = process.env.PORT

    const app = createExpressServer({
      controllers: [UserController, ProductsController, NewsController, AppControlelr, StaticControlelr],
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

    await startNeirodialogDataBase({
      HOST: process.env.DB_HOST,
      USER: process.env.DB_USERNAME,
      PASWORD: process.env.DB_PASSWORD,
      DB: process.env.DB_NAME,
      PORT: process.env.DB_PORT,
    })

    await createReposities()

    const swaggerOptions = {
      explorer: true,
    }
    
    app.use('/api-docs', swagger.serve, swagger.setup(GlobalDocs, swaggerOptions))

    app.get('/get-file/:path', async (req, res) => {
      try {
        const imagePath = req.params.path
  
        res.sendFile(`${imagePath}`, { root: path.join(__dirname, 'data', 'static') })
      } catch (e) {
        console.log('error to send file', e)
  
        res.status(501).json({
          message: 'Ошибка в получении файла',
          status: 501,
          error: e,
        })
      }
    })

    console.log(`Server has been started on PORT - ${port}`)

    app.listen(port)

  } catch (e) {
    console.log('server error: ', e)
  }
}

startServer()
