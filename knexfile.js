require('babel-register');
module.exports = {
  development: {
    // debug: true,
    client: 'postgres',
    connection: 'postgres://vagrant@localhost/main',
    pool: {
      max: 20,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
  production: {
    client: 'postgres',
    connection: 'postgres://vagrant@localhost/main',
    pool: {
      max: 20,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
  test: {
    client: 'postgres',
    connection: 'postgres://vagrant@localhost/main_test',
    pool: {
      max: 20,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
};

