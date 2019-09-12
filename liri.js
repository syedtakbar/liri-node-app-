// This application is designed and developed by Syed Akbar (September 11, 2019)

require("dotenv").config();
const keys = require("./keys.js");
const tasks = require('./tasks');

const liriObj = {

     fs : require("fs"),
     request : require("request"),
     inquirer : require("inquirer"),     
     Spotify : require('node-spotify-api'),
     colors : require('colors'),
     pad : require('pad'),
 
     questions: [
        {
            type: "list",
            name: "task",
            message: "Please select an item: ",
            choices: tasks.tasksDetail,                    
        },
        {
            type: "input",
            name: "taskValue",
            message: "Please enter value for your selection: ",                        
            filter: function(val) {
              return val.toLowerCase();
            }                       
        }
    ],
    
    prompt : () => liriObj.inquirer.prompt(liriObj.questions).then(liriObj.processAnswer,liriObj.processError),

    processAnswer: (answers) => {
        const filterAnswer = tasks.tasks.filter(x => x.item === answers.task.substring(4));         
        const api = filterAnswer[0].api; 
        // console.log(liriObj.pad(liriObj.colors.green( "Tasks: "), 30), liriObj.colors.blue(answers.task));
        // console.log(liriObj.pad(liriObj.colors.green( "Value: "), 30), liriObj.colors.blue(answers.taskValue));
        // console.log(liriObj.pad(liriObj.colors.green( "API: "), 30), liriObj.colors.blue(api));
        liriObj[api](answers.taskValue);
    },
    
    band : (artist)  => {
        if (artist === "" || artist === undefined) 
        {
            console.log(liriObj.colors.red(`No artist value entered for concert-this selection.`)); 
            return;
        }
        
        const url = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp";
        
        //console.log(`URL: ${url}`);
        //f671e401-06f2-4f96-8065-758a59d29630        
        //liriObj.request(url).pipe(liriObj.fs.createWriteStream(`band_${artist}.txt`));
        //console.log(url);
        liriObj.request(url, liriObj.resolveBand);
    },

    resolveBand: (error, response, body) => {

        
        if (error || response.statusCode !== 200) 
        {
            liriObj.processError(error, response.statusCode); 
            return;          
        }

        try {
    
            const concerts = JSON.parse(body);
            
            if (concerts === undefined || concerts.length === 0) 
            {
                console.log(liriObj.colors.red("no concert information found for the artist."));
                return;
            }


            for (var i = 0; i < concerts.length; i++) {  
                const outVal = `
                
                ******EVENT INFO******
                
                Name of the Venue:  ${concerts[i].venue.name}                
                Venue Location:     ${concerts[i].venue.city}
                Date of the Event:  ${concerts[i].datetime}

                ***********************
                
                `;
                console.log(liriObj.colors.green(outVal));
                liriObj.writeData(outVal);
                
            }            
        }
        catch(err) {
            liriObj.processError(err);
        }
    },

    spotify : (song) => {
        if (song === "" || song === undefined) song = "The Sign"; 

        const spotObj = new liriObj.Spotify(keys.spotify);
        spotObj.search({
                type: "track",
                query: song
            },
            (error, data) => {
                if (error) return liriObj.processError(error);                
                
                const songs = data.tracks.items;
                for (var i = 0; i < songs.length; i++) {

                    const outVal = `
                
                        ******SONG INFO******
                        
                        Song name:          ${songs[i].name}                                        
                        Album:              ${songs[i].album.name}
                        Artist(s):          ${songs[i].artists[0].name}
                        Preview song:       ${songs[i].preview_url}

                        ***********************
                
                    `;
                    console.log(liriObj.colors.cyan(outVal));
                    liriObj.writeData(outVal);                  
                }
            }
        );
    },

    omdb : (movie) => {
        if (movie === "" || movie === undefined) {            
            movie = "Mr. Nobody";

            const outVal = `

            If you haven't watched 'Mr. Nobody,' then you should: http://www.imdb.com/title/tt0485947/

            It's on Netflix!

            `;

            console.log(liriObj.colors.yellow(outVal));
            liriObj.writeData(outVal);    

        }

        const url = "http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=trilogy";
        liriObj.request(url, liriObj.resolveMovie);
    },

    resolveMovie: (error, response, body) => {

        if (error || response.statusCode !== 200) {
            liriObj.processError(error, response.statusCode);  
            return;            
        }               

        try {

            const movies = JSON.parse(body);
            
            if (movies.Error) {            
                console.log(liriObj.colors.red(movies.Error)); 
                return;
            }
                    
            const isRatingExist = (movies.Ratings === undefined || movies.Ratings.length === 0) ? false : true;        
            const outVal = `
            
            **********MOVIE INFO*********
            
            Title:                      ${movies.Title}
            Release Year:               ${movies.Year}
            IMDB Rating:                ${movies.imdbRating} 
            Rotten Tomatoes Rating:     ${(isRatingExist) ? movies.Ratings.find((item) => item.Source === "Rotten Tomatoes").Value : "N/A"};                         
            Country of Production:      ${movies.Country}
            Language:                   ${movies.Language}
            Actors:                     ${movies.Actors}
            Plot:                       ${movies.Plot}

            *****************************
            
            `;
            
            console.log(liriObj.colors.green(outVal));
            liriObj.writeData(outVal); 
        }
        catch(err) {
            liriObj.processError(err);
        }
    },

    rand : () => {
        try {
            liriObj.fs.readFile("random.txt", "utf8", function(error, data) {
                if (error) return liriObj.processError(error);                
                    
                const valItems = data.split(',');
                //console.log(`func: ${valItems[0]} val: ${valItems[1]}`) ;      

                const filterAnswer = tasks.tasks.filter(x => x.item === valItems[0]);         
                const api = filterAnswer[0].api;      
                liriObj[api](valItems[1]);
            });   
        }
        catch(err) {
            liriObj.processError(err);
        }     
    },

    processError: (err, httpstatus = 0) => {                
        if (err) console.log(liriObj.colors.red(err));   
        if (httpstatus !== 0) console.log(liriObj.colors.red(`httpstatus: ${httpstatus}`));                                                  
    },

    writeData: (content) => {        
        liriObj.fs.appendFile("log.txt", content, liriObj.processError );
    },
};


liriObj.prompt();
