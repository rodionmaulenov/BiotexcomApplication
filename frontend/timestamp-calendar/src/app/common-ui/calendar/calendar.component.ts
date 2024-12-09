import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, provideNativeDateAdapter} from '@angular/material/core';
import {FormsModule} from '@angular/forms';
import {CUSTOM_DATE_FORMATS, CustomDateAdapter} from '../../data/rus_datepicker/rus-datepicker';


@Component({
  selector: 'app-calendar',
  standalone: true,
  providers: [
    {provide: DateAdapter, useClass: CustomDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS},
    {provide: MAT_DATE_LOCALE, useValue: 'ru-RU'}
  ],
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule, FormsModule,],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,

  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent {
  @Input() placeholder = 'Выберите дату'
  @Output() dateChange = new EventEmitter<string>()

  onDateChange(event: any): void {
    const selectedDate = event.value
    // Ensure the selected date is interpreted in UTC
    const utcDate = new Date(Date.UTC(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    ));
    // Format the UTC date to ISO string (date only)
    const formattedDate = utcDate.toISOString().split('T')[0]
    this.dateChange.emit(formattedDate)
  }

}
