export type TDayName = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'


export class CalendarEntity {
  specialistID: number

  constructor (specialistID: number) {
    this.specialistID = specialistID
  }

  async init () {

  }
}
