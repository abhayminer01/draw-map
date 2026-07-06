/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .dropTableIfExists('maps')
    .then(() => {
      return knex.schema.createTable('users', function(table) {
        table.increments('id').primary();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
      });
    })
    .then(() => {
      return knex.schema.createTable('maps', function(table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable();
        table.foreign('user_id').references('users.id').onDelete('CASCADE');
        table.string('name').notNullable();
        table.text('canvas_data').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
      });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('maps')
    .then(() => knex.schema.dropTableIfExists('users'))
    .then(() => {
      return knex.schema.createTable('maps', function(table) {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.text('canvas_data').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
      });
    });
};
