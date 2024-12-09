import {SubmitDateForm} from '../../dates-table/data/interfaces/date-table.interface';

export interface CreateProfileINT {
  full_name: string
  country: string
  profileName: string
  avatar: string
  datesTable: SubmitDateForm[]
}

