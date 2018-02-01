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
                 if (obj.stopTimes.arrival !== undefined) {
                   var arr = obj.stopTimes.arrival[0];
                   var route = arr.route[0];
                   var estSched = arr.estimated[0] === "0" ? "scheduled" : "estimated";
                   var time = arr.stopTime[0];
                   self.emit(':tell', "The next bus is route " + route + ", " + estSched + " to arrive at " + time + ".");
                 }
                 else {
                   self.emit(':tell', "There is no information on bus arrivals for the stop you specified at this time. Please check back later. Mahalo for using Honolulu Bus Arrivals.");
                 }
               });
             });
  },
  'GetNextRouteAtStopIntent': function() {
    var self = this;
    var stop = this.event.request.intent.slots.stop.value;
    var route = this.event.request.intent.slots.route.value;
    if (stop === undefined || route === undefined) {
      self.emit(":ask", "I didn't get everything. Please try again.");
      return;
    }
    if (/^[Aa](lpha)?$/.test(route)) {
      route = 'A';
    }
    if (/^[Cc](harlie)?$/.test(route)) {
      route = 'C';
    }
    if (/^[Ee](cho)?$/.test(route)) {
      route = 'E';
    }
    request({url: 'http://api.thebus.org/arrivals/?key=' + settings.api_key + '&stop=' + stop,
             method: 'GET'}, function(error, response, body) {
               var obj = parseString(body, function(err, obj) {
                 if (obj.stopTimes.arrival !== undefined) {
                   var arrivals = obj.stopTimes.arrival;
                   arrivals = arrivals.filter(function(arrival) {
                     return arrival.route[0] === route;
                   });
                   if (arrivals.length > 0) {
                     var res = arrivals[0];
                     var estSched = res.estimated[0] === "0" ? "scheduled" : "estimated";
                     var time = res.stopTime[0];
                     self.emit(':tell', "The next route " + route + " bus is " + estSched + " to arrive at stop number " + stop + " at " + time + ".");
                   }
                   else {
                     self.emit(':tell', "There is no information on route " + route + " bus arrivals " + " at stop " + stop + " at this time. Please check back later. Mahalo for using Honolulu Bus Arrivals.");
                   }
                 }
                 else {
                   self.emit(':tell', "There is no information on route " + route + " bus arrivals " + " at stop " + stop + " at this time. Please check back later. Mahalo for using Honolulu Bus Arrivals.");
                 }
               });
             });
  },
  "AMAZON.HelpIntent": function() {
    this.emit(":ask", "This skill allows you to look up scheduled and estimated arrivals at specified bus stops. " +
      "You can ask for the arrival time of the next bus at a desired stop by specifying its stop ID number. " +
      "For instance, try asking: when will the next bus arrive at stop 131. " +
      "You can also ask when the next bus on a desired route will arrive at a desired stop. " +
      "For instance, try asking: when will the next route 1 arrive at stop 131. " +
      "What would you like to ask?");
  },
  "AMAZON.StopIntent": function() {
    this.emit(":tell", "Mahalo for using Honolulu Bus Arrivals.");
  },
  "Unhandled": function () {
    this.emit(":ask", "I don't understand that. Please try again.");
  },
  "LaunchRequest": function() {
    this.emit(":ask", "Aloha. Welcome to Honolulu Bus Arrivals. What would you like to ask?");
  }
}

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context, callback);
  alexa.registerHandlers(handlers);
  alexa.execute();
}
