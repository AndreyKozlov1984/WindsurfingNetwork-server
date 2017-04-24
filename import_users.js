// import users, fotoalbums
// import all users, then import ther albums

import fs from 'fs';
import process from 'process';
import { fileMD5, lookupId, insert } from './import_utils';
const fileName = process.env.USERS || '../scraper/users.json';
const data = JSON.parse(fs.readFileSync(fileName));

function gender (str) {
  return {
    Мужской: 'male',
    Женский: 'female',
  }[str];
}

(async function () {
  for (let userRecord of data) {
    if (!userRecord.photo) {
      continue;
    }

    const dbEntry = {
      original_id: +userRecord.id,
      rating: +userRecord.rating.match(/\d+/)[0],
      name: userRecord.name,
      country: userRecord.country,
      city: userRecord.city,
      gender: gender(userRecord.gender),
      birth_date: userRecord.date,
      logo: await fileMD5(userRecord.photo),
      experience: userRecord.experience,
    };
    const userId = await insert('users', dbEntry);
    await Promise.mapSeries(userRecord.albums, async function (albumRecord) {
      const spotId = await lookupId('spots', albumRecord.spot_id);
      const albumRecordDbEntry = {
        name: albumRecord.name,
        user_id: userId,
        spot_id: spotId,
      };
      const albumId = await insert('albums', albumRecordDbEntry);
      console.info('album: ', albumId);
      await Promise.mapSeries(albumRecord.images, async function (imageRecord) {
        const imageRecordDbEntry = {
          created_at: imageRecord.date,
          filename: await fileMD5(imageRecord.filename),
          owner_id: albumId,
          owner_type: 'albums',
        };
        await insert('photos', imageRecordDbEntry);
      });
    });
  }
})()
  .then(process.exit)
  .catch(function (e) {
    console.info(e);
  });

