const mongoose = require('mongoose')

const uri = process.env.mongoDbURI

mongoose.connect(uri)

mongoose.Promise = global.Promise

module.exports = mongoose