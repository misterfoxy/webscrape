// Import Dependencies
const express = require('express');
const router = express.Router();
const path = require('path');
const request = require('request'); // for web-scraping
const cheerio = require('cheerio'); // for web-scraping

// // Import Model
const Article = require('../models/Article.js');

router.get('/', (req, res) => {
  res.redirect('/scrape');
});

router.get('/articles', function(req, res) {

  // Query MongoDB for all article entries (sort newest to top, assuming Ids increment)
  Article.find().sort({_id: -1})

  // Then, send them to the handlebars template to be rendered
    .exec(function(err, doc) {
    // log any errors
    if (err) {
      console.log(err // or send the doc to the browser as a json object
      );
    } else {
      var hbsObject = {
        articles: doc
      }
      res.render('index', hbsObject);
      // res.json(hbsObject)
    }
  });

});

router.get('/scrape', function(req, res) {

  // First, grab the body of the html with request
  request('http://www.theonion.com/', function(error, response, html) {

    // Then, load html into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);

    // This is an error handler for the Onion website only, they have duplicate articles for some reason...
    var titlesArray = [];

    // Now, grab every everything with a class of "inner" with each "article" tag
    $('article .inner').each(function(i, element) {

      // Create an empty result object
      var result = {};

      // Collect the Article Title (contained in the "h2" of the "header" of "this")
      result.title = $(this).children('header').children('h2').text().trim() + ""; //convert to string for error handling later

      // Collect the Article Link (contained within the "a" tag of the "h2" in the "header" of "this")
      result.link = 'http://www.theonion.com' + $(this).children('header').children('h2').children('a').attr('href').trim();

      // Collect the Article Summary (contained in the next "div" inside of "this")
      result.summary = $(this).children('div').text().trim() + ""; //convert to string for error handling later

      // Error handling to ensure there are no empty scrapes
      if (result.title !== "" && result.summary !== "") {

        // BUT we must also check within each scrape since the Onion has duplicate articles...
        // Due to async, moongoose will not save the articles fast enough for the duplicates within a scrape to be caught
        if (titlesArray.indexOf(result.title) == -1) {

          // Push the saved item to our titlesArray to prevent duplicates thanks the the pesky Onion...
          titlesArray.push(result.title);

          // Only add the entry to the database if is not already there
          Article.count({
            title: result.title
          }, function(err, test) {

            // If the count is 0, then the entry is unique and should be saved
            if (test == 0) {

              // Using the Article model, create a new entry (note that the "result" object has the exact same key-value pairs of the model)
              var entry = new Article(result);

              // Save the entry to MongoDB
              entry.save(function(err, doc) {
                // log any errors
                if (err) {
                  console.log(err // or log the doc that was saved to the DB
                  );
                } else {
                  console.log(doc);
                }
              } // Log that scrape is working, just the content was already in the Database
              );

            } else {
              console.log('Redundant Database Content. Not saved to DB.')
            }

          } // Log that scrape is working, just the content was missing parts
          );
        } else {
          console.log('Redundant Onion Content. Not Saved to DB.') // Log that scrape is working, just the content was missing parts
        }

      } else {
        console.log('Empty Content. Not Saved to DB.')
      }

      // Redirect to the Articles Page, done at the end of the request for proper scoping

    });
    res.redirect("/articles");
  });
});

module.exports = router;
