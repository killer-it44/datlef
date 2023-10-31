'use strict'

exports.up = async function (db) {
    await db.runSql(`CREATE VIEW views AS 
        SELECT group_name, site_name, user_id as user, instant as timestamp
            FROM page INNER JOIN pagehit ON page.id = pagehit.page_id;
    `)
    await db.runSql(`CREATE VIEW clicks AS 
        SELECT user_id AS user, instant AS timestamp, source_uri AS source_uri, target_uri as target_uri FROM click;
    `)
}

exports.down = async function (db) {
    await db.runSql(`DROP VIEW views`)
    await db.runSql(`DROP VIEW clicks`)
}
