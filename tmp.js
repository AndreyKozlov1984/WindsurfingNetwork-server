import knex from '~/knex';

knex('posts')
  .select(
    'posts.id',
    knex.raw(` (select json_agg(comments) from comments where comments.post_id = posts.id) as comments `),
  )
  .orderBy('posts.id')
  .then(function (a) {
    console.info(a[126].comments[0]);
  });

