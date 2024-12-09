import {Component, Renderer2, ViewChild} from '@angular/core';
import {SideBarNavComponent} from './side-bar-nav/side-bar-nav.component';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [
    SideBarNavComponent, NgClass
  ],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {
  protected isOpen = false

  @ViewChild(SideBarNavComponent) sideBarNav!: SideBarNavComponent

  constructor(private renderer: Renderer2) {
  }


  toggleSideBar() {
    this.isOpen = !this.isOpen

    if (this.isOpen) {
      this.renderer.addClass(document.body, 'no-scroll')
    } else {
      this.renderer.removeClass(document.body, 'no-scroll')

      this.sideBarNav.resetListVisibility()
    }
  }

  closeSideBar() {
    if (this.isOpen) {
      this.toggleSideBar()
    }
  }

}
