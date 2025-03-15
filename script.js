//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = `Got ${episodeList.length} episode(s)`;
}

window.onload = setup;
//creating main div
const allEpisodes = getAllEpisodes();
const mainDiv = document.createElement(`div`);
document.body.appendChild(mainDiv);
mainDiv.setAttribute(`id`, `mainDiv`);

function showEpisodes(episodes) {
  episodes.forEach((episode) => {
    //creating div for each episodes
    const divEpisodes = document.createElement(`div`);
    divEpisodes.classList.add(`divEpisodes`);
    // rendering title
    mainDiv.appendChild(divEpisodes);

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
  //creating footer
  const footer = document.createElement(`div`);
  footer.classList.add(`footer`);
  footer.innerHTML += `<p>Data has originally come from <a href ="https://tvmaze.com/" target="_blank">[TVMaze.com]</a></p>`;
  document.body.appendChild(footer);
}

showEpisodes(allEpisodes);
