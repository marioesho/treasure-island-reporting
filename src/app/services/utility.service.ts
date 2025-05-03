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

  public isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
    const time = date.getTime();
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    return time >= startTime && time <= endTime;
  }

  public formatDate(date: Date, format: string): string {
    return formatDate(date, format, this.locale);
  }

  public formatCurrency(value: number | string): string {
    return formatCurrency(Number(value), this.locale, '$', 'USD');
  }
}
