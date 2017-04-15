import Koa from 'koa';
import Router from 'koa-router';
import json from 'koa-json';
import bodyParser from 'koa-bodyParser';

import { getDashboardContent, getLookupData } from '~/dashboard';

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

// response
app.use(json());
app.use(bodyParser());
app.use(router.routes(), router.allowedMethods());

app.listen(3001);

