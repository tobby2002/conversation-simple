
'use strict';

var app = require('../app');
var bodyParser = require('body-parser');
var request = require('supertest');

app.use(bodyParser.json());

describe('Basic API tests', function() {
  it('GET to / should load the home page', function(done) {
    request(app).get('/').expect(200, done);
  });

//  it('POST to /api/message should return error message', function(done) {
//    request(app)
//      .post('/api/message')
//      .set('Accept', /application\/json/)
//      .expect('Content-Type', /application\/json/)
//      .send({'input': {'text': 'Turn on the radio'}})
//      .expect(function(res) {
//        if (!res.body) throw new Error('Body was not present in response');
//        console.log(res.body);
//        if (!res.body.output) throw new Error('\'Output\' was not present in response');
//        if (!res.body.output.text) throw new Error('\'text\' was not present in response');
//      })
//      .expect(200, done);
//  });
});
