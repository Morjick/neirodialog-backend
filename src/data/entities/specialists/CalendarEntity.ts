import { EventEmitter } from 'events'
import { SlotEntity } from './SlotEntity'
import { SlotModel } from '~/data/database/models/specialist/SlotModel'
import { Op } from 'sequelize'

export class CalendarEntity {
  public id: number
  public specialistID: number

  public slots: SlotEntity[]

  public emitter = null

  constructor () {
    this.emitter = new EventEmitter()
  }

  public async init (specialistID: number) {
    this.specialistID = specialistID

    const slotsID = await SlotModel.findAll({
      where: {
        specialistID: this.specialistID,
        status: { [Op.or] : ['created', 'start'] },
      },
      attributes: ['id'],
    })

    const slots = []
    slotsID.forEach(async (item) => {
      const slot = new SlotEntity()
      await slot.findByID(item.dataValues.id)

      slots.push(slot)
    })

    this.slots = slots
  }

  public async addSlot (slot: SlotEntity) {
    this.slots = [...this.slots, slot]
  }
}
