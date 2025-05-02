import { Injectable } from '@angular/core';
import Papa from 'papaparse';

import { ReportItem } from '@models';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class CsvParserService {
  constructor(private errorHandlerService: ErrorHandlerService) {}

  parseCsv(csvText: string): Promise<ReportItem[]> {
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
}
