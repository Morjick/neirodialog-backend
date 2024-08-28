import { Pages } from "../models/pages/PagesModel"

export const createDefaultPages = async () => {
  const MAIN_PAGE_NAME = 'main-page'
  const ABOUT_PAGE_NAME = 'about-page'

  const isMainPageExists = await Pages.findOne({ where: { name: MAIN_PAGE_NAME } })
  const isAboutPageExists = await Pages.findOne({ where: { name: ABOUT_PAGE_NAME } })

  if (isAboutPageExists && isMainPageExists) {
    console.log('Default Pages is exists')
    return
  }

  if (!isMainPageExists) {
    await Pages.create({ name: MAIN_PAGE_NAME, body: '' })
    console.log('Main page created')
  }

  if (!isAboutPageExists) {
    await Pages.create({ name: ABOUT_PAGE_NAME, body: '' })
    console.log('About page created')
  }
}
