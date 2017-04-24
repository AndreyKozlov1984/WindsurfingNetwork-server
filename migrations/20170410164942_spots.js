exports.up = function (knex, Promise) {
  return knex.schema.createTable('spots', function (table) {
    table.increments('id').primary();
    table.integer('original_id');
    table.integer('rating');
    table.string('name');
    table.decimal('lat');
    table.decimal('lng');
    table.string('country');
    table.string('region');
    table.jsonb('monthly_distribution');
    table.jsonb('surface_stats');
    table.jsonb('surface_type');
    table.jsonb('beach_stats');
    table.jsonb('beach_type');
    table.jsonb('wind_stats');
    table.jsonb('wind_type');
    table.jsonb('convenience_stats');
    table.jsonb('convenience_type');
    table.jsonb('entrance_stats');
    table.jsonb('entrance_type');
    table.jsonb('benthal_stats');
    table.jsonb('benthal_type');
    table.jsonb('danger_stats');
    table.jsonb('danger_type');
    table.string('logo');
  });
};
exports.down = function (knex, Promise) {
  return knex.schema.dropTable('spots');
};

