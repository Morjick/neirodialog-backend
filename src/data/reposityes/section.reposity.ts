import { SectionModel } from "../database/models/products/SectionModel"
import { SectionEntity } from "../entities/products/SectionEntity"

export class SectionReposity {
  list: SectionEntity[] = []

  constructor () {}

  async init () {
    const section = await SectionModel.findAll()

    await Promise.all(
      section.map (item => {
        const result = new SectionEntity(item)
        this.list.push(result)
      })
    )

    console.log('Sections Reposity Init')
    return this
  }

  getList () {
    return this.list
  }

  addSection (section: SectionEntity) {
    this.list.push(section)
  }
}
