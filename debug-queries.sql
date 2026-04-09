-- SELECT table_name,table_owner from information_schema.tables WHERE table_type = 'VIEW' AND table_schema = 'public';

-- SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name='clicks';

-- select * from clicks limit 10

-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO test

-- CREATE VIEW hurzl AS 
--         SELECT group_name, site_name, user_id as user, instant as timestamp
--             FROM page INNER JOIN pagehit ON page.id = pagehit.page_id;

-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO test

REVOKE SELECT ON pg_stat_statements FROM test

