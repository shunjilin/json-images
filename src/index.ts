import fetch from 'node-fetch';
import fs from 'fs';
import program from 'commander';
import path from 'path';

program.version('0.1.0');

program
    .requiredOption('--url <url>', 'json url')
    .option('--output <output>', 'directory name for output images')
    .option('--map <map>', 'file name for map json file')

interface JsonObject {
    [key: string]: JsonObject | string
}

const fetchJsonFromUrl = async (url: string): Promise<JsonObject> => {
    const response = await fetch(url);
    return await response.json();
}

// random string identifier
const getRandomString = () => Math.random().toString(36).substr(2, 9)

// given a json object and result array, collect all jpg/jpeg/png/gif image url in result array
const collectImageUrls = (jsonObject: JsonObject | string, resultArray: string[]) => {
    if (typeof jsonObject === 'string') {
        if (jsonObject.startsWith('https://') &&
            (jsonObject.endsWith('.jpg') ||
                jsonObject.endsWith('.jpeg') ||
                jsonObject.endsWith('.png') ||
                jsonObject.endsWith('.gif'))
        ) {
            resultArray.push(jsonObject)
        }
    } else { // recursively traverse
        Object.values(jsonObject).forEach(node => {
            collectImageUrls(node, resultArray)
        });
    }
}

// create empty json file
const createJsonFile = (filePath: string, jsonObject: JsonObject) => {
    const directoryName = path.dirname(filePath)
    // create directory if not exist
    if (!fs.existsSync(directoryName)) {
        fs.mkdirSync(directoryName, { recursive: true })

    }
    // create empty json file
    fs.writeFileSync(filePath, JSON.stringify(jsonObject, null, 2))
}

// remove all files in directory
const removeFilesInDirectory = (dirPath: string) => {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        fs.unlinkSync(path.join(dirPath, file))
    }
}

const main = async () => {
    // get user input
    program.parse(process.argv)
    const generatedDir = './generated'
    const url = program.url
    const imageOutputDirFilepath = program.output ?
        path.join(generatedDir, program.output) : path.join(generatedDir, 'images')
    const mapFilePath = program.map ?
        path.join(generatedDir, program.map) : path.join(generatedDir, 'map.json')

    // remove file if exist
    if (fs.existsSync(mapFilePath)) {
        fs.unlinkSync(mapFilePath) // delete file   
    }

    // clear output folder if exists
    if (fs.existsSync(imageOutputDirFilepath)) {
        if (!fs.lstatSync(imageOutputDirFilepath).isDirectory()) {
            throw new Error(`Output directory ${imageOutputDirFilepath} exists, but is not a folder`)
        }
        removeFilesInDirectory(imageOutputDirFilepath)
    } else {  // create image output directory if not exist
        fs.mkdirSync(imageOutputDirFilepath, { recursive: true })
    }

    // fetch json data from url
    const json = await fetchJsonFromUrl(url)

    // collect image urls
    let resultUrls: string[] = [];
    collectImageUrls(json, resultUrls);
    // remove duplicates
    resultUrls = Array.from(new Set(resultUrls))

    const cacheJsonObject: JsonObject = {}
    // downloads images asynchronously
    await Promise.all(resultUrls.map(async url => {
        if (!cacheJsonObject[url]) { // if not downloaded
            // generate random string
            const outputImageFileName = getRandomString() + '.jpg'
            const outputImageFilePath = path.join(imageOutputDirFilepath, outputImageFileName)
            const urlImage = await fetch(url)
            const outputImage = fs.createWriteStream(outputImageFilePath)
            urlImage.body.pipe(outputImage) // write image
            cacheJsonObject[url] = outputImageFileName// add to cache
        }
    }))

    // create cache file
    createJsonFile(mapFilePath, cacheJsonObject)
}

(async () => main())()