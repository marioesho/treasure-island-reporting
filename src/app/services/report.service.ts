import { Injectable } from '@angular/core';
import Papa from 'papaparse';

import { ReportItem } from '@models';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  constructor(private errorHandlerService: ErrorHandlerService) {}

  public parseCsv(csvText: string): Promise<ReportItem[]> {
    return new Promise(async (resolve, reject) => {
      Papa.parse<ReportItem>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        // @ts-ignore
        error: (error) => reject(this.errorHandlerService.getErrorMessage('Failed to parse CSV.', error)),
        worker: true
      });
    });
  }

  public aggregateReportItems(reportItems: ReportItem[], dataMap: Map<string, ReportItem>): void {
    try {
      reportItems.forEach((item) => {
        const upc = item['UPC'];

        // empty UPCs are department totals, we don't need those for now
        if (!upc) return;

        const totalQty = Number(item['Total Qty']);
        const totalAmount = Number(item['Total Amount']);
        const existingItem = dataMap.get(upc);

        if (existingItem) {
          existingItem['Total Qty'] += !isNaN(totalQty) ? totalQty : 0;
          existingItem['Total Amount'] += !isNaN(totalAmount) ? totalAmount : 0;
          return;
        }

        dataMap.set(upc, {
          UPC: upc,
          Name: item['Name'],
          'Total Qty': !isNaN(totalQty) ? totalQty : 0,
          'Total Amount': !isNaN(totalAmount) ? totalAmount : 0
        });
      });
    } catch (error) {
      this.errorHandlerService.throwError('Failed to aggregate report items', error);
    }
  }
}
