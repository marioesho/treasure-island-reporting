import { NgFor, NgIf } from '@angular/common';
import { Component, effect, input, model, viewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { Filters, ReportItem } from '@models';
import { GmailService, ReportService, DateService } from '@services';

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
  public errors = model.required<string[]>();

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);

  constructor(
    private gmailService: GmailService,
    private reportService: ReportService,
    private dateService: DateService
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
    this.errors.set([]);
    const dataMap = new Map<string, ReportItem>();
    const reportDates = new Map<string, Date>();

    try {
      const emails = await this.gmailService.getEmails(filters);

      for (const [index, message] of emails.messages.entries()) {
        try {
          this.progress = ((index + 1) / emails.resultSizeEstimate) * 100;

          const messageDetails = await this.gmailService.getMessageDetails(message.id);
          const attachment = await this.gmailService.getAttachment(messageDetails);

          const messageDate = new Date(Number(messageDetails.internalDate));
          const messageLocalDate = messageDate.toLocaleDateString();
          if (reportDates.has(messageLocalDate)) {
            this.errors.update(errors => [...errors, `Multiple reports found for ${messageLocalDate}. Ignoring duplicate...`]);
            continue;
          }
          reportDates.set(messageLocalDate, messageDate);

          const csvText = atob(attachment.data.replace(/-/g, '+').replace(/_/g, '/'));
          const reportItems = await this.reportService.parseCsv(csvText);

          this.reportService.aggregateReportItems(reportItems, dataMap);
        } catch (error) {
          this.errors.update(errors => [...errors, `Failed to process message ID: "${message.id}". ${error}`]);
        }
      }

      this.dataSource = new MatTableDataSource<ReportItem>(Array.from(dataMap.values()));
      this.getTotals('All');
      this.findMissingReports(filters, reportDates);
    } catch (error) {
      this.errors.update(errors => [...errors, `Failed to generate report. ${error}`]);
    }

    this.loading = false;
  }

  private findMissingReports(filters: Filters, reportDates: Map<string, Date>): void {
    try {
      let expectedReportDate = filters.startDate;

      while (!this.dateService.compareDates(expectedReportDate, filters.endDate)) {
        const expectedReportLocalDate = expectedReportDate.toLocaleDateString();
        if (!reportDates.has(expectedReportLocalDate)) {
          this.errors.update(errors => [...errors, `Missing report for ${expectedReportLocalDate}.`]);
        }
        expectedReportDate = this.dateService.addDays(expectedReportDate, 1);
      }
    } catch (error) {
      this.errors.update(errors => [...errors, `Failed missing report check. ${error}`]);
    }
  }

  private getTotals(type: 'All' | 'Filtered') {
    const defaultTotal = { UPC: `${type} Total`, Name: '', 'Total Qty': 0, 'Total Amount': 0 };
    try {
      this.total = this.dataSource.filteredData.reduce(
        (acc, item) => {
          const totalQty = Number(item['Total Qty']);
          const totalAmount = Number(item['Total Amount']);
          acc['Total Qty'] += !isNaN(totalQty) ? totalQty : 0;
          acc['Total Amount'] += !isNaN(totalAmount) ? totalAmount : 0;
          return acc;
        },
        defaultTotal
      );
    } catch (error) {
      this.total = defaultTotal;
      this.errors.update(errors => [...errors, `Failed to calculate totals. ${error}`]);
    }
  }
}
