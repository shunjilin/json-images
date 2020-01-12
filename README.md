# Parse JSON and download image data

Simple script to parse JSON from URL and download jpg images (on any JSON leaf nodes).

Allows for caching downloaded images to prevent duplicate downloads.

## Install
```
npm run install
```

## Usage
```
npm start -- --help
```

## Run
```
npm start -- --url <url> --output <output file directory> --cache <cache json file>

// e.g.
npm start -- --url https://my-site.com/json-endpoint --output ./assets/images --cache ./src/cache.json
```

## Cache Json File
cache json file should be of the format  - url : filepath, e.g.:
```
// cache.json
{
    'https://my-site.com/image1.jpg' : './assets/images/image1.jpg',
    'https://my-site.com/image2.jpg' : './assets/images/image2.jpg'
}

```
script will generate random strings as image file name for the output images