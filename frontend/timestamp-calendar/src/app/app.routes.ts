import {Routes} from '@angular/router';
import {LoginPageComponent} from './pages/login-page/login-page.component';
import {LayoutComponent} from './common-ui/layout/layout.component';
import {canActivateAuth} from './auth/auth.guard';
import {DelayCountriesPageComponent} from './pages/delay-countries-page/delay-countries-page.component';
import {CreateProfilePageComponent} from './pages/create-profile-page/create-profile-page.component';
import {ChangeProfilePageComponent} from './pages/change-profile-page/change-profile-page.component';


export const routes: Routes = [
  {
    path: '', component: LayoutComponent, children: [
      {
        path: 'delay',
        component: DelayCountriesPageComponent,
      },
      {path: 'create-profile', component: CreateProfilePageComponent},
      {path: 'change-profile/:profileId', component: ChangeProfilePageComponent},
    ],
    canActivate: [canActivateAuth],
  },

  {path: 'login', component: LoginPageComponent},
];
