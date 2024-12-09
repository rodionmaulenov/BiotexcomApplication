import {Component, OnDestroy} from '@angular/core';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet} from '@angular/router';
import {SideBarComponent} from '../side-bar/side-bar.component';
import {HeaderComponent} from '../header/header.component';
import {MatProgressBar} from '@angular/material/progress-bar';
import {NgIf} from '@angular/common';
import {Subject, takeUntil, timer} from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    SideBarComponent,
    HeaderComponent,
    MatProgressBar,
    NgIf
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnDestroy{
  protected isLoading = false
  private loadingTimeout: any
  private destroy$ = new Subject<void>()

  constructor(private router: Router) {
    this.router.events.pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.showProgressBar()
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.hideProgressBarWithDelay()
      }
    });
  }

  private showProgressBar() {
    clearTimeout(this.loadingTimeout)
    this.isLoading = true
  }

  private hideProgressBarWithDelay() {
    timer(800).pipe(takeUntil(this.destroy$))
      .subscribe(() => {
      this.isLoading = false
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

}
