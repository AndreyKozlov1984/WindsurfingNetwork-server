// Import all spots from the scraper
import fs from 'fs';
import process from 'process';
import { insert, lookupId, fileMD5 } from './import_utils';
import knex from '~/knex';
const fileName = process.env.SCHOOLS || '../scraper/schools.json';
const data = JSON.parse(fs.readFileSync(fileName));

(async function () {
  await Promise.mapSeries(data, async function (schoolRecord) {
    if (!schoolRecord.name) {
      return;
    }
    const dbEntry = {
      original_id: schoolRecord.id,
      name: schoolRecord.name,
      description: schoolRecord.description,
      logo: await fileMD5(schoolRecord.logo),
      website: schoolRecord.website,
      contacts: schoolRecord.contacts,
      ensurance: schoolRecord.ensurance === 'Есть',
      certificate: schoolRecord.certificate,
    };
    const schoolId = await insert('schools', dbEntry);
    await Promise.mapSeries(schoolRecord.owners, async function (ownerOriginalId) {
      const userId = await lookupId('users', ownerOriginalId);
      await knex('users_schools').insert({
        user_id: userId,
        school_id: schoolId,
        is_owner: true,
      });
    });
    await Promise.mapSeries(schoolRecord.users, async function (userOriginalId) {
      const userId = await lookupId('users', userOriginalId);
      await knex('users_schools').insert({
        user_id: userId,
        school_id: schoolId,
        is_owner: false,
      });
    });
    await Promise.mapSeries(schoolRecord.photos, async function (photoRecord) {
      await insert('photos', {
        filename: await fileMD5(photoRecord.filename),
        created_at: photoRecord.date,
        owner_type: 'schools',
        owner_id: schoolId,
      });
    });
    await Promise.mapSeries(schoolRecord.spots, async function (spotOriginalId) {
      const spotId = await lookupId('spots', spotOriginalId);
      await knex('spots_schools').insert({
        spot_id: spotId,
        school_id: schoolId,
      });
    });
    await Promise.mapSeries(schoolRecord.messages.posts, async function (messageRecord) {
      const postRecordDbEntry = {
        owner_type: 'schools',
        owner_id: schoolId,
        user_id: await lookupId('users', messageRecord.user_id),
        school_id: await lookupId('schools', messageRecord.school_id),
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

