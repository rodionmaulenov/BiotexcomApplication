import {SubmitData} from '../../dates-change-table/data/interfaces/submit-data.interface';

export interface ChangeProfileINT {
  id: number
  full_name: string
  country: string
  profileName: string
  avatar: string
  datesTable: SubmitData[]
}
