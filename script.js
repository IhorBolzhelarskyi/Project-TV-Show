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
  console.log(episodeState.allShows);
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
  console.log(castList);
  // console.log(castList);
  const castArray = episodeState.allCast[id]?._embedded?.cast;
  console.log(castArray);
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
        <div><h1 class="showsTitle cursorPointer" data-id="${show.id}">${show.name}</h1></div>
        <div class="showsContent">
        <div class="showsSummary">
          <img class="showsImg cursorPointer" data-id="${show.id}" src="${show.image.medium}" />
          ${show.summary}
        </div>
        <div class="showsStatus">
          <h3 class="showsRating">
            Rated<span>: ${show.rating.average}</span>
          </h3>
           <h3 class="showsRating">
             Genres<span>: ${show.genres.join(` | `)}</span>
           </h3>
          <h3 class="showsRating">
            Status<span>: ${show.status}</span>
          </h3>
          <h3 class="showsRating">
            Runtime<span>: ${show.runtime}</span>
          </h3>
          <h3 class="showsRatingCast cursorPointer" data-id="${show.id}" >
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
      console.log(div);
      div.classList.toggle(`hide`);
      div.classList.toggle(`show`);
    });
  });
}

function renderShows(shows) {
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
    if (episode.image) {
      image.src = episode.image.medium;
      divEpisodes.appendChild(image);
    }

    //rendering summary text
    divEpisodes.innerHTML += episode.summary;
  });
}

function renderEpisodes(id) {
  if (!episodeState.allEpisodes) {
    return;
  }
  selectEpisode.style.display = `inline`;
  episodeState.switcher = false;
  const formattedSearchTerm = episodeState.searchEpisodes.toLowerCase();
  // filter the episodes of the selected show
  const filteredFilms = episodeState.allEpisodes[id].filter(
    (film) =>
      //Added RegExp to remove tags from the summary, as they affect the filter results.
      film.name.toLowerCase().includes(formattedSearchTerm) ||
      film.summary
        .toLowerCase()
        .replace(/<\/?p>|<br\s*\/?>/g, "")
        .includes(formattedSearchTerm)
  );

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
  if (!episodeState.switcher) {
    episodeState.searchEpisodes = event.target.value.trim();
    renderEpisodes(selectShow.value);
  } else {
    episodeState.searchEpisodes = event.target.value.trim();
    renderShows(episodeState.allShows);
  }
}

selectShow.addEventListener("change", handleShowSelect);

function handleShowSelect(event) {
  const selectedShowId = event.target.value;
  episodeState.searchEpisodes = "";
  searchBox.value = "";
  console.log(selectedShowId);
  if (selectedShowId === `111111`) {
    renderShows(episodeState.allShows);
  } else {
    if (Object.keys(episodeState.allEpisodes).includes(selectedShowId)) {
      //check if already we have the list of episodes of the selected show, and if no - fetch them
      renderEpisodes(selectedShowId);
    } else {
      updatingAllEpisodesList(selectedShowId);
    }
  }
}

selectSortShow.addEventListener(`change`, (e) => {
  const selectorValue = e.target.value;
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
});
