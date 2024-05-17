document.addEventListener("DOMContentLoaded", async function () {
  const artistId = new URLSearchParams(location.search).get("artistId");
  if (artistId) {
    await fetchAndDisplayArtistData(artistId);
  }
  getChart();
});

// Funzione per trasformare i numeri in icone di play al passaggio del mouse
const numberTransform = function () {
  const numberTracks = document.querySelectorAll(".numberTrack");
  numberTracks.forEach((track, index) => {
    track.addEventListener("mouseover", () => {
      track.innerHTML = '<i class="bi bi-play-fill"></i>';
    });
    track.addEventListener("mouseout", () => {
      track.innerHTML = `<p>${index + 1}</p>`;
    });
  });
};

// Funzione per recuperare e visualizzare i dati dell'artista
const fetchAndDisplayArtistData = async (artistId) => {
  try {
    const response = await fetch(
      `https://striveschool-api.herokuapp.com/api/deezer/artist/${artistId}`
    );
    if (!response.ok) {
      throw new Error("Errore nella richiesta");
    }
    const data = await response.json();
    // Aggiorna le informazioni dell'artista nel DOM
    document.getElementById("artista").textContent = data.name;
    document.getElementById("artista1").textContent = data.name;
    document.getElementById("nb_fan").textContent =
      "Ascolti mensili: " + data.nb_fan;
    const artistPictureElement = document.getElementById("picture");
    artistPictureElement.src = data.picture_xl;
    artistPictureElement.alt = "Immagine di " + data.name;
    // Recupera e visualizza le top tracks
    const topTracks = await getTopTracks(artistId);
    if (topTracks) {
      generateTracks(topTracks);
      numberTransform();
    } else {
      console.error("No top tracks found");
    }
  } catch (error) {
    console.error("Si è verificato un errore:", error);
  }
};

