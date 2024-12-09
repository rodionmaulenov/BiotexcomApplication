import {inject, Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, Subject, takeUntil, tap, throwError} from 'rxjs';
import {TokenResponse} from './auth.interface';
import {CookieService} from 'ngx-cookie-service';
import {Router} from '@angular/router';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  http: HttpClient = inject(HttpClient)
  cookieService = inject(CookieService)
  router = inject(Router)
  baseApiUrl: string = environment.apiUrl
  private destroy$ = new Subject<void>()
  token: string | null = null
  refresh: string | null = null

  get isAuthenticated(): boolean {
    if (!this.token) {
      this.token = this.cookieService.get('token')
      this.refresh = this.cookieService.get('refresh')
    }
    return !!this.token
  }

  login(payload: { username: string, password: string }) {
    const formData = new FormData()

    formData.append('username', payload.username)
    formData.append('password', payload.password)

    return this.http.post<TokenResponse>(`${this.baseApiUrl}token/`, formData)
      .pipe(
        tap((val: TokenResponse) => this.saveTokens(val)),
        takeUntil(this.destroy$)
      )
  }

  refreshAuthToken() {
    return this.http.post<TokenResponse>(`${this.baseApiUrl}token/refresh/`, {
      refresh: this.refresh,
    }).pipe(
      tap(response => {
        this.token = response.access
        this.cookieService.set('token', this.token)
        if (this.refresh) this.cookieService.set('refresh', this.refresh)
      }),
      catchError(err => {
        this.logout()
        return throwError(err)
      }),
      takeUntil(this.destroy$)
    )
  }

  logout() {
    this.cookieService.deleteAll()
    this.refresh = null
    this.token = null
    this.router.navigate(['/login'])
  }

  saveTokens(res: TokenResponse) {
    this.token = res.access
    this.refresh = res.refresh

    this.cookieService.set('token', this.token)
    this.cookieService.set('refresh', this.refresh)
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
