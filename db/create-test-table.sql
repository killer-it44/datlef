create table if not exists "analytics" (
   "sourceUri" varchar(2048) not null,
   "targetUri" varchar(2048) not null,
   "userId" bigint not null,
   "timestamp" timestamp not null
);
