const BASE_URL = 'https://movie-list.alphacamp.io/'
const INDEX_URL = BASE_URL + 'api/v1/movies/'
const POSTER_URL = BASE_URL + 'posters/'
const MOVIES_PER_PAGE = 12

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const listViewBtn = document.querySelector('#list-view')
const cardViewBtn = document.querySelector('#card-view')
const movies = []
let filterMovies = []
let curPage = 1
let curViewMode = 'card-view'



// ****Render Movie List**** //
axios
  .get(INDEX_URL)
  .then(response => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch(error => console.log(error))

// ****btn event****//
dataPanel.addEventListener('click', function onPanelClick(e) {
  if (e.target.matches('.btn-show-movie')) {
    showMovieModal(Number(e.target.dataset.id))
  } else if (e.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(e.target.dataset.id))
  }
})

// ****Search Bar**** //
searchForm.addEventListener('submit', function onSearchFormSubmitted(e) {
  e.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filterMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))
  if (filterMovies.length === 0) {
    return alert(`您輸入的關鍵字: ${keyword} 沒有符合條件的電影`)
  }
  renderPaginator(filterMovies.length)
  renderMovieList(getMoviesByPage(1))
})

// ****Pagination**** //
paginator.addEventListener('click', function onPaginatorClick(e) {
  if (e.target.tagName !== 'A') return
  const page = Number(e.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
  curPage = page
})

// *****View Mode*****//
listViewBtn.addEventListener('click', onViewModeBtnClick)
cardViewBtn.addEventListener('click', onViewModeBtnClick)


function onViewModeBtnClick(e) {
  if (this.id === curViewMode) return
  curViewMode = this.id
  renderMovieList(getMoviesByPage(curPage))
  listViewBtn.classList.toggle('active')
  cardViewBtn.classList.toggle('active')
}

function renderMovieList(data) {
  let rawHTML = ''
  if (curViewMode === 'card-view') {
    data.forEach(item => {
      rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card"> 
            <img
              src=${POSTER_URL + item.image} 
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id=${item.id}>More</button>
              <button class="btn btn-info btn-add-favorite" data-id=${item.id}> + </button>
            </div>
          </div>
        </div>
      </div>`
    })
  } else if (curViewMode === 'list-view') {
    data.forEach(item => {
      rawHTML += `<div class="col-12 mb-1 border-top">
        <div class="d-flex justify-content-between align-items-center m-2"> 
          <h5 class="card-title">${item.title}</h5>
          <div class="card-btn pr-5">
            <button class="btn btn-primary btn-show-movie mr-2" data-toggle="modal" data-target="#movie-modal" data-id=${item.id}>More</button>
            <button class="btn btn-info btn-add-favorite" data-id=${item.id}> + </button>
          </div>
        </div>
      </div>`
    })
  }
  dataPanel.innerHTML = rawHTML
  dataPanel.querySelector('.col-sm-3')
}

function getMoviesByPage(page) {
  const data = filterMovies.length ? filterMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount) {
  const totalPage = Math.ceil(amount / MOVIES_PER_PAGE)

  let rawHTML = ''
  for (let page = 1; page <= totalPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function showMovieModal(id) {
  const movieTitle = document.querySelector('#movie-modal-title')
  const movieImage = document.querySelector('#movie-modal-image')
  const movieDate = document.querySelector('#movie-modal-date')
  const movieDescription = document.querySelector('#movie-modal-description')

  axios
    .get(INDEX_URL + id)
    .then(response => {
      const data = response.data.results
      movieTitle.innerText = data.title
      movieImage.firstChild.src = POSTER_URL + data.image
      movieDescription.innerText = data.description
      movieDate.innerText = 'Release Date: ' + data.release_date
    })
}

function addToFavorite(id) {
  const favorites = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)

  if (favorites.some(item => Number(item.id) === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  favorites.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(favorites))
}

