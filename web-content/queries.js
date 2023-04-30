const queries = [
    {
        'name': 'clicks by target page',
        'sql': `SELECT 
    "targetUri" AS page,
    count(*) AS clicks 
FROM analytics 
    GROUP BY page`
    },
    {
        'name': 'total clicks per week',
        'sql': `SELECT 
    concat(
        date_part('year', instant::date), 
        date_part('week', instant::date)
    ) AS week,
    count(*) AS clicks 
FROM analytics
    GROUP BY week
    ORDER BY week`
    },
    {
        'name': 'unique clicks per week',
        'sql': `SELECT 
    concat(
        date_part('year', instant::date), 
        date_part('week', instant::date)
    ) AS week,
    count(DISTINCT "userId") AS clicks 
FROM analytics
    GROUP BY week
    ORDER BY week`
    },
    {
        'name': 'clicks per day, last 7',
        'sql': `SELECT date, sum(clicks) AS clicks FROM (
    SELECT 
        instant::date AS date,
        count(*) AS clicks
    FROM analytics
    WHERE instant > current_date - interval '7' day
    GROUP BY date 
UNION
    SELECT dt::date AS date, 0 AS clicks FROM last_n_days(7) dt
) a GROUP BY a.date ORDER BY a.date ASC`
    }
]
