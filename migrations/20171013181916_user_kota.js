exports.up = (knex, Promise) => {
  return Promise.all([
    knex.schema.createTable('user_kota', table => {
      table
        .string('username')
        .primary()
        .references('users.username')
        .onDelete('CASCADE');
      table
        .string('username_provinsi')
        .references('user_provinsi.username')
      table.string('nama').unique();
      table.string('kepala_dinas');
      table.string('alamat');
      table.timestamps();
    })
  ]);
};

exports.down = (knex, Promise) => {
  return Promise.all([knex.schema.dropTable('user_kota')]);
};
