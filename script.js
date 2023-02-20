const root = document.querySelector(':root');
const logo = document.querySelector('header div img');
const themeBtn = document.querySelector('.btn-theme');
const previousBtn = document.querySelector('.btn-prev');
const nextBtn = document.querySelector('.btn-next');
const input = document.querySelector('.input');
const movies = document.querySelector('.movies');
const modal = document.querySelector('.modal');
const closeBtn = document.querySelector('.modal__close');
let currentPage = 0;
let movieList = [[], [], []];

pickTheme();
spawnMovies();
startCarousel();
highlightMovie(436969);


themeBtn.addEventListener('click', changeTheme);

closeBtn.addEventListener('click', () => {
    modal.classList.toggle("hidden");
})

previousBtn.addEventListener('click', () => {
    changeMovies('left');
})

nextBtn.addEventListener('click', () => {
    changeMovies('right');
})

input.addEventListener('keydown', (event) => {  
    if (event.key != 'Enter' && event.key != 'NumpadEnter') return;
    currentPage = 0;
    if (input.value) {
        startCarousel(`${input.value}`);
        input.value = "";
    } else {
        startCarousel();
    }

})

movies.addEventListener('click', async (event) => {
    const modalMovie = await fetchMovie(event.target.id);
    showModal(modalMovie);
})

function pickTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        root.style.setProperty('--background', '#1B2028');
        root.style.setProperty('--bg-secondary', '#2D3440');
        root.style.setProperty('--text-color', '#FFFFFF');
        root.style.setProperty('--input-color', '#665F5F');
        root.style.setProperty('--input-border', '#665F5F');
        root.style.setProperty('--input-bg', '#3E434D');
        root.style.setProperty('--bg-modal', '#2D3440');
        logo.src= './assets/logo.svg';
        themeBtn.src = './assets/dark-mode.svg';
        previousBtn.src = './assets/arrow-left-light.svg';
        nextBtn.src = './assets/arrow-right-light.svg';
        closeBtn.src = './assets/close.svg'
    } else {
        root.style.setProperty('--background', '#fff');
        root.style.setProperty('--bg-secondary', '#ededed');
        root.style.setProperty('--text-color', '#1b2028');
        root.style.setProperty('--input-color', '#979797');
        root.style.setProperty('--input-bg', '#fff');
        root.style.setProperty('--bg-modal', '#ededed');
        logo.src= './assets/logo-dark.png';
        themeBtn.src = './assets/light-mode.svg';
        previousBtn.src = './assets/arrow-left-dark.svg';
        nextBtn.src = './assets/arrow-right-dark.svg';
        closeBtn.src = './assets/close-dark.svg'
    }
}

function changeTheme() {
    let theme = localStorage.getItem('theme');
    if (!theme || theme === 'light' ? theme = 'dark' : theme = 'light');
    localStorage.setItem('theme', theme);
    pickTheme();
}

function spawnMovies() {
    for (let i = 0; i < 6; i++){
        const newMovie = document.createElement('div');
        const info = document.createElement('div');
        const title = document.createElement('span');
        const rating = document.createElement('span');
        const star = document.createElement('img');
        newMovie.classList = 'movie';
        info.classList = 'movie__info';
        title.classList = 'movie__title';
        rating.classList = 'movie__rating';
        star.src = './assets/rating.svg';
    
        newMovie.appendChild(info);
        info.appendChild(title);
        info.appendChild(rating);
        rating.appendChild(star);
        movies.appendChild(newMovie);
    }
}

function changeMovies(direction) {
    const displayed = document.querySelectorAll('.movie');
    
    if (direction === 'right') (currentPage === 2 ? currentPage = 0 : currentPage++);
    else if (direction === 'left') (currentPage === 0 ? currentPage = 2 : currentPage--);
    const moviesToSpawn = movieList[currentPage];

    for (let i = 0; i < moviesToSpawn.length; i++){
        const newMovie = moviesToSpawn[i];
        const movie = displayed[i];
        
        const title = movie.querySelector(`.movie__title`);
        const rating = movie.querySelector(`.movie__rating`);
        
        movie.id = newMovie.id;
        movie.style.backgroundImage = `url(${newMovie.poster_path})`;
        title.innerHTML = newMovie.title;
        rating.innerHTML = `${newMovie.vote_average.toFixed(1)} <img src="./assets/rating.svg">`;
    }
}

async function getMovies(query) {
    movieList = [[], [], []];
    let response;
    
    if (!query) response = await api.get('/3/discover/movie?language=pt-BR&include_adult=false'); 
    else response = await api.get(`/3/search/movie?language=pt-BR&include_adult=false&query=${query}`);

    for (let i = 0; i < 18; i++){
        if (i < 6) movieList[0].push(response.data.results[i]);
        else if (i < 12) movieList[1].push(response.data.results[i]);
        else movieList[2].push(response.data.results[i]);
    }
}

async function startCarousel(query) {
    if (!query ? await getMovies(false) : await getMovies(query));
    changeMovies();
}

async function highlightMovie(id) {
    const response = await fetchMovie(id);
    const video = await api.get('/3/movie/436969/videos?language=pt-BR');
    let genres = [];
    let release = response.release_date.split('-');
    for (genre of response.genres) genres.push(genre.name);

    const highlightLink = document.querySelector('.highlight__video-link');
    const highlightVideo = document.querySelector('.highlight__video');
    const highlightTitle = document.querySelector('.highlight__title');
    const highlightRating = document.querySelector('.highlight__rating');
    const highlightGenre = document.querySelector('.highlight__genres');
    const highlightLaunch = document.querySelector('.highlight__launch');
    const highlightDescription = document.querySelector('.highlight__description');    

    highlightLink.href = `https://www.youtube.com/watch?v=${video.data.results[1].key}`; // trailer fica no 1, instruções mandam pegar o 0
    highlightVideo.style.backgroundImage = `url('${response.backdrop_path}')`;
    highlightTitle.innerHTML = `${response.title}`;
    highlightRating.innerHTML = `${response.vote_average.toFixed(1)}`;
    highlightLaunch.innerHTML = `${release[2]}.${release[1]}.${release[0]}`;
    highlightDescription.innerHTML = `${response.overview}`;
    highlightGenre.innerHTML = `${genres.join(', ')}`;
}

async function fetchMovie(id) {
    const response = await api.get(`/3/movie/${id}?language=pt-BR`);
    return response.data;
}

function showModal(movie){
    const title = document.querySelector('.modal__title');
    const img = document.querySelector('.modal__img');
    const description = document.querySelector('.modal__description');
    const average = document.querySelector('.modal__average');
    const genres = document.querySelector('.modal__genres');
    const oldGenres = document.querySelectorAll('.modal__genre');

    for (g of oldGenres) g.remove();
    for (g of movie.genres) {
        const newGenre = document.createElement('span');
        newGenre.classList = 'modal__genre';
        newGenre.innerHTML = g.name;
        genres.appendChild(newGenre);
    }
    

    title.innerHTML = movie.title;
    img.src = movie.backdrop_path;
    description.innerHTML = movie.overview;
    average.innerHTML = movie.vote_average.toFixed(1);


    modal.classList.toggle("hidden");
}

