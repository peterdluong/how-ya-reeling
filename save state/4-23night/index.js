const backendURL = "http://pi.cmasterx.com:5000/api";
const utellyPassword = "Howdy";
const MOOD = {'anger': '😡','joy': '😀', 'sorrow': '😭', 'surprise': '😮', 'meh': '😐'};

var APIEnabled = false;
var testUtelly = 0; // flag for Utelly
var userMood = 'joy';
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

// check if user has previously loaded image
if (localStorage.getItem("image-url") != null) {
    document.getElementById("faceImg").src = localStorage.getItem("image-url");
    updateUserMood();
}

// Submit button override
$("#featurePasswordForm").submit(function(e) {
    checkForAPIPassword();
    e.preventDefault();
});

function openIntroModal()
{

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

function openTakePictureModal()
{
    $('#pictureModal').modal("show");

}

function openAccessibilityModal()
{
    var dyslexiaTicked = localStorage.getItem("dyslexia") === "true";
    $('#dyslexiaEnableCheckbox').prop('checked', dyslexiaTicked);
    
    $('#accessibilityModal').modal("show");
    showMoviesInTheaters();
}

function setDyslexiaByAccessibility()
{
    var dyselxiaTicked = $('#dyslexiaEnableCheckbox').is(':checked');
    setDyslexiaMode(dyselxiaTicked);
    updateFont();
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

function updateFont()
{
    var bodyTag = document.getElementById("pageBody");
    var font = localStorage.getItem("dyslexia") === "true" ? "DyslexiaFont" : "";

    bodyTag.style.fontFamily = font;
}

function uploadPhoto()
{
    document.getElementById("uploading-image").classList.remove("d-none");
    
    let photo = document.getElementById("inputGroupPicture");
    photo = photo.files[0];
    
    let ff = new FormData();
    ff.append("file", photo);

    fetch(backendURL, {method: "POST", body: ff}).then(function(response) {
        response.text().then(function(text) {
            
            let data = JSON.parse(text);

            if (!data.hasOwnProperty('valid') || data.valid === "no" || !data.hasOwnProperty('url')) {
                document.getElementById("uploading-image").classList.add("d-none");
                return;    
            }
            
            faceImage = document.getElementById('faceImg').src = 'http://' + data.url;
            localStorage.setItem("image-url", 'http://' + data.url);
            getRawMoodFromImage();

            document.getElementById("uploading-image").classList.add("d-none");
        });
    });
}

function updateUserMood()
{
    let text = document.getElementById('user-emotion');
    let rawMood = getRawMoodFromImage();
    let key = processRawMood(rawMood);

    text.innerText = 'You are feeling: ' + MOOD[key];
    userMood = key;
    // Mood processing goes under here 

}

function getRawMoodFromImage(url=localStorage.getItem('image-url'))
{
    if (url === null) return null;
    
    let json = httpGet(url + '?on_file');
    
    let visionEnabled = document.getElementById('visionEnableCheckbox').checked || json.json === true;

    if (visionEnabled) {        // if true, use vision processing
        var key = "google";
    }
    else {
        let arr = ['joy', 'sorrow', 'anger', 'surprise'];
        var key = arr[Math.floor(Math.random() * arr.length)];
    }

    return callVisionAPI(localStorage.getItem('image-url'), key);
}

function processRawMood(data, faceIdx=0)
{
    let userMood = data[faceIdx];
    let moodKey = 'joy';

    moodKey = userMood['joy'] > userMood['sorrow'] ? 'joy' : 'sorrow';
    moodKey = userMood['anger'] > userMood[moodKey] ? 'anger' : moodKey;
    moodKey = userMood['surprise'] > userMood[moodKey] ? 'surprise' : moodKey;

    return moodKey;
}

function callVisionAPI(image_url, args="joy")
{
    return httpGet(image_url + '?vision=' + args)
}

function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return JSON.parse(xmlHttp.responseText);
}

function getServer(filename)
{
    return httpGet('http://how-ya-reeling.cmasterx.com:5000/saving' + '?filename=' + filename);
}

function storeServer(filename, data) 
{
    let form = new FormData()
    form.append('filename', filename);
    form.append('data', JSON.stringify(data));

    fetch('http://how-ya-reeling.cmasterx.com:5000/saving', {method: "POST", body: form}).then(function(response) {
        response.text().then(function(text) {
            console.log('Server responds with: ' + text)
        });
    });
}


/*********************Peter's Dumb Added Code***********************/
// global variables for shizz and gags
var globalMood = 0;
var numMovies = 6;

// gets stored movies from the cookies if there are any
if (localStorage.getItem("stored_movies") != null){
    var watchedMovies = JSON.parse(localStorage.getItem("stored_movies"));
}
else{
    var watchedMovies = [];
    localStorage.setItem("stored_movies", JSON.stringify(watchedMovies));
}

// const testJSON = {"collection":{"id":"5d914028302b840050acbe62","picture":"https://utellyassets9-1.imgix.net/api/Images/4e4d50a0040fd4500193202edbafce6a/Redirect","name":"BoJack Horseman","locations":[{"icon":"https://utellyassets7.imgix.net/locations_icons/utelly/black_new/NetflixIVAUS.png?w=92&auto=compress&app_version=5ad8898f-f073-405d-92ed-98b1c6e8fb54_er2020-02-21","country":["us"],"display_name":"Netflix","name":"NetflixIVAUS","id":"5d81fe2fd51bef0f42268f0f","url":"https://www.netflix.com/title/70298933"}],"provider":"iva","weight":9919,"source_ids":{"imdb":{"url":"https://www.imdb.com/title/tt3398228","id":"tt3398228"}}},"type":"imdb","id":"tt3398228","status_code":200,"variant":"ivafull"}

// helper function to get JSON for trending movies
// change page=# to go to different pages
function getTrendingMovies(){
    var data = null;
	var trending="Now Trending!";
	document.getElementById("p").innerHTML=trending;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.themoviedb.org/3/trending/movie/week?api_key=98d74bc028c22b652a8c88965a9ace22&page=1', false);
    
    xhr.onload = function(){
        data = JSON.parse(xhr.response);
    }
    
    xhr.send(data);
    console.log(data);
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

function checkForAPIPassword(set)
{
    password = document.getElementById("inputPassword").value;
    
    if (password == utellyPassword) {
        
        console.log("Password correct");
        APIEnabled = typeof k == "undefined" ? !APIEnabled : set;
        updateFeaturesModal();
    }
    else {
        console.log("Incorrect password");
    }
}

function updateFeaturesModal()
{
    document.getElementById("utellyEnableCheckbox").disabled = !APIEnabled;
    document.getElementById("visionEnableCheckbox").disabled = !APIEnabled;
    // document.getElementById("visionEnableCheckbox").disabled = !APIEnabled;      // TODO turn this on when this feature is working
}

function toggleUtelly()
{
    testUtelly = document.getElementById('utellyEnableCheckbox').checked;
    
    document.getElementById('moviesPage').innerHTML = "";
    constructMoviesPage();
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
        createCard(movies.results[i], "Streaming Platforms");
    }
}

// function that constructs movies based on mood from google vision
function constructMoodMoviesPage(mood_id){
    var movies = getMoodMovies(mood_id);
    for (i = 0; i < numMovies; i++){
        createCard(movies.results[i], "Streaming Platforms");
    }
}

// generic helper function to create a movie card
// pass in JSON.results[index]
// still need to add buttons from Utelly API
function createCard(movies, t1){
    
    if (!watchedMovies.includes(movies.id)){
    const container = document.getElementById('moviesPage');
    const card = document.createElement('div');
    const holder = `<div id="${movies.id}" class="col-lg-4 col-md-6 mb-4">
        <div class="card h-100">
            <a target="_blank" href="${getMovieIMG(movies)}">
                <img class="card-img-top movie_card" src="${getMovieIMG(movies)}" alt="">
            </a>
            <div class="card-body">
                <h4 class="card-title">
                    <medium class="text-primary">${movies.title}</medium>
                </h4>
                <h4 style="margin-top: -13px"><small>${returnYear(movies)}</small></h4>
                <a target="_blank" href="${googleSearch(movies.title)}" button type="button" class="btn btn-success btn-sm">Learn More</button></a>
                <h5 id="streamPlat" style="margin-top: 10px">${t1}</h5>
                ${getMovieButtons(movies.id)}
            </div>
            <div style="text-align:right">
                <a target="_blank" button type="button" onclick="markAsSeen(${movies.id})" class="btn btn-danger btn-sm text-white">Mark as Seen &#10003</button></a>
            </div>
            <div class="card-footer">
                <large class="text-muted">Rating: ${getMovieStars(movies)}   ${movies.vote_average}/10</large>
            </div>
        </div>
    </div>`
    container.innerHTML += holder;
    return holder;
    }
}
// <img style="margin-left: 3px; width: auto; height: 5%; filter: grayscale(100%)" src="resources/tmdb_rating3.svg" alt="">

function markAsSeen(movie_id){
    console.log("Marked movie " + movie_id + " as seen");
    if (!watchedMovies.includes(movie_id)){
        watchedMovies.push(movie_id);
        localStorage.setItem("stored_movies", JSON.stringify(watchedMovies));
    }
    deleteCard(movie_id);
    document.getElementById("moviesPage").innerHTML="";
    constructMoviesPage();
    // console.log("Deleted Movie with Movie ID:" + movie_id);
    // store as cookie that movie watched
}

function deleteCard(movie_id){
    document.getElementById(movie_id).innerHTML="";
}

function clearWatchedMovies(){
    watchedMovies = [];
    localStorage.setItem("stored_movies", JSON.stringify(watchedMovies));
}

function googleSearch(movie_title){
    var searchQuery = movie_title.replace(/\s/g, "+");
    searchQuery = searchQuery.replace(/&/g, "and");
    return "http://www.google.com/search?q=" + searchQuery + "+movie";
}

function returnYear(movies){
    var year = movies.release_date;
    return year.substring(0,4);
}

// also FIXED
// function to get streaming buttons
// must change testUtelly to 1 for it to actually work
// otherwise it uses testJSON file
function getMovieButtons(movie_id){
    var holder = ``;

    if (testUtelly){
        var utellyData = findStreamingPlatform(movie_id).collection;
        //console.log(utellyData.locations.length);
        var numLocations = utellyData.locations.length;
        
        let i;
        if (numLocations == 0) {
          holder = `<medium>No Available Streaming Platforms Currently</medium>`;
        } 
        else {
          for (i = 0; i < numLocations; i++) {
            holder += `<a target="_blank" style="margin-top: 10px; margin-left: 10px;" href="${utellyData.locations[i].url}" button type="button" class="btn btn-secondary btn-sm">${utellyData.locations[i].display_name}</button></a>`;
          }
        }
    }
    else {
        console.log("Turn on testUtelly variable to see streaming buttons.")
        //holder = `<medium id="turnOnUtelly">Turn on Utelly for buttons</medium>`;
    }
    return holder;
}

// function that gets info from Utelly API
function findStreamingPlatform(movie_id){
    var dataReturn;
    var settings = {
        "async": false,
        "crossDomain": true,
        "url": "https://utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com/idlookup?country=US&source_id="+movie_id+"&source=tmdb",
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com",
            "x-rapidapi-key": "13521bddf5mshd6c32570b973587p160028jsnc3ebb0ee1dae"
        }
    }

    $.ajax(settings).done(function (response) {
        console.log(response);
        dataReturn = response;
    });

    return dataReturn;
}
//var manyFilters = true;
//movies in theaters
function showMoviesInTheaters() {
    var data = null;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.themoviedb.org/3/movie/now_playing?api_key=98d74bc028c22b652a8c88965a9ace22&language=en-US&page=1&region=US', false);
    
    xhr.onload = function(){
        data = JSON.parse(xhr.response);
    }
    xhr.send(data);
    //console.log(data);
    var genres = [];
    //get user's mood ->match to a genre
    if (userMood == "anger") {
        genres[0] = 28; //action
        genres[1] = 10752; //war
        genres[2] = 80; //crime
    }
    else if (userMood == "joy") {
        genres[0] = 35; //comedy
        genres[1] = 10751; //family
        genres[2] = 12; //adventure
    }
    else if (userMood == "sorrow") {
        genres[0] = 35; //comedy
        genres[1] = 10749; //romance
        genres[2] = 18; //drama
    }
    else {
        genres[0] = 28; //action
        genres[1] = 53; //thriller
        genres[2] = 878; //sci fi
    }
    var j = 0;
    var g = 0;
    //check for release dates?
    document.getElementById("moviesPage").innerHTML="";
    var pg = 2;
    while (g < 6) {
        if (j == 19) {
            j = 0;
            xhr.open('GET', 'https://api.themoviedb.org/3/movie/now_playing?api_key=98d74bc028c22b652a8c88965a9ace22&language=en-US&page=' + pg + '&region=US', false);
            xhr.onload = function(){
                data = JSON.parse(xhr.response);
            }
            xhr.send(data);
            pg++;
        }
        var ids = data.results[j].genre_ids;
        for (i = 0; i < ids.length; i++) {
            var key = data.results[j].genre_ids[i];
            if (data.results[j].genre_ids[i] > 0  && genres.indexOf(key) != -1) {
                console.log(data.results[j].genre_ids);
                createCard(data.results[j],"See in Theaters!");
                g++;
                break;
            }
        }
        j++;
    }

    
}
