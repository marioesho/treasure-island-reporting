import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-filters',
  imports: [],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss'
})
export class FiltersComponent {
  @Output() filterChanged = new EventEmitter<{ keyword: string }>();

  keyword: string = '';

  onKeywordChange(value: string) {
    this.keyword = value;
    this.filterChanged.emit({ keyword: this.keyword });
  }
}
