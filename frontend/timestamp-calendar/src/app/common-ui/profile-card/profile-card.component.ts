import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {Profile} from '../../data/interfaces/profile.interface';
import {CalendarComponent} from '../calendar/calendar.component';
import {NgIf} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {DatePickerComponent} from '../date-picker/date-picker.component';
import {MatBadge} from '@angular/material/badge';


@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [CalendarComponent, NgIf, MatFormField, MatInput, DatePickerComponent, MatBadge,],
  templateUrl: './profile-card.component.html',
  styleUrl: './profile-card.component.scss',
})
export class ProfileCardComponent {
  private router = inject(Router)
  private route = inject(ActivatedRoute)

  @Input() profile!: Profile
  @Input() daysLeft!: number | null
  @Input() country!: null | string
  @Output() dateChange = new EventEmitter<{ date: string, instanceId: number }>()

  getNameAndSurname(fullName: string): string {
    if (!fullName) return ''
    const parts = fullName.split(' ')
    return parts.slice(0, 2).join(' ')
  }

  isBadgeHidden(daysLeft: any): boolean {
    if (typeof(daysLeft) === 'string') return true
    return daysLeft > 17
  }

  onCalendarChange(date: string): void {
    this.dateChange.emit({date, instanceId: this.profile.id})
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
