import { Component, OnDestroy, output } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { provideNativeDateAdapter } from '@angular/material/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';

import { Filters } from '@models';
import { UtilityService } from '@services';

@Component({
  selector: 'app-filters',
  providers: [provideNativeDateAdapter()],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatButtonModule
  ],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss'
})
export class FiltersComponent implements OnDestroy {
  public filters = output<Filters>();
  public filterForm: FormGroup;
  public flexDirection = 'flex-direction-row';

  private subscriptions = new Subscription();

  public get maxDate(): Date | null {
    const dateNow = new Date(Date.now());
    const startDate = this.filterForm.get('startDate')?.value;

    if (!startDate) return dateNow;

    const maxDate = this.utilityService.addDays(startDate, 99);
    return maxDate > dateNow ? dateNow : maxDate;
  }

  constructor(
    private fb: FormBuilder,
    private breakpointObserver: BreakpointObserver,
    private utilityService: UtilityService) {
    this.breakpointObserver.observe([Breakpoints.XSmall])
      .subscribe(result => {
        if (result.matches) {
          this.flexDirection = 'flex-direction-column';
        } else {
          this.flexDirection = 'flex-direction-row';
        }
      });
    this.filterForm = this.fb.group({
      startDate: [null, Validators.required],
      endDate: [null, Validators.required]
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSubmit() {
    this.filters.emit(this.filterForm.value);
  }
}
