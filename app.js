import express from 'express'
import pg from 'pg'
import * as csv from 'csv'
import QueryStream from 'pg-query-stream'
import JSONStream from 'JSONStream'

class App {
    run(config) {
        const pool = new pg.Pool({ connectionString: config.dbConnectionString })
        const app = express()

        app.use(express.static('web-content'))

        app.get('/api/query.:type', async (req, res, next) => {
            pool.connect((err, client, done) => {
                if (err) next(err)
                const query = new QueryStream(req.query.sql)
                const stream = client.query(query).on('end', done).on('error', error => {
                    done()
                    next(error)
                })

                if (req.params.type === 'csv') {
                    res.type('text/csv')
                    stream.pipe(csv.stringify({ header: true, cast: { date: v => v.toISOString() } })).pipe(res)
                } else if (req.params.type === 'json') {
                    res.type('application/json')
                    stream.pipe(JSONStream.stringify()).pipe(res)
                } else {
                    done()
                    next(new Error('Unsupported format. Supported formats: csv, json'))
                }
            })
        })

        app.use((err, req, res, next) => {
            // See ExpressJS documentation, if headers are already sent, we should leave it to Express default handler
            if (res.headersSent) {
                return next(err)
            }
            console.error(err)
            res.status(500).type('text/plain').send(`Error:\n${err.message}\n${err.hint || ''}`)
        })

        const server = app.listen(config.httpServerPort)
        console.log(`Server started on port ${server.address().port}`)
    }
}

export default App