// Funzione per recuperare le top tracks dell'artista
const getTopTracks = async (artistId, limit = 5) => {
  const url = `https://striveschool-api.herokuapp.com/api/deezer/artist/${artistId}/top?limit=${limit}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Errore nella richiesta");
    }
    const data = await response.json();
    return data.data.map((track) => ({
      rank: track.rank,
      pictureXL: track.album.cover_xl,
      title: track.title,
      duration: track.duration,
      artistName: track.artist.name,
      preview: track.preview,
    }));
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

// Funzione per generare e visualizzare le tracce
const generateTracks = (tracksArray) => {
  const tracksArtist = document.querySelector(".tracksArtist");
  tracksArtist.innerHTML = ""; // Pulisce le tracce esistenti
  tracksArray.forEach((track, index) => {
    const minutes = Math.floor(track.duration / 60);
    const seconds = track.duration % 60;
    const formattedRank = track.rank.toLocaleString();
    const newCol = document.createElement("div");
    newCol.classList.add("col", "divTracks");
    newCol.innerHTML = `
      <div class="row d-flex align-items-center justify-content-between p-1 mb-2 fs-6 ">
        <div class="col-1 d-lg-block text-center numberTrack cursorPointer text-light text-opacity-75">
          <p>${index + 1}</p>
        </div>
        <div class="col-2 d-flex justify-content-start">
          <img src="${track.pictureXL}" alt="${track.title}" class="img-fluid">
        </div>
        <div class="col-3">
          <div class="row flex-column">
            <div class="col d-flex text-start p-0">
              <p class="titleBold text-light">${track.title}</p>
            </div>
          </div>
        </div>
        <div class="col-3 d-lg-block text-center text-light text-opacity-75">${formattedRank}</div>
        <div class="col-2 text-end text-light text-opacity-75 mobileChange">${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}</div>
      </div>
    `;
    tracksArtist.appendChild(newCol);
  });
  addTrackEventListeners(tracksArray);
};
let currentAudio = null;
let duration = 0;
let currentTime = 0;
// Funzione per aggiungere gli eventi di doppio clic alle tracce
const addTrackEventListeners = (tracksArray) => {
  const divTracks = document.querySelectorAll(".divTracks");
  divTracks.forEach((divTrack, index) => {
    divTrack.addEventListener("dblclick", () => {
      const previewUrl = tracksArray[index].preview;
      const currentPhotoAlbum = tracksArray[index].pictureXL;
      const currentSongTitle = tracksArray[index].title;
      const currentArtistName = tracksArray[index].artistName;
      // Aggiorna il footer con le informazioni della traccia corrente
      fotoFooter.src = currentPhotoAlbum;
      nameArtistFooter.innerText = currentSongTitle;
      nameMainArtistFooter.innerText = currentArtistName;
      // Gestisce la riproduzione audio
      if (currentAudio && currentAudio.src === previewUrl) {
        if (currentAudio.paused) {
          currentAudio.play();
        } else {
          currentAudio.pause();
        }
      } else {
        if (currentAudio) {
          currentAudio.pause();
        }
        const audio = new Audio(previewUrl);
        currentAudio = audio;
        duration = tracksArray[index].duration;
        // Rende gli slider funzionanti
        mySlider.setAttribute("max", duration);
        const volume = volumeSlider.value / 100;
        currentAudio.volume = volume;
        currentAudio.addEventListener("volumechange", () => {
          const volumePercentage = currentAudio.volume * 100;
          volumeSlider.value = volumePercentage;
        });
        currentAudio.addEventListener("timeupdate", () => {
          currentTime = currentAudio.currentTime;
          mySlider.value = currentTime;
        });
        audio.play();
      }
      const iconFooter = document.querySelector(".bi-play-circle-fill");
      if (iconFooter) {
        iconFooter.classList.remove("bi-play-circle-fill");
        iconFooter.classList.add("bi-pause-circle-fill");
      }
      const playPauseButton = document.querySelectorAll(".buttonPlayAndStop");
      playPauseButton.forEach((button) => {
        button.addEventListener("click", () => {
          console.log("ciao");
          if (currentAudio) {
            console.log(currentAudio);
            if (currentAudio.paused) {
              button.classList.remove("bi-play-circle-fill");
              button.classList.add("bi-pause-circle-fill");
              currentAudio.play();
            } else {
              currentAudio.pause();
              button.classList.remove("bi-pause-circle-fill");
              button.classList.add("bi-play-circle-fill");
            }
          }
        });
      });
    });
  });
};

// Event listener per il pulsante indietro
document.querySelectorAll(".buttonIndietro").forEach((button) => {
  button.addEventListener("click", () => {
    window.location.href = "index.html";
  });
});

// Funzione per generare la lista delle tracce casuali
const generateListChart = function (array) {
  const ul = document.getElementById("random-songs");
  ul.innerHTML = ""; // Pulisce la lista esistente
  array.forEach((element) => {
    const newLi = document.createElement("li");
    newLi.innerHTML = `
    <a href="artist.html?artistId=${element.artist.id}" class='text-decoration-none'>
    <div class='d-flex gap-3 rounded-2 p-2 artist-list'>
      <div class='rounded-circle overflow-hidden' style='width: 2.5em'> 
          <img src="${element.artist.picture_small}" class="img-fluid"> 
        </div> 
        <div> 
          <h6 class='mb-0 text-light '> ${element.artist.name} </h6>
          <p class='small mt-0'> Artista</p>
        </div> 
      </div>
    </a>
    `;
    ul.appendChild(newLi);
  });
};

// Funzione per recuperare e visualizzare la classifica delle tracce casuali
const getChart = async function () {
  try {
    const response = await fetch(
      "https://striveschool-api.herokuapp.com/api/deezer/search?q=rap"
    );
    if (!response.ok) {
      throw new Error("Errore durante la richiesta.");
    }
    const json = await response.json();
    if (json && json.data) {
      generateListChart(json.data);
    } else {
      console.log("Nessun dato trovato.");
    }
  } catch (err) {
    console.error("ERRORE!", err);
  }
};

// Event listeners per gli slider
mySlider.addEventListener("input", () => {
  if (currentAudio) {
    currentAudio.currentTime = mySlider.value;
  }
});

volumeSlider.addEventListener("input", () => {
  if (currentAudio) {
    const volume = volumeSlider.value / 100;
    currentAudio.volume = volume;
  }
});
document.getElementById('backButton').addEventListener('click', function() {
  history.back();
});