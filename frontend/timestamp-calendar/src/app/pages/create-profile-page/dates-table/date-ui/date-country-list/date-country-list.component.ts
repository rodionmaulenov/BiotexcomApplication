import {Component, forwardRef, ViewEncapsulation} from '@angular/core';
import {CountryListComponent} from '../../../../../common-ui/country-list/country-list.component';
import {AsyncPipe, NgClass} from '@angular/common';
import {FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';

@Component({
  selector: 'app-date-country-list',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatOption,
    ReactiveFormsModule,
    NgClass
  ],
   providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateCountryListComponent),
      multi: true,
    },
  ],
  templateUrl: './date-country-list.component.html',
  styleUrl: './date-country-list.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class DateCountryListComponent extends CountryListComponent{

}
