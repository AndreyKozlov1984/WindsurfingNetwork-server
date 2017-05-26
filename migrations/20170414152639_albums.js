exports.up = async function (knex) {
  await knex.schema.createTable('albums', function (table) {
    table.increments('id').primary();
    table.string('name').index();
    table.integer('user_id').index();
    table.integer('spot_id').index();
  });

  await knex.schema.createTable('photos', function (table) {
    table.increments('id').primary();
    table.string('filename');
    table.string('owner_id').index();
    table.string('owner_type').index();
    table.date('created_at').index();
    table.integer('width');
    table.integer('height');
    table.integer('month').index();
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable('albums');
  await knex.schema.dropTable('photos');
};

