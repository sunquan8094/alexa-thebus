var Alexa = require('alexa-sdk');
var parseString = require('xml2js').parseString;
var settings = require('./settings.json');
var request = require('request');
var helpers = require('./helpers');

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
                   if (/^\d{3,}$/.test(route)) {
                     route = "<say-as interpret-as=\"digits\">" + route + "</say-as>";
                   }
                   var estSched = arr.estimated[0] === "0" ? "scheduled" : "estimated";
                   var time = arr.stopTime[0];
                   var headsign = arr.headsign[0];
                   headsign = headsign.split(" ").map((w) =>
                     helpers.isHawaiian(w) ? '<phoneme alphabet="ipa" ph="' + helpers.hawaiianPronunciation(w) +  '">' + w + '</phoneme>' : w).join(" ");
                   self.emit(':tell', "The next bus is route " + route + ", " + "with service to " +
                             headsign + ", " + estSched + " to arrive at stop <say-as interpret-as=\"digits\">" + stop + "</say-as> at " + time + ".");
                 }
                 else {
                   self.emit(':tell', "There is no information on bus arrivals for the stop you specified at this time. Please check back later. Mahalo for using Honolulu Bus Arrivals.");
                 }
               });
             });
  },
  'GetNextRouteAtStopIntent': function() {
    var self = this;
    var stop = this.event.request.intent.slots.stop.value || undefined;
    var route = (this.event.request.intent.slots.route && this.event.request.intent.slots.route.value) ||
                (this.event.request.intent.slots.route_with_letter && this.event.request.intent.slots.route_with_letter.value);
    if (!stop || !route) {
      self.emit(":ask", "I didn't get everything. Please try again.");
      return;
    }
    request({url: 'http://api.thebus.org/arrivals/?key=' + settings.api_key + '&stop=' + stop,
             method: 'GET'}, function(error, response, body) {
               var obj = parseString(body, function(err, obj) {
                 if (obj.stopTimes.arrival !== undefined) {
                   var arrivals = obj.stopTimes.arrival;
                   arrivals = arrivals.filter(function(arrival) {
                     return arrival.route[0] === route;
                   });
                   if (/^\d{3,}$/.test(route)) {
                     route = "<say-as interpret-as=\"digits\">" + route + "</say-as>";
                   }
                   if (arrivals.length > 0) {
                     var res = arrivals[0];
                     var estSched = res.estimated[0] === "0" ? "scheduled" : "estimated";
                     var time = res.stopTime[0];
                     self.emit(':tell', "The next route " + route + " bus is " + estSched + " to arrive at stop <say-as interpret-as=\"digits\">" + stop + "</say-as> at " + time + ".");
                   }
                   else {
                     self.emit(':tell', "There is no information on route " + route + " bus arrivals " + " at stop <say-as interpret-as=\"digits\">" + stop + "</say-as> at this time. Please check back later. Mahalo for using Honolulu Bus Arrivals.");
                   }
                 }
                 else {
                   self.emit(':tell', "There is no information on route " + route + " bus arrivals " + " at stop <say-as interpret-as=\"digits\">" + stop + "</say-as> at this time. Please check back later. Mahalo for using Honolulu Bus Arrivals.");
                 }
               });
             });
  },
  "AMAZON.HelpIntent": function() {
    this.emit(":ask", "This skill allows you to look up scheduled and estimated arrivals at specified bus stops. " +
      "You can ask for the arrival time of the next bus at a desired stop by specifying its stop ID number. " +
      "For instance, try asking: when will the next bus arrive at stop <say-as interpret-as=\"digits\">131</say-as>. " +
      "You can also ask when the next bus on a desired route will arrive at a desired stop. " +
      "For instance, try asking: when will the next route 1 arrive at stop <say-as interpret-as=\"digits\">131</say-as>. " +
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
