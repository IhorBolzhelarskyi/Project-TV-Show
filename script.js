"use strict";
const episodeState = {
  allShows: [],
  allCast: {},
  allEpisodes: {},
  searchEpisodes: "",
  switcher: true,
};

const selectShow = document.getElementById("showSelector");
const selectEpisode = document.getElementById("episodeSelector");
const loadingImg = document.querySelector(`#loadingImg`);
const errorMessage = document.querySelector(`#errorMessage`);
const mainDiv = document.getElementById("mainDiv");
const episodesFound = document.getElementById("episodesFound");
const searchBox = document.getElementById("searchbar");
const footer = document.querySelector(`#footer`);
const header = document.querySelector(`#search`);
const selectSortShow = document.querySelector(`#sortShows`);
const webSiteTitle = document.querySelector(`#webSiteTitle`);

//---------fetching shows from the API---------
const fetchShows = async function () {
  try {
    loadingImg.classList.add(`loading`);
    errorMessage.classList.remove(`errorM`);
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) {
      throw new Error(`Error :${response.status}`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    header.style.display = `none`;
    mainDiv.style.display = `none`;
    footer.style.display = `none`;

    errorMessage.textContent = error.message;
  }
};
async function updateShows() {
  const data = await fetchShows();
  // data.sort((a, b) => a.name.localeCompare(b.name));
  const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));
  episodeState.allShows = sortedData;
  populateShowSelector(episodeState.allShows);
  loadingImg.classList.remove(`loading`);
  renderShows([...episodeState.allShows].sort((a, b) => b.name.localeCompare(a.name)));
}
updateShows();
// fetching cast data from API
async function fetchCast(id) {
  try {
    const response = await fetch(`http://api.tvmaze.com/shows/${id}?embed=cast`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    errorMessage.textContent = error.message;
  }
}
// saving data from API in object episodeState.allCast
async function updatingCastForShows(id) {
  const castData = await fetchCast(id);
  episodeState.allCast[id] = castData;
  renderCastForShows(id);
  // console.log(episodeState.allCast);
}
function renderCastForShows(id) {
  const castList = document.querySelector(`#cast${id}`);
  const castArray = episodeState.allCast[id]?._embedded?.cast;
  const seenName = new Set();
  castArray.forEach((actor) => {
    if (!seenName.has(actor.person.name)) {
      seenName.add(actor.person.name);
      const nameOfActor = document.createElement(`p`);
      nameOfActor.textContent = actor.person.name;
      castList.appendChild(nameOfActor);
    }
  });
}
// ---------//

// fetching episodes of the selected show from the API
const fetchEpisodes = async function (id) {
  const showUrl = `https://api.tvmaze.com/shows/${id}/episodes`;
  try {
    loadingImg.classList.add(`loading`);
    errorMessage.classList.remove(`errorM`);
    const response = await fetch(showUrl);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Error :${response.status}`);
    }
    return data;
  } catch (error) {
    header.style.display = `none`;
    mainDiv.style.display = `none`;
    footer.style.display = `none`;
    errorMessage.textContent = error.message;
  }
};
// updating episodeState.allEpisodes with data from API and rendering the episodes
function updatingAllEpisodesList(id) {
  fetchEpisodes(id).then((data) => {
    //add received list of episodes to the state
    episodeState.allEpisodes[id] = data;
    loadingImg.classList.remove(`loading`);
    //now we have list of episodes, so we can render them

    renderEpisodes(id);
  });
}

// add options to episodeSelector
function populateEpisodeSelector(episodes) {
  episodes.forEach((episode) => {
    const option = document.createElement(`option`);
    const seasons = episode.season.toString().padStart(2, `0`);
    const episodes = episode.number.toString().padStart(2, `0`);
    option.textContent = `S${seasons}E${episodes} - ${episode.name}`;
    // Add id as a value for the callback function handling the onChange event
    option.value = `#${episode.id}`;
    selectEpisode.appendChild(option);
  });
}

// add options to showSelector
function populateShowSelector(shows) {
  const allShowsSelector = document.createElement(`option`);
  allShowsSelector.textContent = `All Shows`;
  allShowsSelector.value = 111111;
  selectShow.prepend(allShowsSelector);
  shows.forEach((show) => {
    const option = document.createElement(`option`);
    option.textContent = show.name;
    option.value = show.id;
    selectShow.appendChild(option);
  });
}

