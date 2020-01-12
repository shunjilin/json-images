import fetch from 'node-fetch';
import fs from 'fs';
import program from 'commander';
import path from 'path';

program.version('0.0.1');

program
    .requiredOption('--url <url>', 'json url')
    .requiredOption('--output <output>', 'image output directory filepath, directory will be created if not exist')
    .requiredOption('--cache <cache>', 'cache filepath, stores json object mapping from url to image filepath; file will be created if not exist')

interface JsonObject {
    [key: string]: JsonObject | string
}

const fetchJsonFromUrl = async (url: string): Promise<JsonObject> => {
    const response = await fetch(url);
    return await response.json();
}

// random string identifier
const getRandomString = () => Math.random().toString(36).substr(2, 9)

// given a json object and result array, collect all jpg image url in result array
const collectImageUrls = (jsonObject: JsonObject | string, resultArray: string[]) => {
    if (typeof jsonObject === 'string') {
        if (jsonObject.startsWith('https://') && jsonObject.endsWith('.jpg')) {
            resultArray.push(jsonObject)
        }
    } else { // recursively traverse
        Object.values(jsonObject).forEach(node => {
            collectImageUrls(node, resultArray)
        });
    }
}

// return json object from json file
const getJsonObjectFromJsonFile = (filePath: string): JsonObject => JSON.parse(fs.readFileSync(filePath).toString())

// create empty json file
const createJsonFile = (filePath: string) => {
    const directoryName = path.dirname(filePath)
    // create directory if not exist
    if (!fs.existsSync(directoryName)) {
        fs.mkdirSync(directoryName, { recursive: true })

    }
    // create empty json file
    fs.writeFileSync(filePath, JSON.stringify({}))
}

// append key value pair to json file
const appendKeyValueToJsonFile = (filePath: string, key: string, value: string) => {
    const json = JSON.parse(fs.readFileSync(filePath).toString())
    json[key] = value;
    fs.writeFileSync(filePath, JSON.stringify(json))
}

const main = async () => {
    // get user input
    program.parse(process.argv)
    const url = program.url
    const imageOutputDirFilepath = program.output
    const cacheFilepath = program.cache

    // create cache json file if not exist
    if (!fs.existsSync(cacheFilepath)) {
        createJsonFile(cacheFilepath)
    }

    // create image output directory if not exist
    if (!fs.existsSync(imageOutputDirFilepath)) {
        fs.mkdirSync(imageOutputDirFilepath, { recursive: true })
    }

    // fetch json data from url
    const json = await fetchJsonFromUrl(url)

    // collect image urls
    const resultUrls: string[] = [];
    collectImageUrls(json, resultUrls);

    // get cached urls (prevent downloading again)
    const cacheJsonObject = getJsonObjectFromJsonFile(cacheFilepath)
    const cachedKeys = Object.keys(cacheJsonObject)

    // download image if not cached
    resultUrls.forEach(async url => {
        if (!cachedKeys.includes(url)) { // not cached
            // generate random string
            const outputImageFilePath = path.join(imageOutputDirFilepath, getRandomString() + '.jpg')
            const urlImage = await fetch(url)
            const outputImage = fs.createWriteStream(outputImageFilePath)
            urlImage.body.pipe(outputImage) // write image
            // update cache json file
            appendKeyValueToJsonFile(cacheFilepath, url, outputImageFilePath)
        }
    })
}

(async () => main())()