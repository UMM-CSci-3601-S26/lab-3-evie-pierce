import { TodoListPage } from '../support/todo-list.po';

const page = new TodoListPage();

describe('Todo list', () => {

  before(() => {
    cy.task('seed:database');
  });

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getTodoTitle().should('have.text', 'Todos');
  });

  it('Should show 300 todos in both card and list view', () => {
    page.getTodoCards().should('have.length', 300);
    page.changeView('list');
    page.getTodoListItems().should('have.length', 300);
  });

  it('Should type something in the owner and category filters and check that it returned correct elements', () => {
    // Filter for todos by Fry
    cy.get('[data-test=todoOwnerInput]').type('Fry');
    cy.get('[data-test=todoCategoryInput]').type('homework');

    // All of the todo cards should have the name we are filtering by
    page.getTodoCards().each(e => {
      cy.wrap(e).find('.todo-card-title').should('have.text', 'Fry - homework');
    });
  });

  it('Should type something in the body filter and check that it returned correct elements', () => {
    // Filter for body "Lorem ipsum"
    cy.get('[data-test=todoBodyInput]').type('Lorem ipsum');
    //There are 2 cards that contain this body; should be above 1.
    page.getTodoCards().should('have.lengthOf.above', 1);
    //Cards don't actually display body.
  });

  it('Should change the view', () => {
    // Choose the view type "List"
    page.changeView('list');

    // We should not see any cards
    // There should be list items
    page.getTodoCards().should('not.exist');
    page.getTodoListItems().should('exist');

    // Choose the view type "Card"
    page.changeView('card');

    // There should be cards
    // We should not see any list items
    page.getTodoCards().should('exist');
    page.getTodoListItems().should('not.exist');
  });

  it('Should select a status, switch the view, and check that it returned correct elements', () => {
    // Filter for role 'viewer');
    page.selectStatus('incomplete');

    // Choose the view type "List"
    page.changeView('list');

    // Some of the todos should be listed
    page.getTodoListItems().should('have.lengthOf.above', 0);

    // All of the todo list items that show should have the status we are looking for
    page.getTodoListItems().each(el => {
      cy.wrap(el).find('.todo-list-status').should('contain', 'false');
    });
  });

  it('Should click add todo and go to the right URL', () => {
    // Click on the button for adding a new todo
    page.addTodoButton().click();

    // The URL should end with '/todos/new'
    cy.url().should(url => expect(url.endsWith('/todos/new')).to.be.true);

    // On the page we were sent to, We should see the right title
    cy.get('.add-todo-title').should('have.text', 'New Todo');
  });
});
