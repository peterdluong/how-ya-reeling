// First time visited
if (localStorage.getItem("returning_user") === null)
{
    console.log("First Time User!");
    localStorage.setItem("returning_user", "true");
    setDyslexiaMode("false");
    setColorblind("false");
}

// first time instructions
let introModal = localStorage.getItem("introModal");
if (introModal === null || introModal === "true")
{
    $('#introModal').modal('show');
}

function openIntroModal() {

    let checkboxTicked = localStorage.getItem("introModal") === "false" ? true : false;
    $('#neverShowCheckbox').prop('checked', checkboxTicked);

    $('#introModal').modal('show');
}

function closeIntroModal()
{
    $('#introModal').modal("hide");

    let ticked = $('#neverShowCheckbox').is(':checked') ? "false" : "true";
    localStorage.setItem("introModal", ticked);
}

function toggleDyslexiaMode()
{
    localStorage.setItem("dyslexia", localStorage.getItem("dyslexia") === "false" ? "true" : "false");
}

function setDyslexiaMode(val)
{
    if (typeof val === "boolean") {
        localStorage.setItem("dyslexia", val ? "true" : "false");
        return true;
    }

    return false;
}

function setColorblind(val)
{
    if (typeof val === "boolean") {
        localStorage.setItem("colorblind", val ? "true" : "false");
        return true;
    }

    return false;
}

function isDyslexicFont()
{
  let isDyslexicEnabled = localStorage.getItem("dyslexia");
  console.log(isDyslexicEnabled);

  return JSON.parse(isDyslexicEnabled);
}

function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

/*********************Peter's Dumb Added Code***********************/
// global variables for shizz and gags
var globalMood = 0;
var numMovies = 6;
var testUtelly = 0;
const testJSON = {"collection":{"id":"5d914028302b840050acbe62","picture":"https://utellyassets9-1.imgix.net/api/Images/4e4d50a0040fd4500193202edbafce6a/Redirect","name":"BoJack Horseman","locations":[{"icon":"https://utellyassets7.imgix.net/locations_icons/utelly/black_new/NetflixIVAUS.png?w=92&auto=compress&app_version=5ad8898f-f073-405d-92ed-98b1c6e8fb54_er2020-02-21","country":["us"],"display_name":"Netflix","name":"NetflixIVAUS","id":"5d81fe2fd51bef0f42268f0f","url":"https://www.netflix.com/title/70298933"}],"provider":"iva","weight":9919,"source_ids":{"imdb":{"url":"https://www.imdb.com/title/tt3398228","id":"tt3398228"}}},"type":"imdb","id":"tt3398228","status_code":200,"variant":"ivafull"}

// helper function to get JSON for trending movies
// change page=# to go to different pages
function getTrendingMovies(){
    var data = null;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.themoviedb.org/3/trending/movie/week?api_key=98d74bc028c22b652a8c88965a9ace22&page=1', false);
    
    xhr.onload = function(){
        data = JSON.parse(xhr.response);
    }
    
    xhr.send(data);
    return data;
}

// helper function to get JSON for movies based on mood
// to add sort feature, we can use TMDB built-in sort command when sending request
// change page=# to go to different pages
function getMoodMovies(mood_id){
    var data = null;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.themoviedb.org/3/discover/movie?api_key=98d74bc028c22b652a8c88965a9ace22&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_genres='+mood_id, false);
    
    xhr.onload = function(){
        data = JSON.parse(xhr.response);
    }
    
    xhr.send(data);
    return data;
}

// helper function to get a movie's poster image
// pass in JSON.results[index]
function getMovieIMG(movies){
    var URL = movies.poster_path;
    return "http://image.tmdb.org/t/p/original"+URL;
}

function getMovieStars(movies){
    var rating = movies.vote_average;
    var holder = '';
    if ((rating >= 0.0) && (rating < 2.0))
        holder = '&#9733; &#9734; &#9734; &#9734; &#9734;';
    else if ((rating >= 2.0) && (rating < 4.0))
        holder = '&#9733; &#9733; &#9734; &#9734; &#9734;';
    else if ((rating >= 4.0) && (rating < 6.0))
        holder = '&#9733; &#9733; &#9733; &#9734; &#9734;';
    else if ((rating >= 6.0) && (rating < 8.0))
        holder = '&#9733; &#9733; &#9733; &#9733; &#9734;';
    else
        holder = '&#9733; &#9733; &#9733; &#9733; &#9733;';
    return holder;
}

// parent function that runs on page onload
// determines what movies page to construct
// mood should be a global variable or something
function constructMoviesPage(){
    // run mood finder function
    if (globalMood == 0){
        constructTrendingMoviesPage();
    }
    else{
        constructMoodMoviesPage(globalMood);
    }
}

// function that runs when first viewing page
// can specify number of movies to view (up to 20 at a time)
function constructTrendingMoviesPage(){
    var movies = getTrendingMovies();
    for (i = 0; i < numMovies; i++){
        createCard(movies.results[i]);
    }
}

// function that constructs movies based on mood from google vision
function constructMoodMoviesPage(mood_id){
    var movies = getMoodMovies(mood_id);
    for (i = 0; i < numMovies; i++){
        createCard(movies.results[i]);
    }
}

// generic helper function to create a movie card
// pass in JSON.results[index]
// still need to add buttons from Utelly API
function createCard(movies){
    const container = document.getElementById('moviesPage');
    const card = document.createElement('div');
    const holder = `<div class="col-lg-4 col-md-6 mb-4">
        <div class="card h-100">
            <a href="#">
                <img class="card-img-top movie_card" src="${getMovieIMG(movies)}" alt="">
            </a>
            <div class="card-body">
                <h4 class="card-title">
                    <a href="#">${movies.title}</script></a>
                </h4>
                <a href="https://www.netflix.com/search?q=avengers%20endgame" button type="button" class="btn btn-secondary btn-sm">Netflix</button>
                </a>
            </div>
            <div class="card-footer">
                <small class="text-muted">${getMovieStars(movies)}</small>
            </div>
        </div>
    </div>`
    container.innerHTML += holder;
}

// also BROKEN
// function to get streaming buttons
// must change testUtelly to 1 for it to actually work
// otherwise it uses testJSON file
/*
function getMovieButtons(movies){
    var holder = '';
    if (testUtelly){
        var utellyData = findStreamingPlatform(movies.id).collection;
        for (i = 0; i < utellyData.locations.length; i++){
            holder += `<a href="${utellyData.locations[i].url}" button type="button" class="btn btn-secondary btn-sm">${utellyData.locations[i].display_name}</button></a>`
        }
    }
    else {
        console.log("Turn on testUtelly variable");
        var utellyData = testJSON.collection;
        for (i = 0; i < utellyData.locations.length; i++){
            holder += `<a href="${utellyData.locations[i].url}" button type="button" class="btn btn-secondary btn-sm">${utellyData.locations[i].display_name}</button></a>`
        }
    }
    return holder;
}
*/

// doesn't work at the moment ://
// function that gets info from Utelly API
/*
function findStreamingPlatform(movie_id){
    var data = null;
 
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
 
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            console.log(this.responseText);
        }
    });
 
    xhr.open("GET", "https://utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com/idlookup?country=US&source_id="+movie_id+"&source=tmdb", false);
    xhr.setRequestHeader("x-rapidapi-host", "utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com");
    xhr.setRequestHeader("x-rapidapi-key", "13521bddf5mshd6c32570b973587p160028jsnc3ebb0ee1dae");
 
    xhr.onload = function(){
        data = JSON.parse(xhr.response);
    }

    xhr.send(data);
    return data;
}
*/
