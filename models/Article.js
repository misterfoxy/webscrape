const moment = require('moment');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArticleSchema = new Schema({

  title: {
    type: String,
    required: true
  },

  link: {
    type: String,
    required: true
  },

  summary: {
    type: String,
    required: true
  },

  updated: {
    type: String,
    default: moment().format('MMMM Do YYYY, h:mm A')
  }
});

const Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;
