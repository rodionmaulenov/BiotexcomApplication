import { Component } from '@angular/core';
import {SideBarComponent} from "../side-bar/side-bar.component";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    SideBarComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

}
