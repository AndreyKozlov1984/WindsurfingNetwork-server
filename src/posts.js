import knex from '~/knex';

function queryPosts () {
  const commentsQuery = knex('comments')
    .innerJoin('users as comments_users', 'comments_users.id', 'comments.user_id')
    .orderBy('comments.date', 'desc')
    .select(
      knex.raw(
        `
      comments.id,
      comments.content,
      comments.date,
      comments_users.name as name,
      comments.user_id,
      comments_users.logo
      `,
      ),
    )
    .whereRaw('comments.post_id = posts.id');

  return knex('posts')
    .leftJoin('users', 'users.id', 'posts.user_id')
    .leftJoin('schools', 'schools.id', 'posts.school_id')
    .orderBy('posts.date', 'desc')
    .select(
      'posts.content',
      'posts.date',
      knex.raw('coalesce(users.name, schools.name) as name'),
      knex.raw('coalesce(users.logo, schools.logo) as logo'),
      knex.raw('coalesce(users.id, schools.id) as author_id'),
      'posts.image_filename as image_filename',
      knex.raw(
        ` (select json_agg(comments) from (${commentsQuery})  as comments)
          as comments `,
      ),
    );
}
export async function getPosts () {
  // build request;
  const data = await queryPosts();
  return data.map(function (record) {
    return {
      ...record,
    };
  });
}

export async function getPost (id) {
  var query = queryPosts().where('posts.id', id).first();
  const result = await query;
  return result;
}

