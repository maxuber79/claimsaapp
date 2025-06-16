import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoStatsComponent } from './todo-stats.component';

describe('TodoStatsComponent', () => {
  let component: TodoStatsComponent;
  let fixture: ComponentFixture<TodoStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodoStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
