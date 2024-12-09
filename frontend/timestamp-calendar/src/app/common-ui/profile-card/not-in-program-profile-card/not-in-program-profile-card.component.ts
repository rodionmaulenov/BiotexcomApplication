import {Component, Input} from '@angular/core';
import {notInProgramProfile} from '../../../data/interfaces/profile.interface';
import {ActivatedRoute, Router} from '@angular/router';
import {CalendarComponent} from '../../calendar/calendar.component';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-not-in-program-profile-card',
  standalone: true,
  imports: [
    CalendarComponent,
    NgIf
  ],
  templateUrl: './not-in-program-profile-card.component.html',
  styleUrl: './not-in-program-profile-card.component.scss'
})
export class NotInProgramProfileCardComponent {
  @Input() profile!: notInProgramProfile
  @Input() country!: null | string

  constructor(private router: Router, private route: ActivatedRoute) {
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
