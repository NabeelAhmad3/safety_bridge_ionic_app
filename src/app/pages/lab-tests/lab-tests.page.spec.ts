import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabTestsPage } from './lab-tests.page';

describe('LabTestsPage', () => {
  let component: LabTestsPage;
  let fixture: ComponentFixture<LabTestsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LabTestsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
