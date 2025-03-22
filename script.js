const allEpisodes = getAllEpisodes();
// Declare a variable to store the search term
let searchTerm = "";

// add options to episodeSelector
function populateEpisodeSelector(episodes) {
  const select = document.getElementById("episodeSelector");
  episodes.forEach((episode) => {
    const option = document.createElement(`option`);
    const seasons = episode.season.toString().padStart(2, `0`);
    const episodes = episode.number.toString().padStart(2, `0`);
    option.textContent = `S${seasons}E${episodes} - ${episode.name}`;
    // Add id as a value for the callback function handling the onChange event
    option.value = `#${episode.id}`;
    select.appendChild(option);
  });
}
populateEpisodeSelector(allEpisodes);
//rendering episodes
function showEpisodes(episodes) {
  episodes.forEach((episode) => {
    //creating div for each episodes
    const divEpisodes = document.createElement(`div`);
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
// declare variable to store the amount of displayed episodes
const episodesFound = document.getElementById("episodesFound");

function render() {
  const formattedSearchTerm = searchTerm.toLowerCase();
  const filteredFilms = allEpisodes.filter(
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
  showEpisodes(filteredFilms);
  // remove episodesFound if all episodes are shown
  if (filteredFilms.length === 73) {
    episodesFound.textContent = "";
  } else {
    episodesFound.textContent = `Displaying ${filteredFilms.length}/73 episodes`;
  }
}

const searchBox = document.getElementById("searchbar");
searchBox.addEventListener("input", handleSearchInput);

function handleSearchInput(event) {
  searchTerm = event.target.value;
  render();
}

render();
