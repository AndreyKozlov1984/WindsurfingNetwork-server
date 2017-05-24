exports.up = async function (knex) {
  await knex.schema.alterTable('users', function (t) {
    t.string('email');
    t.string('password');
    t.string('role');
  });
};
exports.down = async function (knex) {
  await knex.schema.alterTable('users', function (t) {
    t.dropColumn('email');
    t.dropColumn('password');
    t.dropColumn('role');
  });
};

