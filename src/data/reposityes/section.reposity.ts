import { SectionModel } from "../database/models/products/SectionModel"
import { SectionEntity } from "../entities/products/SectionEntity"

export class SectionReposity {
  list: SectionEntity[] = []

  constructor () {}

  async init () {
    const section = await SectionModel.findAll()

    section.forEach (item => {
      const result = new SectionEntity(item)
      this.list.push(result)
    })

    console.log('Sections Reposity Init')
  }

  getList () {
    return this.list
  }

  addSection (section: SectionEntity) {
    this.list.push(section)
  }
}
