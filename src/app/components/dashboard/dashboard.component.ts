import { NgIf } from '@angular/common';
import { Component } from '@angular/core';

import { GmailService, CsvParserService, ReportService } from '@services';
import { FiltersComponent } from '../filters/filters.component';
import { ReportComponent } from '../report/report.component';

@Component({
  selector: 'app-dashboard',
  imports: [NgIf, FiltersComponent, ReportComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  loading = false;
  filteredData: any[] = [];

  constructor(
    private gmailService: GmailService,
    private csvParserService: CsvParserService,
    private reportService: ReportService
  ) {}

  async fetchData() {
    this.loading = true;
    try {
      const messages = (await this.gmailService.getEmails()).messages;
      console.log(messages);
      const messageDetails = await this.gmailService.getMessageDetails(messages[0].id);
      console.log(messageDetails);
      const messageAttachment = await this.gmailService.getAttachment(messageDetails);
      console.log(messageAttachment);

      // let allParsedData: any[] = [];

      // for (const message of messages) {
      //   const blob = await this.gmailService.getAttachment(message.id);
      //   const parsed = await this.csvParserService.parseCsv(blob);
      //   allParsedData = allParsedData.concat(parsed);
      // }

      // this.reportService.setData(allParsedData);
      // this.filteredData = allParsedData;
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  onFilterChanged(filters: any) {
    this.filteredData = this.reportService.getFilteredData(filters);
  }
}
