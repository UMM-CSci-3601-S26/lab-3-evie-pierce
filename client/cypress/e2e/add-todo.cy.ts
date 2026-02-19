import { Todo } from 'src/app/todos/todo';
import { AddTodoPage } from '../support/add-todo.po';

describe('Add todo', () => {
  const page = new AddTodoPage();

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getTitle().should('have.text', 'New Todo');
  });

  it('Should enable and disable the add todo button', () => {
    // ADD USER button should be disabled until all the necessary fields
    // are filled. Once the last (`#emailField`) is filled, then the button should
    // become enabled.
    page.addTodoButton().should('be.disabled');
    page.getFormField('owner').type('Test');
    page.addTodoButton().should('be.disabled');
    page.getFormField('category').type('homework');
    page.addTodoButton().should('be.disabled');
    page.getFormField('body').type('This is a test!');
    page.addTodoButton().should('be.disabled');
    page.selectMatSelectValue(page.getFormField('status'),'complete')
    // all the required fields have valid input, then it should be enabled
    page.addTodoButton().should('be.enabled');
  });

  it('Should show error messages for invalid inputs', () => {
    // Before doing anything there shouldn't be an error
    cy.get('[data-test=ownerError]').should('not.exist');
    // Just clicking the owner field without entering anything should cause an error message
    page.getFormField('owner').click().blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    // Some more tests for various invalid owner inputs
    page.getFormField('owner').type('J').blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    page
      .getFormField('owner')
      .clear()
      .type('This is a very long owner that goes beyond the 50 character limit')
      .blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    // Entering a valid owner should remove the error.
    page.getFormField('owner').clear().type('Test').blur();
    cy.get('[data-test=ownerError]').should('not.exist');
  });

  describe('Adding a new todo', () => {
    beforeEach(() => {
      cy.task('seed:database');
    });

    it('Should successfully add Todo and display correct message', () => {
      const todo: Todo = {
        _id: null,
        owner: 'Test Todo',
        category: 'homework',
        body: 'This is a test!',
        status: 'incomplete',
      };

      cy.intercept('/api/todos').as('addTodo');
      page.addTodo(todo);
      cy.wait('@addTodo');

      // We should see the confirmation message at the bottom of the screen
      page.getSnackBar().should('contain', `Added todo for ${todo.owner}`);
    });
  });
});
