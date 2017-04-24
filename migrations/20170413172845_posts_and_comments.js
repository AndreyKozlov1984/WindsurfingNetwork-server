exports.up = async function (knex) {
  await knex.schema.createTable('posts', function (table) {
    table.increments('id').primary();
    table.integer('owner_id');
    table.string('owner_type');
    table.integer('user_id');
    table.integer('school_id');
    table.text('content');
    table.datetime('date');
    table.string('wind_direction');
    table.integer('wind_force');
    table.integer('wind_gust');
    table.decimal('lat');
    table.decimal('lng');
    table.string('image_filename');
  });
  await knex.schema.createTable('comments', function (table) {
    table.increments('id').primary();
    table.integer('user_id');
    table.text('content');
    table.datetime('date');
    table.integer('post_id');
  });
  await knex.schema.createTable('schools', function (table) {
    table.increments('id').primary();
    table.integer('original_id');
    table.text('description');
    table.string('name');
    table.string('logo');
    table.string('website');
    table.string('contacts');
    table.bool('ensurance');
    table.string('certificate');
    table.jsonb('availability');
  });
  await knex.schema.createTable('users', function (table) {
    table.increments('id').primary();
    table.integer('original_id');
    table.string('logo');
    table.date('birth_date');
    table.integer('rating');
    table.string('name');
    table.enu('gender', ['male', 'female']);
    table.string('country');
    table.string('city');
    table.jsonb('experience');
    table.jsonb('items');
  });
  await knex.schema.createTable('users_schools', function (table) {
    table.integer('user_id');
    table.integer('school_id');
    table.bool('is_owner');
  });
  await knex.schema.createTable('spots_schools', function (table) {
    table.integer('spot_id');
    table.integer('school_id');
  });
  await knex.schema.createTable('users_spots', function (table) {
    table.integer('user_id');
    table.integer('spot_id');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable('posts');
  await knex.schema.dropTable('comments');
  await knex.schema.dropTable('schools');
  await knex.schema.dropTable('users');
  await knex.schema.dropTable('users_schools');
  await knex.schema.dropTable('spots_schools');
  await knex.schema.dropTable('users_spots');
};

