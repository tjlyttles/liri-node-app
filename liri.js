require("dotenv").config()

var fs = require("fs")
var keys = require("./keys.js")
var moment = require('moment')
var axios = require('axios')
var Spotify =require('node-spotify-api')
var spotify = new Spotify(keys.spotify)
var getCommand = process.argv[2]
var nameCommand = process.argv.slice(3).join(" ")

function switchCaseCommand() {
    switch (getCommand) {
        
        case `concert-this`:
        bandSearch()
        break
    
        case `spotify-this-song`:
        musicSearch()
        break

        case `movie-this`:
        movieSearch()
        break

        case `do-what-it-says`:
        randomSearch()
        break

        default:
        text = 'Error in processing this command. Please try again.'
    }
}

function randomSearch() {

    fs.readFile("random.txt", "utf8", function(error, data) {
        getCommand = ''
        nameCommand = ''
        
        if (error) {
          return console.log(error);
        }
        var dataArr = data.split(",")
        var randData = Math.floor(Math.random() * dataArr.length)
        
        if (randData % 2 === 1 || randData === 1) {

            getCommand = dataArr[randData - 1]
            nameCommand = dataArr[randData].split(' ').join('+')
            console.log(getCommand)
            console.log(nameCommand)
            switchCaseCommand()
        } else {

            getCommand = dataArr[randData]
            nameCommand = dataArr[randData + 1].split(' ').join('+')
            console.log(getCommand)
            console.log(nameCommand)    
            switchCaseCommand()
        }

    })    
}

function movieSearch() {

    if (nameCommand === '') {
        axios.get("http://www.omdbapi.com/?t=mr+nobody&y=&plot=short&apikey=trilogy").then(
            function(response) {

                console.log('Title: ' + response.data.Title);
                console.log('imdbRating: ' + response.data.Ratings[0].Value)
                console.log('Rotten Tomates: ' + response.data.Ratings[1].Value)
                console.log('Country: ' + response.data.Country)
                console.log('Language: ' + response.data.Language)
                console.log('Plot: ' + response.data.Plot)
                console.log('Actors: ' + response.data.Actors)
            }
          )
    } else {
        axios.get("http://www.omdbapi.com/?t=" + nameCommand + "&y=&plot=short&apikey=trilogy")
        .then(function(response) {
    
            console.log('Title: ' + response.data.Title);
            console.log('imdbRating: ' + response.data.Ratings[0].Value)
            console.log('Rotten Tomates: ' + response.data.Ratings[1].Value)
            console.log('Country: ' + response.data.Country)
            console.log('Language: ' + response.data.Language)
            console.log('Plot: ' + response.data.Plot)
            console.log('Actors: ' + response.data.Actors)
        })
    }
}

function musicSearch () {

  if (nameCommand === '') {

    spotify
    .request('https://api.spotify.com/v1/search?q=track%3Athe+sign&type=track&limit=1')
    .then(function(data) {
        console.log('Artist: ' + data.tracks.items[0].album.artists[0].name)
        console.log('Song Name: ' + data.tracks.items[0].name)
        console.log('Song Preview: ' + data.tracks.items[0].album.external_urls.spotify)
        console.log('Album: ' + data.tracks.items[0].album.name)
    })
  .catch(function(err) {
  console.error('Error occurred: ' + err); 
  })
 } else {

        spotify
        .request('https://api.spotify.com/v1/search?q=track%3A' + nameCommand + '&type=track&limit=1')
        .then(function(data) {
          console.log('Artist: ' + data.tracks.items[0].album.artists[0].name)
          console.log('Song Name: ' + data.tracks.items[0].name)
          console.log('Song Preview: ' + data.tracks.items[0].album.external_urls.spotify)
          console.log('Album: ' + data.tracks.items[0].album.name)
        })
        .catch(function(err) {
          console.error('Error occurred: ' + err); 
        });

    } 
    
}

function bandSearch() {
    
    axios.get("https://rest.bandsintown.com/artists/" + nameCommand + "/events?app_id=codingbootcamp")
    .then(function(response) {
        // If the axios was successful...
        // Then log the body from the site!
        var venueInfo = response.data
        console.log((venueInfo).length)
        for (var i = 0; i < venueInfo.length; i++) {
            console.log('Venue Name: ' + venueInfo[i].venue.name);
            console.log('Venue Location: ' + venueInfo[i].venue.city + ', ' + venueInfo[i].venue.country)
            console.log('Venue Date: ' + moment(venueInfo[i].datetime).format("MM/DD/YYYY"))
            console.log('<---------------------------------->')
        }
    })
    
}
switchCaseCommand()