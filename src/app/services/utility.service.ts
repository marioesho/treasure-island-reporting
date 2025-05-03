import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { formatCurrency, formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  public addDays(date: Date, days: number): Date {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    return newDate;
  }

  public isDatesEqual(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }

  public formatDate(date: Date, format: string): string {
    return formatDate(date, format, this.locale);
  }

  public formatCurrency(value: number | string): string {
    return formatCurrency(Number(value), this.locale, '$', 'USD');
  }
}
