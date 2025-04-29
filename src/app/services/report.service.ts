import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private allData: any[] = [];

  setData(data: any[]): void {
    this.allData = data;
  }

  getFilteredData(filters: { [key: string]: any }): any[] {
    return this.allData.filter(item => {
      if (filters['keyword'] && !JSON.stringify(item).toLowerCase().includes(filters['keyword'].toLowerCase())) {
        return false;
      }
      return true;
    });
  }
}
