import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FetchProfile} from '../../represent_data/profile.represent';
import {environment} from '../../../../../../environments/environment';



@Injectable({providedIn: 'root'})
export class ChangeProfileService {
  private http: HttpClient = inject(HttpClient)
    baseApiUrl: string = environment.apiUrl

  getProfileData(profileId: string) {
    const url = `${this.baseApiUrl}profile/${profileId}/`
    return this.http.get<FetchProfile>(url)
  }
}
