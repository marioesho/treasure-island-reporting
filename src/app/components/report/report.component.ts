import { NgFor, NgIf } from '@angular/common';
import { Component, effect, input, model, viewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

import { AdditionalStylesDirective, FlexContainerModule } from '@directives';
import { Filters, ReportItem } from '@models';
import { GmailService, ReportService, UtilityService } from '@services';

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
    MatProgressBarModule,
    MatCardModule,
    MatListModule,
    FlexContainerModule,
    AdditionalStylesDirective
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent {
  public loading = true;
  public progress = 0;
  public displayedColumns: (keyof ReportItem)[] = ['UPC', 'Name', 'Total Qty', 'Total Amount'];
  public totals?: ReportItem;
  public departmentTotals?: ReportItem[];
  public dataSource = new MatTableDataSource<ReportItem>([]);
  public filters = input.required<Filters>();
  public additionalInfo = model.required<string[]>();
  public errors = model.required<string[]>();

  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);

  constructor(
    private gmailService: GmailService,
    private reportService: ReportService,
    private utilityService: UtilityService
  ) {
    effect(() => this.getReport(this.filters()));
    effect(() => {
      this.dataSource.paginator = this.paginator() ?? null;
      this.dataSource.sort = this.sort() ?? null;
    });
  }

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
    this.dataSource.paginator?.firstPage();

    if (filterValue) {
      this.getTotals('Filtered');
    } else {
      this.getTotals('All');
    }
  }

  public getColumnValue(reportItem: ReportItem | undefined, displayedColumn: keyof ReportItem): string | number {
    if (!reportItem) return '';

    return displayedColumn === 'Total Amount' ? this.utilityService.formatCurrency(reportItem[displayedColumn]) : reportItem[displayedColumn] ?? '';
  }

  private async getReport(filters: Filters): Promise<void> {
    this.progress = 0;
    this.loading = true;
    this.additionalInfo.set([]);
    this.errors.set([]);
    const reportItemsMap = new Map<string, ReportItem>();
    const departmentTotalsMap = new Map<string, ReportItem>();
    const reportDates = new Set<string>();

    try {
      const emails = await this.gmailService.getEmails(filters);

      for (const [index, message] of emails.messages.entries()) {
        try {
          this.progress = ((index + 1) / emails.resultSizeEstimate) * 100;

          const messageDetails = await this.gmailService.getMessageDetails(message.id);
          const messagePart = messageDetails.payload.parts.find(part => part.filename && part.filename.startsWith('Sales_History') && part.filename.endsWith('.csv'));

          if (!messagePart?.body?.attachmentId) throw new Error('No Sales_History CSV attachment found.');

          const {reportDate, reportLocalDate} = this.getReportDate(messagePart.filename);

          if (!this.utilityService.isDateInRange(reportDate, filters.startDate, filters.endDate)) {
            // this.additionalInfo.update(info => [...info, `Found report, ${reportLocalDate}, outside the selected date range. Ignoring...`]);
            continue;
          }

          if (reportDates.has(reportLocalDate)) {
            this.additionalInfo.update(info => [...info, `Multiple reports found for ${reportLocalDate}. Ignoring...`]);
            continue;
          }
          reportDates.add(reportLocalDate);

          const attachment = await this.gmailService.getAttachment(messageDetails.id, messagePart);
          const csvText = atob(attachment.data.replace(/-/g, '+').replace(/_/g, '/'));
          const reportItems = await this.reportService.parseCsv(csvText);

          this.reportService.aggregateReportItems(reportItems, reportItemsMap, departmentTotalsMap);
        } catch (error) {
          this.errors.update(errors => [...errors, `Failed to process message ID: "${message.id}". ${error}`]);
        }
      }

      this.dataSource = new MatTableDataSource<ReportItem>(Array.from(reportItemsMap.values()));
      this.departmentTotals = Array.from(departmentTotalsMap.values());
      this.getTotals('All');
      this.findMissingReports(filters, reportDates);
    } catch (error) {
      this.errors.update(errors => [...errors, `Failed to generate report. ${error}`]);
    }

    this.loading = false;
  }

  private findMissingReports(filters: Filters, reportDates: Set<string>): void {
    try {
      let expectedReportDate = filters.startDate;
      let reportCount = 0;

      while (expectedReportDate <= filters.endDate) {
        const expectedReportLocalDate = expectedReportDate.toLocaleDateString();
        if (!reportDates.has(expectedReportLocalDate)) {
          this.errors.update(errors => [...errors, `Missing report for ${expectedReportLocalDate}.`]);
        }
        else {
          reportCount++;
        }
        expectedReportDate = this.utilityService.addDays(expectedReportDate, 1);
      }

      this.additionalInfo.update(info => [...info, `Processed ${reportCount} reports for the selected date range.`]);
    } catch (error) {
      this.errors.update(errors => [...errors, `Failed missing report check. ${error}`]);
    }
  }

  private getReportDate(filename: string): { reportDate: Date; reportLocalDate: string } {
    const match = filename.match(/Sales_History_(\w+)_(\d{2}),_(\d{4})\.csv/);

    if (match) {
      const [, month, day, year] = match;
      const monthIndex = new Date(`${month} 1, 2000`).getMonth();
      const reportDate = new Date(Number(year), monthIndex, Number(day));

      return { reportDate, reportLocalDate: reportDate.toLocaleDateString() };
    } else {
      throw new Error('Invalid filename date format.');
    }
  }

  private getTotals(type: 'All' | 'Filtered'): void {
    const defaultTotals = { UPC: `${type} Total`, Name: '', 'Total Qty': 0, 'Total Amount': 0 };
    try {
      this.totals = this.dataSource.filteredData.reduce(
        (acc, item) => {
          const totalQty = Number(item['Total Qty']);
          const totalAmount = Number(item['Total Amount']);
          acc['Total Qty'] += !isNaN(totalQty) ? totalQty : 0;
          acc['Total Amount'] += !isNaN(totalAmount) ? totalAmount : 0;
          return acc;
        },
        defaultTotals
      );
    } catch (error) {
      this.totals = defaultTotals;
      this.errors.update(errors => [...errors, `Failed to calculate item totals. ${error}`]);
    }
  }
}
