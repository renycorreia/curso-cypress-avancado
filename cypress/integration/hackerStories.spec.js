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

      cy.contains('More')
        .should('be.visible')
        .click()

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
        .should('be.visible')
        .clear()
        .type(`${newTerm}{enter}`)

      cy.wait('@buscaNovoTermo')

      cy.getLocalStorage('search')
        .should('be.equal', newTerm)

      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
        .click()

      cy.wait('@buscaInicial')

      cy.get('.item').should('have.length', 20)
      cy.get('.item')
        .first()
        .should('be.visible')
        .and('contain', initialTerm)
      cy.get(`button:contains(${newTerm})`)
        .should('be.visible')
    })
  })

  it('shows a "Loading ..." state before showing the results', () => {
    cy.intercept(
      'GET',
      '**/search**',
      {
        delay: 1000,
        fixture: 'stories'
      }
    ).as('getDelayedStories')

    cy.visit('/')

    cy.assertLoadingIsShownAndHidden()

    cy.wait('@getDelayedStories')

    cy.get('.item').should('have.length', 2)
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
          .should('be.visible')
          .first()
          .click()

        cy.get('.item').should('have.length', 1)
      })

      context('List of stories', () => {
        const stories = require('../fixtures/stories')

        it('shows the right data for all rendered stories', () => {
          cy.get('.item')
            .first()
            .should('be.visible')
            .and('contain', stories.hits[0].title)
            .and('contain', stories.hits[0].author)
            .and('contain', stories.hits[0].num_comments)
            .and('contain', stories.hits[0].points)
          cy.get(`.item a:contains(${stories.hits[0].title})`).should('have.attr', 'href', stories.hits[0].url)

          cy.get('.item')
            .last()
            .should('contain', stories.hits[1].title)
            .and('contain', stories.hits[1].author)
            .and('contain', stories.hits[1].num_comments)
            .and('contain', stories.hits[1].points)
          cy.get(`.item a:contains(${stories.hits[1].title})`)
            .should('have.attr', 'href', stories.hits[1].url)
        })

        context('Order by', () => {
          it('orders by title', () => {
            cy.get('.list-header-button:contains(Title)')
              .as('titleHeader')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].title)

            cy.get(`.item a:contains(${stories.hits[1].title})`)
              .should('have.attr', 'href', stories.hits[1].url)

            cy.get('@titleHeader')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].title)

            cy.get(`.item a:contains(${stories.hits[0].title})`)
              .should('have.attr', 'href', stories.hits[0].url)
          })

          it('orders by author', () => {
            cy.get('.list-header-button:contains(Author)')
              .as('authorHeader')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].author)

            cy.get('@authorHeader')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].author)
          })

          it('orders by comments', () => {
            cy.get('.list-header-button:contains(Comments)')
              .as('commentsHeader')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].num_comments)

            cy.get('@commentsHeader')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].num_comments)
          })

          it('orders by points', () => {
            cy.get('.list-header-button:contains(Points)')
              .as('pointsHeader')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].points)

            cy.get('@pointsHeader')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].points)
          })
        })
      })
    })

    context('Search', () => {
      beforeEach(() => {
        cy.intercept(
          'GET'
          , `**/search?query=${initialTerm}&page=0`
          , { fixture: 'empty' })
          .as('buscaInicialMockVazia')

        cy.intercept(
          'GET'
          , `**/search?query=${newTerm}&page=0`
          , { fixture: 'storiesSearch' })
          .as('busca')

        cy.visit('/')

        cy.wait('@buscaInicialMockVazia')
      })

      it('shows no story when none is returned', () => {
        cy.get('.item').should('not.exist')
      })

      it('types and hits ENTER', () => {
        cy.get('#search')
          .should('be.visible')
          .clear()
          .type(`${newTerm}{enter}`)

        cy.wait('@busca')

        cy.getLocalStorage('search')
          .should('be.equal', newTerm)

        cy.get('.item').should('have.length', 1)
        cy.get('.item')
          .first()
          .should('be.visible')
          .and('contain', newTerm)
        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })

      it('types and clicks the submit button', () => {
        cy.get('#search')
          .should('be.visible')
          .clear()
          .type(newTerm)

        cy.contains('Submit')
          .should('be.visible')
          .click()

        cy.wait('@busca')

        cy.getLocalStorage('search')
          .should('be.equal', newTerm)

        cy.get('.item').should('have.length', 1)
        cy.get('.item')
          .first()
          .should('be.visible')
          .and('contain', newTerm)
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
              .should('be.visible')
              .clear()
              .type(`${random}{enter}`)

            cy.wait('@buscaRandom')

            cy.getLocalStorage('search')
              .should('be.equal', random)
          })

          cy.get('.last-searches')
            .within(() => {
              cy.get('button').should('have.length', 5)
            })

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
        .should('be.visible')
        .and('contain', newTerm)
      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
    }) */
