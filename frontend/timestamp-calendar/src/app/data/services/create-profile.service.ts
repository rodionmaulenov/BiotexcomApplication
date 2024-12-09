import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ProfileNameResults} from '../interfaces/profile.interface';
import {CreateProfileINT} from '../../pages/create-profile-page/data/interfaces/create-page.interface';
import {ChangeProfileINT} from '../../pages/change-profile-page/data/interfaces/submit.interface';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CreateProfileService {
  private http: HttpClient = inject(HttpClient)
    baseApiUrl: string = environment.apiUrl

  getProfilesByName(searchQuery: string): Observable<ProfileNameResults> {
    const url = `${this.baseApiUrl}last_five_profiles/`
    let params = new HttpParams().set('search', searchQuery)
    return this.http.get<ProfileNameResults>(url, {params})
  }

  lastCreatedProfiles(count: number): Observable<ProfileNameResults> {
    const url = `${this.baseApiUrl}last_five_profiles/`
    let params = new HttpParams().set('count_profile', count.toString())
    return this.http.get<ProfileNameResults>(url, {params})
  }

  createProfile(profile: CreateProfileINT): any {
    const url = `${this.baseApiUrl}create/`
    return this.http.post(url, profile)
  }

  updateProfile(id: number, profileData: ChangeProfileINT): any {
    const url = `${this.baseApiUrl}update/${id.toString()}`
    return this.http.put<any>(url, profileData)
  }
}
