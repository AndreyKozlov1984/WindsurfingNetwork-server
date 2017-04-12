exports.up = function(knex, Promise) {
    return knex.schema.createTable('items', function(table) {
        table.integer('id').primary();
        table.string('name');
    });
}

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('items');
};
