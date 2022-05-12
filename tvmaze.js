"use strict";
const missing_image_url = "https://tinyurl.com/missing-tv";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");
const $searchForm = $("#searchForm");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function searchShows(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const res = await axios.get(`https://api.tvmaze.com/search/shows?q=${term}`);
  console.log(res);

  return res.data.map(result => {
    const show = result.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : missing_image_url
    };
  });
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img src="${show.image}" alt="${show.name}" class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await searchShows(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (e) {
  e.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  console.log(res);

  return res.data.map(result => ({
    id: result.id,
    name: result.name,
    season: result.season,
    number: result.number,
    image: result.image ? result.image.medium : missing_image_url,
    summary: result.summary,
    runtime: result.runtime
  }));
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) {
  $episodesList.empty();

  for (let episode of episodes) {
    const $item = $(
      `<li>
        <img src="${episode.image}">
        <div>
       ${episode.name}  (Season ${episode.season}, Episode ${episode.number})
       <p>Runtime of ${episode.runtime} minutes</p>
        <p>${episode.summary}</p>
      </div>
       </li>
      `);

    $episodesList.append($item);
  }

  $episodesArea.show();
}

async function getEpisodesAndDisplay(e) {
  const showId = $(e.target).closest('.Show').data('show-id');
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$showsList.on('click', '.Show-getEpisodes', getEpisodesAndDisplay);