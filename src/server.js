import Koa from 'koa';
import Router from 'koa-router';
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';
import fsp from 'fs-promise';
import asyncBusboy from 'async-busboy';

import { getDashboardContent, getLookupData } from '~/dashboard';
import { getPosts, getPost } from '~/posts';
import { getSpot, getSpotForm, getSpotGallery, getSpotUsers, getSpotSchools, saveSpot } from '~/spots';
import { fileMD5 } from './utils';
import streamToPromise from 'stream-to-promise';

const app = new Koa();
const router = new Router({
  prefix: '/api/dashboard',
});
router.post('/', async function (ctx) {
  console.info(ctx.request.headers);
  console.info('yeah?');
  ctx.body = await getDashboardContent(ctx.request.body);
});
router.get('/init', async function (ctx) {
  ctx.body = await getLookupData();
});

const secondRouter = new Router({
  prefix: '/api/usercontent',
});
secondRouter.get('/:id', async function (ctx) {
  console.info(ctx.params);
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
  const md5 = await fileMD5(content);

  ctx.body = { success: true, id: md5 };
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
spotsRouter.get('/:id', async function (ctx) {
  ctx.body = await getSpot(ctx.params.id);
});
spotsRouter.post('/:id', async function (ctx) {
  ctx.body = await saveSpot(ctx.params.id, ctx.request.body);
});
spotsRouter.get('/:id/edit', async function (ctx) {
  ctx.body = await getSpotForm(ctx.params.id);
});
spotsRouter.get('/:id/gallery', async function (ctx) {
  ctx.body = await getSpotGallery(ctx.params.id);
});
spotsRouter.get('/:id/users', async function (ctx) {
  ctx.body = await getSpotUsers(ctx.params.id);
});
spotsRouter.get('/:id/schools', async function (ctx) {
  ctx.body = await getSpotSchools(ctx.params.id);
});
// response
app.use(json());
app.use(bodyParser());
app.use(router.routes(), router.allowedMethods());
app.use(secondRouter.routes(), secondRouter.allowedMethods());
app.use(postsRouter.routes(), postsRouter.allowedMethods());
app.use(spotsRouter.routes(), spotsRouter.allowedMethods());
app.use(uploadRouter.routes(), uploadRouter.allowedMethods());

app.listen(3001);

