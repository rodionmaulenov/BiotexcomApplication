import {Component, Input} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';


@Component({
  selector: 'app-profile-filters',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './profile-filters.component.html',
  styleUrls: ['./profile-filters.component.scss'],
})
export class ProfileFiltersComponent {
  @Input() searchForm!: FormGroup

}
