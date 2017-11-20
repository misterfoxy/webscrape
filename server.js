// INITIALIZE SERVER DEPENDENCIES
const express = require('express');
const PORT = process.env.PORT || 3030;
const app = express();

// IMPORT DEPENDENCIES
const bodyParser = require('body-parser');
const request = require('request');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');

app.use(bodyParser.urlencoded({
  extended:false
}));

// SET VIEW ENGINE
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

mongoose.Promise = global.Promise;
// DATABASE CONNECTION
if (process.env.NODE_ENV == 'production'){
  mongoose.connect('#');
}
else{
  mongoose.connect('mongodb://localhost/webscrape');
}

const db = mongoose.connection;

db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

db.once('open', function() {
  console.log('Mongoose connection successful.');
});



// load static files to server
app.use(express.static('public'));


// LOAD MODELS
const Article = require('./models/Article.js');

// LOAD CONTROLLERS
const router = require('./controllers/controller.js');
app.use('/', router);

// SPIN SERVER
app.listen(PORT, function(){
  console.log('Listening on PORT ' + PORT);
});
