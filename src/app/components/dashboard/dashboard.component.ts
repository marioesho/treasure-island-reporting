import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { Filters, ReportItem } from '@models';
import { GmailService, CsvParserService } from '@services';
import { FiltersComponent } from '../filters/filters.component';
import { ReportComponent } from '../report/report.component';

@Component({
  selector: 'app-dashboard',
  imports: [NgIf, FiltersComponent, ReportComponent, MatProgressBarModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  public loading = false;
  public totalEmails: number = 0;
  public emailIndex: number = 0;
  public data?: ReportItem[];

  constructor(
    private gmailService: GmailService,
    private csvParserService: CsvParserService
  ) {}

  async getReport(filters: Filters): Promise<void> {
    this.loading = true;

    const emails = await this.gmailService.getEmails(filters);
    this.totalEmails = emails.resultSizeEstimate;

    // TODO: what is returned when no emails are found
    emails.messages.forEach(async (message, index) => {
      this.emailIndex = index + 1;
      const messageDetails = await this.gmailService.getMessageDetails(message.id);
      const attachment = await this.gmailService.getAttachment(messageDetails);
      const csvText = atob(attachment.data.replace(/-/g, '+').replace(/_/g, '/'));
      this.data = await this.csvParserService.parseCsv(csvText);
    });

    this.loading = false;
  }
}
