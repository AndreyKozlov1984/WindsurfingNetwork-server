import fs from 'fs';
import fsp from 'fs-promise';
import process from 'process';
import getImageSize from 'probe-image-size';
import { hashPath } from './src/utils';
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
      if (postRecordDbEntry.image_filename) {
        // get size
        // get month
        // insert into photos
        const content = await fsp.readFile(hashPath(postRecordDbEntry.image_filename));
        const month = new Date(messageRecord.date).getMonth();
        const size = getImageSize.sync(content);
        await insert('photos', {
          owner_id: spotId,
          owner_type: 'spots',
          width: size.width,
          height: size.height,
          month: month,
          created_at: messageRecord.date,
          filename: postRecordDbEntry.image_filename,
        });
      }
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

