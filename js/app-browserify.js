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

// --------MODEL--------
var WeatherModel = Backbone.Model.extend ({
	url: "https://api.forecast.io/forecast/a8a1d6dd27dd4b8c77724d9b4743bcd2/29.7604,-95.3698",
	
	parse: function(responseData) {
		console.log(responseData)
		return responseData
	}
})
// --------Views--------
// this[someV](parms)
// 
var InputView = Backbone.View.extend ({
	el: "#opener",
	
	events: {
		"click #daily": "getWeeklyView",
		"click #current": "getCurrentView",
		"click #hourly": "getHourlyView",
		"keypress input": "getUserQuery"
	},

	getWeeklyView: function() {
		location.hash = "showWeeklyView"
		console.log("changing weekly hash")
	},

	getHourlyView: function() {
		location.hash = "showHourlyView"
		console.log("changing hourly hash")
	},

	getCurrentView: function() {
		location.hash = "showCurrentView"
		console.log("changing current hash")
	},

	getUserQuery: function(event) {
		if (event.keyCode === 13) {
			console.log('------',event)
			location.hash = event.currentTarget.value
		}
	},

	initialize: function(){}

})
new InputView
var CurrentView = Backbone.View.extend ({
	el: "#wheelWrapper",

	getApparentTemp: function() {
		return Math.floor(this.model.attributes.currently.apparentTemperature)
	},

	getActualTemp: function() {
		return Math.floor(this.model.attributes.currently.temperature)
	},

	getHumidity: function() {
		return this.model.attributes.currently.humidity * 100
	},

	getTime: function() {
		var d = new Date(this.model.attributes.currently.time * 1000)
		//console.log(d.getHours())
		if (d.getHours() > 12) {
			return (d.getHours() - 12) + ":" + d.getMinutes() + "PM"
		} else {
			return d.getHours() + ":" + d.getMinutes() + "AM"
		}
	},

	render: function() {
		console.log("Here comes the Current Weather!")
		// console.log(this.model)
		this.$el.html(`
			<div id="current">
				<p>Feels like ${this.getApparentTemp()}&#176;</p>
				<p>The temperature is ${this.getActualTemp()}&#176;</p>
				<p>There is ${this.getHumidity()}&#37; Humidity</p>
				<p>The time is ${this.getTime()}</p>
			</div>
			`)
	},

	initialize: function(){}
})

var HourlyView = Backbone.View.extend({
	el: "#wheelWrapper",

	getTemp: function(temp) {
		return Math.floor(temp)
	},

	getHumidity: function(humidity) {
		return humidity * 100
	},

	getTime: function(time) {
		var d = new Date(time * 1000)
		console.log(d)
		console.log(d.getHours())
		if (d.getHours() > 12) {
			return (d.getHours() - 12) + "PM"
		} else {
			return d.getHours() + "AM"
		}
	},

	render: function() {
		console.log("Here comes the Hourly Weather!")
		console.log(this.model)
		var hourlyArr = this.model.attributes.hourly.data.slice(0, 7),
			htmlString = "",
			self = this
		hourlyArr.forEach(function(hourlyData){
			console.log(hourlyData)
			htmlString += `<div id="hourly">\
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
	el: "#wheelWrapper",

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
			htmlString += `<div id="weekly">\
						<p>${self.getDay(weeklyData.time)}</p>\
						<p>High&#58; ${self.getTemp(weeklyData.temperatureMax)}&#176;</p>\
						<p>Low&#58; ${self.getTemp(weeklyData.temperatureMin)}&#176;</p>\
						<p>${self.getHumidity(weeklyData.humidity)}&#37; Humidity</p>\
						</div>`
		})

		this.$el.html(`${htmlString}`)
	},

	initialize: function(){}
})

// --------ROUTER--------
var WeatherRouter = Backbone.Router.extend ({
	routes: {
		"lat/:lat/long/:long": "showCurrentWeather",
		"showHourlyView": "showHourlyView",
		"showCurrentView": "showCurrentView",
		"showWeeklyView": "showWeeklyView",
		"*anyquery": "showCurrentView"
	},

	fetcher: function() {
		return this.wm.fetch({
			dataType: "jsonp",
			processData: true
		})
	},

	showCurrentView: function(latss,longss) {
		console.log("getting current weather")
		var self = this
		this.fetcher().success(function(){
			self.cV.render()
		})
	},

	showHourlyView: function() {
		console.log("getting hourly weather")
		var self = this
		this.fetcher().success(function(){
			self.hV.render()
		})
	},
	
	showWeeklyView: function() {
		console.log("getting weekly weather")
		var self = this
		this.fetcher().success(function(){
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


