import {ChangeDetectionStrategy, Component, inject, Input} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {NgClass} from '@angular/common';
import {Router} from '@angular/router';


@Component({
  selector: 'app-side-bar-nav',
  standalone: true,
  imports: [MatExpansionModule, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './side-bar-nav.component.html',
  styleUrl: './side-bar-nav.component.scss',
})
export class SideBarNavComponent {
  private router: Router = inject(Router)
  protected isListVisible = false
  country = ''
  @Input() closeSidebar!: () => void


  public resetListVisibility(): void {
    this.isListVisible = false
  }

  protected toggleListVisible() {
    this.isListVisible = !this.isListVisible
  }

  protected selectCountry(country: string): void {
    if (this.closeSidebar) this.closeSidebar()
    this.isListVisible = false
    this.router.navigate(['/delay'], {queryParams: {country}})
  }

  protected redirectOnCreatePage(): void {
    if (this.closeSidebar) this.closeSidebar()
    this.isListVisible = false
    this.router.navigate(['/create-profile'])
  }
}

