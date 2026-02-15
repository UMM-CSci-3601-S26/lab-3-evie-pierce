import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TodoCardComponent } from './todo-card.component';
import { Todo } from './todo';

describe('TodoCardComponent', () => {
  let component: TodoCardComponent;
  let fixture: ComponentFixture<TodoCardComponent>;
  let expectedTodo: Todo;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TodoCardComponent
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoCardComponent);
    component = fixture.componentInstance;
    expectedTodo = {
      _id: 'example_id',
      owner:'Bob',
      category:'espionage',
      status: false,
      body:'This is a test! How exciting!'
    };
    fixture.componentRef.setInput('todo', expectedTodo);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be associated with the correct todo', () => {
    expect(component.todo()).toEqual(expectedTodo);
  });

  it('should be the todo owned by Bob', () => {
    expect(component.todo().owner).toEqual('Bob');
  });
  it('should involve espionage', () => {
    expect(component.todo().category).toEqual('espionage');
  });
  it('should contain the expected body', () => {
    expect(component.todo().body).toEqual('This is a test! How exciting!');
  });
});
