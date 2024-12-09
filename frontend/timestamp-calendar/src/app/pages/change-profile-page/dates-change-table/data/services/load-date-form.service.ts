import {Injectable, OnDestroy} from '@angular/core';
import {FormGroup, FormControl, Validators, FormArray} from '@angular/forms';
import {FetchDate} from '../../../data/represent_data/profile.represent';
import {Subject, takeUntil} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DateFormService implements OnDestroy {
  private destroy$ = new Subject<void>()

  // Create a FormGroup for a single FetchDate
  createDateForm(date: FetchDate): FormGroup {
    return new FormGroup({
      id: new FormControl(date.id),
      entry: new FormControl(date.entry, Validators.required),
      exit: new FormControl(date.exit, Validators.required),
      country: new FormControl(date.country, Validators.required),
      disable: new FormControl(date.disable),
      created: new FormControl(date.created),
      days_left: new FormControl(date.days_left),
      deleted: new FormControl(false),
      status: new FormControl('old'),
      updated: new FormControl(false),
    });
  }

  createDateFormArray(dates: FetchDate[] = []): FormArray {
    const sortedDates = dates.sort((a, b) => {
      // Parse dates for comparison
      const aEntry = new Date(a.entry).getTime()
      const aExit = new Date(a.exit).getTime()
      const aCreated = new Date(a.created).getTime()

      const bEntry = new Date(b.entry).getTime()
      const bExit = new Date(b.exit).getTime()
      const bCreated = new Date(b.created).getTime()

      // Primary Condition: Compare entry and exit for prioritization
      if (bEntry < aEntry && bExit < aExit && bCreated > aCreated) {
        return 1
      }
      if (aEntry < bEntry && aExit < bExit && aCreated > bCreated) {
        return -1
      }

      // Fallback: Order by created date
      return aCreated - bCreated
    });
    const formGroups = sortedDates.map((date) => this.createDateForm(date))
    const formArray = new FormArray(formGroups)

    // Attach change detection for each FormGroup in the array
    formArray.controls.forEach((control) => {
      this.attachChangeDetection(control as FormGroup)
    });

    return formArray
  }

  // Utility function to observe value changes and set 'updated' to true
  private attachChangeDetection(group: FormGroup): void {
    group.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (group.get('status')?.value === 'old') {
        group.get('updated')?.setValue(true, {emitEvent: false})
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }
}

