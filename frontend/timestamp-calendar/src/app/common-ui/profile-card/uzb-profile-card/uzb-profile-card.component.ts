import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {CalendarComponent} from '../../calendar/calendar.component';
import {NgIf, SlicePipe} from '@angular/common';
import {MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {DatePickerComponent} from '../../date-picker/date-picker.component';
import {ActivatedRoute, Router} from '@angular/router';
import {ProfileUzb} from '../../../data/interfaces/profile.interface';


@Component({
  selector: 'app-uzb-profile-card',
  standalone: true,
  imports: [CalendarComponent, NgIf, MatFormField, MatInput, DatePickerComponent, SlicePipe,],
  templateUrl: './uzb-profile-card.component.html',
  styleUrl: './uzb-profile-card.component.scss'
})
export class UzbProfileCardComponent {
  private router = inject(Router)
  private route = inject(ActivatedRoute)

  @Input() profile!: ProfileUzb
  @Input() ukrDaysLeft!: number | null
  @Input() mldDaysLeft!: number | null
  @Input() country!: null | string
  @Output() mldDateChange = new EventEmitter<{ date: string, instanceId: number }>()
  @Output() ukrDateChange = new EventEmitter<{ date: string, instanceId: number }>()

  getNameAndSurname(fullName: string): string {
    if (!fullName) return ''
    const parts = fullName.split(' ')
    return parts.slice(0, 2).join(' ')
  }


  onUkraineCalendarChange(date: string): void {
    this.ukrDateChange.emit({date, instanceId: this.profile.id})
  }

  onMoldovaCalendarChange(date: string): void {
    this.mldDateChange.emit({date, instanceId: this.profile.id})
  }


  onSubmit(profile_id: number): void {
    this.router.navigate(['/change-profile', profile_id.toString()], {
      queryParams: {
        country: this.route.snapshot.queryParams['country'],
        page: this.route.snapshot.queryParams['page'],
        pageSize: this.route.snapshot.queryParams['pageSize'],
      },
    })

  }
}
