import knex from './knex';
import jwt from 'koa-jwt';
export async function login ({ email, password }) {
  const user = await knex('users')
    .select('id', 'role', 'email', 'name')
    .where({ email: email, password: password })
    .first();
  if (!user) {
    return { success: false };
  } else {
    return {
      success: true,
      user: user,
    };
  }
}

export function extractToken () {
  return jwt({ secret: 'secret', passthrough: true });
}

export function loadUser () {
  return async function (ctx, next) {
    if (ctx.state.user) {
      ctx.state.user = await knex('users').where('id', ctx.state.user).select('id', 'role', 'email', 'name').first();
    }
    await next();
  };
}

export function isAdmin () {
  return async function (ctx, next) {
    if (!ctx.state.user) {
      ctx.throw(401, 'not authorized');
    }
    if (!ctx.state.user.role === 'admin') {
      ctx.throw(403, 'not allowed');
    }
    await next();
  };
}

