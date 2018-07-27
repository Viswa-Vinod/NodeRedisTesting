
jest.setTimeout(30000);

require('../models/User');
const mongoose = require('mongoose');
const keys = require('../config/keys');

//tell mongoose to use the promise implementation of nodejs
mongoose.Promise = global.Promise;

//connect to DB; provide option to get rid of nuisance warnings
mongoose.connect(keys.mongoURI, { useMongoClient: true});
