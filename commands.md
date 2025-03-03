### start docker compose with postgres & pgAdmin4

`docker compose up -d`

### stop docker compose and kills containers and volumes

`docker compose down -v`

### run sql file in postgres

`psql -h localhost -p 5432 -U fit -d fit -f ./db/schema.sql`

### run sql file in postgres deployed in docker

`docker cp ./db/schema.sql id:/tmp/schema.sql`
`docker exec -it id bash -c "PGPASSWORD=db psql -U db -d db -f/tmp/schema.sql"`
