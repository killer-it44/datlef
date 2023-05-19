create table if not exists "click" (
   id serial not null,
   source_uri varchar(2048) not null,
   target_uri varchar(2048) not null,
   user_id bigint not null,
   instant timestamp not null
);
