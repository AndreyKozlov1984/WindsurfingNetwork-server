import fs from 'fs';
import process from 'process';
import { fileMD5, lookupId, insert } from './import_utils';
const fileName = process.env.USERS || '../scraper/spots.json';
const data = JSON.parse(fs.readFileSync(fileName));

(async function () {
  await Promise.mapSeries(data, async function (spotRecord) {
    const spotId = await lookupId('spots', spotRecord.id);
    if (!spotId) {
      return;
    }
    await Promise.mapSeries(spotRecord.messages.posts, async function (messageRecord) {
      console.info(messageRecord.filename);
      const postRecordDbEntry = {
        owner_type: 'spots',
        owner_id: spotId,
        user_id: await lookupId('users', messageRecord.user_id),
        content: messageRecord.content,
        date: messageRecord.date,
        wind_direction: messageRecord.wind_direction,
        wind_force: messageRecord.wind_force,
        wind_gust: messageRecord.wind_gust,
        lat: messageRecord.lat,
        lng: messageRecord.lng,
        image_filename: messageRecord.filename ? await fileMD5(messageRecord.filename) : null,
      };
      console.info(postRecordDbEntry);
      const postId = await insert('posts', postRecordDbEntry);
      await Promise.mapSeries(messageRecord.comments, async function (commentRecord) {
        const commentRecordDbEntry = {
          user_id: await lookupId('users', commentRecord.user_id),
          content: commentRecord.content,
          post_id: postId,
          date: commentRecord.date,
        };
        await insert('comments', commentRecordDbEntry);
      });
    });
  });
})().then(process.exit);

