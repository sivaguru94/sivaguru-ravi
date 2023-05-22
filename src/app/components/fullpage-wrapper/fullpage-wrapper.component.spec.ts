import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullpageWrapperComponent } from './fullpage-wrapper.component';

describe('FullpageWrapperComponent', () => {
  let component: FullpageWrapperComponent;
  let fixture: ComponentFixture<FullpageWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FullpageWrapperComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullpageWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
