import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FetchEmailsComponent } from './fetch-emails.component';

describe('FetchEmailsComponent', () => {
  let component: FetchEmailsComponent;
  let fixture: ComponentFixture<FetchEmailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FetchEmailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FetchEmailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
