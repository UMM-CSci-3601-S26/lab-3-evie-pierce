import { Component, computed, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { catchError, combineLatest, of, switchMap, tap } from 'rxjs';
import { Todo } from './todo';
import { TodoCardComponent } from './todo-card.component';
import { TodoService } from './todo.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

/**
 * A component that displays a list of todos, either as a grid
 * of cards or as a vertical list.
 *
 * The component supports local filtering by category and/or owner,
 * and remote filtering (i.e., filtering by the server) by
 * status and/or body. These choices are fairly arbitrary here,
 * but in "real" projects you want to think about where it
 * makes the most sense to do the filtering.
 */
@Component({
  selector: 'app-todo-list-component',
  templateUrl: 'todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  providers: [],
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MatRadioModule,
    TodoCardComponent,
    MatListModule,
    RouterLink,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
  ],
})
export class TodoListComponent {
  // todoService the `TodoService` used to get todos from the server
  private todoService = inject(TodoService);
  // snackBar the `MatSnackBar` used to display feedback
  private snackBar = inject(MatSnackBar);

  todoOwner = signal<string | undefined>(undefined);
  todoCategory = signal<string | undefined>(undefined);
  todoBody = signal<string | undefined>(undefined);
  todoStatus = signal<string | undefined>(undefined);
  todoOrder = signal<string | undefined>(undefined);
  todoLimit = signal<number | undefined>(undefined);

  viewType = signal<'card' | 'list'>('card');

  errMsg = signal<string | undefined>(undefined);

  // The `Observable`s used in the definition of `serverFilteredUsers` below need
  // observables to react to, i.e., they need to know what kinds of changes to respond to.
  // We want to do the age and role filtering on the server side, so if either of those
  // text fields change we want to re-run the filtering. That means we have to convert both
  // of those _signals_ to _observables_ using `toObservable()`. Those are then used in the
  // definition of `serverFilteredUsers` below to trigger updates to the `Observable` there.
  private todoStatus$ = toObservable(this.todoStatus);
  private todoBody$ = toObservable(this.todoBody);
  private todoLimit$ = toObservable(this.todoLimit);
  private todoOrder$ = toObservable(this.todoOrder);

  // Server side filtering
  serverFilteredTodos =
    toSignal(
      combineLatest([this.todoStatus$, this.todoBody$, this.todoLimit$, this.todoOrder$]).pipe(

        switchMap(([status, body, limit, orderBy]) =>
          this.todoService.getTodos({
            status,
            body,
            limit,
            orderBy,
          })
        ),

        catchError((err) => {
          if (!(err.error instanceof ErrorEvent)) {
            this.errMsg.set(
              `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`
            );
          }
          this.snackBar.open(this.errMsg(), 'OK', { duration: 6000 });

          return of<Todo[]>([]);
        }),
        // Tap allows you to perform side effects if necessary
        tap(() => {
        })
      )
    );

  //Client side filtering
  filteredTodos = computed(() => {
    const serverFilteredTodos = this.serverFilteredTodos();
    return this.todoService.filterTodos(serverFilteredTodos, {
      owner: this.todoOwner(),
      category: this.todoCategory(),
    });
  });
}
