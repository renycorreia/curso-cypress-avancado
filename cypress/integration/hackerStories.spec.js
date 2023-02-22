describe('Hacker Stories', () => {
  const initialTerm = 'React'
  const newTerm = 'Cypress'

  context('Using real API', () => {
    beforeEach(() => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: `${initialTerm}`,
          page: '0'
        }
      }).as('buscaInicial')

      cy.visit('/')

      cy.wait('@buscaInicial')
    })

    it('shows 20 stories, then the next 20 after clicking "More"', () => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: `${initialTerm}`,
          page: '1'
        }
      }).as('buscaSegundaPagina')

      cy.get('.item').should('have.length', 20)

      cy.contains('More').click()

      cy.wait('@buscaSegundaPagina')

      cy.get('.item').should('have.length', 40)
    })

    it('searches via the last searched term', () => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: `${newTerm}`,
          page: '0'
        }
      }).as('buscaNovoTermo')

      cy.get('#search')
        .clear()
        .type(`${newTerm}{enter}`)

      cy.wait('@buscaNovoTermo')

      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
        .click()

      cy.wait('@buscaInicial')

      cy.get('.item').should('have.length', 20)
      cy.get('.item')
        .first()
        .should('contain', initialTerm)
      cy.get(`button:contains(${newTerm})`)
        .should('be.visible')
    })
  })

  context('Using API mock', () => {
    context('Footer and list of stories', () => {
      beforeEach(() => {
        cy.intercept(
          'GET'
          , `**/search?query=${initialTerm}&page=0`
          , { fixture: 'stories' })
          .as('buscaInicialMock')

        cy.visit('/')

        cy.wait('@buscaInicialMock')
      })

      it('shows the footer', () => {
        cy.get('footer')
          .should('be.visible')
          .and('contain', 'Icons made by Freepik from www.flaticon.com')
      })

      it('shows one last story after dimissing the first one', () => {
        cy.get('.button-small')
          .first()
          .click()

        cy.get('.item').should('have.length', 1)
      })

      context('List of stories', () => {
      // Since the API is external,
      // I can't control what it will provide to the frontend,
      // and so, how can I assert on the data?
      // This is why this test is being skipped.
      // TODO: Find a way to test it out.
        it.skip('shows the right data for all rendered stories', () => {})

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
    })

    context('Search', () => {
      beforeEach(() => {
        cy.intercept(
          'GET'
          , `**/search?query=${initialTerm}&page=0`
          , { fixture: 'empty' })
          .as('buscaInicialMock')

        cy.intercept(
          'GET'
          , `**/search?query=${newTerm}&page=0`
          , { fixture: 'storiesSearch' })
          .as('busca')

        cy.visit('/')

        cy.wait('@buscaInicialMock')
      })

      it('types and hits ENTER', () => {
        cy.get('#search')
          .clear()
          .type(`${newTerm}{enter}`)

        cy.wait('@busca')

        cy.get('.item').should('have.length', 1)
        cy.get('.item')
          .first()
          .should('contain', newTerm)
        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })

      it('types and clicks the submit button', () => {
        cy.get('#search')
          .clear()
          .type(newTerm)
        cy.contains('Submit')
          .click()

        cy.wait('@busca')

        cy.get('.item').should('have.length', 1)
        cy.get('.item')
          .first()
          .should('contain', newTerm)
        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })

      context('Last searches', () => {
        it('shows a max of 5 buttons for the last searched terms', () => {
          const faker = require('faker')
          let aux1 = ''

          Cypress._.times(7, (index) => {
            const random = faker.random.word()
            cy.log(random)

            if (index === 0) {
              aux1 = random
            }

            cy.intercept(
              'GET'
              , '**/search**'
              , { fixture: 'empty' })
              .as('buscaRandom')

            cy.get('#search')
              .clear()
              .type(`${random}{enter}`)

            cy.wait('@buscaRandom')
          })

          cy.get('.last-searches button')
            .should('have.length', 5)

          cy.get(`button:contains(${aux1})`)
            .should('not.exist')
        })
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

/*
    EXTRA
    it('types and submits the form directly', () => {
      cy.get('form input[type="text"]')
        .should('be.visible')
        .clear()
        .type(`${newTerm}`)
      cy.get('form').submit()

      cy.wait('@busca')

      cy.get('.item').should('have.length', 20)
      cy.get('.item')
        .first()
        .should('contain', newTerm)
      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
    }) */
