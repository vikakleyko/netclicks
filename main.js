// menu
const leftMenu = document.querySelector(".left-menu"),
 hamburger = document.querySelector(".hamburger"),
 tvShowList = document.querySelector(".tv-shows__list"),
 modal = document.querySelector(".modal"),
 tvShows = document.querySelector('.tv-shows'),
 tvCardImg = document.querySelector('.tv-card__img'),
 modalTitle = document.querySelector('.modal__title'),
 genresList = document.querySelector('.genres-list'),
 rating = document.querySelector('.rating'),
 description = document.querySelector('.description'),
 modalLink = document.querySelector('.modal__link'),
 searchForm = document.querySelector('.search__form'),
 searchFormInput = document.querySelector('.search__form-input');


const IMG_URL = "https://image.tmdb.org/t/p/w185_and_h278_bestv2";
const API_KEY_3 = '455bf3bcb765b8b07f0bb4d2877f0533';
const SERVER = 'https://api.themoviedb.org/3';

const loading = document.createElement('div');
loading.className = 'loading';

const DBService = class {
  getData = async (url) => {
    const res = await fetch(url);
    if (res.ok) {
      return res.json();
    } else {
      throw new Error(`error url ${url}, no data`);
    }
  };
  // fetch(`${url}/discover/movie?api_key=${key}&sort_by=${this.state.sort_by}&page=${this.state.page}`)

  getTestData = () => {
    return this.getData("test.json");
  };

  getTestCard = () => {
    return this.getData("card.json");
  };

  getSearchResult = query => {
    return this.getData(`${SERVER}/search/tv?api_key=${API_KEY_3}&query=${query}&language=en-US`);
  }

  getTvShow = id => {
    return this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY_3}&language=en-US`)
  }
};

new DBService().getSearchResult('Star');

const renderCard = (response) => {
  tvShowList.textContent = "";

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
};

searchForm.addEventListener('submit', event => {

  event.preventDefault();

  const value = searchFormInput.value.trim();
  if(value) {
    tvShows.append(loading);
    new DBService().getSearchResult(value).then(renderCard);
  }
  searchFormInput.value = '';
});

{
  tvShows.append(loading);
  new DBService().getTestData().then(renderCard);
}



// handle menu
hamburger.addEventListener("click", () => {
  leftMenu.classList.toggle("openMenu");
  hamburger.classList.toggle("open");
});

document.body.addEventListener("click", (event) => {
  // console.log(!!event.target.closest('.left-menu'));

  if (!event.target.closest(".left-menu")) {
    console.log("click outside menu");
    leftMenu.classList.remove("openMenu");
    hamburger.classList.remove("open");
  }
});

leftMenu.addEventListener("click", (event) => {
  event.preventDefault();
  const target = event.target;
  const dropdown = target.closest(".dropdown");
  if (dropdown) {
    dropdown.classList.toggle("active");
    leftMenu.classList.add("openMenu");
    hamburger.classList.add("open");
  }
});

// open modal
tvShowList.addEventListener("click", (event) => {

  event.preventDefault();

  const target = event.target;
  const card = target.closest(".tv-card");

  if (card) {
    new DBService().getTvShow(card.id)
        .then(({
            poster_path: posterPath,
            name: title,
            genres, 
            vote_average: voteAverage,
            homepage,
            overview 
        }) => {
          tvCardImg.src = IMG_URL + posterPath;
          modalTitle.textContent = title;
          tvCardImg.alt = title;
          // genresList.innerHTML = data.genres.reduce((acc, item) => { 
          // `${acc}<li>${item.name}</li>`
          // }, '');

          genres.forEach( item => {
            genresList.innerHTML += `<li>${item.name}</li>`;
          })

          // genresList.textContent = '';
          // for(const item of data.genres) {
          //   genresList.innerHTML += genresList.innerHTML + `<li>${item.name}</li>`;
          // }
          rating.textContent = voteAverage;
          description.textContent = overview;
          modalLink.href = homepage;

        }).then(() => {
            document.body.style.overflow = 'hidden';
            modal.classList.remove('hide');
        })

    document.body.style.overflow = "hidden";
    modal.classList.remove("hide");
  }
});

// close modal
modal.addEventListener("click", (event) => {
  if (
    event.target.closest(".cross") ||
    event.target.classList.contains("modal")
  ) {
    document.body.style.overflow = "";
    modal.classList.add("hide");
  }
});

// replace card on hover
const changeImage = (event) => {
  const card = event.target.closest(".tv-shows__item");
  // console.log(card);
  if (card) {
    const img = card.querySelector(".tv-card__img");
    if (img.dataset.backdrop) {
      [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
    }
  }
};
tvShowList.addEventListener("mouseover", changeImage);
tvShowList.addEventListener("mouseout", changeImage);