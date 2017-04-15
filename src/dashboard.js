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

export async function getDashboardContent (filters) {
  // build request;
  let query = knex('spots');
  query = applyFilters({ query, filters });

  const data = await query.select('*');
  return {
    mapMarkers: data.map(function (record) {
      return {
        id: record.id,
        lat: record.lat,
        lng: record.lng,
      };
    }),
    spots: data.map(function (record) {
      return {
        id: record.id,
        name: record.name,
        country: record.country,
        region: record.region,
      };
    }),
    activities: [],
  };
}

export async function getLookupData () {
  const countries = await knex('spots').distinct('country').orderBy('country').select();
  return {
    countries: countries.map(x => x.country),
  };
}

