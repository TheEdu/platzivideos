//console.log('hola mundo!');
const noCambia = "Eduardo";

let cambia = "@EduardoDenis"

function cambiarNombre(nuevoNombre) {
  cambia = nuevoNombre
}


const getUser = new Promise(function(todoBien, todoMal) {

  setTimeout(function() {
    todoBien('todoBien 3');
  }, 3000)

})


const getUserAll = new Promise(function(todoBien, todoMal) {

  setTimeout(function() {
    todoBien('todoBien 5');
  }, 5000)

})


// getUser
//   .then(function() {
//     console.log('todo está bien en la vida')
//   })
//   .catch(function(message) {
//     console.log(message)
//   })

Promise.race([
  getUser,
  getUserAll,
])
.then(function(message) {
  console.log(message)
})
.catch(function(message) {
  console.log(message)
})


$.ajax("https://randomuser.me/api", {
  method: "GET", //POST, PUT, DELETE
  success: function(data) {
    console.log("ajax: ")
    console.log(data)
  },
  error: function(error) {
    console.log(error)
  }
})


fetch("https://randomuser.me/api")
  .then(function(response){
    console.log("fetch: ")
    console.log(response)
    return response.json()
  }).then(function(data){
    console.log("json promise: ")
    console.log(data)
  });

