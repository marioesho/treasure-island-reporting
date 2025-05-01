import { Injectable } from '@angular/core';
import Papa from 'papaparse';

import { ReportItem } from '@models';

@Injectable({
  providedIn: 'root'
})
export class CsvParserService {
  parseCsv(csvText: string): Promise<ReportItem[]> {
    return new Promise(async (resolve, reject) => {
      Papa.parse<ReportItem>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        // @ts-ignore
        error: (error) => reject(error),
        worker: true
      });
    });
  }
}
