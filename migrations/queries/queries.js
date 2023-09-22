'use strict'

module.exports = [
    {
        name: 'total page views per group',
        owner: 'default',
        sql: `SELECT
    p.group_name as page,
    count(*) AS views
FROM pagehit JOIN page p ON page_id = p.id
    GROUP BY page`
    },
    {
        name: 'page viewers per group',
        owner: 'default',
        sql: `SELECT
    p.group_name as page,
    count(distinct user_id) AS views
FROM pagehit JOIN page p ON page_id = p.id
    GROUP BY page`
    },
    {
        name: 'clicks by target page',
        owner: 'default',
        sql: `SELECT
    target_uri AS page,
    count(*) AS clicks
FROM click
    GROUP BY page`
    },
    {
        name: 'total clicks per week',
        owner: 'default',
        sql: `SELECT
    concat(
        date_part('year', instant::date),
        date_part('week', instant::date)
    ) AS week,
    count(*) AS clicks
FROM click
    GROUP BY week
    ORDER BY week`
    },
    {
        name: 'unique clicks per week',
        owner: 'default',
        sql: `SELECT
    concat(
        date_part('year', instant::date),
        date_part('week', instant::date)
    ) AS week,
    count(DISTINCT user_id) AS clicks
FROM click
    GROUP BY week
    ORDER BY week`
    },
    {
        name: 'clicks per day, last 7',
        owner: 'default',
        sql: `SELECT date, sum(clicks) AS clicks FROM (
    SELECT
        instant::date AS date,
        count(*) AS clicks
    FROM click
    WHERE instant > current_date - interval '7' day
    GROUP BY date
UNION
    SELECT dt::date AS date, 0 AS clicks FROM last_n_days(7) dt
) a GROUP BY a.date ORDER BY a.date ASC`
    }
]
