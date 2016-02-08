// es5 and 6 polyfills, powered by babel
require("babel/polyfill")

let fetch = require('./fetcher')

var $ = require('jquery'),
	Backbone = require('backbone')

console.log('loaded javascript')
// other stuff that we don't really use in our own code
// var Pace = require("../bower_components/pace/pace.js")

// require your own libraries, too!
// var Router = require('./app.js')

// window.addEventListener('load', app)

// function app() {
    // start app
    // new Router()
// }

var geocodeApi = "AIzaSyDRI-uKq_WlhB66Azm3e86bpg61xlzK6Co"

// --------MODEL--------
var WeatherModel = Backbone.Model.extend ({
	url: "https://api.forecast.io/forecast/a8a1d6dd27dd4b8c77724d9b4743bcd2/",
	
	parse: function(responseData) {
		// console.log(responseData)
		return responseData
	}
})
// --------Views--------
var InputView = Backbone.View.extend ({
	el: "#opener",
	
	events: {
		"click #current": "getCurrentView",
		"click #hourly": "getHourlyView",
		"click #daily": "getWeeklyView",
		"keypress input": "getUserQuery"
		
	},

	getCurrentView: function() {
		//var latVal = document.querySelector(".lat").value
		//var longVal = document.querySelector(".long").value
		location.hash = "weather/" 
		console.log("changing current hash")
	},

	getHourlyView: function() {
		location.hash = "/hourly"
		console.log("changing hourly hash")
	},

	getWeeklyView: function() {
		location.hash = "/weekly"
		console.log("changing weekly hash")
	},

	getUserQuery: function(event) {
		if (event.keyCode === 13) {
			console.log('------',event)
			location.hash = "weather/" + event.target.value
		}
	},

	initialize: function(){}

})
new InputView

var CurrentView = Backbone.View.extend ({
	el: "#weatherInfo",

	getApparentTemp: function() {
		return Math.floor(this.model.attributes.currently.apparentTemperature)
	},

	getActualTemp: function() {
		return Math.floor(this.model.attributes.currently.temperature)
	},

	getHumidity: function() {
		return Math.floor(this.model.attributes.currently.humidity * 100)
	},

	getSummary: function() {
		return this.model.attributes.currently.summary
	},

	getTime: function() {
		var d = new Date(this.model.attributes.currently.time * 1000)
		var minutes = d.getMinutes()
		if (minutes < 10) {minutes = 0 + minutes}
		if (d.getHours() > 12) {
			return (d.getHours() - 12) + ":" + minutes + "PM"
		} else {
			return d.getHours() + ":" + minutes + "AM"
		}
	},

	render: function() {
		console.log("Here comes the Current Weather!")
		console.log(this.model)
		this.$el.html(`
			<div id="currentTemp">\
				<p>The temperature is ${this.getActualTemp()}&#176;</p>\
				<p>${this.getSummary()}</p>\
				<p>Feels like ${this.getApparentTemp()}&#176;</p>\
				<p>There is ${this.getHumidity()}&#37; Humidity</p>\
				<p>The time is ${this.getTime()}</p>\
			</div>
			`)
	},

	initialize: function(){}
})

var HourlyView = Backbone.View.extend({
	el: "#weatherInfo",

	getTemp: function(temp) {
		return Math.floor(temp)
	},

	getHumidity: function(humidity) {
		return Math.floor(humidity * 100)
	},

	getTime: function(time) {
		var d = new Date(time * 1000)
		console.log(d)
		console.log(d.getHours())
		if (d.getHours() > 12) {
			return (d.getHours() - 12) + "PM"
		} else if (d.getHours() === 12) {
			return 12 + "PM"
		} else if (d.getHours() === 24) {
			return 12 + "AM"
		} else {
			return d.getHours() + "AM"
		}
	},

	render: function() {
		console.log("Here comes the Hourly Weather!")
		console.log(this.model)
		var hourlyArr = this.model.attributes.hourly.data.slice(0, 8),
			htmlString = "",
			self = this
		hourlyArr.forEach(function(hourlyData){
			console.log(hourlyData)
			htmlString += `<div id="hourlyTemp">\
						<p>${self.getTime(hourlyData.time)}</p>\
						<p>${self.getTemp(hourlyData.temperature)}&#176;</p>\
						<p>${self.getHumidity(hourlyData.humidity)}&#37; Humidity</p>\
						</div>`
		})
		this.$el.html(`${htmlString}`)
	},

	initialize: function(){}
})

var WeeklyView = Backbone.View.extend({
	el: "#weatherInfo",

	getTemp: function(temp) {
		return Math.floor(temp)
	},

	getHumidity: function(humidity) {
		return Math.floor(humidity * 100)
	},

	getDay: function(time) {
		var d = new Date(time * 1000)
		return d.toString().split(" ").slice(0,1).join()
		console.log(d)
	},


	render: function() {
		console.log("Here comes the Weekly Weather!")
		console.log(this.model)
		var weeklyArr = this.model.attributes.daily.data,
			htmlString = "",
			self = this
		weeklyArr.forEach(function(weeklyData){
			console.log(weeklyData)
			htmlString += `<div id="weeklyTemp">\
						<p>${self.getDay(weeklyData.time)}</p>\
						<p>High&#58; ${self.getTemp(weeklyData.temperatureMax)}&#176;</p>\
						<p>Low&#58; ${self.getTemp(weeklyData.temperatureMin)}&#176;</p>\
						<p>${self.getHumidity(weeklyData.humidity)}&#37; Humidity</p>\
						</div>`
		})
		console.log(htmlString)
		this.$el.html(`${htmlString}`)
	},

	initialize: function(){}
})

// --------ROUTER--------
var WeatherRouter = Backbone.Router.extend ({
	routes: {
		"weather/:query": "showCurrentView",
		":query/hourly": "showHourlyView",
		":query/weekly": "showWeeklyView",
		"*anyquery": "showHomeView"
	},

	doAjax: function(query) {
		console.log(query)
		var ajaxParams = {
			url: "https://maps.googleapis.com/maps/api/geocode/json",
			data: {
				address: query,
				key: geocodeApi
			}
		}
		return $.ajax(ajaxParams)
	},

	fetcher: function(query) {
		var self = this
		return self.doAjax(query).done(function(response){
			// console.log(response)

			var loc = response.results[0].geometry.location,
				lat = loc.lat,
				lng = loc.lng
			
			self.wm.fetch({
				url: self.wm.url + `${lat},${lng}`,
				dataType: "jsonp"
			})
		})
		console.log("returning data")
	},

	showCurrentView: function(query) {
		var self = this
		console.log("getting current weather")
		console.log(query)
		this.fetcher(query).done(function(){
			self.wV.render()
		})
	},

	showHourlyView: function(query) {
		console.log("getting hourly weather")
		var self = this
		this.fetcher(query).done(function(){
			self.wV.render()
		})
	},
	
	showWeeklyView: function(query) {
		console.log("getting weekly weather")
		var self = this
		this.fetcher().done(function(){
			self.wV.render()
		})
	},

	initialize: function() {
		this.wm = new WeatherModel(),
		this.wV = new WeeklyView({model:this.wm}),
		this.hV = new HourlyView({model:this.wm}),
		this.cV = new CurrentView({model:this.wm}),
		Backbone.history.start()
	}
})

var thisRouter = new WeatherRouter()