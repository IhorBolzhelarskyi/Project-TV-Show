"use strict";
const episodeState = {
  allShows: [],
  allEpisodes: {},
  searchEpisodes: "",
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

//---------fetching shows from the API---------
const fetchShows = async function () {
  try {
    loadingImg.classList.add(`loading`);
    errorMessage.classList.remove(`errorM`);
    const response = await fetch("https://api.tvmaze.com/shows");
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
// update episodeState.allEpisodes with data from API and render the episodes
fetchShows().then((data) => {
  //sort data by name
  data.sort((a, b) => (a.name > b.name ? 1 : -1));
  episodeState.allShows = data;
  populateShowSelector(episodeState.allShows);
  //populate episode selector with the list of episodes from the first show
  updatingAllEpisodesList(episodeState.allShows[0].id);
  loadingImg.classList.remove(`loading`);
});

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
    render(id);
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
  shows.forEach((show) => {
    const option = document.createElement(`option`);
    option.textContent = show.name;
    option.value = show.id;
    selectShow.appendChild(option);
  });
}

//rendering episodes
function showEpisodes(episodes) {
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
    image.src = episode.image.medium;
    divEpisodes.appendChild(image);
    //rendering summary text
    divEpisodes.innerHTML += episode.summary;
  });
}

function render(id) {
  if (!episodeState.allEpisodes) {
    return;
  }
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
  episodeState.searchEpisodes = event.target.value;
  render(selectShow.value);
}

selectShow.addEventListener("change", handleShowSelect);

function handleShowSelect(event) {
  const selectedShowId = event.target.value;
  //check if already we have the list of episodes of the selected show, and if no - fetch them
  if (Object.keys(episodeState.allEpisodes).includes(selectedShowId)) {
    render(selectedShowId);
  } else {
    updatingAllEpisodesList(selectedShowId);
  }
}
