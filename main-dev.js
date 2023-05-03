import App from './app.js'

new App().run({ httpServerPort: 3000, db: { connectionString: 'postgres://postgres@localhost/postgres' } })
