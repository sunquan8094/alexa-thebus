var Alexa = require('alexa-sdk');
var parseString = require('xml2js').parseString;
var settings = require('./settings.json');
var request = require('request');

var handlers = {
  'GetNextBusAtStopIntent': function() {
    var self = this;
    var stop = this.event.request.intent.slots.stop.value;
    request({url: 'http://api.thebus.org/arrivals/?key=' + settings.api_key + '&stop=' + stop,
             method: 'GET'}, function(error, response, body) {
               var obj = parseString(body, function(err, obj) {
                 var arr = obj.stopTimes.arrival[0];
                 var route = arr.route[0];
                 var estSched = arr.estimated[0] === "0" ? "scheduled" : "estimated";
                 var time = arr.stopTime[0];
                 self.emit(':tell', "The next bus is route " + route + ", " + estSched + " to arrive at " + time + ".");
               });
             });
  },
  "Unhandled": function () {
    this.emit(":tell", "I don't understand that.");
  },
  "LaunchRequest": function() {
    this.emit(":ask", "Aloha from TheBus. What would you like to ask?");
  }
}

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context, callback);
  alexa.registerHandlers(handlers);
  alexa.execute();
}
