import {Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {MatFormField, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {CUSTOM_DATE_FORMATS, CustomDateAdapter} from '../../data/rus_datepicker/rus-datepicker';
import {Subject, takeUntil} from 'rxjs';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [
    MatDatepickerInput, MatFormField, MatInput, ReactiveFormsModule, MatDatepickerToggle, MatDatepicker, MatSuffix, NgClass
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    },
    {provide: DateAdapter, useClass: CustomDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS},
    {provide: MAT_DATE_LOCALE, useValue: 'ru-RU'}
  ],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss'
})
export class DatePickerComponent implements ControlValueAccessor, OnDestroy, OnInit {
  @Input() placeholder: string = 'Select date'
  @ViewChild('picker') datepicker!: MatDatepicker<Date>
  control = new FormControl<Date | null>(null)
  private destroy$ = new Subject<void>()
  onChange = (date: Date | null) => {
  }
  onTouched = () => {
  }

  ngOnInit() {
    // Listen to changes in the FormControl and notify the parent component
    this.control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.onChange(value)
      this.onTouched()
    });
  }

  writeValue(value: Date | null): void {
    this.control.setValue(value)
  }

  registerOnChange(fn: (date: Date | null) => void): void {
    this.onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.control.disable() : this.control.enable()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
