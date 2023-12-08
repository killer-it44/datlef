'use strict'

const [user] = process.env.READONLY_DB_USER.split(':')

exports.up = async function (db) {
    await db.runSql(`GRANT SELECT ON ALL TABLES IN SCHEMA public TO ${user}`)
    await db.runSql(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ${user}`)
}

exports.down = async function (db) {
}
