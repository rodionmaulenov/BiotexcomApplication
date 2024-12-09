import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, map, Observable, of, Subject} from 'rxjs';
import {FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {ProfileControlService} from './create-empty-form.service';
import {CreateProfileService} from '../../../../data/services/create-profile.service';
import {SubmitDateForm} from '../../dates-table/data/interfaces/date-table.interface';
import {CreateProfileINT} from '../interfaces/create-page.interface';


@Injectable({providedIn: 'root',})
export class CreateProfilePageService {
  router = inject(Router)
  createProfileService = inject(CreateProfileService)
  profileControlService = inject(ProfileControlService)
  destroy$ = new Subject<void>()
  form!: FormGroup
  datesTableData: SubmitDateForm[] = []
  isChildFormInvalid$ = new BehaviorSubject<boolean>(false)
  isProfileNameEmpty$ = new BehaviorSubject<boolean>(false)


  initForm(): FormGroup {
    this.form = this.profileControlService.toFormGroup()
    this.setupProfileNameCheck()
    return this.form
  }


  setupProfileNameCheck(): void {
    this.form.get('profileName')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      const isEmpty = value === null || value.trim() === ''
      this.isProfileNameEmpty$.next(!isEmpty)
    });
  }


  handleFormArrayData(submitData: SubmitDateForm[]): void {
    this.datesTableData = submitData
  }


  onSubmit(): Observable<{ country: string }> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return of({country: ''})

    const formValue: CreateProfileINT = {...this.form.value, datesTable: this.datesTableData}
    const countryAliases: { [key: string]: string } = {
      'Украина': 'ukraine',
      'Молдова': 'moldova',
      'Узбекистан': 'uzbekistan',
    }
    formValue.country = countryAliases[formValue.country]

    return this.createProfileService.createProfile(formValue).pipe(
      map(() => ({country: formValue.country})),
      takeUntil(this.destroy$)
    )
  }

  cleanup(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
