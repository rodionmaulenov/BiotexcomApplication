import {FormControl} from '@angular/forms';

export interface DateEntryForm {
  entry: FormControl<string | null>
  exit: FormControl<string | null>
  country: FormControl<string | null>
  disable: FormControl<boolean>
  deleted: FormControl<boolean>
  created: FormControl<string>
}

export interface SubmitDateForm {
  entry: string
  exit: string
  country: string
  disable: boolean
  created: string
}
