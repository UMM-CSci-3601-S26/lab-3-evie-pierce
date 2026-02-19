import { Location } from '@angular/common';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';//fakeAsync, flush, tick,
import { AbstractControl, FormGroup } from '@angular/forms';
import { Router} from '@angular/router';//provideRouter
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { throwError } from 'rxjs'; //of
import { MockTodoService } from 'src/testing/todo.service.mock';
import { AddTodoComponent } from './add-todo.component';
//import { TodoProfileComponent } from './todo-profile.component';
import { TodoService } from './todo.service';
import { provideHttpClient } from '@angular/common/http';

describe('AddTodoComponent', () => {
  let addTodoComponent: AddTodoComponent;
  let addTodoForm: FormGroup;
  let fixture: ComponentFixture<AddTodoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AddTodoComponent,
        MatSnackBarModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TodoService, useClass: MockTodoService }
      ]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTodoComponent);
    addTodoComponent = fixture.componentInstance;
    fixture.detectChanges();
    addTodoForm = addTodoComponent.addTodoForm;
    expect(addTodoForm).toBeDefined();
    expect(addTodoForm.controls).toBeDefined();
  });

  // Not terribly important; if the component doesn't create
  // successfully that will probably blow up a lot of things.
  // Including it, though, does give us confidence that our
  // our component definitions don't have errors that would
  // prevent them from being successfully constructed.
  it('should create the component and form', () => {
    expect(addTodoComponent).toBeTruthy();
    expect(addTodoForm).toBeTruthy();
  });

  // Confirms that an initial, empty form is *not* valid, so
  // people can't submit an empty form.
  it('form should be invalid when empty', () => {
    expect(addTodoForm.valid).toBeFalsy();
  });

  describe('The owner field', () => {
    let ownerControl: AbstractControl;

    beforeEach(() => {
      ownerControl = addTodoComponent.addTodoForm.controls.owner;
    });

    it('should not allow empty names', () => {
      ownerControl.setValue('');
      expect(ownerControl.valid).toBeFalsy();
    });

    it('should be fine with "Bob"', () => {
      ownerControl.setValue('Bob');
      expect(ownerControl.valid).toBeTruthy();
    });

    it('should fail on single character owner inputs', () => {
      ownerControl.setValue('x');
      expect(ownerControl.valid).toBeFalsy();
      expect(ownerControl.hasError('minlength')).toBeTruthy();
    });

    it('should fail on really long owner inputs', () => {
      ownerControl.setValue('x'.repeat(100));
      expect(ownerControl.valid).toBeFalsy();
      expect(ownerControl.hasError('maxlength')).toBeTruthy();
    });
  });

  describe('The category field', () => {
    let categoryControl: AbstractControl;

    beforeEach(() => {
      categoryControl = addTodoComponent.addTodoForm.controls.category;
    });

    it('should not allow empty categories', () => {
      categoryControl.setValue('');
      expect(categoryControl.valid).toBeFalsy();
    });

    it('should be fine with "homework"', () => {
      categoryControl.setValue('homework');
      expect(categoryControl.valid).toBeTruthy();
    });

    it('should fail on single character categories', () => {
      categoryControl.setValue('x');
      expect(categoryControl.valid).toBeFalsy();
      expect(categoryControl.hasError('minlength')).toBeTruthy();
    });

    it('should fail on really long categories', () => {
      categoryControl.setValue('x'.repeat(100));
      expect(categoryControl.valid).toBeFalsy();
      expect(categoryControl.hasError('maxlength')).toBeTruthy();
    });
  });

  describe('The body field', () => {
    let bodyControl: AbstractControl;

    beforeEach(() => {
      bodyControl = addTodoComponent.addTodoForm.controls.body;
    });

    it('should not allow empty bodies', () => {
      bodyControl.setValue('');
      expect(bodyControl.valid).toBeFalsy();
    });

    it('should be fine with "testing"', () => {
      bodyControl.setValue('testing');
      expect(bodyControl.valid).toBeTruthy();
    });

    it('should fail on single character bodies', () => {
      bodyControl.setValue('x');
      expect(bodyControl.valid).toBeFalsy();
      expect(bodyControl.hasError('minlength')).toBeTruthy();
    });

    it('should fail on really long categories', () => {
      bodyControl.setValue('x'.repeat(100));
      expect(bodyControl.valid).toBeFalsy();
      expect(bodyControl.hasError('maxlength')).toBeTruthy();
    });
  });

  describe('The status field', () => {
    let statusControl: AbstractControl;

    beforeEach(() => {
      statusControl = addTodoComponent.addTodoForm.controls.status;
    });

    it('should not allow empty status', () => {
      statusControl.setValue('');
      expect(statusControl.valid).toBeFalsy();
    });

    it('should be fine with "complete"', () => {
      statusControl.setValue('complete');
      expect(statusControl.valid).toBeTruthy();
    });

    it('should be fine with "incomplete"', () => {
      statusControl.setValue('incomplete');
      expect(statusControl.valid).toBeTruthy();
    });
  });

  describe('getErrorMessage()', () => {
    it('should return the correct error message', () => {
      // The type statement is needed to ensure that `controlName` isn't just any
      // random string, but rather one of the keys of the `addTodoValidationMessages`
      // map in the component.
      let controlName: keyof typeof addTodoComponent.addTodoValidationMessages = 'owner';
      addTodoComponent.addTodoForm.get(controlName).setErrors({'required': true});
      expect(addTodoComponent.getErrorMessage(controlName)).toEqual('Owner is required');

      // We don't need the type statement here because we're not using the
      // same (previously typed) variable. We could use a `let` and the type statement
      // if we wanted to create a new variable, though.
      controlName = 'category';
      addTodoComponent.addTodoForm.get(controlName).setErrors({'required': true});
      expect(addTodoComponent.getErrorMessage(controlName)).toEqual('Category is required');

      controlName = 'body';
      addTodoComponent.addTodoForm.get(controlName).setErrors({'required': true});
      expect(addTodoComponent.getErrorMessage(controlName)).toEqual('Body is required');

      controlName = 'status';
      addTodoComponent.addTodoForm.get(controlName).setErrors({'required': true});
      expect(addTodoComponent.getErrorMessage(controlName)).toEqual('Status is required');
    });

    it('should return "Unknown error" if no error message is found', () => {
      // The type statement is needed to ensure that `controlName` isn't just any
      // random string, but rather one of the keys of the `addTodoValidationMessages`
      // map in the component.
      const controlName: keyof typeof addTodoComponent.addTodoValidationMessages = 'owner';
      addTodoComponent.addTodoForm.get(controlName).setErrors({'unknown': true});
      expect(addTodoComponent.getErrorMessage(controlName)).toEqual('Unknown error');
    });
  });
});

