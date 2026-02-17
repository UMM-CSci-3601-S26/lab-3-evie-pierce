import { HttpClient, HttpParams, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { Todo } from './todo';
import { TodoService } from './todo.service';
//import { Company } from '../company-list/company';

describe('TodoService', () => {
  // A small collection of test todos
  const testTodos: Todo[] = [
    {
      _id: 'test_id_1',
      owner: 'Alfred',
      category: "homework",
      status: "incomplete",
      body: "Write a paper!"
    },
    {
      _id: 'test_id_2',
      owner: 'Bob',
      category: "homework",
      status: "complete",
      body: "Write another paper!"
    },
    {
      _id: 'test_id_3',
      owner: 'Clide',
      category: "homework",
      status: "incomplete",
      body: "Write all the papers!"
    }
  ];

  let todoService: TodoService;
  // These are used to mock the HTTP requests so that we (a) don't have to
  // have the server running and (b) we can check exactly which HTTP
  // requests were made to ensure that we're making the correct requests.
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    // Construct an instance of the service with the mock
    // HTTP client.
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    todoService = TestBed.inject(TodoService);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  describe('When getTodos() is called with no parameters', () => {
    it('calls `api/todos`', waitForAsync(() => {
      // Mock the `httpClient.get()` method, so that instead of making an HTTP request,
      // it just returns our test data.
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

      // Call `todoService.getTodos()` and confirm that the correct call has
      // been made with the correct arguments.
      //
      // We have to `subscribe()` to the `Observable` returned by `getUsers()`.
      // The `users` argument in the function is the array of Users returned by
      // the call to `getUsers()`.
      todoService.getTodos().subscribe(() => {
        // The mocked method (`httpClient.get()`) should have been called
        // exactly one time.
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        // The mocked method should have been called with two arguments:
        //   * the appropriate URL ('/api/todos' defined in the `TodoService`)
        //   * An options object containing an empty `HttpParams`
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams() });
      });
    }));
  });

  describe('When getTodos() is called with parameters, it correctly forms the HTTP request (Javalin/Server filtering)', () => {

    it('correctly calls api/todos with filter parameter \'contains\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

      todoService.getTodos({ body:'Write' }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        // The mocked method should have been called with two arguments:
        //   * the appropriate URL ('/api/users' defined in the `UserService`)
        //   * An options object containing an `HttpParams` with the `role`:`admin`
        //     key-value pair.
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams().set('contains', 'Write') });
      });
    });

    it('correctly calls api/todos with filter parameter \'status\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

      todoService.getTodos({ status: "incomplete" }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        //For some reason this results in no parameters?
        //Does this have something to do with how we're converting booleans into 'complete' and 'incomplete'?
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams().set('status', 'incomplete') });
      });
    });
  });

  it('correctly calls api/todos with filter parameter \'limit\'', () => {
    const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

    todoService.getTodos({ limit: 2 }).subscribe(() => {
      expect(mockedMethod)
        .withContext('one call')
        .toHaveBeenCalledTimes(1);
      expect(mockedMethod)
        .withContext('talks to the correct endpoint')
        .toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams().set('limit', 2) });
    });
  });

  it('correctly calls api/todos with filter parameter \'orderBy\'', () => {
    const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

    todoService.getTodos({orderBy: 'status' }).subscribe(() => {
      expect(mockedMethod)
        .withContext('one call')
        .toHaveBeenCalledTimes(1);
      expect(mockedMethod)
        .withContext('talks to the correct endpoint')
        .toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams().set('orderBy', 'status') });
    });
  });

  describe('When getTodoById() is given an ID', () => {
    it('calls api/users/id with the correct ID', waitForAsync(() => {
      // We're just picking a Todo  "at random" from our little
      // set of Todos up at the top.
      const targetTodo: Todo = testTodos[1];
      const targetId: string = targetTodo._id;

      // Mock the `httpClient.get()` method so that instead of making an HTTP request
      // it just returns one todo from our test data
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(targetTodo));

      // Call `userService.getUser()` and confirm that the correct call has
      // been made with the correct arguments.
      //
      // We have to `subscribe()` to the `Observable` returned by `getUserById()`.
      // The `user` argument in the function below is the thing of type Todo returned by
      // the call to `getTodoById()`.

      todoService.getTodoById(targetId).subscribe(() => {
        // The `User` returned by `getUserById()` should be targetTodo, but
        // we don't bother with an `expect` here since we don't care what was returned.
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(`${todoService.todoUrl}/${targetId}`);
      });
    }));
  });

  describe('Filtering on the client using `filterTodos()` (Angular/Client filtering)', () => {
    it('filters by owner', () => {
      const userName = 'Al';
      const filteredTodos = todoService.filterTodos(testTodos, { owner: userName });
      // Only one user's name contains 'Al.'
      expect(filteredTodos.length).toBe(1);
      // The returned user's name should contain 'Al.'
      filteredTodos.forEach(todo => {
        expect(todo.owner.indexOf(userName)).toBeGreaterThanOrEqual(0);
      });
    });

    it('filters by category', () => {
      const categoryName = 'homework';
      const filteredTodos = todoService.filterTodos(testTodos, { category: categoryName });
      // All three test todos are of category 'homework'
      expect(filteredTodos.length).toBe(3);
      // Every returned user's name should contain 'homework.'
      filteredTodos.forEach(todo => {
        expect(todo.category.indexOf(categoryName)).toBeGreaterThanOrEqual(0);
      });
    });
  });

  // describe('Adding a user using `addUser()`', () => {
  //   it('talks to the right endpoint and is called once', waitForAsync(() => {
  //     const user_id = 'pat_id';
  //     const expected_http_response = { id: user_id } ;

  //     // Mock the `httpClient.addUser()` method, so that instead of making an HTTP request,
  //     // it just returns our expected HTTP response.
  //     const mockedMethod = spyOn(httpClient, 'post')
  //       .and
  //       .returnValue(of(expected_http_response));

  //     userService.addUser(testUsers[1]).subscribe((new_user_id) => {
  //       expect(new_user_id).toBe(user_id);
  //       expect(mockedMethod)
  //         .withContext('one call')
  //         .toHaveBeenCalledTimes(1);
  //       expect(mockedMethod)
  //         .withContext('talks to the correct endpoint')
  //         .toHaveBeenCalledWith(userService.userUrl, testUsers[1]);
  //     });
  //   }));
  // });
});
