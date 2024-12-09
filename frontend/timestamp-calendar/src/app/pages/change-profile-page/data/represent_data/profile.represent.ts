export class FetchDate {
  id: number
  entry: string
  exit: string
  country: string
  disable: boolean
  created: string
  days_left: number

  constructor(data: any) {
    this.id = data.id
    this.entry = data.entry
    this.exit = data.exit
    this.country = data.country
    this.disable = data.disable
    this.created = data.created
    this.days_left = data.days_left
  }
}

export class FetchProfile {
  id: number
  full_name: string
  country: string
  file: string
  relatedDates: FetchDate[]

  constructor(data: any) {
    this.id = data.id
    this.full_name = data.full_name
    this.country = data.country
    this.file = data.file
    this.relatedDates = (data.related_dates || []).map((date: any) => new FetchDate(date))
  }
}

