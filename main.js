// menu
const leftMenu = document.querySelector('.left-menu'),
 hamburger = document.querySelector('.hamburger'),
 tvShowList = document.querySelector('.tv-shows__list'),
 modal = document.querySelector('.modal'),
 tvShows = document.querySelector('.tv-shows'),
 tvCardImg = document.querySelector('.tv-card__img'),
 modalTitle = document.querySelector('.modal__title'),
 genresList = document.querySelector('.genres-list'),
 rating = document.querySelector('.rating'),
 description = document.querySelector('.description'),
 modalLink = document.querySelector('.modal__link'),
 searchForm = document.querySelector('.search__form'),
 preloader = document.querySelector('.preloader'),
 searchFormInput = document.querySelector('.search__form-input'),
 dropdown = document.querySelectorAll('.dropdown'),
 tvShowsHead = document.querySelector('.tv-shows__head')
 posterWrapper = document.querySelector('.poster__wrapper'),
 modalContent = document.querySelector('.modal__content'),
 pagination = document.querySelector('.pagination');

const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';

const loading = document.createElement('div');
loading.className = 'loading';

const DBService = class {

  constructor() {
    this.SERVER = 'https://api.themoviedb.org/3';
    this.API_KEY_3 = '455bf3bcb765b8b07f0bb4d2877f0533';
  }
  getData = async (url) => {
    const res = await fetch(url);
    if (res.ok) {
      return res.json();
    } else {
      throw new Error(`error url ${url}, no data`);
    }
  };

  getTestData = () => {
    return this.getData('test.json');
  };

  getTestCard = () => {
    return this.getData('card.json');
  };

  getSearchResult = query => {
    this.temp = `${this.SERVER}/search/tv?api_key=${this.API_KEY_3}&query=${query}&language=en-US`;
    return this.getData(this.temp);
  }

  getNextPage = page => {
    return this.getData(this.temp + '&page=' + page);
  }

  getTvShow = id => {
    return this.getData(`${this.SERVER}/tv/${id}?api_key=${this.API_KEY_3}&language=en-US`);
  }

  getTopRated = () => this.getData(`${this.SERVER}/tv/top_rated?api_key=${this.API_KEY_3}&language=en-US`);

  getPopular = () => this.getData(`${this.SERVER}/tv/popular?api_key=${this.API_KEY_3}&language=en-US`);

  getToday = () => this.getData(`${this.SERVER}/tv/airing_today?api_key=${this.API_KEY_3}&language=en-US`);

  getWeek = () => this.getData(`${this.SERVER}/tv/on_the_air?api_key=${this.API_KEY_3}&language=en-US`);
};

const dbService = new DBService;

const renderCard = (response, target) => {
  tvShowList.textContent = '';

  if(!response.total_results) {
    loading.remove();
    tvShowsHead.textContent = 'No results..';
    tvShowsHead.style.cssText = 'color: red';
    return;
  }

  tvShowsHead.textContent = target ? target.textContent : 'Search result';
  tvShowsHead.style.cssText = 'color: black';

  response.results.forEach((item) => {
    const {
        backdrop_path: backdrop,
        name: title,
        poster_path: poster,
        vote_average: vote,
        id
    } = item;  

    const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
    const backdropIMG = backdrop ? IMG_URL + backdrop : '';
    const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

    const card = document.createElement("li");
    card.idTV = id;
    card.className = "tv-shows__item";
    card.innerHTML = `
        <a href="#" id="${id}" class="tv-card">
            ${voteElem}
            <img class="tv-card__img"
                src="${posterIMG}"
                data-backdrop="${backdropIMG}"
                alt="Эвоки">
            <h4 class="tv-card__head">${title}</h4>
        </a>`;
    loading.remove();
    tvShowList.append(card);
  });

  pagination.textContent = '';

  if(!target && response.total_pages > 1){
    for(let i = 1; i <= response.total_pages; i++) {
      pagination.innerHTML += `<li><a href="#" class="pages">${i}</a></li>`;
    }
  }
};

