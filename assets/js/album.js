// ----Dichiarazioni variabili----
const albumImageBig = document.querySelector(".albumImageBig");
const titleAlbumBig = document.querySelector(".titleAlbumBig");
const artistAlbum = document.querySelector(".artistAlbum");
const releaseAlbum = document.querySelector(".releaseAlbum");
const albumTracks = document.querySelector(".albumTracks");
const albumDuration = document.querySelector(".albumDuration");
const tracksAlbum = document.querySelector(".tracksAlbum");
const artistImageLittle = document.querySelector(".artistImageLittle");
const mainColumnAlbum = document.getElementById("mainColumnAlbum");
const buttonPlay = document.getElementById("buttonPlay");
const albumHero = document.querySelector(".albumHero");
const navbarAlbum = document.getElementById("navbarAlbum");
const colorChange = document.querySelectorAll("colorChange");
const TitleSong = document.getElementById("TitleSong");
const nameArtistFooter = document.getElementById("nameArtistFooter");
const nameMainArtistFooter = document.getElementById("nameMainArtistFooter");
const fotoFooter = document.getElementById("fotoFooter");
const buttonPlayFooter = document.querySelector(".provadue");
const volumeSlider = document.getElementById("volumeSlider");
const mySlider = document.getElementById("mySlider");
const progressBar = document.querySelector(".progress-bar");
const playPauseButton = document.querySelectorAll(".buttonPlayAndStop");

// ----Genero le Track----
const generateTracks = function (TracksArray) {
  TracksArray.forEach((track, index) => {
    const minutes = Math.floor(track.duration / 60);
    const seconds = track.duration % 60;
    const formattedRank = track.rank.toLocaleString();

    const newCol = document.createElement("div");
    newCol.classList.add("col", "divTracks");
    newCol.innerHTML = `
    <div class=" d-flex  align-items-center justify-content-between mb-2 divTrack cursorPointer"> 
      <div class="col-1 d-none d-lg-block text-center numberTrack cursorPointer text-light text-opacity-75 "><p>${
        index + 1
      }</p></div>
      <div class="col-5">
        <div class="row flex-column ">
          <div class="col d-flex text-start p-0">
            <p class="titleBold text-light">${track.title}</p>
          </div>
          <div class="col p-0">
            <a  href="artist.html?artistId=${
              track.artist.id
            }" class="artistAlbum text-light text-opacity-75 authorDescription
            ">${track.artist.name}</a>
          </div>
        </div>
      </div>
      <div class="col-4 d-none d-lg-block text-center text-light text-opacity-75">${formattedRank}</div>
      <div class="col-2  text-end text-light text-opacity-75 mobileChange">${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}</div> 
      </div>
    `;
    tracksAlbum.appendChild(newCol);
  });
};

const getAlbumCard = function () {
  const addressBarContent = new URLSearchParams(location.search);
  const albumId = addressBarContent.get("albumId");

  fetch(`https://striveschool-api.herokuapp.com/api/deezer/album/${albumId}`)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Errore big F");
      }
    })
    .then((albumArray) => {
      albumImageBig.src = albumArray.cover_big;
      titleAlbumBig.innerText = albumArray.title;
      artistAlbum.innerText = albumArray.artist.name;
      releaseAlbum.innerText = albumArray.release_date;
      const durataTotaleAlbumSec = albumArray.duration;
      const durataTotaleAlbumMin = Math.floor(durataTotaleAlbumSec / 60);
      const durataTotaleAlbumSecRimasti = durataTotaleAlbumSec % 60;
      const durataTotaleAlbumStringa = `${durataTotaleAlbumMin} min ${durataTotaleAlbumSecRimasti} sec`;
      albumTracks.innerText = `${albumArray.nb_tracks} brani,  ${durataTotaleAlbumStringa}`;
      artistImageLittle.src = albumArray.artist.picture_small;
      // ----Mi prendo il colore dominante----
      const colorThief = new ColorThief();
      albumImageBig.crossOrigin = "Anonymous";
      const windowWidth = window.innerWidth;
      if (albumImageBig.complete) {
        const color = colorThief.getColor(albumImageBig);
        applyGradient(color, windowWidth);
        applyTextColor(color); // chroma
        applyNavbarColor(color);
      } else {
        albumImageBig.addEventListener("load", function () {
          const color = colorThief.getColor(albumImageBig);
          applyGradient(color, windowWidth);
          applyTextColor(color);
          applyNavbarColor(color);
        });
      }

      generateTracks(albumArray.tracks.data);
      TitleSong.innerText = albumArray.title;

      numberTransform();

      // ----Rendo le track cliccabili----
      let currentAudio = null;
      let duration = 0;
      let currentTime = 0;
      const divTracks = document.querySelectorAll(".divTracks");
      divTracks.forEach((divTrack, index) => {
        divTrack.addEventListener("dblclick", () => {
          const previewUrl = albumArray.tracks.data[index].preview;
          const currentPhotoAlbum = albumArray.cover_small;
          fotoFooter.src = currentPhotoAlbum;
          const currentSongTitle = albumArray.tracks.data[index].title;
          nameArtistFooter.innerText = currentSongTitle;
          const currentArtistName = albumArray.artist.name;
          nameMainArtistFooter.innerText = currentArtistName;
          // ----Gestisco il play and stop sinconizzandole nel footer----
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
            duration = albumArray.tracks.data[index].duration;
            // ----Rendo gli slider funzionanti----
            mySlider.setAttribute("max", duration);
            const volume = volumeSlider.value / 100;
            currentAudio.volume = volume;
            currentAudio.addEventListener("volumechange", () => {
              const volumePercentage = currentAudio.volume * 100;
              volumeSlider.value = volumePercentage;
            });
            currentAudio.addEventListener("timeupdate", () => {
              currentTime = currentAudio.currentTime;
              const percentage = (currentTime / duration) * 100;
              mySlider.value = currentTime;
            });
            audio.play();
          }
          const iconFooter = document.querySelector(".bi-play-circle-fill");
          if (iconFooter) {
            iconFooter.classList.remove("bi-play-circle-fill");
            iconFooter.classList.add("bi-pause-circle-fill");
          }
        });
      });

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
    })
    .catch((err) => {
      console.error("ERRORE", err);
    });
};

