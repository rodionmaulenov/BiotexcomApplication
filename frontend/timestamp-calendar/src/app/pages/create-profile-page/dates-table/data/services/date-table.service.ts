import {ChangeDetectorRef, inject, Injectable} from '@angular/core';
import {Subject, takeUntil} from 'rxjs';
import {AbstractControl, FormArray, FormGroup} from '@angular/forms';
import {DateEntryForm, SubmitDateForm} from '../interfaces/date-table.interface';
import {DateControlService} from './date-empty-form.service';
import {CreateProfilePageService} from '../../../data/services/create-page.service';


@Injectable({
  providedIn: 'root'
})
export class DateTableService {
  createProfilePageService = inject(CreateProfilePageService)
  dcs = inject(DateControlService)
  cdr = inject(ChangeDetectorRef)
  public isProfileNameEmpty = false
  countryAliases: { [key: string]: string } = {
    'Украина': 'UKR',
    'Молдова': 'MLD',
    'Узбекистан': 'UZB'
  }

  destroy$ = new Subject<void>()
  formArray = new FormArray<FormGroup<DateEntryForm>>([])

  addRow() {
    this.formArray.push(this.dcs.toFormGroup() as FormGroup)
  }

  deleteRow(index: number, isChecked: boolean) {
    if (isChecked) {
      const row = this.formArray.at(index) as FormGroup
      row.patchValue({deleted: true})
      setTimeout(() => {
        this.formArray.removeAt(index)
        this.cdr.markForCheck()
      }, 600)
    }
  }

  verifyParentProfileName() {
    this.createProfilePageService.isProfileNameEmpty$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((isNotEmpty: boolean) => {
      this.isProfileNameEmpty = isNotEmpty
      this.makeFieldsDisabled()
    });
  }

  makeFieldsDisabled() {
    this.formArray.controls.forEach(control => {
      if (this.isProfileNameEmpty) {
        control.disable()
      } else {
        control.enable()
      }
    });
  }

  processFormData(): SubmitDateForm[] {
    if (this.isProfileNameEmpty) {
      return []
    }

    return this.formArray.controls.map((control: AbstractControl) => {
      const {deleted, country, exit, entry, ...usefulData} = control.value

      usefulData.country = this.countryAliases[country]

      const toUtcDateString = (date: Date) =>
        new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
          .toISOString()
          .split('T')[0]

      usefulData.entry = toUtcDateString(entry)
      usefulData.exit = toUtcDateString(exit)

      return usefulData as SubmitDateForm
    });
  }

  asFormGroup(row: AbstractControl): FormGroup {
    return row as FormGroup
  }

  trackByIndex(index: number): number {
    return index
  }


  destroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
