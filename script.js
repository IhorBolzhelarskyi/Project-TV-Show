"use strict";

const allEpisodes = getAllEpisodes();
let searchTerm = "";

function addOptionToEpisodeSelector(episodes) {
  const select = document.getElementById("episodeSelector")
  episodes.forEach((episode) => {
    const option = document.createElement(`option`);
    option.textContent = episode.name
    option.value = `#${episode.id}`
    
    select.appendChild(option)
  })
}
addOptionToEpisodeSelector(allEpisodes)
//rendering episodes
function showEpisodes(episodes) {
  episodes.forEach((episode) => {
    //creating div for each episodes
    const divEpisodes = document.createElement(`div`);
    divEpisodes.classList.add(`divEpisodes`);
    divEpisodes.setAttribute("id", `${episode.id}`)
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
function render() {
  const formattedSearchTerm = searchTerm.toLowerCase()
  const filteredFilms = allEpisodes.filter(
    (film) =>
      //added regexp to remove tags from summary, as the will affect filter results
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

  mainDiv.textContent = "";
  episodesFound.textContent = "";
  showEpisodes(filteredFilms);
  if (filteredFilms.length === 73) {
    episodesFound.textContent = "";
  } else {
    episodesFound.textContent = `Displaying ${filteredFilms.length}/73 episodes`;
  }
}

const searchBox = document.getElementById("searchbar");
const episodesFound = document.getElementById("episodesFound");
searchBox.addEventListener("input", handleSearchInput);

function handleSearchInput(event) {
  searchTerm = event.target.value;
  render();
}
render();

