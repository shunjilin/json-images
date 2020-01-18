# Parse JSON and download image data

Simple script to parse JSON from URL and download jpg/jpeg/png images (on any JSON leaf nodes).

Also generates a json file that maps url to the generated image names.

## Install
```
npm install
```

## Usage
```
npm start -- --help
```

## Run
```
npm start -- --url <url>
//e.g.
npm start -- --url https://my-site.com/json-endpoint
```
## Output
- images directory: ./generated/output
- map json file: ./generated/map.json

## Map Json File
map json file will be of the format  - url : filename, e.g.:
```
// map.json
{
    'https://my-site.com/image1.jpg' : 'image1.jpg',
    'https://my-site.com/image2.jpg' : 'image2.jpg'
}

```
script will generate random strings as image file name for the output images
