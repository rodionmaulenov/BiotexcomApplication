import {
  ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges
} from '@angular/core';
import {
  DateCountryListComponent
} from '../../create-profile-page/dates-table/date-ui/date-country-list/date-country-list.component';
import {DatePickerComponent} from '../../../common-ui/date-picker/date-picker.component';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatButton, MatFabButton} from '@angular/material/button';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {NgForOf, NgIf} from '@angular/common';
import {AbstractControl, FormArray, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {provideNativeDateAdapter} from '@angular/material/core';
import {fadeOut, staggeredFadeIn} from '../../../data/animations/delete-animations';
import {FetchDate} from '../data/represent_data/profile.represent';
import {DateFormService} from './data/services/load-date-form.service';
import {DateEmptyControlService} from './data/services/empty-dates-form.service';
import {SubmitData} from './data/interfaces/submit-data.interface';
import {Subject, takeUntil} from 'rxjs';


@Component({
  selector: 'app-dates-change-table',
  standalone: true,
  imports: [
    DateCountryListComponent, DatePickerComponent, MatCheckbox, MatFabButton, MatSlideToggle, NgForOf,
    NgIf, ReactiveFormsModule, MatButton
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './dates-change-table.component.html',
  styleUrl: './dates-change-table.component.scss',
  animations: [fadeOut, staggeredFadeIn]
})
export class DatesChangeTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() dates: FetchDate[] = []
  @Output() ChildFormStatus = new EventEmitter<boolean>()
  @Output() childFormDataPush = new EventEmitter<SubmitData[]>()
  formArray!: FormArray<FormGroup>
  destroy$ = new Subject<void>()
  countryAliases: { [key: string]: string } = {
    'Украина': 'UKR',
    'Молдова': 'MLD',
    'Узбекистан': 'UZB'
  }

  constructor(private dfs: DateFormService,
              private dcs: DateEmptyControlService,
              private cdr: ChangeDetectorRef) {
  }


  ngOnInit(): void {
    // Initialize the formArray even if dates are not immediately available
    this.formArray = new FormArray<FormGroup>([])
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dates'] && changes['dates'].currentValue) {
      this.formArray = this.dfs.createDateFormArray(changes['dates'].currentValue)

      this.ChildFormStatus.emit(this.formArray.invalid)
      this.formArray.statusChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.ChildFormStatus.emit(this.formArray.invalid)
      });

      this.cdr.detectChanges()
    }

  }

  addRow() {
    const newRow = this.dcs.toFormGroup()
    newRow.get('exit')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.updateDaysLeft(newRow))
    newRow.get('entry')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.updateDaysLeft(newRow))

    this.formArray.push(newRow)

    this.ChildFormStatus.emit(this.formArray.invalid)
  }

  deleteRow(index: number, isChecked: boolean) {
    if (isChecked) {
      const row = this.formArray.at(index) as FormGroup
      if (row.get('status')?.value === 'old') {
        row.patchValue({deleted: true})
        row.disable()
        setTimeout(() => {
          this.cdr.detectChanges()
        }, 600)
      }
      if (row.get('status')?.value === 'new') {
        row.patchValue({deleted: true})
        row.disable()
        setTimeout(() => {
          this.formArray.removeAt(index)
          this.cdr.detectChanges()
        }, 600)
      }
      this.ChildFormStatus.emit(this.formArray.invalid)
    }
  }


  asFormGroup(row: AbstractControl): FormGroup {
    return row as FormGroup
  }

  trackByIndex(index: number): number {
    return index
  }

  emitFormData(): void {
    const formData = this.processFormData()
    this.childFormDataPush.emit(formData || [])
  }

  processFormData(): SubmitData[] {
    return this.formArray.controls.map((control: AbstractControl) => {
      const {country, exit, entry, ...usefulData} = control.value

      usefulData.country = this.countryAliases[country]

      const toUtcDateString = (date: string | Date | null): string | null => {
        if (!date) return null
        const parsedDate = new Date(date)
        if (isNaN(parsedDate.getTime())) {
          return null
        }
        return new Date(Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()))
          .toISOString()
          .split('T')[0]
      }
      usefulData.entry = toUtcDateString(entry)
      usefulData.exit = toUtcDateString(exit)

      return usefulData as SubmitData
    });
  }

  private updateDaysLeft(row: FormGroup): void {
    const entry = row.get('entry')?.value
    const exit = row.get('exit')?.value

    if (entry && exit) {
      const entryDate = new Date(entry)
      const exitDate = new Date(exit)

      if (!isNaN(entryDate.getTime()) && !isNaN(exitDate.getTime())) {
        // Calculate the difference in whole days
        const differenceInDays =
          (exitDate.getTime() - entryDate.getTime()) / (1000 * 3600 * 24)

        // Add 1 day to include both entry and exit dates if needed
        const accurateDifference = Math.round(differenceInDays) + 1

        // Update the days_left field
        row.get('days_left')?.setValue(accurateDifference)
      } else {
        // Reset days_left if dates are invalid
        row.get('days_left')?.setValue('_')
      }
    } else {
      // Reset days_left if either date is missing
      row.get('days_left')?.setValue('_')
    }
  }


  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }


}
