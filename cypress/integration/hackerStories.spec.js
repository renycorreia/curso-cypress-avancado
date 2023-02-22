describe('Hacker Stories', () => {
  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      pathname: '**/search',
      query: {
        query: 'React',
        page: '0'
      }
    }).as('buscaPaginaInicial')

    cy.visit('/')

    cy.wait('@buscaPaginaInicial')
  })

  it('shows the footer', () => {
    cy.get('footer')
      .should('be.visible')
      .and('contain', 'Icons made by Freepik from www.flaticon.com')
  })

  context('List of stories', () => {
    // Since the API is external,
    // I can't control what it will provide to the frontend,
    // and so, how can I assert on the data?
    // This is why this test is being skipped.
    // TODO: Find a way to test it out.
    it.skip('shows the right data for all rendered stories', () => {})

    it('shows 20 stories, then the next 20 after clicking "More"', () => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: 'React',
          page: '1'
        }
      }).as('buscaSegundaPagina')

      cy.get('.item').should('have.length', 20)

      cy.contains('More').click()

      cy.wait('@buscaSegundaPagina')

      cy.get('.item').should('have.length', 40)
    })

    it('shows only nineteen stories after dimissing the first story', () => {
      cy.get('.button-small')
        .first()
        .click()

      cy.get('.item').should('have.length', 19)
    })

    // Since the API is external,
    // I can't control what it will provide to the frontend,
    // and so, how can I test ordering?
    // This is why these tests are being skipped.
    // TODO: Find a way to test them out.
    context.skip('Order by', () => {
      it('orders by title', () => {})

      it('orders by author', () => {})

      it('orders by comments', () => {})

      it('orders by points', () => {})
    })
  })

  context('Search', () => {
    const initialTerm = 'React'
    const newTerm = 'Cypress'

    beforeEach(() => {
      cy.get('#search')
        .clear()

      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: `${newTerm}`,
          page: '0'
        }
      }).as('busca')

      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: `${initialTerm}`,
          page: '0'
        }
      }).as('buscaAnterior')
    })

    it('types and hits ENTER', () => {
      cy.get('#search')
        .type(`${newTerm}{enter}`)

      cy.wait('@busca')

      cy.get('.item').should('have.length', 20)
      cy.get('.item')
        .first()
        .should('contain', newTerm)
      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
    })

    it('types and clicks the submit button', () => {
      cy.get('#search')
        .type(newTerm)
      cy.contains('Submit')
        .click()

      cy.wait('@busca')

      cy.get('.item').should('have.length', 20)
      cy.get('.item')
        .first()
        .should('contain', newTerm)
      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
    })

    /* it('types and submits the form directly', () => {
      cy.get('form input[type="text"]')
        .should('be.visible')
        .clear()
        .type('Cypress')
      cy.get('form').submit()

      cy.wait('@busca')

      cy.get('.item').should('have.length', 20)
      cy.get('.item')
        .first()
        .should('contain', newTerm)
      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
    }) */

    context('Last searches', () => {
      it('searches via the last searched term', () => {
        cy.get('#search')
          .type(`${newTerm}{enter}`)

        cy.wait('@busca')

        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
          .click()

        cy.wait('@buscaAnterior')

        cy.get('.item').should('have.length', 20)
        cy.get('.item')
          .first()
          .should('contain', initialTerm)
        cy.get(`button:contains(${newTerm})`)
          .should('be.visible')
      })

      it('shows a max of 5 buttons for the last searched terms', () => {
        const faker = require('faker')
        let aux1 = ''
        let aux2 = ''

        Cypress._.times(7, (index) => {
          const random = faker.random.word()
          cy.log(random)

          if (index === 0) {
            aux1 = random
          } else if (index === 6) {
            aux2 = random
          }

          cy.intercept({
            method: 'GET',
            pathname: '**/search',
            query: {
              query: `${random}`,
              page: '0'
            }
          }).as('buscaRandom')

          cy.get('#search')
            .clear()
            .type(`${random}{enter}`)
        })

        cy.wait('@buscaRandom')

        cy.get('.last-searches button')
          .should('have.length', 5)

        cy.get(`button:contains(${aux1})`)
          .should('not.exist')
        cy.get(`button:contains(${aux2})`)
          .should('not.exist')
      })
    })
  })
})

context('Errors', () => {
  const errorMsg = 'Something went wrong ...'

  it('shows "Something went wrong ..." in case of a server error', () => {
    cy.intercept('GET', '**/search**',
      { statusCode: 500 }
    ).as('busca')

    cy.visit('/')

    cy.wait('@busca')

    cy.get(`p:contains(${errorMsg})`)
      .should('be.visible')
  })

  it('shows "Something went wrong ..." in case of a network error', () => {
    cy.intercept('GET', '**/search**',
      { forceNetworkError: true }
    ).as('busca')

    cy.visit('/')

    cy.wait('@busca')

    cy.get(`p:contains(${errorMsg})`)
      .should('be.visible')
  })
})