//rendering shows
function showShows(shows) {
  mainDiv.innerHTML = ``;
  mainDiv.className = `mainDivShows-view`;
  shows.forEach((show) => {
    const html = `<section class="shows">
        <div class="divShowsTitle"><h1 class="showsTitle cursorPointer" data-id="${show.id}">${show.name}</h1></div>
        <div class="showsContent">
        <div class="showsSummary">
          <img class="showsImg cursorPointer" data-id="${show.id}" src="${show.image.medium}" />
          <div class="summaryText" id="summary${show.id}">${show.summary}</div>
        </div>
        <div class="showsStatus">
          <h3 class="showsRating">
            Rated<span class="ratingSpan">: ${show.rating.average ?? `-`}</span>
          </h3>
           <h3 class="showsRating">
             Genres<span class="ratingSpan">: ${show.genres.join(` | `) || `-`}</span>
           </h3>
          <h3 class="showsRating">
            Status<span class="ratingSpan">: ${show.status}</span>
          </h3>
          <h3 class="showsRating">
            Runtime<span class="ratingSpan">: ${show.runtime || `-`}</span>
          </h3>
          <h3 class="showsRatingCast showsRating cursorPointer" data-id="${show.id}" >
            list of actors ➜
          </h3>
          <div id=cast${show.id} class="listOfCast hide"></div>
        </div>  
        </div>
      </section>`;
    mainDiv.insertAdjacentHTML(`afterbegin`, html);
  });
  const titles = document.querySelectorAll(`.showsTitle`);
  const imgs = document.querySelectorAll(`.showsImg`);
  const listOfCast = document.querySelectorAll(`.showsRatingCast`);
  const summaryDivs = document.querySelectorAll(`.summaryText`);
  //replacing multiple p elements in summary into one p
  summaryDivs.forEach((div) => {
    const allP = div.querySelectorAll(`p`);
    const combinedP = [...allP].map((p) => p.textContent).join(` `);
    allP.forEach((p) => p.remove());
    const newP = document.createElement(`p`);
    newP.textContent = combinedP;
    //creating span read more for each summary
    newP.className = `summaryShow`;
    const span = document.createElement(`span`);
    span.textContent = `...read more`;
    span.className = `readMore`;
    div.append(newP, span);
    const lineHeight = parseFloat(getComputedStyle(newP).lineHeight);
    const maxLines = 3;
    const maxHeight = lineHeight * maxLines;
    if (newP.scrollHeight > maxHeight) {
      newP.classList.add("truncate");
      span.style.display = "inline";
      span.addEventListener(`click`, () => {
        newP.classList.toggle("expanded");
        span.textContent = newP.classList.contains("expanded") ? "collapse" : "... read more";
      });
    }
  });
  const clickOnShow = (e) => {
    const selectedShowId = e.target.dataset.id;
    episodeState.switcher = false;
    mainDiv.innerHTML = ``;
    selectShow.value = selectedShowId;

    if (Object.keys(episodeState.allEpisodes).includes(selectedShowId)) {
      renderEpisodes(selectedShowId);
    } else {
      updatingAllEpisodesList(selectedShowId);
    }
    episodeState.searchEpisodes = "";
    searchBox.value = "";
  };
  titles.forEach((title) => {
    title.addEventListener(`click`, clickOnShow);
  });
  imgs.forEach((img) => {
    img.addEventListener(`click`, clickOnShow);
  });
  listOfCast.forEach((cast) => {
    cast.addEventListener(`click`, (e) => {
      const castId = e.target.dataset.id;
      const div = document.querySelector(`#cast${castId}`);
      div.innerHTML = "";
      if (Object.keys(episodeState.allCast).includes(castId)) {
        renderCastForShows(castId);
      } else {
        updatingCastForShows(castId);
      }
      div.classList.toggle(`hide`);
      div.classList.toggle(`show`);
    });
  });
}

function renderShows(shows) {
  selectSortShow.classList.remove(`hideFilter`);
  selectEpisode.style.display = `none`;
  episodeState.switcher = true;
  const formattedSearchTerm = episodeState.searchEpisodes.toLocaleLowerCase();
  const filteredShows = shows.filter((show) => {
    const genresString = show.genres.join(" ").toLowerCase();
    return (
      show.name.toLowerCase().includes(formattedSearchTerm) ||
      genresString.toLowerCase().includes(formattedSearchTerm) ||
      show.summary.toLocaleLowerCase().includes(formattedSearchTerm)
    );
  });
  showShows(filteredShows);
  episodesFound.textContent = `found ${filteredShows.length} shows`;
}

