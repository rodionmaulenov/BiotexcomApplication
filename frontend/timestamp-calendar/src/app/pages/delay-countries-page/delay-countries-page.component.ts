import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ProfileCardComponent} from '../../common-ui/profile-card/profile-card.component';
import {ProfileService} from '../../data/services/profile.service';
import {notInProgramProfile, PaginationDetails, Profile, ProfileUzb} from '../../data/interfaces/profile.interface';
import {DaysLeftMap} from '../../data/interfaces/profile.interface';
import {AsyncPipe, NgClass, NgForOf, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {PaginatorComponent} from '../../common-ui/paginator/paginator.component';
import {ProfileFiltersComponent} from './profile-filters/profile-filters.component';
import {FormControl, FormGroup} from '@angular/forms';
import {debounceTime, Subject, takeUntil} from 'rxjs';
import {animate, style, transition, trigger} from '@angular/animations';
import {ActivatedRoute, Router} from '@angular/router';
import {UzbProfileCardComponent} from '../../common-ui/profile-card/uzb-profile-card/uzb-profile-card.component';
import {
  NotInProgramProfileCardComponent
} from '../../common-ui/profile-card/not-in-program-profile-card/not-in-program-profile-card.component';


@Component({
  selector: 'app-delay-countries-page',
  standalone: true,
  imports: [
    ProfileCardComponent, AsyncPipe, NgForOf, MatPaginator, PaginatorComponent, ProfileFiltersComponent,
    NgClass, NgIf, UzbProfileCardComponent, NgSwitch, NgSwitchCase, NotInProgramProfileCardComponent
  ],
  templateUrl: './delay-countries-page.component.html',
  styleUrl: './delay-countries-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({opacity: 0, transform: 'translateY(60px)'}), // Start hidden and below
        animate('0.45s ease-out', style({opacity: 1, transform: 'translateY(0)'})) // Fade in and move to original position
      ])
    ])
  ]
})
export class DelayCountriesPageComponent implements OnInit, OnDestroy {
  profileService: ProfileService = inject(ProfileService)
  route = inject(ActivatedRoute)
  router = inject(Router)
  cdr = inject(ChangeDetectorRef)
  uzbProfiles: ProfileUzb[] = []
  notInProgramProfiles: notInProgramProfile[] = []
  nonUzbProfiles: Profile[] = []
  daysLeftMap: DaysLeftMap = {}
  ukrDaysLeft: DaysLeftMap = {}
  mldDaysLeft: DaysLeftMap = {}
  paginatorIsNotVisible = false
  searchForm = new FormGroup({
    fullName: new FormControl('')
  });
  country = ''
  isAnimated = false
  pageIndex = 0
  pageSize = 5
  pagination: PaginationDetails = {count: 0, next: null, previous: null}

  private destroy$ = new Subject<void>()

  trackByProfileUzbId(index: number, profile: ProfileUzb): number {
    return profile.id
  }

  trackByProfileId(index: number, profile: Profile): number {
    return profile.id
  }

  trackByNotInProgramProfileId(index: number, profile: notInProgramProfile): number {
    return profile.id
  }

  isProfileUzb(profile: Profile | ProfileUzb | notInProgramProfile): profile is ProfileUzb {
    return 'day_stayed' in profile
  }

  isNotInProgramProfile(profile: Profile | ProfileUzb | notInProgramProfile): profile is notInProgramProfile {
    return !('days_passed' in profile || 'day_stayed' in profile)
  }

  ngOnInit() {
    this.initSubscriptions()
    this.loadProfilesFromQueryParams()
  }

  initSubscriptions() {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((queryParams) => {
        const countryFromQuery = queryParams['country']
        if (countryFromQuery) {
          this.country = countryFromQuery
        } else {
          console.warn('No country found in query params');
        }
      });

    this.searchForm.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe(({fullName}) => {
        if (fullName) {
          this.searchProfiles(fullName)
        } else {
          this.loadProfiles(this.pageIndex + 1, this.pageSize)
        }
        this.cdr.markForCheck()
      });
  }

  loadProfilesFromQueryParams() {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$),
    ).subscribe(params => {
      this.pageIndex = +params['page'] - 1 || 0
      this.pageSize = +params['pageSize'] || 5
      this.loadProfiles(this.pageIndex + 1, this.pageSize)
      this.cdr.markForCheck()
    });
  }


  loadProfiles(page: number, pageSize: number) {
    this.profileService.getProfileListMLDorUKR(this.country, page, pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        this.pagination = response.pagination
        this.processProfiles(response.profiles)
        this.cdr.markForCheck()
      });
  }

  searchProfiles(query: string) {
    this.profileService.searchProfiles(this.country, query)
      .pipe(takeUntil(this.destroy$))
      .subscribe(profiles => {
        this.processProfiles(profiles)
        this.cdr.markForCheck()
      });
  }

  processProfiles(profiles: (Profile | ProfileUzb | notInProgramProfile)[]) {
    this.uzbProfiles = profiles.filter(this.isProfileUzb) as ProfileUzb[]
    this.notInProgramProfiles = profiles.filter(this.isNotInProgramProfile) as notInProgramProfile[]
    this.nonUzbProfiles = profiles.filter(profile =>
      !this.isProfileUzb(profile) && !this.isNotInProgramProfile(profile)
    ) as Profile[]
  }


  getDaysLeft(profileId: number, type?: string): number {
    if (type === 'UKR') {
      return this.ukrDaysLeft[profileId]?.days_left
    } else if (type === 'MLD') {
      return this.mldDaysLeft[profileId]?.days_left
    } else {
      return this.daysLeftMap[profileId]?.days_left
    }
  }

  onDateChange(date: string, profileId: number, type?: string): void {
    this.profileService.getControlDate(profileId, date, type)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        const updatedDaysLeft = response.days_left

        if (type === 'UKR') {
          this.ukrDaysLeft[profileId] = {days_left: updatedDaysLeft}
        } else if (type === 'MLD') {
          this.mldDaysLeft[profileId] = {days_left: updatedDaysLeft}
        } else {
          this.daysLeftMap[profileId] = {days_left: updatedDaysLeft}
        }

        this.cdr.detectChanges()
      });
  }

  onPageChange(event: PageEvent): void {
    const page = event.pageIndex + 1
    const pageSize = event.pageSize

    // Update query parameters in the URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: page,
        pageSize: pageSize,
        country: this.country,
      },
      queryParamsHandling: 'merge',
    });
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
    this.resetBodyStyle()
  }

  onAnimationStart() {
    document.body.style.position = 'fixed'
    document.body.style.overflow = 'hidden'
  }

  onAnimationDone() {
    this.resetBodyStyle()
    this.isAnimated = true
  }

  private resetBodyStyle() {
    document.body.style.position = ''
    document.body.style.overflow = ''
  }

}
