/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

// promisified fs module
const fs = require('fs-extra')
const path = require('path')

function getConfigurationByFile(file) {
  const pathToConfigFile = path.resolve('cypress', 'config', `${file}.json`)  // <-- this is a path to our file: cypress/config/filename.json 
  if(!fs.existsSync(pathToConfigFile)){  //if we dont have pathToConfigFile, we want to return and empty object
    return {};
  }

  return fs.readJson(pathToConfigFile)
}
module.exports = (on, config) => {
  //require('cypress-plugin-retries/lib/plugin')(on)
  const file = config.env.configFile  // config.env.configFile || 'development' is setting development by default, but we dont have Dev.

  return getConfigurationByFile(file)
}
