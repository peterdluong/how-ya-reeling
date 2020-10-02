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

function getTrendingMovies(){
    var data = null;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.themoviedb.org/3/trending/movie/week?api_key=98d74bc028c22b652a8c88965a9ace22', false);
    
    xhr.onload = function(){
        data = JSON.parse(xhr.response);
    }
    
    xhr.send(data);
    //console.log(data);
    return data;
}

function getTrendingMovieIMG(movie_num){
    var URL = getTrendingMovies().results[movie_num].poster_path;
    return "http://image.tmdb.org/t/p/original"+URL;
}

function getTrendingMovieTitle(movie_num){
    return getTrendingMovies().results[movie_num].title;
}

function getTrendingMovieID(movie_num){
    return getTrendingMovies().results[movie_num].id;
}

function constructTrendingMoviesPage(){
    var movies = getTrendingMovies();
    var rows = 5;
    const container = document.getElementById('moviesPage');
    for (i = 0; i < 3*rows; i++){
        const card = document.createElement('div');
        const holder = `<div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
                <a href="#">
                    <img class="card-img-top movie_card" src="${getTrendingMovieIMG(i)}" alt="">
                </a>
                <div class="card-body">
                    <h4 class="card-title">
                        <a href="#">${movies.results[i].title}</script></a>
                    </h4>
                    <a href="https://www.netflix.com/search?q=avengers%20endgame" button type="button" class="btn btn-danger btn-sm">Netflix</button>
                    </a>
                </div>
                <div class="card-footer">
                    <small class="text-muted">&#9733; &#9733; &#9733; &#9733; &#9733;</small>
                </div>
            </div>
        </div>`
        container.innerHTML += holder;
    }
}

function createCard(movies){
    const container = document.getElementById('moviesPage');
    const card = document.createElement('div');
    const holder = `<div class="col-lg-4 col-md-6 mb-4">
        <div class="card h-100">
            <a href="#">
                <img class="card-img-top movie_card" src="${getTrendingMovieIMG(i)}" alt="">
            </a>
            <div class="card-body">
                <h4 class="card-title">
                    <a href="#">${movies.results[i].title}</script></a>
                </h4>
                <a href="https://www.netflix.com/search?q=avengers%20endgame" button type="button" class="btn btn-danger btn-sm">Netflix</button>
                </a>
            </div>
            <div class="card-footer">
                <small class="text-muted">&#9733; &#9733; &#9733; &#9733; &#9733;</small>
            </div>
        </div>
    </div>`
    container.innerHTML += holder;
}

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
 
    xhr.open("GET", "https://utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com/idlookup?country=US&source_id="+"454626"+"&source=tmdb");
    xhr.setRequestHeader("x-rapidapi-host", "utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com");
    xhr.setRequestHeader("x-rapidapi-key", "13521bddf5mshd6c32570b973587p160028jsnc3ebb0ee1dae");
 
    xhr.onload = function(){
        data = JSON.parse(xhr.response);

    }

    xhr.send(data);
}
*/