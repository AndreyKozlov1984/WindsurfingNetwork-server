import fsp from 'fs-promise';
import mkdirp from 'mkdirp-promise';
import md5 from 'md5';
import sharp from 'sharp';
import { ExifImage } from 'exif';
import moment from 'moment';

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

export async function rotateImage (direction, path) {
  return await sharp(path).rotate(direction === 'left' ? 270 : direction === 'right' ? 90 : 0).toBuffer();
}

// eslint-disable-next-line require-await
export async function getCreatedDate (imageBuffer) {
  return new Promise(function (resolve, reject) {
    // eslint-disable-next-line no-new
    new ExifImage({ image: imageBuffer }, function (error, exifData) {
      if (error) {
        resolve(null);
      } else {
        const tstamp = moment(exifData.exif.DateTimeOriginal, 'YYYY:MM:DD HH:mm:ss');
        const date = tstamp.toDate();
        resolve(date);
      }
    });
  });
}

