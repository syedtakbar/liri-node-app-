exports.tasks = [
    {item: "concert-this", value: 1, api: "band"},
    {item: "spotify-this-song", value: 2, api: "spotify"},
    {item: "movie-this", value: 3, api: "omdb"},
    {item: "do-what-it-says", value: 4, api: "rand"},   
];
exports.tasksDetail = exports.tasks.map(function(o) {
    return o.value + " - " + o.item ; 
});

