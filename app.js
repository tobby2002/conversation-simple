'use strict';

require( 'dotenv' ).config( {silent: true} );
var express = require( 'express' );  // app server
var bodyParser = require( 'body-parser' );  // parser for post requests
var request = require('request');

// The following requires are needed for logging purposes
var uuid = require( 'uuid' );
var logs = null;
var app = express();

// Bootstrap application settings
app.use( express.static( './public' ) ); // load UI from public folder
app.use( bodyParser.json() );

app.post( '/api/message', function(req, res) {
  //var workspace = process.env.WORKSPACE_ID || '089d387b-d0e5-4513-8f32-cc06b8ebf7cb';
  var workspace = process.env.WORKSPACE_ID || 'df632851-4ebe-417d-b4d8-1c107c538f21';
  // var workspace = process.env.WORKSPACE_ID || '<workspace-id>';
  if ( !workspace || workspace === '<workspace-id>' ) {
    return res.json( {
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b>.'
      }
    } );
  }

  var payload = {
    workspace_id: workspace,
    context: {},
    input: {}
  };

  if ( req.body ) {
    if ( req.body.input ) {
      payload.input = req.body.input;
    }
    if ( req.body.context ) {
      // The client must maintain context/state
      payload.context = req.body.context;
    }
  }

  var options = {

    uri: 'http://127.0.0.1:8000/api/v0/mrtalk/message',
    //uri: 'http://45.32.106.253:8000/api/v0/mrtalk/message',
    method: 'POST',
    json: payload
  };

  request(options, function(err, response, body) {
    if ( err ) {
      // return res.status( err.code || 500 ).json( err );
      return res.status(err.code ? 200 : 500).json( err );
    }
    return res.json( updateMessage( payload, JSON.parse(JSON.stringify(body)) ) );
  });

} );

/**
 * Updates the response text using the intent confidence
 * @param  {Object} input The request to the Conversation service
 * @param  {Object} response The response from the Conversation service
 * @return {Object}          The response with the updated message
 */
function updateMessage(input, response) {
  var responseText = null;
  var id = null;
  if ( !response.output ) {
    //response.output = {};
  } else {
    if ( logs ) {
      // If the logs db is set, then we want to record all input and responses
      id = uuid.v4();
      logs.insert( {'_id': id, 'request': input, 'response': response, 'time': new Date()});
    }
    return response;
  }
  if ( response.intents && response.intents[0] ) {
    var intent = response.intents[0];
    // Depending on the confidence of the response the app can return different messages.
    if ( intent.confidence >= 0.75 ) {
      responseText = 'I understood your intent was ' + intent.intent;
    } else if ( intent.confidence >= 0.5 ) {
      responseText = 'I think your intent was ' + intent.intent;
    } else {
      responseText = 'I did not understand your intent';
    }
  }

  try {
      process.stdout.write(response.toString());
      response.output.text = responseText;
  } catch (exception) {
      console.log(exception);
      process.stdout.write(exception.toString());

  }

  if ( logs ) {
    // If the logs db is set, then we want to record all input and responses
    id = uuid.v4();
    logs.insert( {'_id': id, 'request': input, 'response': response, 'time': new Date()});
  }
  return response;
}


module.exports = app;

