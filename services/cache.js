const mongoose = require("mongoose");
const redis = require("redis");
const redisUrl = "redis://127.0.0.1:8000";
const client = redis.createClient(redisUrl);
const util = require("util");

//promisify hget because we are using nested hash
client.hget = util.promisify(client.hget);
//store reference to original exec
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options={}) {
  //this will refer to the query instance
  this.useCache = true;
  //stringify in case someone does not pass a string and passes an object
  //also have a default value in case someone does not pass a key property
  this.hashKey = JSON.stringify(options.key || "");
  return this;
};
//overwrite original mongoose Query; use function keyword so that the this binding is coherent
mongoose.Query.prototype.exec = async function() {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name
    })
  );

  //see if we have a value of key in redis
  //use hget to pull info out of a nested hash
  const cacheValue = await client.hget(this.hashKey, key);

  //if we do, return that
  if (cacheValue) {
    //app expects mongoose documents not JSON objects
    //cacheValue is an array of JSON objects. A new mongoose instance needs to be created
    //for each item in the array
    const doc = JSON.parse(cacheValue);
    return Array.isArray(doc)
      ? doc.map(d => this.model(d))
      : new this.model(doc);
  }
  //otherwise issue the query and store the result in redis
  const result = await exec.apply(this, arguments);
  client.hset(this.hashKey, key, JSON.stringify(result));
  client.expire(this.hashKey, 10);
  return result;
};

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey))
    }
}