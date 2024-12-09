import {ChangeDetectorRef, Component, forwardRef, inject, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';
import {AsyncPipe, NgClass} from '@angular/common';
import {map, Observable, startWith, Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-country-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatOption,
    AsyncPipe,
    NgClass
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CountryListComponent),
      multi: true,
    },
  ],
  templateUrl: './country-list.component.html',
  styleUrl: './country-list.component.scss',
})
export class CountryListComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
  cdr = inject(ChangeDetectorRef)
  @Input() notInProgram = false
  control = new FormControl('')
  streets: string[] = ["Украина", "Молдова", "Узбекистан"]
  filteredStreets!: Observable<string[]>
  private destroy$ = new Subject<void>()
  onChange: (value: string | null) => void = () => {
  }
  onTouched: () => void = () => {
  }

  constructor(cdr: ChangeDetectorRef) {
  }

  ngOnChanges(): void {
    if (this.notInProgram) {
      this.streets = ["Украина", "Молдова", "Узбекистан", 'Не в программе']
    }
    this.cdr.markForCheck()
  }

  ngOnInit() {
    this.filteredStreets = this.control.valueChanges.pipe(
      startWith(this.control.value || ''),
      map(value => this._filter(value || '')),
      takeUntil(this.destroy$)
    )

    // Listen to changes in the control and notify the parent form
    this.control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.onChange(value)
    })
  }

  private _filter(value: string): string[] {
    const filterValue = this._normalizeValue(value)
    return this.streets.filter(street => this._normalizeValue(street).includes(filterValue))
  }

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '')
  }

  writeValue(value: string | null): void {
    this.control.setValue(value)
  }

  registerOnChange(fn: (value: string | null) => void): void {
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
