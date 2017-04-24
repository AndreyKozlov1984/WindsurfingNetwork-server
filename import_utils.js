import fsp from 'fs-promise';
import mkdirp from 'mkdirp-promise';
import md5 from 'md5';
import knex from '~/knex';

export async function fileMD5 (fileName) {
  let hash = null;
  try {
    const nameWithoutPath = fileName.replace(/^images\//, '');
    const name = `../scraper/images/${nameWithoutPath}`;
    const content = await fsp.readFile(name, null);
    hash = await md5(content);
    const firstPart = hash.substring(0, 2);
    const lastPart = hash.substring(2);
    await mkdirp(`usercontent/${firstPart}`);
    await fsp.copy(name, `usercontent/${firstPart}/${lastPart}`);
  } catch (e) {
    console.info(e);
  }
  return hash;
}

export async function insert (table, values) {
  const result = await knex(table).insert(values).returning('id');
  return result[0];
}

export async function lookupId (table, originalId) {
  return originalId ? (await knex(table).where({ original_id: originalId }).pluck('id'))[0] : null;
}

