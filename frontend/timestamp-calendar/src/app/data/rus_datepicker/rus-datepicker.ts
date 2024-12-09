import {MatDateFormats, NativeDateAdapter} from '@angular/material/core';
import moment from 'moment';
import {Injectable} from '@angular/core';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  override parse(value: any): Date | null {
    const formats = [
      'DD/MM/YY', 'DD/MM/YYYY', 'D/M/YY', 'D/M/YYYY',
      'DD-MM-YY', 'DD-MM-YYYY', 'D-M-YY', 'D-M-YYYY',
      'DD.MM.YY', 'DD.MM.YYYY', 'D.M.YY', 'D.M.YYYY',
      'DD MM YY', 'DD MM YYYY', 'D M YY', 'D M YYYY',
      'YYYY-MM-DD', 'YYYY/MM/DD', 'YYYY.MM.DD',
      'YYYY-M-D', 'YYYY/M/D', 'YYYY.M.D',
      'YYYY-M-DD', 'YYYY/M/DD', 'YYYY.M.DD',
      'YYYY-MM-D', 'YYYY/MM/D', 'YYYY.MM.D',
      'YY-MM-DD', 'YY/MM/DD', 'YY.MM.DD',
      'YY-MM-D', 'YY/MM/D', 'YY.MM.D',
      'YY-M-DD', 'YY/M/DD', 'YY.M.DD',
      'YY-M-D', 'YY/M/D', 'YY.M.D',
    ]

    if (typeof value === 'string') {
      const date = moment(value, formats, true)
      return date.isValid() ? date.toDate() : null
    }
    return value ? new Date(value) : null
  }

  override format(date: Date, displayFormat: any): string {
    return moment(date).format('DD.MM.YYYY')
  }
}

export const CUSTOM_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'DD/MM/YYYY',  // Format for parsing input
  },
  display: {
    dateInput: 'DD/MM/YYYY',   // Format for displaying in the input field
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};