// A lot of these tests mock the service using an approach like this doc example
// https://angular.dev/guide/testing/components-scenarios#more-async-tests
// The same way that the following allows the mock to be used:
//
// TestBed.configureTestingModule({
//   providers: [{provide: TwainQuotes, useClass: MockTwainQuotes}], // A (more-async-tests) - provide + use class of the mock
// });
// const twainQuotes = TestBed.inject(TwainQuotes) as MockTwainQuotes; // B (more-async-tests) - inject the service as the mock
//
// Is how these tests work with the mock then being injected in

describe('AddTodoComponent#submitForm()', () => {
  let component: AddTodoComponent;
  let fixture: ComponentFixture<AddTodoComponent>;
  let todoService: TodoService;
  let location: Location;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AddTodoComponent,
        MatSnackBarModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: TodoService, useClass: MockTodoService }, // A (more-async-tests) - provide + use class of the mock
        // provideRouter([
        //   { path: 'todos/1', component: TodoProfileComponent }
        // ])
      ]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTodoComponent);
    component = fixture.componentInstance;
    todoService = TestBed.inject(TodoService); // B (more-async-tests) - inject the service as the mock
    location = TestBed.inject(Location);
    // We need to inject the router and the HttpTestingController, but
    // never need to use them. So, we can just inject them into the TestBed
    // and ignore the returned values.
    TestBed.inject(Router);
    TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  beforeEach(() => {
    // Set up the form with valid values.
    // We don't actually have to do this, but it does mean that when we
    // check that `submitForm()` is called with the right arguments below,
    // we have some reason to believe that that wasn't passing "by accident".
    component.addTodoForm.controls.owner.setValue('Bob');
    component.addTodoForm.controls.category.setValue('homework');
    component.addTodoForm.controls.body.setValue('This is a body');
    component.addTodoForm.controls.status.setValue('incomplete');
  });

  it('should call addTodo() and handle error response', () => {
    // Save the original path so we can check that it doesn't change.
    const path = location.path();
    // A canned error response to be returned by the spy.
    const errorResponse = { status: 500, message: 'Server error' };
    // "Spy" on the `.addTodo()` method in the todo service. Here we basically
    // intercept any calls to that method and return the error response
    // defined above.
    const addTodoSpy = spyOn(todoService, 'addTodo')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    // Check that `.addTodo()` was called with the form's values which we set
    // up above.
    expect(addTodoSpy).toHaveBeenCalledWith(component.addTodoForm.value);
    // Confirm that we're still at the same path.
    expect(location.path()).toBe(path);
  });

  it('should call addTodo() and handle error response for illegal todo', () => {
    // Save the original path so we can check that it doesn't change.
    const path = location.path();
    // A canned error response to be returned by the spy.
    const errorResponse = { status: 400, message: 'Illegal todo error' };
    // "Spy" on the `.addTodo()` method in the todo service. Here we basically
    // intercept any calls to that method and return the error response
    // defined above.
    const addTodoSpy = spyOn(todoService, 'addTodo')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    // Check that `.addTodo()` was called with the form's values which we set
    // up above.
    expect(addTodoSpy).toHaveBeenCalledWith(component.addTodoForm.value);
    // Confirm that we're still at the same path.
    expect(location.path()).toBe(path);
  });

  it('should call addTodo() and handle unexpected error response if it arises', () => {
    // Save the original path so we can check that it doesn't change.
    const path = location.path();
    // A canned error response to be returned by the spy.
    const errorResponse = { status: 404, message: 'Not found' };
    // "Spy" on the `.addTodo()` method in the todo service. Here we basically
    // intercept any calls to that method and return the error response
    // defined above.
    const addTodoSpy = spyOn(todoService, 'addTodo')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    // Check that `.addTodo()` was called with the form's values which we set
    // up above.
    expect(addTodoSpy).toHaveBeenCalledWith(component.addTodoForm.value);
    // Confirm that we're still at the same path.
    expect(location.path()).toBe(path);
  });
});
