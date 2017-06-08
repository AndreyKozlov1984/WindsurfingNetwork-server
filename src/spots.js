import knex from '~/knex';
import _ from 'lodash';
import getImageSize from 'probe-image-size';
import { hashPath, fileMD5, rotateImage } from './utils';

export async function getSpot (id) {
  var query = knex('spots')
    .where('spots.id', id)
    .select(
      'id',
      'name',
      'lat',
      'lng',
      'logo',
      'name',
      'country',
      'region',
      'rating',
      'monthly_distribution',
      'surface_type',
      'beach_type',
      'wind_type',
      'convenience_type',
      'entrance_type',
      'benthal_type',
      'danger_type',
    )
    .first();
  const result = await query;
  console.info(result.id);
  const schools = await knex('schools')
    .select('schools.id', 'schools.name', 'schools.logo')
    .innerJoin('spots_schools', 'schools.id', 'spots_schools.school_id')
    .where('spots_schools.spot_id', result.id);
  const photos = await knex('photos').where('owner_id', result.id).where('owner_type', 'spots').pluck('filename');
  const users = await knex('users')
    .select('users.id', 'users.logo')
    .innerJoin('users_spots', 'users_spots.user_id', 'users.id')
    .where('users_spots.spot_id', result.id)
    .orderBy('users.rating', 'desc');

  return {
    ...result,
    schools: schools,
    photos: photos,
    users: users,
  };
}

export async function getSpotGallery (id) {
  const spotInfo = await knex('spots').where('spots.id', id).select('spots.id', 'spots.name').first();
  const photos = await knex('photos')
    .where('owner_id', id)
    .where('owner_type', 'spots')
    .select('filename', 'month', 'width', 'height');
  const groupedPhotos = _.groupBy(photos, function (photo) {
    return photo.month;
  });
  return {
    id: spotInfo.id,
    name: spotInfo.name,
    photos: groupedPhotos,
  };
}

function applySearch (search) {
  if (!search) {
    return knex.raw('1 = 1');
  } else {
    return function () {
      this.where('users.name', 'ilike', `%${search}%`);
    };
  }
}

export async function getSpotUsers (id, search) {
  const spotInfo = await knex('spots').where('spots.id', id).select('spots.id', 'spots.name').first();
  const usersCount = await knex('users')
    .innerJoin('users_spots', 'users_spots.user_id', 'users.id')
    .where('users_spots.spot_id', id)
    .where(applySearch(search))
    .count('*');

  return {
    id: spotInfo.id,
    name: spotInfo.name,
    count: +usersCount[0].count,
  };
}

export async function getSpotUsersPage (id, search, offset, limit) {
  const users = await knex('users')
    .innerJoin('users_spots', 'users_spots.user_id', 'users.id')
    .where('users_spots.spot_id', id)
    .select(
      'users.id',
      'users.name',
      'users.logo',
      'users.rating',
      'users.country',
      'users.city',
      knex.raw(
        `
          (select count(*)::integer from photos inner join albums on photos.owner_type = 'albums' and
          photos.owner_id = albums.id::text
          where albums.user_id =  users.id) as photos_count
        `,
      ),
    )
    .where(applySearch(search))
    .offset(offset)
    .limit(limit)
    .orderBy('rating', 'desc');

  return users;
}

export async function getSpotSchools (id) {
  const spotInfo = await knex('spots').where('spots.id', id).select('spots.id', 'spots.name').first();
  const photosQuery = knex('photos')
    .whereRaw('photos.owner_id = schools.id::text')
    .whereRaw("photos.owner_type = 'schools'")
    .select('photos.filename');

  const schools = await knex('schools')
    .innerJoin('spots_schools', 'spots_schools.school_id', 'schools.id')
    .where('spots_schools.spot_id', id)
    .select(
      'schools.id',
      'schools.name',
      'schools.logo',
      'schools.description',
      'schools.website',
      knex.raw(
        `
          (select count(*)::integer from photos where
          photos.owner_id = schools.id::text and photos.owner_type = 'schools'
          ) as photos_count
        `,
      ),
      knex.raw(
        `
         (select coalesce(json_agg(photos.filename), '[]'::json) from (${photosQuery}) as photos) as photos
        `,
      ),
    );

  return {
    id: spotInfo.id,
    name: spotInfo.name,
    schools: schools,
  };
}

export async function getSpotForm (id) {
  const spotInfo = await knex('spots')
    .where('spots.id', id)
    .select(
      'spots.id',
      'spots.name',
      'spots.lat',
      'spots.lng',
      'spots.rating',
      'spots.country',
      'spots.region',
      'spots.monthly_distribution',
      'spots.surface_type',
      'spots.beach_type',
      'spots.wind_type',
      'spots.convenience_type',
      'spots.entrance_type',
      'spots.benthal_type',
      'spots.danger_type',
      'spots.logo',
    )
    .first();

  const schools = await knex('schools')
    .pluck('schools.id')
    .innerJoin('spots_schools', 'schools.id', 'spots_schools.school_id')
    .where('spots_schools.spot_id', id);
  const allSchools = await knex('schools')
    .select('schools.id', 'schools.name', 'schools.logo')
    .orderBy('schools.name', 'asc');
  const photos = await knex('photos')
    .where('owner_id', id)
    .where('owner_type', 'spots')
    .select('width', 'height', 'month', 'created_at', 'filename');
  const users = await knex('users')
    .pluck('users.id')
    .innerJoin('users_spots', 'users_spots.user_id', 'users.id')
    .where('users_spots.spot_id', id)
    .orderBy('users.rating', 'desc');

  return {
    values: {
      ...spotInfo,
      schools: schools,
      photos: photos,
      users: users,
    },
    lookups: {
      schools: allSchools,
    },
  };
}

export async function saveSpot (id, values) {
  await knex('spots')
    .update({
      name: values.name,
      lat: values.lat,
      lng: values.lng,
      rating: values.rating,
      country: values.country,
      region: values.region,
      monthly_distribution: values.monthly_distribution,
      surface_type: values.surface_type,
      beach_type: values.beach_type,
      wind_type: values.wind_type,
      convenience_type: values.convenience_type,
      benthal_type: values.benthal_type,
      danger_type: values.danger_type,
      logo: values.logo,
    })
    .where('id', id);

  await knex('spots_schools').where('spot_id', id).del();

  const inserts = values.schools.map(schoolId => ({ spot_id: id, school_id: schoolId }));
  await knex('spots_schools').insert(inserts);

  await knex('photos').where('owner_id', id).where('owner_type', 'spots').del();
  console.info('photos deleted');
  const photosInserts = values.photos.map(photo => ({ ...photo, owner_id: id, owner_type: 'spots' }));
  console.info(photosInserts);
  await knex('photos').insert(photosInserts);

  return { status: 'ok', errors: {} };
}

export async function rotate (direction, filename) {
  const pathToOriginalFile = hashPath(filename);
  const rotatedFile = await rotateImage(direction, pathToOriginalFile);
  const size = getImageSize.sync(rotatedFile);
  const hash = await fileMD5(rotatedFile);
  return {
    filename: hash,
    width: size.width,
    height: size.height,
  };
}