searchForm.addEventListener('submit', event => {

  event.preventDefault();

  const value = searchFormInput.value.trim();
  if(value) {
    dbService.getSearchResult(value).then(renderCard);
  }
  searchFormInput.value = '';
});

{
  tvShows.append(loading);
  dbService.getTestData().then(renderCard);
}

// handle menu

const closeDropDown = () => {
  dropdown.forEach( item => {
    item.classList.remove('active');
  })
}

hamburger.addEventListener('click', () => {
  leftMenu.classList.toggle('openMenu');
  hamburger.classList.toggle('open');
  closeDropDown();
});

document.body.addEventListener('click', (event) => {
  if (!event.target.closest('.left-menu')) {
    leftMenu.classList.remove('openMenu');
    hamburger.classList.remove('open');
    closeDropDown();
  }
});

leftMenu.addEventListener('click', (event) => {
  event.preventDefault();
  const target = event.target;
  const dropdown = target.closest('.dropdown');
  if (dropdown) {
    dropdown.classList.toggle('active');
    leftMenu.classList.add('openMenu');
    hamburger.classList.add('open');
  }

  if(target.closest('#top-rated')) {
    tvShows.append(loading);
    dbService.getTopRated().then((response) => renderCard(response, target));
  }

  if(target.closest('#popular')) {
    tvShows.append(loading);
    dbService.getPopular().then((response) => renderCard(response, target));
  }

  if(target.closest('#week')) {
    tvShows.append(loading);
    dbService.getWeek().then((response) => renderCard(response, target));
  }

  if(target.closest('#today')) {
    tvShows.append(loading);
    dbService.getToday().then((response) => renderCard(response, target));
  }

  if(target.closest('#search')) {
    tvShowList.textContent = '';
    tvShowsHead.textContent = '';
  }

});

// open modal
tvShowList.addEventListener('click', (event) => {

  event.preventDefault();

  const target = event.target;
  const card = target.closest('.tv-card');

  if (card) {

    preloader.style.display = 'block';

    dbService.getTvShow(card.id)
        .then(({
            poster_path: posterPath,
            name: title,
            genres, 
            vote_average: voteAverage,
            homepage,
            overview 
        }) => {

          if(posterPath){
            tvCardImg.src = IMG_URL + posterPath;
            tvCardImg.alt = title;
            posterWrapper.style.display = '';
            modalContent.style.paddingLeft = '';
          } else {
            posterWrapper.style.display = 'none';
            modalContent.style.paddingLeft = '25px';
          }
          modalTitle.textContent = title;
          genres.forEach( item => {
            genresList.innerHTML += `<li>${item.name}</li>`;
          })
          rating.textContent = voteAverage;
          description.textContent = overview;
          modalLink.href = homepage;

        })
        .then(() => {
            document.body.style.overflow = 'hidden';
            modal.classList.remove('hide');
        })
        .finally(() => {
          preloader.style.display = '';
        })

    document.body.style.overflow = 'hidden';
    modal.classList.remove('hide');
  }
});

// close modal
modal.addEventListener('click', (event) => {
  if (
    event.target.closest('.cross') ||
    event.target.classList.contains('modal')
  ) {
    document.body.style.overflow = '';
    modal.classList.add('hide');
  }
});

// replace card on hover
const changeImage = (event) => {
  const card = event.target.closest('.tv-shows__item');
  if (card) {
    const img = card.querySelector('.tv-card__img');
    if (img.dataset.backdrop) {
      [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
    }
  }
};
tvShowList.addEventListener('mouseover', changeImage);
tvShowList.addEventListener('mouseout', changeImage);

pagination.addEventListener('click', event => {
  event.preventDefault();
  const target = event.target;
  if(target.classList.contains('pages')) {
    tvShows.append(loading);
    dbService.getNextPage(target.textContent).then(renderCard);
  }
})