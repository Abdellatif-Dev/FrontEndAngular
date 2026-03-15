import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashAdmin } from './dash-admin';

describe('DashAdmin', () => {
  let component: DashAdmin;
  let fixture: ComponentFixture<DashAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(DashAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
