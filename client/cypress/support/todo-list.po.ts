//import { TodoRole } from 'src/app/todos/todo';

export class TodoListPage {
  private readonly baseUrl = '/todos';
  private readonly pageTitle = '.todo-list-title';
  private readonly todoCardSelector = '.todo-cards-container app-todo-card';
  private readonly todoListItemsSelector = '.todo-nav-list .todo-list-item';
  //private readonly profileButtonSelector = '[data-test=viewProfileButton]';
  private readonly radioButtonSelector = '[data-test=viewTypeRadio] mat-radio-button';
  private readonly todoStatusDropdownSelector = '[data-test=todoStatusSelect]';
  private readonly dropdownOptionSelector = 'mat-option';
  private readonly addTodoButtonSelector = '[data-test=addTodoButton]';

  navigateTo() {
    return cy.visit(this.baseUrl);
  }

  /**
   * Gets the title of the app when visiting the `/todos` page.
   *
   * @returns the value of the element with the ID `.todo-list-title`
   */
  getTodoTitle() {
    return cy.get(this.pageTitle);
  }

  /**
   * Get all the `app-todo-card` DOM elements. This will be
   * empty if we're using the list view of the todos.
   *
   * @returns an iterable (`Cypress.Chainable`) containing all
   *   the `app-todo-card` DOM elements.
   */
  getTodoCards() {
    return cy.get(this.todoCardSelector);
  }

  /**
   * Get all the `.todo-list-item` DOM elements. This will
   * be empty if we're using the card view of the todos.
   *
   * @returns an iterable (`Cypress.Chainable`) containing all
   *   the `.todo-list-item` DOM elements.
   */
  getTodoListItems() {
    return cy.get(this.todoListItemsSelector);
  }

  /**
   * Clicks the "view profile" button for the given todo card.
   * Requires being in the "card" view.
   *
   * @param card The todo card
   * Change the view of todos.
   *
   * @param viewType Which view type to change to: "card" or "list".
   */
  changeView(viewType: 'card' | 'list') {
    return cy.get(`${this.radioButtonSelector}[value="${viewType}"]`).click();
  }

  /**
   * Selects a role to filter in the "Role" selector.
   *
   * @param value The role *value* to select, this is what's found in the mat-option "value" attribute.
   */
  selectStatus(value: string) {
    // Find and click the drop down
    cy.get(this.todoStatusDropdownSelector).click();
    // Select and click the desired value from the resulting menu
    return cy.get(`${this.dropdownOptionSelector}[value="${value}"]`).click();
  }

  addTodoButton() {
    return cy.get(this.addTodoButtonSelector);
  }
}
