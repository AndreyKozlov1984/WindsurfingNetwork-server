// Import all spots from the scraper
import fs from 'fs';
import process from 'process';
import knex from '~/knex';
import _ from 'lodash';
const fileName = process.env.SPOTS || '../scraper/spots.json';
const data = JSON.parse(fs.readFileSync(fileName));

const surfaceKeys = [
    "flat",
    "small_chop",
    "chop",
    "wave",
    "big_wave"
]
const surfaceObject = function(stats) {
    return _.fromPairs(_.zip(surfaceKeys, stats.map( x => parseInt(x))));
};

const surfaceType = function(stats) {
    const distribution = surfaceObject(stats);
    const threshold = _.max(_.values(stats)) * 0.8;
    return _.mapValues(distribution, function(value) {
        return value > threshold && value > 0;
    });
}

const beachKeys = [
    "sand",
    "pebble",
    "ground",
    "grass"
]
const beachObject = function(stats) {
    return _.fromPairs(_.zip(beachKeys, stats.map( x => parseInt(x))));
};

const beachType = function(stats) {
    const distribution = beachObject(stats);
    const threshold = _.max(_.values(stats)) * 0.8;
    return _.mapValues(distribution, function(value) {
        return value > threshold && value > 0;
    });
}

const windKeys = [
    "to_coast",
    "to_coast_angle",
    "across_coast",
    "offshore"
];

const windObject = function(stats) {
    return _.fromPairs(_.zip(windKeys, stats.map( x => parseInt(x))));
};

const windType = function(stats) {
    const distribution = windObject(stats);
    const threshold = _.max(_.values(stats)) * 0.8;
    return _.mapValues(distribution, function(value) {
        return value > threshold && value > 0;
    });
}

const convenienceKeys = [
    "narrow",
    "middle",
    "wide",
];

const convenienceObject = function(stats) {
    return _.fromPairs(_.zip(convenienceKeys, stats.map( x => parseInt(x))));
};

const convenienceType = function(stats) {
    const distribution = convenienceObject(stats);
    const threshold = _.max(_.values(stats)) * 0.8;
    return _.mapValues(distribution, function(value) {
        return value > threshold && value > 0;
    });
}

const entranceKeys = [
    "shallow",
    "average",
    "deep",
];

const entranceObject = function(stats) {
    return _.fromPairs(_.zip(entranceKeys, stats.map( x => parseInt(x))));
};

const entranceType = function(stats) {
    const distribution = entranceObject(stats);
    const threshold = _.max(_.values(stats)) * 0.8;
    return _.mapValues(distribution, function(value) {
        return value > threshold && value > 0;
    });
}

const benthalKeys = [
    "sand",
    "small_stones",
    "large_stones",
    "pebble",
    "coral",
];

const benthalObject = function(stats) {
    return _.fromPairs(_.zip(benthalKeys, stats.map( x => parseInt(x))));
};

const benthalType = function(stats) {
    const distribution = benthalObject(stats);
    const threshold = _.max(_.values(stats)) * 0.8;
    return _.mapValues(distribution, function(value) {
        return value > threshold && value > 0;
    });
}

const dangerKeys = [
    "current",
    "sea_animals",
    "jellyfish",
    "trees",
    "nets",
    "fishes",
    "sharks"
];

const dangerObject = function(stats) {
    return _.fromPairs(_.zip(dangerKeys, stats.map( x => parseInt(x))));
};

const dangerType = function(stats) {
    console.info(stats);
    const distribution = dangerObject(stats);
    const threshold = _.max(_.values(stats)) * 0.8;
    return _.mapValues(distribution, function(value) {
        return value > threshold && value > 0;
    });
}

console.info('go');
(async function () {
    const items = await knex('spots').select(['id', ' name']);
    for (let spotRecord of data) {
        if (!spotRecord.lat) {
            return
        }
        console.info(spotRecord.questions.a6stats);
        const dbEntry = {
            original_id: spotRecord.id,
            name: spotRecord.name,
            lat: parseFloat(spotRecord.lat),
            lng: parseFloat(spotRecord.lng),
            monthly_distribution: _.mapValues(spotRecord.distribution, function(arr) {
                return arr.map( v => parseInt(v))
            }),
            country: spotRecord.location.split(', ')[0],
            region: spotRecord.location.split(', ')[1],
            surface_stats: surfaceObject(spotRecord.questions.a1stats),
            surface_type: surfaceType(spotRecord.questions.a1stats),
            beach_stats: beachObject(spotRecord.questions.a2stats),
            beach_type: beachType(spotRecord.questions.a2stats),
            wind_stats: windObject(spotRecord.questions.a3stats),
            wind_type: windType(spotRecord.questions.a3stats),
            convenience_stats: convenienceObject(spotRecord.questions.a4stats),
            convenience_type: convenienceType(spotRecord.questions.a4stats),
            entrance_stats: entranceObject(spotRecord.questions.a5stats),
            entrance_type: entranceType(spotRecord.questions.a5stats),
            benthal_stats: benthalObject(spotRecord.questions.a6stats),
            benthal_type: benthalType(spotRecord.questions.a6stats),
            danger_stats: dangerObject(spotRecord.questions.a7stats),
            danger_type: dangerType(spotRecord.questions.a7stats),
        };
        await knex('spots').insert(dbEntry);
    }
})().then(process.exit);


