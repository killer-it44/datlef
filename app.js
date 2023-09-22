import express from 'express'
import pg from 'pg'
import * as csv from 'csv'
import QueryStream from 'pg-query-stream'
import JSONStream from 'JSONStream'

class App {
    run(config) {
        const pool = new pg.Pool(config.db)
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

        app.get('/api/queries', express.json(), async (req, res, next) => {
            try {
                res.json((await pool.query('SELECT queryname, sql FROM datlef.queries ORDER BY queryname')).rows)
            } catch (e) {
                next(e)
            }
        })

        app.put('/api/queries/:queryname', express.json(), async (req, res, next) => {
            try {
                const result = await pool.query(`INSERT INTO datlef.queries (queryname, owner, sql) VALUES ($1, $2, $3)
                    ON CONFLICT (queryname) DO UPDATE
                        SET sql = $3 WHERE datlef.queries.queryname = $1 AND datlef.queries.owner = $2`,
                    [req.params.queryname, req.body.owner, req.body.sql])
                if (result.rowCount === 0) {
                    next(new Error('Query could not be saved. The name already exists, but the owner does not match.'))
                } else {
                    res.status(201).send('Query saved.')
                }
            } catch (error) {
                next(error)
            }
        })

        app.delete('/api/queries/:queryname', express.json(), async (req, res, next) => {
            try {
                const result = await pool.query(`DELETE FROM datlef.queries
                    WHERE datlef.queries.queryname = $1 AND datlef.queries.owner = $2`,
                    [req.params.queryname, req.body.owner])
                if (result.rowCount === 0) {
                    next(new Error('Query could not be deleted. Check if the owner and queryname are correct.'))
                } else {
                    res.status(200).send('Query deleted.')
                }
            } catch (error) {
                next(error)
            }
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
