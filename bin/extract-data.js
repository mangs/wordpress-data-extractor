#!/usr/bin/env node

// Import Modules
const convert = require('xml-js');
const fs = require('fs').promises;
const path = require('path');


// Constants
const DATE_STAMP = (new Date()).toLocaleDateString().replace(/\//g, '-');
const INPUT_DIRECTORY_DEFAULT = 'input-files';
const OUTPUT_DIRECTORY_DEFAULT = 'output-files';
const INPUT_FILE_LOCATION = process.argv[2] || `${INPUT_DIRECTORY_DEFAULT}/data.xml`;
const OUTPUT_FILE_LOCATION = process.argv[3] || `${OUTPUT_DIRECTORY_DEFAULT}/extracted-data-${DATE_STAMP}.json`;


// Functions
async function readFromFile(fileLocation, fileEncoding='utf8') {
  console.info(`Reading from file: ${fileLocation}`);
  try {
    return await fs.readFile(fileLocation, fileEncoding);
  } catch (exception) {
    console.error('readFromFile():', exception);
  }
}

async function writeToFile(fileLocation, data, fileEncoding='utf8') {
  console.info(`Writing to file: ${fileLocation}`);
  try {
    return await fs.writeFile(fileLocation, data, fileEncoding);
  } catch (exception) {
    console.error('writeToFile():', exception);
  }
}

function convertToJson(xml) {
  console.info('Converting XML to JSON...');
  const options = {
    compact: true,
    trim: true,
    ignoreComment: true,
  };
  return convert.xml2js(xml, options);
}

function extractFromSiteData(siteData) {
  console.info('Extracting data from JSON...');
  let metaDescriptionCount = 0;
  const articleCount = siteData.rss.channel.item.length;
  const extractedData = siteData.rss.channel.item.map((article) => {
    const postID = article['wp:post_id']._text;
    const title = article.title._text;
    const url = article.link._text;
    const publishDate = article.pubDate._text;
    const metaDescription = article['wp:postmeta'].reduce((accumulator, currentValue) => {
      if (currentValue['wp:meta_key']._cdata === '_yoast_wpseo_metadesc') {
        ++metaDescriptionCount;
        return currentValue['wp:meta_value']._cdata;
      }

      return accumulator;
    }, undefined);

    return {
      postID,
      title,
      url,
      publishDate,
      metaDescription,
    };
  });

  console.info(`Out of ${articleCount} articles, ${metaDescriptionCount} had a meta description`);
  return extractedData;
}

function printUsage() {
  const scriptLocation = path.basename(__filename);
  console.error(`USAGE: node ${scriptLocation} [INPUT_XML_FILE] [OUTPUT_JSON_FILE]`);
}

async function main() {
  if (process.argv.length < 3) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const xml = await readFromFile(INPUT_FILE_LOCATION);
  const convertedDocument = convertToJson(xml);
  const extractedData = extractFromSiteData(convertedDocument);
  const extractedDataString = JSON.stringify(extractedData);
  await writeToFile(OUTPUT_FILE_LOCATION, extractedDataString);
}


// Begin Execution
main();
