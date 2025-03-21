"use strict"

const allEpisodes = getAllEpisodes();
let searchTerm = "";

//rendering episodes
function showEpisodes(episodes) {
  episodes.forEach((episode) => {
    //creating div for each episodes
    const divEpisodes = document.createElement(`div`);
    divEpisodes.classList.add(`divEpisodes`);
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
  const formattedSearchTerm =
    searchTerm.charAt(0).toUpperCase() +
    searchTerm.slice(1).toLowerCase();
  const filteredFilms = allEpisodes.filter((film) =>
    //added regexp to remove tags from summary, as the will affect filter results
    film.name.includes(formattedSearchTerm) || film.summary.replace(/<\/?p>|<br\s*\/?>/g, "").includes(formattedSearchTerm)
  );

  if (filteredFilms.length === 0) {
    mainDiv.textContent = "No films found.";
    return;
  }
  mainDiv.textContent = ""
  showEpisodes(filteredFilms);
}

const searchBox = document.getElementById("search");

searchBox.addEventListener("input", handleSearchInput);

function handleSearchInput(event) {
  searchTerm = event.target.value;
  render();
}
render();
