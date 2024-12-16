import {
  ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges
} from '@angular/core';
import {
  DateCountryListComponent
} from '../../create-profile-page/dates-table/date-ui/date-country-list/date-country-list.component';
import {DatePickerComponent} from '../../../common-ui/date-picker/date-picker.component';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatButton, MatFabButton} from '@angular/material/button';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
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
    NgIf, ReactiveFormsModule, MatButton, AsyncPipe
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './dates-change-table.component.html',
  styleUrl: './dates-change-table.component.scss',
  animations: [fadeOut, staggeredFadeIn],
  changeDetection: ChangeDetectionStrategy.OnPush
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
              private dcs: DateEmptyControlService) {
  }


  ngOnInit(): void {
    // Initialize the formArray even if dates are not immediately available
    this.formArray = new FormArray<FormGroup>([])
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dates'] && changes['dates'].currentValue) {
      this.formArray = this.dfs.createDateFormArray(changes['dates'].currentValue)

      this.formArray.controls.forEach((row: AbstractControl) => {
        const formGroup = row as FormGroup
        this.attachRowSubscriptions(formGroup)
      });

      this.ChildFormStatus.emit(this.formArray.invalid)

      this.formArray.statusChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.ChildFormStatus.emit(this.formArray.invalid)
      });
    }
  }

  addRow() {
    const newRow = this.dcs.toFormGroup()
    this.attachRowSubscriptions(newRow)

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
        }, 600)
      }
      if (row.get('status')?.value === 'new') {
        row.patchValue({deleted: true})
        row.disable()
        setTimeout(() => {
          this.formArray.removeAt(index)
        }, 600)
      }
      this.ChildFormStatus.emit(this.formArray.invalid)
    }
  }


  protected asFormGroup(row: AbstractControl): FormGroup {
    return row as FormGroup
  }

  protected trackByIndex(index: number): number {
    return index
  }

  emitFormData(): void {
    const formData = this.processFormData()
    this.childFormDataPush.emit(formData || [])
  }


  private processFormData(): SubmitData[] {
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
    const entry = this.toUtcDate(row.get('entry')?.value)
    const exit = this.toUtcDate(row.get('exit')?.value)

    if (entry && exit) {
      const differenceInDays = (exit.getTime() - entry.getTime()) / (1000 * 3600 * 24)
      const accurateDifference = Math.round(differenceInDays) + 1
      row.get('days_left')?.setValue(accurateDifference)
    } else {
      row.get('days_left')?.setValue('_')
    }
  }

  private toUtcDate(date: string | Date): Date | undefined {
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
      return
    } else {
      return new Date(Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()))
    }
  }

  private attachRowSubscriptions(row: FormGroup): void {
    row.get('exit')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateDaysLeft(row)
    });

    row.get('entry')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateDaysLeft(row)
    });
  }


  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

}
