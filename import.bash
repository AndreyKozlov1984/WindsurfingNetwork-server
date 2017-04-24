set -e
./node_modules/.bin/knex migrate:rollback
./node_modules/.bin/knex migrate:latest
babel-node import_spots.js
babel-node import_users.js
babel-node import_spot_messages.js
babel-node import_spot_users.js
babel-node import_schools.js
