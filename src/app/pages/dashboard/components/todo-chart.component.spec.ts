import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoChartComponent } from './todo-chart.component';

describe('TodoChartComponent', () => {
  let component: TodoChartComponent;
  let fixture: ComponentFixture<TodoChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodoChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