//rendering episodes
function showEpisodes(episodes) {
  mainDiv.className = `mainDivEpisodes-view`;
  episodes.forEach((episode) => {
    //creating div for each episodes
    const divEpisodes = document.createElement(`section`);
    divEpisodes.classList.add(`divEpisodes`);
    divEpisodes.setAttribute("id", `${episode.id}`);
    mainDiv.appendChild(divEpisodes);
    // rendering title
    const name = document.createElement(`h1`);
    const seasons = episode.season.toString().padStart(2, `0`);
    const episodes = episode.number.toString().padStart(2, `0`);
    name.textContent = `${episode.name} - S${seasons}E${episodes}`;
    divEpisodes.appendChild(name);
    //rendering img

    const image = document.createElement(`img`);

    image.src =
      episode.image?.medium ??
      `data:image/png;base64,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`;
    divEpisodes.appendChild(image);

    //rendering summary text
    divEpisodes.innerHTML += episode.summary ?? `No description`;
  });
}

function renderEpisodes(id) {
  if (!episodeState.allEpisodes) {
    return;
  }
  selectSortShow.selectedIndex = 0;
  selectSortShow.classList.add(`hideFilter`);
  selectEpisode.style.display = `inline`;
  episodeState.switcher = false;
  const formattedSearchTerm = episodeState.searchEpisodes.toLowerCase();
  // filter the episodes of the selected show
  const filteredFilms = episodeState.allEpisodes[id].filter((film) => {
    if (film.summary === null) {
      return film.name.toLowerCase().includes(formattedSearchTerm);
    } else {
      return (
        film.name.toLowerCase().includes(formattedSearchTerm) ||
        film?.summary
          .toLowerCase()
          .replace(/<\/?p>|<br\s*\/?>/g, "")
          .includes(formattedSearchTerm)
      );
    }
  });

  if (filteredFilms.length === 0) {
    mainDiv.textContent = "";
    episodesFound.textContent = "No films found.";
    return;
  }
  // clear previous result
  mainDiv.textContent = "";
  episodesFound.textContent = "";
  selectEpisode.innerHTML = "";
  populateEpisodeSelector(episodeState.allEpisodes[id]);
  showEpisodes(filteredFilms);
  episodesFound.textContent = `Displaying ${filteredFilms.length}/${episodeState.allEpisodes[id].length} episodes`;
}

searchBox.addEventListener("input", handleSearchInput);

function handleSearchInput(event) {
  episodeState.searchEpisodes = event.target.value.trim();
  if (!episodeState.switcher) {
    renderEpisodes(selectShow.value);
  } else {
    sortSwitcher();
  }
}

selectShow.addEventListener("change", handleShowSelect);

function handleShowSelect(event) {
  const selectedShowId = event.target.value;
  episodeState.searchEpisodes = "";
  searchBox.value = "";
  if (selectedShowId === `111111`) {
    selectSortShow.value = "up";
    renderShows([...episodeState.allShows].sort((a, b) => b.name.localeCompare(a.name)));
  } else {
    if (Object.keys(episodeState.allEpisodes).includes(selectedShowId)) {
      //check if already we have the list of episodes of the selected show, and if no - fetch them
      renderEpisodes(selectedShowId);
    } else {
      updatingAllEpisodesList(selectedShowId);
    }
  }
}
//filter shows
selectSortShow.addEventListener(`change`, sortSwitcher);

function sortSwitcher() {
  const selectorValue = selectSortShow.value;
  switch (selectorValue) {
    case "up":
      const sortedAz = [...episodeState.allShows].sort((a, b) => b.name.localeCompare(a.name));
      renderShows(sortedAz);
      break;
    case "down":
      const sortedZa = [...episodeState.allShows].sort((a, b) => a.name.localeCompare(b.name));
      renderShows(sortedZa);
      break;
    case "ratingUp":
      const sortedRatingUp = [...episodeState.allShows].sort((a, b) => a.rating.average - b.rating.average);
      renderShows(sortedRatingUp);
      break;
    case "ratingDown":
      const sortedRatingDown = [...episodeState.allShows].sort((a, b) => b.rating.average - a.rating.average);
      renderShows(sortedRatingDown);
  }
}

//Back to main page functionality
webSiteTitle.addEventListener(`click`, () => {
  selectSortShow.value = "up";
  episodeState.searchEpisodes = "";
  searchBox.value = "";
  const sortedAz = [...episodeState.allShows].sort((a, b) => b.name.localeCompare(a.name));
  renderShows(sortedAz);
});
