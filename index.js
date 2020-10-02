const backendURL = "http://pi.cmasterx.com:5000/api";
const utellyPassword = "Howdy";
const MOOD = {'anger': '😡','joy': '😀', 'sorrow': '😭', 'surprise': '😮', 'meh': '😐'};

var APIEnabled = true;
var testUtelly = 1; // flag for Utelly
var userMood = 'meh';
var numMovies = 6;
var moviesOnPage = [];
var theaterFlag = false;

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

// gets stored movies from the cookies if there are any
if (localStorage.getItem("stored_movies") != null){
    var watchedMovies = JSON.parse(localStorage.getItem("stored_movies"));
}
else{
    var watchedMovies = [];
    localStorage.setItem("stored_movies", JSON.stringify(watchedMovies));
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
    // constructMoviesPage(); // TODO mark
    // showMoviesInTheaters();
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
            updateUserMood();

            document.getElementById("uploading-image").classList.add("d-none");
            $("#pictureModal").modal("hide");
        });
    });
}

function updateMoodFromDropdown()
{
    mood = document.getElementById('emotion-emoji').value;
    
    updateUserMood(mood);
}

function updateUserMood(mood=null)
{
    if (mood == null) {
        let text = document.getElementById('user-emotion');
        let rawMood = getRawMoodFromImage();
        userMood = processRawMood(rawMood);
        document.getElementById('emotion-emoji').value = userMood;
    }
    else {
        userMood = mood;
    }
    //text.innerText = 'You are feeling: ' + MOOD[key];
    // Mood processing goes under here 
    constructMoviesPage();
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

function checkServer(filename)
{
    let res = httpGet('http://how-ya-reeling.cmasterx.com:5000/saving' + '?filename=' + filename + '&exists');
    return res.exists;
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
	
	//var done = false;
    fetch('http://how-ya-reeling.cmasterx.com:5000/saving', {method: "POST", body: form}).then(function(response) {
        response.text().then(function(text) {
            console.log('Server responds with: ' + text);
			//done = true;
        });
    });
	//for(;!done;) {}
}


/*********************Peter's Dumb Added Code***********************/
// global variables for shizz and gags
//var globalMood = 0;
var filterFlag = "null";

// const testJSON = {"collection":{"id":"5d914028302b840050acbe62","picture":"https://utellyassets9-1.imgix.net/api/Images/4e4d50a0040fd4500193202edbafce6a/Redirect","name":"BoJack Horseman","locations":[{"icon":"https://utellyassets7.imgix.net/locations_icons/utelly/black_new/NetflixIVAUS.png?w=92&auto=compress&app_version=5ad8898f-f073-405d-92ed-98b1c6e8fb54_er2020-02-21","country":["us"],"display_name":"Netflix","name":"NetflixIVAUS","id":"5d81fe2fd51bef0f42268f0f","url":"https://www.netflix.com/title/70298933"}],"provider":"iva","weight":9919,"source_ids":{"imdb":{"url":"https://www.imdb.com/title/tt3398228","id":"tt3398228"}}},"type":"imdb","id":"tt3398228","status_code":200,"variant":"ivafull"}

function viewWatchHistory(){
    highlightMovieRecomendationSelection("watch");
    clearMovieTiles();
    document.getElementById("p").innerHTML="Your Watch History";
    var i;
    var movies;
    if (watchedMovies.length == 0){
        const container = document.getElementById('moviesPage');
        const card = document.createElement('div');
        const holder = `<h2 style="color: white; margin-top: 50px; margin-bottom: 50px" class="col-lg-12 col-md-12 mb-4 text-center">No Watch History to display. <br> Mark movies as seen to build your watch history!</h2>`
        container.innerHTML += holder;
    }
    else{
    for (i = 0; i < watchedMovies.length; i++){
        movies = httpGet('https://api.themoviedb.org/3/movie/' + watchedMovies[i] + '?api_key=98d74bc028c22b652a8c88965a9ace22&language=en-US');
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
                    <h4 style="margin-top: -13px"><small><b>${returnYear(movies)}</b></small></h4>
                    <a target="_blank" href="${googleSearch(movies.title)}" button type="button" class="btn btn-success btn-sm">Learn More</button></a>
                </div>
                <div class="card-footer">
                    <large class="text-muted">Rating: ${getMovieStars(movies)}   ${movies.vote_average}/10</large>
                </div>
            </div>
        </div>`
        container.innerHTML += holder;
    }
    }
}

function viewMovieSuggestions(){
    highlightMovieRecomendationSelection("recommend");
    clearMovieTiles();
    document.getElementById("p").innerHTML="Your Movie Recommendations";
    if (userMood == 'meh' ){
        const container = document.getElementById('moviesPage');
        const card = document.createElement('div');
        const holder = `<h2 style="color: white; margin-top: 50px; margin-bottom: 50px" class="col-lg-12 col-md-12 mb-4 text-center">No Movie Recommendations to display. <br> Upload a picture to get personalized movie recommendations!</h2>`
        container.innerHTML += holder;
    }
    else{
        constructMoodMoviesPage();
    }
}

// helper function to get JSON for trending movies
// change page=# to go to different pages
function getTrendingMovies(page_num){
    var data = null;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.themoviedb.org/3/trending/movie/week?api_key=98d74bc028c22b652a8c88965a9ace22&page=' + page_num, false);
    
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
function getMoodMovies(pgNum){
    var data = null;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.themoviedb.org/3/discover/movie?api_key=98d74bc028c22b652a8c88965a9ace22&language=en-US&region=US&sort_by=popularity.desc&include_adult=false&include_video=false&page=' + pgNum, false);
    
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
    if (userMood == 'meh'){
        if (theaterFlag){
            showMoviesInTheaters();
            return;
        }
        else{

        }
        constructTrendingMoviesPage();
    }
    else if (theaterFlag){
        showMoviesInTheaters();
    }
    else{
        constructMoodMoviesPage();
    }
}

// function that runs when first viewing page
// can specify number of movies to view (up to 20 at a time)
function constructTrendingMoviesPage(){
    highlightMovieRecomendationSelection("trending");
    var pageNum = 1;
    document.getElementById('moviesPage').innerHTML = "";
    document.getElementById("p").innerHTML="Currently Trending Movies";
    var movies = getTrendingMovies(pageNum);
    var populatedMovies = 0;
    var index = 0;
    while((populatedMovies < numMovies) && (index < 20)){
        if (!watchedMovies.includes(movies.results[index].id) && (filterFlag=="null"||isMovieOnPlatform(movies.results[index].id, filterFlag))) {
            createCard(movies.results[index], "Streaming Platforms");
            index++;
            populatedMovies++;
            if (index == 19){
                pageNum++;
                movies = getTrendingMovies(pageNum);
                index = 0;
            }
        } 
        else{
            index++;
            if (index == 19){
                pageNum++;
                movies = getTrendingMovies(pageNum);
                index = 0;
            }
        }
    }
    // for (i = 0; i < numMovies; i++){
    //     createCard(movies.results[i], "Streaming Platforms");
    // }
}

// function that constructs movies based on mood from google vision
function constructMoodMoviesPage(){
    document.getElementById("p").innerHTML="Your Movie Recommendations";
    var pageNum = 1;
    var data = getMoodMovies(pageNum);
    
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
    var idx = 0;
    var count = 0;
    //check for release dates?
    clearMovieTiles();
    //var pg = 2;
    while (count < 6) {
        if (idx == 19) {
            idx = 0;
            pageNum++;
            data = getMoodMovies(pageNum);
        }
        var ids = data.results[idx].genre_ids;

        dFlag0 = !watchedMovies.includes(data.results[idx].id);
        dFlag1 = (filterFlag == "null" || filterFlag === undefined || isMovieOnPlatform(data.results[idx].id, filterFlag));
        if (dFlag0 && dFlag1) { //if not marked as seen
            for (i = 0; i < ids.length; i++) {
                var key = data.results[idx].genre_ids[i];
                if (data.results[idx].genre_ids[i] > 0  && genres.indexOf(key) != -1) {
                    //console.log(data.results[idx].genre_ids);
                    createCard(data.results[idx],"Streaming Platforms");
                    count++;
                    break;
                }
            }
        }
        idx++;
    }
}

function getGenreNames(movies) {
	// Create array of genre names for movie
    var genreIds = movies.genre_ids;
    var genreNames = [];
    var i;
    for (i = 0; i < genreIds.length; i++) {
        switch(genreIds[i]) {
            case 28:
                genreNames.push("Action");
                break;
            case 12:
                genreNames.push("Adventure");
                break;
            case 16:
                genreNames.push("Animation");
                break;
            case 35:
                genreNames.push("Comedy");
                break;
            case 80:
                genreNames.push("Crime");
                break;
            case 99:
                genreNames.push("Documentary");
                break;
            case 18:
                genreNames.push("Drama");
                break;
            case 10751:
                genreNames.push("Family");
                break;
            case 14:
                genreNames.push("Fantasy");
                break;
            case 36:
                genreNames.push("History");
                break;
            case 27:
                genreNames.push("Horror");
                break;
            case 10402:
                genreNames.push("Music");
                break;
            case 9648:
                genreNames.push("Mystery");
                break;
            case 10749:
                genreNames.push("Romance");
                break;
            case 878:
                genreNames.push("Science Fiction");
                break;
            case 10770:
                genreNames.push("TV Movie");
                break;
            case 53:
                genreNames.push("Thriller");
                break;
            case 10752:
                genreNames.push("War");
                break;
            case 37:
                genreNames.push("Western");
                break;
        }
    }
    var printGenres = genreNames.join(', ');
	return printGenres;
}

// generic helper function to create a movie card
// pass in JSON.results[index]
// still need to add buttons from Utelly API
function createCard(movies, t1){
	var printGenres = getGenreNames(movies);
    if (!watchedMovies.includes(movies.id)){
    moviesOnPage.push(movies.id);
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
                <h4 style="margin-top: -13px"><small><b>${returnYear(movies)}</b></small></h4>
                <h5 style="margin-top: -10px"><small>Genres: ${printGenres}</small></h5>
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
    // TODO deleter a }
}
// <img style="margin-left: 3px; width: auto; height: 5%; filter: grayscale(100%)" src="resources/tmdb_rating3.svg" alt="">

function clearMovieTiles(){
    document.getElementById("moviesPage").innerHTML="";
    moviesOnPage = [];
}

function markAsSeen(movie_id){
    console.log("Marked movie " + movie_id + " as seen");
    if (!watchedMovies.includes(movie_id)){
        watchedMovies.push(movie_id);
        localStorage.setItem("stored_movies", JSON.stringify(watchedMovies));
    }
    //deleteCard(movie_id);
    clearMovieTiles();
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
    clearMovieTiles();
    constructMoviesPage();
}
// <img style="margin-left: 3px; width: auto; height: 5%; filter: grayscale(100%)" src="resources/tmdb_rating3.svg" alt="">

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
        if (checkServer(movie_id+".json")){
            var utellyData = JSON.parse(getServer(movie_id+".json")).collection;
            //console.log("Retrieving stored Utelly JSON for movie id: " + movie_id);
        }
        else{
            var utellyData = findStreamingPlatform(movie_id).collection;
            //console.log("Movie id: " + movie_id + " Utelly JSON not found")
        }
        //console.log(utellyData.locations.length);
        var numLocations = utellyData.locations.length;
        
        let i;
        if (numLocations == 0) {
          holder = `<medium>No Available Streaming Platforms Currently</medium>`;
        } 
        else {
          for (i = 0; i < numLocations; i++) {
            holder += `<a target="_blank" style="margin-top: 10px; width: 100%;" href="${utellyData.locations[i].url}" button type="button" class="btn btn-secondary btn-sm">${utellyData.locations[i].display_name}</button></a>`;
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
	
	let done = false;
	
    $.ajax(settings).done(function (response) {
        console.log(response);
        dataReturn = response;
		done = true;
    });

	for (;!done;) {}

    // stores json for movie into server to access for filters
    storeServer(movie_id+".json", dataReturn);
    return dataReturn;
}
//var manyFilters = true;
//movies in theaters
function showMoviesInTheaters() {
	filterFlag = "null";
    var data = null;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.themoviedb.org/3/movie/now_playing?api_key=98d74bc028c22b652a8c88965a9ace22&language=en-US&page=1&region=US', false);
    
    xhr.onload = function(){
        data = JSON.parse(xhr.response);
    }
    xhr.send(data);
    //console.log(data);
    theaterFlag = true;
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
    var count = 0;
    //check for release dates?
    document.getElementById("p").innerHTML="Movies in Theater";
    clearMovieTiles();
    var pg = 2;
    while (count < 6) {
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
        if (!watchedMovies.includes(data.results[j].id)) { //if not marked as seen
            for (i = 0; i < ids.length; i++) {
                var key = data.results[j].genre_ids[i];
                if (data.results[j].genre_ids[i] > 0  && genres.indexOf(key) != -1) {
                    console.log(data.results[j].genre_ids);
                    createCard(data.results[j],"See in Theaters!");
                    count++;
                    break;
                }
            }
        }
        j++;
    }
}

function isMovieOnPlatform(movie_id, streamName) {
	if (testUtelly){
		let running = true;
		while (running) {
			if (checkServer(movie_id+".json")){
				var movieInfo = JSON.parse(getServer(movie_id+".json"));
				//console.log("Retrieving stored Utelly JSON for movie id: " + movie_id);
				running = false;
			}
			else{
				try {
					var movieInfo = JSON.parse(findStreamingPlatform(movie_id));
					//console.log("Movie id: " + movie_id + " Utelly JSON not found")
					running = false;
				}
				catch (err) {
					console.log("error");
				}
			}
			
        }
	}
	else{
		return true;
	}
	var i;
	var isOnPlatform = false;
	for (i = 0; i < movieInfo.collection.locations.length; i++) {
		if(movieInfo.collection.locations[i].display_name ==  streamName) {
			isOnPlatform = true;
		}
	}
	return isOnPlatform;
}

function clearFilters() {
	filterFlag = "null";
    theaterFlag = false;
	document.getElementById("moviesPage").innerHTML="";
    constructMoviesPage();
}

function showMoviesOnNetflix() {
	filterFlag = "Netflix";
    theaterFlag = false;
	document.getElementById("moviesPage").innerHTML="";
    constructMoviesPage();
}

function showMoviesOnAmazon() {
	filterFlag = "Amazon Instant Video";
    theaterFlag = false;
	document.getElementById("moviesPage").innerHTML="";
    constructMoviesPage();
}

function showMoviesOnItunes() {
	filterFlag = "iTunes";
    theaterFlag = false;
	document.getElementById("moviesPage").innerHTML="";
    constructMoviesPage();
}

function showMoviesOnGooglePlay() {
	filterFlag = "Google Play";
    theaterFlag = false;
	document.getElementById("moviesPage").innerHTML="";
    constructMoviesPage();
}

function highlightMovieRecomendationSelection(type) {
    var bTrending = $("#trendingButton").removeClass("btn-warning").addClass("btn-secondary").css({"color" : "white"});
    var brecommend = $("#recommendedButton").removeClass("btn-warning").addClass("btn-secondary").css({"color" : "white"});
    var bwatched = $("#watchedButton").removeClass("btn-warning").addClass("btn-secondary").css({"color" : "white"});
    
    
    
    switch (type) {
        case "trending":
            var bTrending = $("#trendingButton").removeClass("btn-secondary").addClass("btn-warning").css({"color" : "black"});
            break;
        case "recommend":
            var brecommend = $("#recommendedButton").removeClass("btn-secondary").addClass("btn-warning").css({"color" : "black"});
            break;
        case "watch":
            var bwatched = $("#watchedButton").removeClass("btn-secondary").addClass("btn-warning").css({"color" : "black"});
            break;
        default:
            break;
    }
}