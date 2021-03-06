import knex from '~/knex';
import _ from 'lodash';

function applyCheckboxFilter ({ query, filters, key }) {
  const value = filters[key];
  if (
    _.every(_.values(value), function (x) {
      return !x;
    })
  ) {
    return query;
  }
  const options = _.keys(_.pickBy(value, v => v));
  const rawSqlParts = _.map(options, function (o) {
    const dbKey = key + '_type';
    return `${dbKey}->>'${o}' = 'true'`;
  });
  query.whereRaw(`( ${rawSqlParts.join(' or ')} )`);
  return query;
}

function applyDangerCheckboxFilter ({ query, value }) {
  const key = 'danger';
  if (
    _.every(_.values(value), function (x) {
      return !x;
    })
  ) {
    return query;
  }
  const options = _.keys(_.pickBy(value, v => v));
  const rawSqlParts = _.map(options, function (o) {
    const dbKey = key + '_type';
    return `${dbKey}->>'${o}' = 'false'`;
  });
  query.whereRaw(`( ${rawSqlParts.join(' and ')} )`);
  return query;
}

function applyCountryFilter ({ query, filters }) {
  if (!filters.country) {
    return query;
  }
  return query.where('country', filters.country);
}

function applyFilters ({ query, filters }) {
  let result = query;
  result = applyCountryFilter({ query: result, filters });
  const filterTypes = ['surface', 'beach', 'wind', 'convenience', 'entrance', 'benthal'];
  for (let key of filterTypes) {
    result = applyCheckboxFilter({ query: result, filters, key: key });
  }
  result = applyDangerCheckboxFilter({ query: result, value: filters.danger });
  return result;
}

export async function getSpotsPage ({ filters, offset, limit }) {
  // build request;
  let query = knex('spots');
  query = applyFilters({ query, filters });

  const spots = await query
    .select(
      'spots.id',
      'spots.name',
      'spots.country',
      'spots.region',
      'spots.logo',
      knex.raw(`(select count(*)::int from users_spots us where us.spot_id = spots.id) as users_count`),
      knex.raw(`(select count(*)::int from spots_schools ss where ss.spot_id = spots.id) as schools_count`),
      knex.raw(
        `(select count(*)::int from photos p where 1 = 1
        and p.owner_type = 'spots'
        and p.owner_id::int = spots.id
       ) as photos_count`,
      ),
    )
    .offset(offset)
    .limit(limit)
    .orderBy('users_count', 'desc')
    .orderBy('id', 'asc');
  return spots;
}

export async function getDashboardContent (filters) {
  // build request;
  let query = knex('spots');
  query = applyFilters({ query, filters });

  const data = await query
    .select(
      'spots.id',
      'spots.lat',
      'spots.lng',
      knex.raw(`(select count(*)::int from users_spots us where us.spot_id = spots.id) as users_count`),
    )
    .orderBy('users_count', 'desc')
    .orderBy('id', 'asc');

  return {
    mapMarkers: data.map(function (record, index) {
      return {
        id: record.id,
        lat: record.lat,
        lng: record.lng,
        index: index,
      };
    }),
    spots: {
      count: data.length,
    },
  };
}

export async function getLookupData () {
  const countries = await knex('spots').distinct('country').orderBy('country').select();
  return {
    countries: countries.map(x => x.country),
  };
}

