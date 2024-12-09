import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {JsonPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {Subject, takeUntil} from 'rxjs';
import {AvatarUploadComponent} from './avatar-upload/avatar-upload.component';
import {DatesTableComponent} from './dates-table/dates-table.component';
import {MatFabButton} from '@angular/material/button';
import {CountryListComponent} from '../../common-ui/country-list/country-list.component';
import {ProfileSearchListComponent} from '../../common-ui/profile-search-list/profile-search-list.component';
import {ProfileControlService} from './data/services/create-empty-form.service';
import {SubmitDateForm} from './dates-table/data/interfaces/date-table.interface';
import {CreateProfilePageService} from './data/services/create-page.service';
import {Router} from '@angular/router';


@Component({
  selector: 'app-create-profile-page',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf, NgForOf, AvatarUploadComponent, NgClass,
    DatesTableComponent, MatFabButton, JsonPipe, CountryListComponent, ProfileSearchListComponent
  ],
  providers: [ProfileControlService, CreateProfilePageService],
  templateUrl: './create-profile-page.component.html',
  styleUrl: './create-profile-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateProfilePageComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(AvatarUploadComponent) avatarUploadComponent!: AvatarUploadComponent
  @ViewChild(DatesTableComponent) datesTableComponent!: DatesTableComponent
  router = inject(Router)
  form!: FormGroup
  destroy$ = new Subject<void>()

  constructor(public cps: CreateProfilePageService,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.form = this.cps.initForm()
  }

  ngAfterViewInit() {
    // Subscribe to child form status only after the view is initialized
    this.datesTableComponent.childFormStatus.pipe(takeUntil(this.destroy$))
      .subscribe((isInvalid: boolean) => {
        this.cps.isChildFormInvalid$.next(isInvalid)
      });
    // Subscribe to the form array data emitted by the child
    this.datesTableComponent.formArrayData.pipe(takeUntil(this.destroy$))
      .subscribe((submitData: SubmitDateForm[]) => {
        this.cps.handleFormArrayData(submitData)
      });
  }

  parentFillAvatarField(newAvatar: string) {
    this.form.get('avatar')!.setValue(newAvatar)
  }

  onSubmit(): void {
    this.datesTableComponent.emitFormArrayData()
    this.cps.onSubmit().pipe(takeUntil(this.destroy$)).subscribe({
      next: ({country}) => {
        this.resetForm()
        this.datesTableComponent.formArray.reset()
        this.cdr.detectChanges()
        this.router.navigate(['/delay'], {
          queryParams: {
            country: country,
          },
        });
      },
      error: (err) => console.error('Failed to save profile:', err),
    });
  }


  onSubmitAndProceed(): void {
    this.datesTableComponent.emitFormArrayData()
    this.cps.onSubmit().pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.resetForm()
        this.cdr.detectChanges()
      },
      error: (err) => console.error('Failed to save profile:', err),
    });
  }


  resetForm() {
    const formArray = this.datesTableComponent.formArray
    // Remove all rows except the first one
    while (formArray.length > 1) {
      formArray.removeAt(1)
    }
    // Optionally, reset the first row to its initial state
    const firstRow = formArray.at(0)
    if (firstRow) {
      firstRow.reset() // Reset the first row
    }
    this.form.reset()
    this.avatarUploadComponent.resetAvatar()
  }

  ngOnDestroy(): void {
    this.cps.cleanup()
    this.destroy$.next()
    this.destroy$.complete()
  }

}
