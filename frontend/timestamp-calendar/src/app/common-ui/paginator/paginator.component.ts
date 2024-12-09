import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatPaginator, MatPaginatorIntl, PageEvent} from "@angular/material/paginator";
import {getRussianPaginatorIntl} from '../../data/rus_paginator/rus,paginator';
import {PaginationDetails} from '../../data/interfaces/profile.interface';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [
    MatPaginator,
  ],
  providers: [
    {provide: MatPaginatorIntl, useValue: getRussianPaginatorIntl()},
  ],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
})
export class PaginatorComponent {
  @Input() pagination: PaginationDetails = {count: 0, next: null, previous: null}
  @Input() pageSize = 5
  @Input() pageIndex = 0
  @Output() pageChange = new EventEmitter<PageEvent>()


  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event)
  }

}
