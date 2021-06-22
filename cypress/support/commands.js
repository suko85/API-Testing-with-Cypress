// ***********************************************
// This example commands.js shows you how to
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

Cypress.Commands.add('loginToApplication', () =>{

    const userCredentials = {
        "user": {
            "email": "sukoggu@gmail.com",
            "password": "Gegu 1085"
        }
    } 
    cy.request('POST', 'https://conduit.productionready.io/api/users/login', userCredentials)
        .its('body').then( body => {
            const token = body.user.token

            cy.wrap(token).as('token')
            //here is important visit the homepage(do not login page) because we assume we already authenticated.
            cy.visit('/', {
                //we need to provide an option to visit method (onBeforeLoad event) 
                onBeforeLoad (win){   // <-- using window object
                    win.localStorage.setItem('jwtToken', token) //getting the local storage and setting the item with the key and value
                }
            })
        })

    // cy.visit('/login')
    // cy.get('[placeholder="Email"]').type('sukoggu@gmail.com')
    // cy.get('[placeholder="Password"]').type('Gegu 1085')
    // cy.get('form').submit()
}) 