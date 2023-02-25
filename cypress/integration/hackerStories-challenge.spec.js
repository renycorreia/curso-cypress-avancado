describe('Hacker Stories Challenge', () => {
  const newTerm = 'Cypress'

  beforeEach(() => {
    cy.visit('https://hackernews-seven.vercel.app/')

    cy.intercept(
      'GET'
      , '**/search?query=redux&page=0&hitsPerPage=100'
    ).as('paginaInicial')

    cy.wait('@paginaInicial')
  })

  it('correctly use requests in cache', () => {
    cy.get('.table-row')
      .should('be.visible')
      .and('have.length', 100)

    var aux = 0

    cy.intercept(`**/search?query=${newTerm}**`, () => {
      aux += 1
    }).as('buscaNovoTermo')

    for (let i = 0; i < 5; i++) {
      cy.get('input')
        .should('be.visible')
        .clear()
        .type(`${newTerm}{enter}`).then(() => {
          expect(aux, `network calls to fetch ${newTerm}`).to.equal(1)
        })

      if (i === 0) {
        cy.wait('@buscaNovoTermo')
      }
    }
  })
})
