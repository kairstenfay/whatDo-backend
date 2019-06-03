const express = require('express')
// const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const axios = require('axios');
require('dotenv').config();

const app = express()
const t = 10000;

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// const url = "https://jsonplaceholder.typicode.com/posts/1";
// https.get(url, res => {
//   res.setEncoding("utf8");
//   let body = "";
//   res.on("data", data => {
//     body += data;
//   });
//   res.on("end", () => {
//     body = JSON.parse(body);
//     console.log(body);
//   });
// });

/**
 * Search Eventful's API for events.
 * @see https://api.eventful.com/docs/events/search
 *
 */
app.get('/eventful', function(req, res, next) {
    const maturity = 'all';
    const page_size = 10;
    const location = 'seattle';

    let url = 'https://api.eventful.com/json/events/search?app_key=' +
        process.env.EVENTFUL_KEY + `&location=${location}` +
        `&page_size=${page_size}` + `&mature=${maturity}`;

    axios.get(url)
      .then(response => {
        const parsed_events = response.data['events']['event'].map(x => {
            return {  // todo: save additional details?
                title: x['title'],
                description: x['description'],
                url: x['url'],
                start_time: x['start_time'],
                identifier: x['id'],
                venue_name: x['venue_name'],
                venue_url: x['venue_url'],
                venue_address: x['venue_address'],
                venue_identiier: x['venue_id'],
                city: x['city_name'],
                zipcode: x['postal_code'],
                state: x['region_abbr'],
                region: x['region_name'],
                iso3: x['country_abbr'],
            }
        });
        res.send(parsed_events);
      })
      .catch(error => {
        console.log(error);
      });
});

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
