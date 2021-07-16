/// <reference types="cypress" />

const runOn = (browser, fn) => {
    if (Cypress.isBrowser(browser)){
        fn()
    }
}

const ignoreOn = (browser, fn) => {
    if (!Cypress.isBrowser(browser)){
        fn()
    }
}

describe('Test with backend', () =>{

    beforeEach('login to the app', () => {
        cy.intercept({method: 'Get', path:'tags'}, {fixture:'tags.json'}) //reading the JSON with the request. 
        cy.loginToApplication()
    })

    ignoreOn('firefox', () => {
        it('verify correct request and response', () => {

            cy.intercept({method:'POST', path:'articles'}).as('postArticles') //here we save the result of the call to POST for '**/articles'
                                                               // in postArticles object.
            
            cy.contains('New Article').click()
            cy.get('[formcontrolname="title"]').type('This is a title!')
            cy.get('[formcontrolname="description"]').type('This is a description!')
            cy.get('[formcontrolname="body"]').type('This is a body of the article!')
            cy.contains('Publish Article').click()
    
            cy.wait('@postArticles') // waiting for postArticles will be done using '@'
            cy.get('@postArticles').then( xhr => {
                console.log(xhr)
                expect(xhr.response.statusCode).to.equal(200)
                expect(xhr.request.body.article.body).to.equal('This is a body of the article!')
                expect(xhr.response.body.article.description).to.equal('This is a description!')
            })
        })
    })



    it('intercepting and modifying the request and response', () => {

        // cy.intercept('POST', '**/articles', (req) => {
        //     req.body.article.description = "This is a description 2!"
        // }).as('postArticles') //here we save the result of the call to POST for '**/articles'
        //                                                    // in postArticles object.
        

        cy.intercept('POST', '**/articles', (req) => {
            req.reply( res => {
                expect(res.body.article.description).to.equal('This is a description!')
                res.body.article.description = "This is a description 2!"
            })
        }).as('postArticles') //here we save the result of the call to POST for '**/articles'
                                                           // in postArticles object.
        

        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type('This is a title!')
        cy.get('[formcontrolname="description"]').type('This is a description!')
        cy.get('[formcontrolname="body"]').type('This is a body of the article!')
        cy.contains('Publish Article').click()

        cy.wait('@postArticles') // waiting for postArticles will be done using '@'
        cy.get('@postArticles').then( xhr => {
            console.log(xhr)
            expect(xhr.response.statusCode).to.equal(200)
            expect(xhr.request.body.article.body).to.equal('This is a body of the article!')
            expect(xhr.response.body.article.description).to.equal('This is a description 2!')
        })
    })


    //mocking response for API request expecting the values provided in the tag.json.
    it('should gave tags with routing object', () => {
        cy.get('.tag-list')
        .should('contain', 'cypress')
        .and('contain', 'automation')
        .and('contain', 'testing')
    })

    it.skip('verify global feed likes count', () => {
        cy.intercept({method:'GET', path:'articles/feed*'}, {"articles":[],"articlesCount":0})
        //This GET request for API '**/articles*', and the response for this request will be a 'fixture:articles.json'. 
        cy.intercept({method:'GET', path:'articles/feed*'}, {fixture:'articles.json'})

        cy.contains('Global Feed').click()
        //We modify in the mock json the number of likes, and here we make the assert for those values.
        cy.get('app-article-list button').then( listOfButtons => {
            expect(listOfButtons[0]).to.contain('1')
            expect(listOfButtons[1]).to.contain('5')
        })

        cy.fixture('articles').then( file => {
            const articleLink = file.articles[1].slug     //here we are calling the slug attribute of the article, which contain the random link to the article.
            cy.intercept('POST', '**/articles/'+articleLink+'/favorite', file)
        })

        cy.get('app-article-list button')
        .eq(1)
        .click()
        .should('contain', '6')
    })

    it('delete a new article in a global feed', () =>{

        const bodyRequest = {
            "article": {
                "tagList": [],
                "title": "My Request from API",
                "description": "API Testing is easy",
                "body": "Angular is cool"
            }
        }
        //getting the token from the alias saved in the login method
            cy.get('@token').then(token =>{
            
           //sending the POST request to create the article passing header and parameters
            cy.request({
                url: Cypress.env('apiUrl')+'api/articles/',
                headers: {'Authorization': 'Token '+ token},
                method: 'POST',
                body: bodyRequest
            }).then( response => {
                expect(response.status).to.equal(200)   // checking that the POST was successfull
            })

            // going to the recently created article(the first one on the list) to delete it. 
            cy.contains('Global Feed').click()
            cy.get('.article-preview').first().click()
            cy.get('.article-actions').contains('Delete Article').click() 

            //getting the list of articles to make sure the deleted one is not present.
            cy.request({
                url: Cypress.env('apiUrl')+'api/articles?limit=10&offset=0',
                headers: { 'Authorization': 'Token '+ token},
                method: 'GET'
            }).its('body').then( body => {
                expect(body.articles[0].title).not.equal('My Request from API')
            })
        })
    })

})

 