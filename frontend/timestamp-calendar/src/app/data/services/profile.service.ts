import {inject, Injectable, OnDestroy} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {PaginatedResponse, PaginationDetails, Profile, ProfileResults} from '../interfaces/profile.interface';
import {map, Observable, of, Subject, takeUntil} from 'rxjs';
import {environment} from '../../../environments/environment';


@Injectable({providedIn: 'root'})
export class ProfileService implements OnDestroy {

  private http: HttpClient = inject(HttpClient)
  baseApiUrl: string = environment.apiUrl
  private profileCache = new Map<string, { profiles: Profile[]; pagination: PaginationDetails }>()
  destroy$ = new Subject<void>()


  getControlDate(instanceId: number, date: string, country: string | null = null): Observable<any> {
    const backendUrl = `${this.baseApiUrl}countries/${instanceId}/control_date/`
    return this.http.post<{ days_left: number }>(backendUrl, {date, country})
  }


  searchProfiles(country: string, searchQuery: string) {
    let url = `${this.baseApiUrl}countries/search_profile/`
    let params = new HttpParams().set('country', country).set('search', searchQuery)
    return this.http.get<ProfileResults>(url, {params}).pipe(
      map((response) => response.results),
      takeUntil(this.destroy$)
    )
  }

  getProfileListMLDorUKR(country: string, page: number = 1, pageSize: number = 5):
    Observable<{ profiles: Profile[]; pagination: PaginationDetails }> {

    const cacheKey = `${country}-${page}-${pageSize}`

    // Check if the data is already cached
    if (this.profileCache.has(cacheKey)) {
      const {profiles, pagination} = this.profileCache.get(cacheKey)!
      return of({profiles, pagination})
    }
    const url = `${this.baseApiUrl}countries/?country=${country}&page=${page}&page_size=${pageSize}`
    return this.http.get<PaginatedResponse<Profile>>(url).pipe(
      takeUntil(this.destroy$),
      map((response) => {
        // Cache both profiles and pagination details
        this.profileCache.set(cacheKey, {
          profiles: response.results,
          pagination: {
            count: response.count,
            next: response.next,
            previous: response.previous,
          },
        });
        // Return both profiles and pagination details
        return {
          profiles: response.results,
          pagination: {
            count: response.count,
            next: response.next,
            previous: response.previous,
          },
        };
      })
    );
  }

  clearCache(cacheKey?: string): void {
    if (cacheKey) {
      this.profileCache.delete(cacheKey)
    } else {
      this.profileCache.clear()
    }
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

}
