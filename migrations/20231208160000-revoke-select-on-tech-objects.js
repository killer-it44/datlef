'use strict'

const [user] = process.env.READONLY_DB_USER.split(':')

async function revokeSelectIfExists(db, object) {
    const result = await db.runSql(`SELECT * FROM pg_catalog.pg_tables WHERE tablename='${object}'`)
    if (result.rows.length > 0) {
        await db.runSql(`REVOKE SELECT ON ${object} FROM ${user}`)
    }
}

exports.up = async function (db) {
    await revokeSelectIfExists(db, 'pg_stat_statements')
    await revokeSelectIfExists(db, 'databasechangeloglock')
    await revokeSelectIfExists(db, 'databasechangelog')
    await revokeSelectIfExists(db, 'migrations')
}

exports.down = async function () {
}
