exports.up = async function (knex) {
  await knex.schema.createTable('posts', function (table) {
    table.increments('id').primary();
    table.integer('owner_id').index();
    table.string('owner_type').index();
    table.integer('user_id').index();
    table.integer('school_id').index();
    table.text('content');
    table.datetime('date').index();
    table.string('wind_direction').index();
    table.integer('wind_force').index();
    table.integer('wind_gust').index();
    table.float('lat').index();
    table.float('lng').index();
    table.string('image_filename');
  });
  await knex.schema.createTable('comments', function (table) {
    table.increments('id').primary();
    table.integer('user_id').index();
    table.text('content');
    table.datetime('date').index();
    table.integer('post_id').index();
  });
  await knex.schema.createTable('schools', function (table) {
    table.increments('id').primary();
    table.integer('original_id').index();
    table.text('description');
    table.string('name').index();
    table.string('logo');
    table.string('website');
    table.string('contacts');
    table.bool('ensurance').index();
    table.string('certificate').index();
    table.jsonb('availability');
  });
  await knex.schema.createTable('users', function (table) {
    table.increments('id').primary();
    table.integer('original_id');
    table.string('logo');
    table.date('birth_date');
    table.integer('rating');
    table.string('name').index();
    table.enu('gender', ['male', 'female']).index();
    table.string('country').index();
    table.string('city');
    table.jsonb('experience');
    table.jsonb('items');
  });
  await knex.schema.createTable('users_schools', function (table) {
    table.integer('user_id').index();
    table.integer('school_id').index();
    table.bool('is_owner').index();
  });
  await knex.schema.createTable('spots_schools', function (table) {
    table.integer('spot_id').index();
    table.integer('school_id').index();
  });
  await knex.schema.createTable('users_spots', function (table) {
    table.integer('user_id').index();
    table.integer('spot_id').index();
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

