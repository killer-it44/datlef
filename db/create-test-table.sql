CREATE TABLE IF NOT EXISTS "analytics" (
   "sourceUri" VARCHAR(2048) NOT NULL,
   "targetUri" VARCHAR(2048) NOT NULL,
   "userId" BIGINT NOT NULL,
   "instant" TIMESTAMP NOT NULL
);
