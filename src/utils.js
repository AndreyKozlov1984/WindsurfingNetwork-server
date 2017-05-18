import fsp from 'fs-promise';
import mkdirp from 'mkdirp-promise';
import md5 from 'md5';
import sharp from 'sharp';

export function hashPath (hash) {
  const firstPart = hash.substring(0, 2);
  const lastPart = hash.substring(2);
  return `usercontent/${firstPart}/${lastPart}`;
}

export async function fileMD5 (content) {
  const hash = await md5(content);
  const firstPart = hash.substring(0, 2);
  const lastPart = hash.substring(2);
  await mkdirp(`usercontent/${firstPart}`);
  await fsp.writeFile(`usercontent/${firstPart}/${lastPart}`, content);
  return hash;
}

export async function resize (inputBuffer, width, height) {
  return await sharp(inputBuffer).resize(width, height).toBuffer();
}

