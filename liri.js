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
            // console.log(getCommand)
            // console.log(nameCommand + '\n')
            switchCaseCommand()
        } else {

            getCommand = dataArr[randData]
            nameCommand = dataArr[randData + 1].split(' ').join('+')
            // console.log(getCommand)
            // console.log(nameCommand + '\n')    
            switchCaseCommand()
        }

    })    
}

function movieSearch() {

    if (nameCommand === '') {
        axios.get("http://www.omdbapi.com/?t=mr+nobody&y=&plot=short&apikey=trilogy").then(
            function(response) {

              var respData = response.data
              var movieData = [
                'Title: ' + respData.Title,
                'imdbRating: ' + respData.Ratings[0].Value,
                'Rotten Tomates: ' + respData.Ratings[1].Value,
                'Country: ' + respData.Country,
                'Language: ' + respData.Language,
                'Plot: ' + respData.Plot,
                'Actors: ' + respData.Actors
            ].join('\n\n')
  
            addToLog(movieData)
            }
          )
    } else {
        axios.get("http://www.omdbapi.com/?t=" + nameCommand + "&y=&plot=short&apikey=trilogy")
        .then(function(response) {

            var respData = response.data
            var movieData = [
              'Title: ' + respData.Title,
              'imdbRating: ' + respData.Ratings[0].Value,
              'Rotten Tomates: ' + respData.Ratings[1].Value,
              'Country: ' + respData.Country,
              'Language: ' + respData.Language,
              'Plot: ' + respData.Plot,
              'Actors: ' + respData.Actors
          ].join('\n\n')

          addToLog(movieData)
        })
    }
}

function musicSearch () {

  if (nameCommand === '') {

    spotify
    .request('https://api.spotify.com/v1/search?q=track%3Athe+sign&type=track&limit=1')
    .then(function(data) {

      var track = data.tracks
      var songData = [
        'Artist: ' + track.items[0].album.artists[0].name,
        'Song Name: ' + track.items[0].name,
        'Song Preview: ' + track.items[0].album.external_urls.spotify,
        'Album: ' + track.items[0].album.name
      ].join('\n\n')

    addToLog(songData)
    })
  .catch(function(err) {
  console.error('Error occurred: ' + err); 
  })

  } else {

    spotify
    .request('https://api.spotify.com/v1/search?q=track%3A' + nameCommand + '&type=track&limit=1')
    .then(function(data) {

      var track = data.tracks
      var songData = [
      'Artist: ' + track.items[0].album.artists[0].name,
      'Song Name: ' + track.items[0].name,
      'Song Preview: ' + track.items[0].album.external_urls.spotify,
      'Album: ' + track.items[0].album.name
    ].join('\n\n')

    addToLog(songData)
    })
    .catch(function(err) {
      console.error('Error occurred: ' + err); 
    })
  }     
}

function bandSearch() {
    
  axios.get("https://rest.bandsintown.com/artists/" + nameCommand + "/events?app_id=codingbootcamp")
  .then(function(response) {
      // If the axios was successful...
      // Then log the body from the site!
      var venueInfo = response.data
      console.log('Total Venues: ' + (venueInfo).length + '\n')
      for (var i = 0; i < venueInfo.length; i++) {

        var venueData = [
          'Artist: ' + venueInfo[i].lineup[0],
          'Venue Name: ' + venueInfo[i].venue.name,
          'Venue Location: ' + venueInfo[i].venue.city + ', ' + venueInfo[i].venue.country,
          'Venue Date: ' + moment(venueInfo[i].datetime).format("MM/DD/YYYY")             
        ].join('\n\n')
        
        addToLog(venueData)
      }
  })
}

function addToLog(data) {
  //console.log(data)
  var divider = '\n------------------------------------------------------------------------------------------------------'
  fs.appendFile("log.txt", data + divider, function(err) {

      //If an error was experienced we will log it.
      if (err) throw err
        console.log(data + divider);
  });
}

switchCaseCommand()