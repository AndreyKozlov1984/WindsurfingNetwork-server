// Import all spots from the scraper
import fs from 'fs';
import process from 'process';
import { lookupId } from './import_utils';
import knex from '~/knex';
const fileName = process.env.SPOTS || '../scraper/spots.json';
const data = JSON.parse(fs.readFileSync(fileName));

(async function () {
  await Promise.mapSeries(data, async function (spotRecord) {
    if (!spotRecord.lat) {
      return;
    }
    if (!+spotRecord.lat) {
      return;
    }
    await Promise.mapSeries(spotRecord.users, async function (userOriginalId) {
      const userId = await lookupId('users', userOriginalId);
      const spotId = await lookupId('spots', spotRecord.id);
      await knex('users_spots').insert({
        user_id: userId,
        spot_id: spotId,
      });
    });
  });
})().then(process.exit);

