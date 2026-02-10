import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
//import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Todo } from './todo';
//import { Company } from '../company-list/company';

/**
 * Service that provides the interface for getting information
 * about `Users` from the server.
 */
@Injectable({
  providedIn: 'root'
})
export class TodoService {
  // The private `HttpClient` is *injected* into the service
  // by the Angular framework. This allows the system to create
  // only one `HttpClient` and share that across all services
  // that need it, and it allows us to inject a mock version
  // of `HttpClient` in the unit tests so they don't have to
  // make "real" HTTP calls to a server that might not exist or
  // might not be currently running.
  private httpClient = inject(HttpClient);

  // The URL for the users part of the server API.
  readonly todoUrl: string = `${environment.apiUrl}todos`;
  readonly todosByCategoryUrl: string = `${environment.apiUrl}todosByCategory`;

  private readonly ownerKey = 'owner';
  private readonly categoryKey = 'category';
  private readonly bodyKey = 'body';
  private readonly statusKey = 'status';

  /**
   * Get all the todos from the server, filtered by the information
   * in the `filters` map.
   *
   * It would be more consistent with `TodoListComponent` if this
   * only supported filtering on age and role, and left company to
   * just be in `filterUsers()` below. We've included it here, though,
   * to provide some additional examples.
   *
   * @param filters a map that allows us to specify a target role, age,
   *  or company to filter by, or any combination of those
   * @returns an `Observable` of an array of `Users`. Wrapping the array
   *  in an `Observable` means that other bits of of code can `subscribe` to
   *  the result (the `Observable`) and get the results that come back
   *  from the server after a possibly substantial delay (because we're
   *  contacting a remote server over the Internet).
   */
  getTodos(filters?: {status?: boolean; body?: string; }): Observable<Todo[]> {
    // `HttpParams` is essentially just a map used to hold key-value
    // pairs that are then encoded as "?key1=value1&key2=value2&…" in
    // the URL when we make the call to `.get()` below.
    let httpParams: HttpParams = new HttpParams();
    if (filters) {
      if (filters.body) {
        httpParams = httpParams.set(this.bodyKey, filters.body);
      }
      if (filters.status) {
        if (filters.status == true) {
          httpParams = httpParams.set(this.statusKey, "complete");
        } else {
          httpParams = httpParams.set(this.statusKey, "incomplete");
        }
      }
    }
    // Send the HTTP GET request with the given URL and parameters.
    // That will return the desired `Observable<User[]>`.
    return this.httpClient.get<Todo[]>(this.todoUrl, {
      params: httpParams,
    });
  }

  /**
   * Get the `Todo` with the specified ID.
   *
   * @param id the ID of the desired todo
   * @returns an `Observable` containing the resulting todo.
   */
  getTodoById(id: string): Observable<Todo> {
    // The input to get could also be written as (this.todoUrl + '/' + id)
    return this.httpClient.get<Todo>(`${this.todoUrl}/${id}`);
  }

  /**
   * A service method that filters an array of `Todo` using
   * the specified filters.
   *
   * Note that the filters here support partial matches. Since the
   * matching is done locally we can afford to repeatedly look for
   * partial matches instead of waiting until we have a full string
   * to match against.
   *
   * @param todos the array of `Users` that we're filtering
   * @param filters the map of key-value pairs used for the filtering
   * @returns an array of `Users` matching the given filters
   */
  filterTodos(todos: Todo[], filters: { owner?: string; category?: string; status?: boolean; body?: string }): Todo[] { // skipcq: JS-0105
    let filteredTodos = todos;

    //Filter by Owner
    if (filters.owner) {
      filters.owner = filters.owner.toLowerCase();
      filteredTodos = filteredTodos.filter(todo => todo.owner.toLowerCase().indexOf(filters.owner) !== -1);
    }
    //Filter by Category
    if (filters.category) {
      filters.category = filters.category.toLowerCase();
      filteredTodos = filteredTodos.filter(todo => todo.category.toLowerCase().indexOf(filters.category) !== -1);
    }

    return filteredTodos;
  }

  // getCompanies(): Observable<Company[]> {
  //   return this.httpClient.get<Company[]>(`${this.usersByCompanyUrl}`);
  // }

  // addUser(newUser: Partial<User>): Observable<string> {
  //   // Send post request to add a new user with the user data as the body.
  //   // `res.id` should be the MongoDB ID of the newly added `User`.
  //   return this.httpClient.post<{id: string}>(this.userUrl, newUser).pipe(map(response => response.id));
  // }
}
