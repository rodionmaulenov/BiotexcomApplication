import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {FormArray, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {provideNativeDateAdapter} from '@angular/material/core';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatIcon} from '@angular/material/icon';
import {MatFabButton} from '@angular/material/button';
import {fadeOut} from '../../../data/animations/delete-animations';
import {DateCountryListComponent} from './date-ui/date-country-list/date-country-list.component';
import {DateTableService} from './data/services/date-table.service';
import {DateEntryForm, SubmitDateForm} from './data/interfaces/date-table.interface';
import {DatePickerComponent} from '../../../common-ui/date-picker/date-picker.component';
import {DateControlService} from './data/services/date-empty-form.service';
import {BehaviorSubject, Subject, takeUntil} from 'rxjs';


@Component({
  selector: 'app-dates-table',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgForOf, NgIf, MatCheckbox, MatIcon, MatFabButton, AsyncPipe,
    DateCountryListComponent, DatePickerComponent, MatSlideToggle,
  ],
  providers: [provideNativeDateAdapter(), DateControlService, DateTableService,],
  templateUrl: './dates-table.component.html',
  styleUrl: './dates-table.component.scss',
  animations: [fadeOut],
})
export class DatesTableComponent implements OnInit, OnDestroy {
  formArray: FormArray<FormGroup<DateEntryForm>>
  private formStatus$ = new BehaviorSubject<boolean>(true)
  private destroy$ = new Subject<void>()
  @Output() childFormStatus = this.formStatus$.asObservable()
  @Output() formArrayData = new EventEmitter<SubmitDateForm[]>()


  constructor(public dts: DateTableService) {
    this.formArray = this.dts.formArray
  }

  ngOnInit(): void {
    // Optionally add an initial row
    this.addRow()

    // Initialize the profile name check
    this.dts.verifyParentProfileName()

    // Pass to parent valid/invalid formArray
    this.formArray.statusChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.formStatus$.next(this.formArray.invalid)
    });
  }

  emitFormArrayData() {
    const processedData = this.dts.processFormData()
    this.formArrayData.emit(processedData)
  }

  addRow(): void {
    this.dts.addRow()
  }

  deleteRow(index: number, isChecked: boolean): void {
    this.dts.deleteRow(index, isChecked)
  }

  ngOnDestroy(): void {
    this.dts.destroy()
    this.destroy$.next()
    this.destroy$.complete()
    // Clean up the subscription to avoid memory leaks
    this.formStatus$.complete()
  }
}





