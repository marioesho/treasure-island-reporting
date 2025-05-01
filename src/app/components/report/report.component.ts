import { NgFor, NgIf } from '@angular/common';
import { Component, effect, input, viewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { Filters, ReportItem } from '@models';
import { GmailService, CsvParserService } from '@services';

@Component({
  selector: 'app-report',
  imports: [
    NgFor,
    NgIf,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressBarModule
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent {
  public loading = true;
  public progress = 0;
  public displayedColumns: (keyof ReportItem)[] = ['UPC', 'Name', 'Total Qty', 'Total Amount'];
  public total?: ReportItem;
  public dataSource = new MatTableDataSource<ReportItem>([]);
  public filters = input.required<Filters>();

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);

  constructor(
    private gmailService: GmailService,
    private csvParserService: CsvParserService
  ) {
    effect(() => this.getReport(this.filters()));
    effect(() => {
      this.dataSource.paginator = this.paginator() ?? null;
      this.dataSource.sort = this.sort() ?? null;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
    this.dataSource.paginator?.firstPage();

    if (filterValue) {
      this.getTotals('Filtered');
    } else {
      this.getTotals('All');
    }
  }

  private async getReport(filters: Filters): Promise<void> {
    this.progress = 0;
    this.loading = true;

    const emails = await this.gmailService.getEmails(filters);
    const dataMap = new Map<string, ReportItem>();

    for (const [index, message] of emails.messages.entries()) {
      this.progress = ((index + 1) / emails.resultSizeEstimate) * 100;

      const messageDetails = await this.gmailService.getMessageDetails(message.id);
      const attachment = await this.gmailService.getAttachment(messageDetails);
      const csvText = atob(attachment.data.replace(/-/g, '+').replace(/_/g, '/'));
      const reportItems = await this.csvParserService.parseCsv(csvText);

      this.aggregateReportItems(reportItems, dataMap);
    }

    this.dataSource = new MatTableDataSource<ReportItem>(Array.from(dataMap.values()));
    this.getTotals('All');

    this.loading = false;
  }

  private aggregateReportItems(reportItems: ReportItem[], dataMap: Map<string, ReportItem>): void {
    reportItems.forEach((item) => {
      // empty UPCs are department totals, we don't need those for now
      if (!item['UPC']) return;

      const upc = item['UPC'];
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
  }

  private getTotals(type: 'All' | 'Filtered') {
    this.total = this.dataSource.filteredData.reduce(
      (acc, item) => {
        const totalQty = Number(item['Total Qty']);
        const totalAmount = Number(item['Total Amount']);
        acc['Total Qty'] += !isNaN(totalQty) ? totalQty : 0;
        acc['Total Amount'] += !isNaN(totalAmount) ? totalAmount : 0;
        return acc;
      },
      { UPC: `${type} Total`, Name: '', 'Total Qty': 0, 'Total Amount': 0 }
    );
  }
}
