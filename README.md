# Parse JSON and download image data

Simple script to parse JSON from URL and download jpg images (on any JSON leaf nodes).

Also generates a json file that maps url to the generated image names

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
// get images from url
npm start -- --url <url>
//e.g.
npm start -- --url https://my-site.com/json-endpoint

// optional arguments for output image directory and map name
npm start -- url <url> --output <output file directory name> --map <map json file name>
// e.g.
npm start -- --url https://my-site.com/json-endpoint --output myimages --map mymap.json
```
If no optional arguments given,
- Default output images directory: ./output
- Default map json file: ./map.json

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
