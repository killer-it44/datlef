create table pagehit (
    id serial not null primary key,
    page_id	serial not null,
    user_id	serial not null,
    instant	timestamp without time zone not	null
);
