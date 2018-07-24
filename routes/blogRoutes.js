const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');

const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {
    const redis = require('redis');
    const redisUrl = 'redis://127.0.0.1:8000';
    const client = redis.createClient(redisUrl);
    const util = require('util');
    client.get = util.promisify(client.get);
    
    //do we have any data related to this query. If yes, return the value and return from the request

    const cachedBlogs = await client.get(req.user.id);
    if (cachedBlogs) {
      console.log('serving from cache');
      return res.send(JSON.parse(cachedBlogs));
    } 
    //if no, send request to mongo and update cache with result

    const blogs = await Blog.find({ _user: req.user.id });

    console.log('serving from mongoDB');
    res.send(blogs);
    client.set(req.user.id, JSON.stringify(blogs))
  });

  app.post('/api/blogs', requireLogin, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });
};
