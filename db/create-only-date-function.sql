drop function if exists last_n_days;

create function last_n_days(n int)
returns SETOF date as $$
    select dt::date from generate_series(current_date - ((n -1) || ' days')::INTERVAL, current_date, interval '1 days') dt
$$ language sql;
