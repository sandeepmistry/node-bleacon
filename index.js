var Bleacon = require('./lib/bleacon');

var bleacon = new Bleacon();

bleacon.BleuStation = require('./bleu-station/bleu-station');
bleacon.Estimote = require('./estimote/estimote');
bleacon.EstimoteSticker = require('./estimote-sticker/estimote-sticker');

module.exports = bleacon;
