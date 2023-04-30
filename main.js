import App from './app.js'

new App().run({ 
    httpServerPort: process.env.PORT || 3000, 
    dbConnectionString: process.env.DB_URL || 'postgres://postgres@localhost/postgres'
})
