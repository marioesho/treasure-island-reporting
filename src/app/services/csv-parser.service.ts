import { Injectable } from '@angular/core';
import Papa from 'papaparse';

@Injectable({
  providedIn: 'root'
})
export class CsvParserService {
  parseCsv(blob: Blob): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      Papa.parse(await blob.text(), {
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
