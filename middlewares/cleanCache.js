const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => {
     //this is a trick so that the middleware runs after the route handler
     await next()
     clearHash(req.user.id);
}