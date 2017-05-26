import { insert } from './import_utils';
import knex from '~/knex';

(async function () {
  await knex('users').where('email', 'admin@example.com').del();
  await insert('users', {
    rating: 100,
    name: 'Admin',
    country: null,
    email: 'admin@example.com',
    password: 'realadmin',
    role: 'admin',
  });
})()
  .then(process.exit)
  .catch(function (e) {
    console.info(e);
  });

