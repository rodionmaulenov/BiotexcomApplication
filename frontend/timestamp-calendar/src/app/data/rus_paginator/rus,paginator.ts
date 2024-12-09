import { MatPaginatorIntl } from '@angular/material/paginator';

export function getRussianPaginatorIntl() {
  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.itemsPerPageLabel = 'Элементов на странице:'
  paginatorIntl.nextPageLabel = 'Следующая страница'
  paginatorIntl.previousPageLabel = 'Предыдущая страница'
  paginatorIntl.firstPageLabel = 'Первая страница'
  paginatorIntl.lastPageLabel = 'Последняя страница'
  paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `0 из 0 страниц`
    }
    const totalPages = Math.ceil(length / pageSize)
    return `${page + 1} из ${totalPages} страниц`
  }

  return paginatorIntl
}
