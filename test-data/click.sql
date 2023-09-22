create table click (
   id serial not null primary key,
   source_uri varchar(2048) not null,
   target_uri varchar(2048) not null,
   user_id bigint not null,
   instant timestamp not null
);