getAlbumCard();
// ----Cambio il gradiente lineare a seconda della vw----
function applyGradient(color, windowWidth) {
  const gradientColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  let gradient;

  if (windowWidth < 576) {
    gradient = `linear-gradient(to bottom, ${gradientColor} 525px, black 600px)`;
  } else if (windowWidth >= 576 && windowWidth < 768) {
    gradient = `linear-gradient(to bottom, ${gradientColor} 680px, black 740px)`;
  } else if (windowWidth >= 768 && windowWidth < 992) {
    gradient = `linear-gradient(to bottom, ${gradientColor} 190px, black 300px)`;
  } else if (windowWidth >= 992 && windowWidth < 1200) {
    gradient = `linear-gradient(to bottom, ${gradientColor} 285px, black 380px)`;
  } else if (windowWidth >= 1200 && windowWidth < 1400) {
    gradient = `linear-gradient(to bottom, ${gradientColor} 380px, black 420px)`;
  } else {
    gradient = `linear-gradient(to bottom, ${gradientColor} 380px, black 460px)`;
  }

  mainColumnAlbum.style.background = gradient;
  mainColumnAlbum.style.backgroundAttachment = "fixed";
}
// ----Con chroma faccio si che il testo sia sempre leggibile----
function applyTextColor(color) {
  const backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  const textColor =
    chroma.contrast(backgroundColor, "black") >
    chroma.contrast(backgroundColor, "white")
      ? "black"
      : "white";
  titleAlbumBig.style.color = textColor;
  artistAlbum.style.color = textColor;
  releaseAlbum.style.color = textColor;
  albumTracks.style.color = textColor;
  albumDuration.style.color = textColor;
  albumHero.style.color = textColor;
}

function applyNavbarColor(color) {
  const backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  const textColor =
    chroma.contrast(backgroundColor, "black") >
    chroma.contrast(backgroundColor, "white")
      ? "black"
      : "white";
  navbarAlbum.style.backgroundColor = backgroundColor;
  navbarAlbum.style.color = textColor;
}

// ----Effetto all hover del number----
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

// ----Effetti icons----
const icons = document.querySelectorAll(".iconTop");

icons.forEach((icon) => {
  icon.addEventListener("mouseover", () => {
    icon.style.opacity = "1";
  });

  icon.addEventListener("mouseout", () => {
    icon.style.opacity = "0.5";
  });
});

// ----Reindirizzamento----
const buttonsIndietro = document.querySelectorAll(".buttonIndietro");
buttonsIndietro.forEach((button) => {
  button.addEventListener("click", () => {
    window.location.href = "index.html";
  });
});

// ----Cambiamenti dell hero----
mainColumnAlbum.addEventListener("scroll", () => {
  const buttonBack = document.getElementById("dinamicScroll");

  const buttonPlayNavbar = document.getElementById("buttonPlayNavbar");
  const scrollHeight = 250;

  if (mainColumnAlbum.scrollTop > scrollHeight) {
    buttonBack.style.display = "none";

    buttonPlayNavbar.classList.add("displayNone");
    TitleSong.classList.add("displayNone");
  } else {
    buttonPlayNavbar.classList.remove("displayNone");
    TitleSong.classList.remove("displayNone");
    buttonBack.style.display = "block";
  }
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
getChart();
