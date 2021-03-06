/**
 * Listings API
 */

var rest = require('restler');
var cheerio = require('cheerio');
var async = require('async');
var apps = require('../data/apps.json');

var getAppListing = function(app, callback) {
	var request = rest.get(app.url);
	request.once('complete', function(result) {
		$ = cheerio.load(result);		
		
		switch(this.url.hostname) {
			case "play.google.com":
				app.title = $(".document-title[itemprop='name']").text().trim();
				app.developerName = $(".document-subtitle.primary[itemprop='name']").text().trim();
				app.numberOfInstalls = $(".content[itemprop='numDownloads']").text().trim().split(" ")[0].replace(/,/g,'');
				app.imageUrl = $(".cover-image[itemprop='image']").attr('src');
				break;
			case "www.amazon.com":
				app.title = $("#btAsinTitle").text().trim();
				app.developerName = $(".buying > span > a").text().trim();
				app.numberOfInstalls = 0;
				app.imageUrl = $("#prodImage").attr('src');
				break;
			default:
				app.title = '?';
				app.developerName = 'unknown';
				app.numberOfInstalls = 0;
				app.imageUrl = '';
		}
		
		callback();
	});    
};


exports.list = function(req, res) {
	async.eachSeries(apps, getAppListing, function(err){
		if(err) {
			console.log(err);
		}
		//res.set('Cache-Control', 'max-age=3600');
		res.json(apps);
	});
};