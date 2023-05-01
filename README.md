# Datlev

Your best friend for data crunching.

## Quickstart

To setup:
1. `npm ci` to install the required libs
1. `npm run dev-db:start` to start a local test db
1. `npm run dev-db:init` to populate the local test db with some data
1. `npm start`
1. Open browser at http://localhost:3000

## Approach

The design goal of Datlev is that users get the most flexible and performant approach, so that they will _never_ be blocked by limited functionality or poor performance. At the same time, it should still be simple to use.

To achieve maximum flexibility and performance, users use SQL directly on the frontend, which Datlev supplies the query directly and unmodified to the server for immediate execution.

To keep it simple, named template queries are available from a dropdown. Datlev allows the user to freely modify the template queries through a details menu, before sending them.

## API

### HTTP API

The UI is generic just sends SQL queries to an endpoint `/api/query.[type]?[sql]`, where `type` is either `json` (for rendering the chart) or `csv` (if the user wants to download the result).

### SQL Contract

Any SQL is supported by the UI, as long as the result adheres to the following structure and semantics:
- The first result column will be interpreted as the category column / x-axis, it can be textual or numeric
- The second result column will be interpreted as the values column / y-axis, it must be numeric
- (Future: ideally we will later support multiple value columns that can be visualized as stacked bar charts, bubble charts, ...)

### Examples

#### Clicks Per Page

```sql
SELECT 
    "targetUri" AS "page",
    count(*) AS "clicks" 
FROM "analytics" 
    GROUP BY "page"
```

The first colum "page" will be considered for the x axis, and the second column "clicks" will be considered as the y axis.

#### Unique Clicks Per Week

```sql
SELECT 
    concat(
        date_part('year', "timestamp"::date), 
        date_part('week', "timestamp"::date)
    ) AS "week",
    count(DISTINCT "userId") AS "clicks" 
FROM "analytics"
    GROUP BY "week"
    ORDER BY "week"
```

The first colum "week" will be considered for the x axis, and the second column "clicks" will be considered as the y axis.
