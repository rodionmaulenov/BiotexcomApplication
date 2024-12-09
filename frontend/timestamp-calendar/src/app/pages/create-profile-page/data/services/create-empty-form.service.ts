import {Injectable} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';


@Injectable({
  providedIn: 'root'
  })
export class ProfileControlService {
  toFormGroup() {
    const group: { [key: string]: FormControl } = {}

    group['full_name'] = new FormControl(null, Validators.required)
    group['country'] = new FormControl(null, Validators.required)
    group['profileName'] = new FormControl(null)
    group['avatar'] = new FormControl(null, Validators.required)

    return new FormGroup(group)
  }
}
