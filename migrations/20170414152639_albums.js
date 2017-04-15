exports.up = async function (knex) {
  await knex.schema.createTable('albums', function (table) {
    table.increments('id').primary();
    table.string('name');
    table.integer('user_id');
    table.integer('spot_id');
  });

  await knex.schema.createTable('photos', function (table) {
    table.increments('id').primary();
    table.string('filename');
    table.string('owner_id');
    table.string('owner_type');
    table.date('created_at');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable('albums');
  await knex.schema.dropTable('photos');
};

