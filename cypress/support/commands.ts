/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
declare global {
  namespace Cypress {
    interface Chainable {
      loginAdmin(email: string, password: string): Chainable<void>;
      loginUser(email: string, password: string): Chainable<void>;
      addCommunityProposal(
        name: string,
        description: string,
        requesterId: string,
      ): Chainable<void>;
    }
  }
}

Cypress.Commands.add('loginAdmin', (email: string, password: string) => {
  cy.request('POST', 'http://localhost:3001/auth/login', {
    email,
    password,
  }).then((response) => {
    cy.wrap(response.status).should('eq', 200);
    window.localStorage.setItem('adminAuthToken', response.body.token);
  });
});
