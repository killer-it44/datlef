import express from 'express'
import pg from 'pg'
import * as csv from 'csv'
import QueryStream from 'pg-query-stream'
import JSONStream from 'JSONStream'

class App {
    run(config) {
        const pool = new pg.Pool(config.db)
        const ai = config.ai
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

        app.post('/api/ai-assistant', express.json(), async (req, res, next) => {
            try {
                const authUrl = ai.credentials.uaa.url
                const clientId = ai.credentials.uaa.clientid
                const clientSecret = ai.credentials.uaa.clientsecret
                const authBody = {'client_id': clientId, 'grant_type': 'client_credentials'}
                const formBody = Object.keys(authBody).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(authBody[key])}`).join('&')
                const authResponse = await fetch(`${authUrl}/oauth/token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': `Basic ${btoa(clientId + ':' + clientSecret)}` },
                    body: formBody
                })
                
                const body = await authResponse.json()
                const response = await fetch(`${ai.url}/api/v1/completions?deployment_id=gpt-35-turbo`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${body.access_token}` },
                    body: JSON.stringify({ deployment_id: 'gpt-35-turbo', messages: [
                        {'role': 'system', 'content': `You are an assistant for an analytics app that uses SQL. The database is postgres. You are given a question and you need to provide a SQL query that answers the question. The table schema is as follows: ${req.body.schema}`}, 
                        // {'role': 'system', 'content': `You are an assistant for an analytics app that uses SQL. The database is postgres. You are given a question and you need to provide a SQL query that answers the question. The first column of your SQL should always be some kind of label, followed by one or more key figure columns to plot on the y-axis. The table schema is as follows: ${await getTableSchema()}`},
                        {'role': 'user', 'content': `${req.body.question}`}]
                    })
                })
                
                const result = await response.json()
                let message = ""
                result.choices.forEach(choice => message += choice.message.content)
                
                res.status(200).send(message)
            } catch (e) {
                next(e)
            }
        })

        app.get('/api/queries', express.json(), async (req, res, next) => {
            try {
                res.json((await pool.query('SELECT * FROM datlef.queries ORDER BY queryname')).rows)
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