(async function loadMovies(){

  function setAttributes($element,attributes){
    for(const key in attributes) $element.setAttribute(key,attributes[key])
  }

  // Literal Template
  function featuringTemplate(movie){
    return(
      `
      <div class="featuring">
        <div class="featuring-image">
          <img src="${movie.medium_cover_image}" width="70" height="100" alt="">
        </div>
        <div class="featuring-content">
          <p class="featuring-title">Pelicula encontrada</p>
          <p class="featuring-album">${movie.title}</p>
        </div>
      </div>
      `
    )
  }

  const $form = document.querySelector('#form')
  const $home = document.querySelector('#home')
  const $featuringContainer = document.querySelector('#featuring')

  const BASE_API = 'https://yts.am/api/v2/'

  $form.addEventListener('submit', async (event) => {
    event.preventDefault()
    $home.classList.add('search-active')
    const $loader = document.createElement('img')
    setAttributes($loader,{
      src:'src/images/loader.gif',
      height:50,
      width:50
    })
    $featuringContainer.append($loader)

    const data = new FormData($form)
    const movieName = data.get('movie') // input name
    try{
      const { data: { movies: pelis } } = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${movieName}`)
      const MovieHTMLString = featuringTemplate(pelis[0])
      $featuringContainer.innerHTML = MovieHTMLString;
    }catch(error){
      alert(error.message)
      $loader.remove()
      $home.classList.remove('search-active')
    }
  })

  // async + await style 
  async function getData(url){
    let data
    try{
      const response = await fetch(url)
      data = await response.json()
    }catch(error){
      console.log("Error Catch: ",error)
    }
    if (data.data.movie_count > 0) return data
    throw new Error('No se encontró ningún resultado');
  }

  // promise style
  getData('https://yts.am/api/v2/list_movies.json?genre=drama')
    .then(function(data){
      console.log('dramaList (async + await): ',data)
    })

  // await style 
  // const { data: { movies: actionList    } } = await getData('https://yts.am/api/v2/list_movies.json?genre=action')
  // const { data: { movies: dramaList     } } = await getData('https://yts.am/api/v2/list_movies.json?genre=drama')
  // const { data: { movies: animationList } } = await getData('https://yts.am/api/v2/list_movies.json?genre=animation')
  // console.log('Movies Lists (async + await): ', actionList, dramaList, animationList)



  // Query Selector
  // const $actionContainer = document.querySelector('#action')
  // const $dramaContainer = document.querySelector('#drama')
  // const $animationContainer = document.querySelector('#animation')

  // Literal Template
  function videoItemStringTemplate(movie,category){
    return(
      `<div class="primaryPlaylistItem"  data-id=${movie.id} data-category=${category}>
        <div class="primaryPlaylistItem-image">
          <img src="${movie.medium_cover_image}">
        </div>
        <h4 class="primaryPlaylistItem-title">
          ${movie.title}
        </h4>
      </div>`
    )
  }

  function createElementTemplate(HTMLString) {
    const html = document.implementation.createHTMLDocument();
    html.body.innerHTML = HTMLString;
    return html.body.children[0];
  }

  function addEventClick($element){
    $element.addEventListener('click', () => {
      //alert('click')
      showModal($element)
    })
  }

  function renderMovieList(movieList, $container, category) {
    movieList.forEach((movie)=> {
      const HTMLString = videoItemStringTemplate(movie,category)
      const movieElement = createElementTemplate(HTMLString)
      addEventClick(movieElement)
      $container.append(movieElement)

      const $image = movieElement.querySelector('img');
      $image.addEventListener('load',(event)=>{
        event.srcElement.classList.add('fadeIn')
      })
    })
    $container.children[0].remove();
  }


  async function getListFromCache(category){
    const listName = `${category}List`
    const cacheList = localStorage.getItem(listName)

    if(cacheList){
      return JSON.parse(cacheList)
    } else {
      const {data: { movies: data } } = await getData(`${BASE_API}list_movies.json?genre=${category}`)
      localStorage.setItem(listName,JSON.stringify(data))
      //clear item from cache in a given time
      setTimeout(()=>{
        localStorage.removeItem(listName.toString())
      },10000)
      return data
    }
  }

  const actionList = await getListFromCache('action')
  const $actionContainer = document.querySelector('#action')
  renderMovieList(actionList,$actionContainer,'action');

  const dramaList = await getListFromCache('drama')
  const $dramaContainer = document.querySelector('#drama')
  renderMovieList(dramaList,$dramaContainer,'drama');

  const animationList = await getListFromCache('animation')
  const $animationContainer = document.querySelector('#animation')
  renderMovieList(animationList,$animationContainer,'animation');

  // actionList.data.movies.forEach((movie)=>{
  //   //debugger
  //   //console.log(videoItemTemplate(movie))
  //   const HTMLString = videoItemTemplate(movie);
  //   const html = document.implementation.createHTMLDocument();
  //   html.body.innerHTML = HTMLString;
  //   $actionContainer.append(html.body.children[0]);
  // })
  
  const $modal = document.querySelector('#modal')
  const $hideModal = document.querySelector('#hide-modal')
  const $overlay = document.querySelector('#overlay')

  const $modalTitle = $modal.querySelector('h1');
  const $modalImage = $modal.querySelector('img');
  const $modalDescrition = $modal.querySelector('p');
  
  function findById(list,id){
    return list.find( movie => movie.id === parseInt(id))
  }
  

  function findMovie(id,category){
    let movie
    switch (category) {
      case"action": 
        movie = findById(actionList,id)
        break;
      case"drama": 
        movie = findById(dramaList,id)
        break;
      default: 
        movie = findById(animationList,id)
    }
    return movie
  }

  function showModal($element){
    $overlay.classList.add('active')
    $modal.style.animation = 'modalIn .8s forwards'
    const id = $element.dataset.id
    const category = $element.dataset.category
    const data = findMovie(id,category)

    $modalTitle.textContent = data.title
    $modalImage.setAttribute('src',data.medium_cover_image)
    $modalDescrition.textContent = data.description_full
  }

  function hideModal(){
    $overlay.classList.remove('active')
    $modal.style.animation = 'modalOut .8s forwards'
  }

  $hideModal.addEventListener('click',hideModal)

})();

(async function loadUsers(){
  const BASE_API = 'https://randomuser.me/api/'
  const USERS_NUMBER = Math.floor((Math.random() *10))+1;
  const LOCAL_STORAGE_TIME = 20000

  async function getUsers(usersNumber){
    const itemName = `users${usersNumber}`
    const item = localStorage.getItem(itemName)

    //Get from Local Storage
    if(item) return JSON.parse(item)
    
    //Get from API
    const apiURL = `${BASE_API}?results=${usersNumber}`
    const apiResponse = await fetch(apiURL)
    const { results: users } = await apiResponse.json()
    localStorage.setItem(itemName,JSON.stringify(users))
    setTimeout(()=>{
      localStorage.removeItem(itemName.toString())
    },LOCAL_STORAGE_TIME)
    return users
  }

  const users = await getUsers(USERS_NUMBER)
  console.log('users: ',users)

  function createUserTemplate(user){
    HTMLString = `<li class="playlistFriends-item">
                    <a href="#">
                      <img src="${user.picture.thumbnail}" alt="Load Error" />
                      <span>
                        ${user.name.title} ${user.name.first} ${user.name.last}
                      </span>
                    </a>
                  </li>`

    const html = document.implementation.createHTMLDocument()
    html.body.innerHTML = HTMLString
    return html.body.children[0]

  }

  $friends = document.querySelector('.playlistFriends')
  $friends.innerHTML = ''

  for(const key in users){
    const $userHTMLElement = createUserTemplate(users[key])
    const $image = $userHTMLElement.querySelector('img');
    $image.addEventListener('load',(event)=>{
        event.srcElement.classList.add('fadeIn')
    })
    $friends.append($userHTMLElement)
  }

})();

(async function loadLastMoviesAdded(){
  // Show The Last Movies Added

  function createLastMovieTemplate(movie){
    HTMLString = `<li class="myPlaylist-item" data-id="${movie.id}">
                    <a href="#">
                      <span>
                        ${movie.title}
                      </span>
                    </a>
                  </li>`

    const html = document.implementation.createHTMLDocument()
    html.body.innerHTML = HTMLString
    return html.body.children[0]
  }

  const $modal = document.querySelector('#modal')
  const $hideModal = document.querySelector('#hide-modal')
  const $overlay = document.querySelector('#overlay')

  const $modalTitle = $modal.querySelector('h1');
  const $modalImage = $modal.querySelector('img');
  const $modalDescrition = $modal.querySelector('p');
  

  function showModal(id,list){
    $overlay.classList.add('active')
    $modal.style.animation = 'modalIn .8s forwards'
    const movie = list.find( movie => movie.id === parseInt(id))

    $modalTitle.textContent = movie.title
    $modalImage.setAttribute('src',movie.medium_cover_image)
    $modalDescrition.textContent = movie.description_full
  }

  $myPlaylist = document.querySelector('.myPlaylist')

  fetch("https://yts.am/api/v2/list_movies.json?sort_by=date_added&limit=10")
    .then(function(response){
      return response.json()
    })
    .then(function(data){
      movieList = data.data.movies
      console.log(movieList)
      for(key in movieList){
        const $movieHTMLElement = createLastMovieTemplate(movieList[key])
        const $anchor = $movieHTMLElement.querySelector('a');
        $anchor.addEventListener('click',(event)=>{
          showModal($movieHTMLElement.dataset.id,movieList);
        })
        $myPlaylist.append($movieHTMLElement)
      }
    });


})()
