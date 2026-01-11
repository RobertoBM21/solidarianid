describe('Register Admin User', () => {
  beforeEach(() => {
    cy.visit('/auth/register');

    /*
     * Disable HTML5 validation to test our custom validation messages.
     * Modern browsers may block form submission before our JS validation runs
     * if the built-in validation is not satisfied.
     * That feature prevents us from testing our custom validation messages.
     * So we disable it here.
     */
    cy.get('form').then(($form) => {
      $form.attr('novalidate', 'novalidate');
    });
  });

  it('should register a new admin user successfully', () => {
    cy.intercept('POST', '/auth/register', {
      statusCode: 200,
      body: { id: 'admin-123' },
    }).as('register');

    cy.get('input[name="name"]').type('Admin User');
    cy.get('input[name="email"]').type('testadmin@example.com');
    cy.get('input[name="password"]').type('AdminPassword123');
    cy.get('input[name="phone"]').type('+34 98765432');
    cy.get('button[type="submit"]').click();

    cy.wait('@register');
    // In the real app, after successful registration, it may redirect to /
    // But in register.js it redirects to /auth/login
    cy.location('pathname').should('eq', '/auth/login');
  });

  it('should show error when name is empty', () => {
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="phone"]').type('123456789');
    cy.get('button[type="submit"]').click();

    cy.get('#js-error-container').should('be.visible');
    cy.get('#js-error-message').should(
      'contain',
      'El nombre no puede estar vacío.',
    );
  });

  it('should show error when name contains numbers', () => {
    cy.get('input[name="name"]').type('Admin123');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="phone"]').type('123456789');
    cy.get('button[type="submit"]').click();

    cy.get('#js-error-container').should('be.visible');
    cy.get('#js-error-message').should(
      'contain',
      'El nombre solo puede contener letras y espacios',
    );
  });

  it('should show error when name contains special characters', () => {
    cy.get('input[name="name"]').type('Admin@User');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="phone"]').type('123456789');
    cy.get('button[type="submit"]').click();

    cy.get('#js-error-container').should('be.visible');
    cy.get('#js-error-message').should(
      'contain',
      'El nombre solo puede contener letras y espacios',
    );
  });

  it('should show error when email is empty', () => {
    cy.get('input[name="name"]').type('Admin User');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="phone"]').type('123456789');
    cy.get('button[type="submit"]').click();

    cy.get('#js-error-container').should('be.visible');
    cy.get('#js-error-message').should(
      'contain',
      'El correo electrónico es obligatorio.',
    );
  });

  it('should show error when email is invalid', () => {
    cy.get('input[name="name"]').type('Admin User');
    cy.get('input[name="email"]').type('notanemail');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="phone"]').type('123456789');
    cy.get('button[type="submit"]').click();

    cy.get('#js-error-container').should('be.visible');
    cy.get('#js-error-message').should(
      'contain',
      'Por favor, introduce un correo electrónico válido.',
    );
  });

  it('should show error when phone is empty', () => {
    cy.get('input[name="name"]').type('Admin User');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.get('#js-error-container').should('be.visible');
    cy.get('#js-error-message').should(
      'contain',
      'El teléfono es obligatorio.',
    );
  });

  it('should show error when password is empty', () => {
    cy.get('input[name="name"]').type('Admin User');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="phone"]').type('123456789');
    cy.get('button[type="submit"]').click();

    cy.get('#js-error-container').should('be.visible');
    cy.get('#js-error-message').should(
      'contain',
      'La contraseña es obligatoria.',
    );
  });

  it('should show server error when email already exists', () => {
    cy.intercept('POST', '/auth/register', {
      statusCode: 400,
      body: { message: 'El correo ya existe' },
    }).as('register');

    cy.get('input[name="name"]').type('Admin User');
    cy.get('input[name="email"]').type('existing@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="phone"]').type('123456789');
    cy.get('button[type="submit"]').click();

    cy.wait('@register');
    cy.get('#js-error-container').should('be.visible');
    cy.get('#js-error-message').should('contain', 'El correo ya existe');
    cy.get('button[type="submit"]').should('not.be.disabled');
  });

  it('should show generic error on server failure', () => {
    cy.intercept('POST', '/auth/register', {
      statusCode: 500,
      body: { message: 'Error del servidor' },
    }).as('register');

    cy.get('input[name="name"]').type('Admin User');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="phone"]').type('123456789');
    cy.get('button[type="submit"]').click();

    cy.wait('@register');
    cy.get('#js-error-container').should('be.visible');
    cy.get('#js-error-message').should('contain', 'Error del servidor');
    cy.get('button[type="submit"]').should('not.be.disabled');
  });

  it('should hide error when correcting invalid input and retrying', () => {
    cy.intercept('POST', '/auth/register', {
      statusCode: 200,
      body: { id: 'admin-456' },
    }).as('register');

    // First attempt with invalid email
    cy.get('input[name="name"]').type('Admin User');
    cy.get('input[name="email"]').type('invalidemail');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="phone"]').type('123456789');
    cy.get('button[type="submit"]').click();

    cy.get('#js-error-container').should('be.visible');
    cy.get('#js-error-message').should(
      'contain',
      'Por favor, introduce un correo electrónico válido.',
    );

    // Fix email and retry
    cy.get('input[name="email"]').clear().type('valid@example.com');
    cy.get('button[type="submit"]').click();

    cy.wait('@register');
    cy.location('pathname').should('eq', '/auth/login');
  });
});
