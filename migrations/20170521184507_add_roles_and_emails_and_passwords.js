exports.up = async function (knex) {
  await knex.schema.alterTable('users', function (t) {
    t.string('email').index();
    t.string('password');
    t.string('role').index();
  });
};
exports.down = async function (knex) {
  await knex.schema.alterTable('users', function (t) {
    t.dropColumn('email');
    t.dropColumn('password');
    t.dropColumn('role');
  });
};

