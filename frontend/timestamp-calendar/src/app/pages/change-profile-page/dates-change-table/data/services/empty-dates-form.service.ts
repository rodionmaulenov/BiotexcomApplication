import {Injectable} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {format} from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class DateEmptyControlService {
  toFormGroup(): FormGroup {
    return new FormGroup({
      entry: new FormControl<string | null>(null, Validators.required),
      exit: new FormControl<string | null>(null, Validators.required),
      country: new FormControl<string | null>(null, Validators.required),
      disable: new FormControl<boolean>(false, {nonNullable: true}),
      deleted: new FormControl<boolean>(false, {nonNullable: true}),
      days_left: new FormControl<number | string>('_'),
      status: new FormControl<string>('new', {nonNullable: true}),
      updated: new FormControl<boolean>(false, {nonNullable: true}),
      created: new FormControl<string>(format(new Date(), 'yyyy-MM-dd HH:mm:ss'), {nonNullable: true})
    });
  }
}
