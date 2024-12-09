import {AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn} from '@angular/forms';
import {delay, map, Observable, of} from 'rxjs';

export function mustBeStringValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value || ''
    if (!value.trim()) {
      return null
    }
    const words = value.trim().split(/\s+/)
    const allWordsAreStrings = words.every((word: any) => /^[a-zA-Zа-яА-Я]+$/.test(word))
    return allWordsAreStrings ? null : {mustBeString: true}
  }
}

const validCountries = ['Украина', 'Молдова', 'Узбекистан']

export function inCountriesListAsyncValidator(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = control.value || ''

    return of(validCountries.includes(value)).pipe(
      delay(500),
      map(isValidCountry => (isValidCountry ? null : {invalidCountry: true}))
    )
  }
}



