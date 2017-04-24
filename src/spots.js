import knex from '~/knex';
import fs from 'fs';
import getImageSize from 'probe-image-size';
import _ from 'lodash';
import moment from 'moment';

export async function getSpot (id) {
  var query = knex('spots').where('spots.id', id).first();
  const result = await query;
  console.info(result.id);
  const schools = await knex('schools')
    .select('schools.id', 'schools.name', 'schools.logo')
    .innerJoin('spots_schools', 'schools.id', 'spots_schools.school_id')
    .where('spots_schools.spot_id', result.id);
  const photos = await knex('posts')
    .where('owner_id', result.id)
    .where('owner_type', 'spots')
    .whereRaw('posts.image_filename is not null')
    .pluck('image_filename');
  const users = await knex('users')
    .select('users.id', 'users.name', 'users.logo')
    .innerJoin('users_spots', 'users_spots.user_id', 'users.id')
    .where('users_spots.spot_id', result.id)
    .orderBy('users.rating', 'desc');

  return {
    ...result,
    lat: +result.lat,
    lng: +result.lng,
    schools: schools,
    photos: photos,
    users: users,
  };
}

export async function getSpotGallery (id) {
  const spotInfo = await knex('spots').where('spots.id', id).select('spots.id', 'spots.name').first();
  const photos = await knex('posts')
    .where('owner_id', id)
    .where('owner_type', 'spots')
    .whereRaw('posts.image_filename is not null')
    .select('image_filename', 'date');
  const photosWithSize = await Promise.mapSeries(photos, async function (photo) {
    const dir = photo.image_filename.substring(0, 2);
    const filename = photo.image_filename.substring(2);
    const path = `usercontent/${dir}/${filename}`;
    const fileStream = fs.createReadStream(path);
    const size = await getImageSize(fileStream);
    fileStream.destroy();
    return {
      width: size.width,
      height: size.height,
      photo: photo.image_filename,
      date: photo.date,
    };
  });
  const groupedPhotos = _.groupBy(photosWithSize, function (photo) {
    return moment(photo.date).month();
  });
  return {
    id: spotInfo.id,
    name: spotInfo.name,
    photos: groupedPhotos,
  };
}

