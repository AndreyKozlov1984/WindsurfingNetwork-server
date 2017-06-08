import Koa from 'koa';
import Router from 'koa-router';
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';
import fsp from 'fs-promise';
import asyncBusboy from 'async-busboy';
import getImageSize from 'probe-image-size';
import { sign } from 'jsonwebtoken';

import { getDashboardContent, getLookupData } from '~/dashboard';
import { getPosts, getPost } from '~/posts';
import {
  rotate,
  getSpot,
  getSpotForm,
  getSpotGallery,
  getSpotUsers,
  getSpotUsersPage,
  getSpotSchools,
  saveSpot,
} from '~/spots';
import { fileMD5, resize, getCreatedDate } from './utils';
import { login, loadUser, extractToken, isAdmin } from './auth';
import streamToPromise from 'stream-to-promise';

const app = new Koa();
const router = new Router({
  prefix: '/api/dashboard',
});
router.post('/', async function (ctx) {
  ctx.body = await getDashboardContent(ctx.request.body);
});
router.get('/init', async function (ctx) {
  ctx.body = await getLookupData();
});

const loginRouter = new Router({
  prefix: '/api/auth',
});
loginRouter.delete('/sign_out', function (ctx) {
  ctx.body = { success: true };
});
loginRouter.post('/sign_in', async function (ctx) {
  const result = await login({ email: ctx.request.body.email, password: ctx.request.body.password });
  if (result.success) {
    ctx.body = {
      data: {
        uid: result.user.email,
        provider: 'email',
        email: result.user.email,
        role: result.user.role,
      },
    };
    ctx.set({
      'access-token': sign(result.user.id, 'secret'),
      client: Math.random(),
      uid: result.user.email,
      expiry: new Date().getTime() + 60 * 1000 * 60, //1 hour ?
    });
  } else {
    ctx.body = { errors: ['Invalid email or password'] };
    ctx.status = 401;
  }
});
loginRouter.get('/validate_token', function (ctx) {
  const user = ctx.state.user;
  if (user) {
    ctx.body = {
      data: {
        uid: user.email,
        provider: 'email',
        email: user.email,
        role: user.role,
      },
    };
    ctx.set({
      'access-token': sign(user.id, 'secret'),
      client: Math.random(),
      uid: user.email,
      expiry: new Date().getTime() + 60 * 1000 * 60, //1 hour ?
    });
  }
});

const secondRouter = new Router({
  prefix: '/api/usercontent',
});
secondRouter.get('/:id', async function (ctx) {
  const dir = ctx.params.id.substring(0, 2);
  const filename = ctx.params.id.substring(2);
  ctx.body = await fsp.readFile(`usercontent/${dir}/${filename}`);
  ctx.type = 'image/jpeg';
});

const uploadRouter = new Router({
  prefix: '/api/upload',
});
uploadRouter.post('/', async function (ctx) {
  const { files } = await asyncBusboy(ctx.req);
  const fileStream = files[0];
  const content = await streamToPromise(fileStream);
  const resizedContent = await resize(content, 128, 128);
  const md5 = await fileMD5(resizedContent);

  ctx.body = { success: true, id: md5 };
});

uploadRouter.post('/photo', async function (ctx) {
  const { files } = await asyncBusboy(ctx.req);
  const fileStream = files[0];
  const content = await streamToPromise(fileStream);
  const md5 = await fileMD5(content);
  const size = getImageSize.sync(content);
  const date = (await getCreatedDate(content)) || new Date();
  const month = date.getMonth();

  ctx.body = {
    success: true,
    record: { filename: md5, width: size.width, height: size.height, created_at: date, month: month },
  };
});

const postsRouter = new Router({
  prefix: '/api/posts',
});
postsRouter.get('/', async function (ctx) {
  ctx.body = await getPosts();
});
postsRouter.get('/:id', async function (ctx) {
  ctx.body = await getPost(ctx.params.id);
});

const spotsRouter = new Router({
  prefix: '/api/spots',
});
spotsRouter.get('/rotate/:direction/:filename', async function (ctx) {
  ctx.body = await rotate(ctx.params.direction, ctx.params.filename);
});
spotsRouter.get('/:id', async function (ctx) {
  ctx.body = await getSpot(ctx.params.id);
});
spotsRouter.post('/:id', isAdmin(), async function (ctx) {
  ctx.body = await saveSpot(ctx.params.id, ctx.request.body);
});
spotsRouter.get('/:id/edit', isAdmin(), async function (ctx) {
  ctx.body = await getSpotForm(ctx.params.id);
});
spotsRouter.get('/:id/gallery', async function (ctx) {
  ctx.body = await getSpotGallery(ctx.params.id);
});
spotsRouter.get('/:id/users/page', async function (ctx) {
  ctx.body = await getSpotUsersPage(
    ctx.params.id,
    ctx.request.query.search,
    ctx.request.query.offset,
    ctx.request.query.limit,
  );
});
spotsRouter.get('/:id/users', async function (ctx) {
  ctx.body = await getSpotUsers(ctx.params.id, ctx.request.query.search);
});
spotsRouter.get('/:id/schools', async function (ctx) {
  ctx.body = await getSpotSchools(ctx.params.id);
});
// response
app.use(extractToken());
app.use(loadUser());
app.use(json());
app.use(bodyParser());
app.use(router.routes(), router.allowedMethods());
app.use(loginRouter.routes(), loginRouter.allowedMethods());
app.use(secondRouter.routes(), secondRouter.allowedMethods());
app.use(postsRouter.routes(), postsRouter.allowedMethods());
app.use(spotsRouter.routes(), spotsRouter.allowedMethods());
app.use(uploadRouter.routes(), uploadRouter.allowedMethods());

app.listen(3001);

