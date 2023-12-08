'use strict'

const [user] = process.env.READONLY_DB_USER.split(':')

exports.up = async function (db) {
    await db.runSql(`REVOKE SELECT ON pg_stat_statements FROM ${user}`)
    await db.runSql(`REVOKE SELECT ON databasechangeloglock FROM ${user}`)
    await db.runSql(`REVOKE SELECT ON databasechangelog FROM ${user}`)
    await db.runSql(`REVOKE SELECT ON migrations FROM ${user}`)
}

exports.down = async function () {
}
