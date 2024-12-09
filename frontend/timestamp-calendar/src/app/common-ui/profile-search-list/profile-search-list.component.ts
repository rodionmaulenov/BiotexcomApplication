import {ChangeDetectorRef, Component, forwardRef, inject, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';
import {AsyncPipe} from '@angular/common';
import {debounceTime, distinctUntilChanged, map, Subject, switchMap, takeUntil} from 'rxjs';
import {CreateProfileService} from '../../data/services/create-profile.service';
import {ProfileName, ProfileNameResults} from '../../data/interfaces/profile.interface';

@Component({
  selector: 'app-profile-search-list',
  standalone: true,
  imports: [ReactiveFormsModule, MatAutocompleteTrigger, MatAutocomplete, AsyncPipe, MatOption],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProfileSearchListComponent),
      multi: true,
    },
  ],
  templateUrl: './profile-search-list.component.html',
  styleUrl: './profile-search-list.component.scss',
})
export class ProfileSearchListComponent implements OnInit, OnDestroy, ControlValueAccessor {
  createProfileService = inject(CreateProfileService)
  cdr = inject(ChangeDetectorRef)
  control = new FormControl('')
  profileNames: string[] = []
  destroy$ = new Subject<void>()
  onChange: (value: string | null) => void = () => {
  }
  onTouched: () => void = () => {
  }


  ngOnInit() {
    // Load the last 5 profiles by default
    this.loadLastFiveProfiles()

    // Set up reactive search with switchMap
    this.control.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((value: string | null) => {
        if (value && value.trim() !== '') {
          // Perform search when there is input
          return this.createProfileService.getProfilesByName(value).pipe(
            map((profileResults: ProfileNameResults) => profileResults.results),
            takeUntil(this.destroy$),
          );
        } else {
          // Load the last 5 profiles if input is empty
          return this.createProfileService.lastCreatedProfiles(5).pipe(
            map((profileResults: ProfileNameResults) => profileResults.results),
            takeUntil(this.destroy$),
          );
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe((profiles: ProfileName[]) => {
      this.profileNames = profiles.map(profile => profile.full_name)
      this.onChange(this.control.value)
      this.cdr.markForCheck()
    });
  }

  // Method to load the last 5 profiles initially or when the input is cleared
  private loadLastFiveProfiles() {
    this.createProfileService.lastCreatedProfiles(5).pipe(
      takeUntil(this.destroy$)
    ).subscribe((profileResults: ProfileNameResults) => {
      this.profileNames = profileResults.results.map(profile => profile.full_name)
      this.cdr.markForCheck()
    });
  }

  writeValue(value: string | null): void {
    this.control.setValue(value, {emitEvent: false});
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

}
