import { NgFor } from '@angular/common';
import { Component, effect, input, viewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { ReportItem, ReportTotals } from '@models';

@Component({
  selector: 'app-report',
  imports: [
    NgFor,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent {
  displayedColumns: (keyof ReportItem)[] = ['UPC', 'Name', 'Total Qty', 'Total Amount'];
  data = input.required({ transform: this.transformData });
  paginator = viewChild.required(MatPaginator);
  sort = viewChild.required(MatSort);
  total?: ReportTotals;

  constructor() {
    effect(() => {
      this.data().paginator = this.paginator();
      this.data().sort = this.sort();
      this.getTotals('All');
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    if (filterValue) {
      this.data().filter = filterValue;
      this.data().paginator?.firstPage();
      this.getTotals('Filtered');
    } else {
      this.getTotals('All');
    }
  }

  private getTotals(type: 'All' | 'Filtered') {
    this.total = { UPC: `${type} Total`, Name: '', 'Total Qty': 0, 'Total Amount': 0 };
    let data: ReportItem[];

    if (type === 'All') {
      data = this.data().data;
    } else {
      const pageSize = this.paginator().pageSize;
      const startIndex = this.paginator().pageIndex * pageSize;
      const endIndex = startIndex + pageSize;
      data = this.data().filteredData.slice(startIndex, endIndex);
    }

    data.forEach((item) => {
      const totalQty = Number(item['Total Qty']);
      const totalAmount = Number(item['Total Amount']);
      if (!isNaN(totalQty)) this.total!['Total Qty'] += totalQty;
      if (!isNaN(totalAmount)) this.total!['Total Amount'] += totalAmount;
    });
  }

  private transformData(value: ReportItem[]): MatTableDataSource<ReportItem> {
    // TODO: consolidate UPCs here
    return new MatTableDataSource<ReportItem>(value);
  }
}
