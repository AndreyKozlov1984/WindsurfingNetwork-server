// import users, fotoalbums
// import all users, then import ther albums

import fs from 'fs';
import fsp from 'fs-promise';
import process from 'process';
import knex from '~/knex';
import mkdirp from 'mkdirp-promise';
import md5 from 'md5';
const fileName = process.env.USERS || '../scraper/users.json';
const data = JSON.parse(fs.readFileSync(fileName));

function gender (str) {
  return {
    Мужской: 'male',
    Женский: 'female',
  }[str];
}

async function fileMD5 (fileName) {
  const nameWithoutPath = fileName.replace(/^images\//, '');
  const name = `../scraper/images/${nameWithoutPath}`;
  // console.info(name);
  const content = await fsp.readFile(name, null);
  const hash = await md5(content);
  const firstPart = hash.substring(0, 2);
  const lastPart = hash.substring(2);
  await mkdirp(`usercontent/${firstPart}`);
  await fsp.copy(name, `usercontent/${firstPart}/${lastPart}`);
  return hash;
}

(async function () {
  for (let userRecord of data.slice(0, 10)) {
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
    };
    const userId = (await knex('users').insert(dbEntry).returning('id'))[0];
    console.info('user:', userId);
    await Promise.map(userRecord.albums, async function (albumRecord) {
      const albumRecordDbEntry = {
        name: albumRecord.name,
        user_id: userId,
        spot_id: await knex('spots').where({ original_id: albumRecord.spot_id }).first('id').id,
      };
      const albumId = (await knex('albums').insert(albumRecordDbEntry).returning('id'))[0];
      console.info('album: ', albumId);
      await Promise.map(albumRecord.images, async function (imageRecord) {
        const imageRecordDbEntry = {
          created_at: imageRecord.date,
          filename: await fileMD5(imageRecord.filename),
          owner_id: albumId,
          owner_type: 'albums',
        };
        await knex('photos').insert(imageRecordDbEntry);
      });
    });
  }
})().then(process.exit);

