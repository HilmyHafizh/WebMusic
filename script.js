let songs = [];
let currentIndex = 0;
let audio = new Audio();
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let currentView = "home";
let currentSongTitle = "";

// ELEMENT
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const cover = document.getElementById("cover");
const playlistDiv = document.getElementById("playlist");
const progress = document.getElementById("progress");
const playBtn = document.getElementById("playBtn");
const search = document.getElementById("search");
const volume = document.getElementById("volume");

// DEFAULT
audio.volume = 0.5;
volume.value = 0.5;

/* ================= LOAD ================= */
async function loadSongs() {
  const res = await fetch("data.json");
  songs = await res.json();

  renderPlaylist(songs);
  loadSong(0);
}

/* ================= LOAD SONG ================= */
function loadSong(i) {
  const song = songs[i];

  audio.src = song.src;
  title.innerText = song.title;
  artist.innerText = song.artist;
  cover.src = song.cover;

  currentSongTitle = song.title;

  highlight();
}

/* ================= PLAY / PAUSE ================= */
function togglePlay() {
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

/* ================= NEXT ================= */
function nextSong() {
  currentIndex = (currentIndex + 1) % songs.length;

  loadSong(currentIndex);
  audio.play();
}

/* ================= PREV ================= */
function prevSong() {
  currentIndex =
    (currentIndex - 1 + songs.length) % songs.length;

  loadSong(currentIndex);
  audio.play();
}

/* ================= AUTO NEXT ================= */
audio.addEventListener("ended", () => {
  nextSong();
});

/* ================= AUDIO EVENTS ================= */
audio.onplay = () => {
  playBtn.innerText = "⏸";
  cover.classList.add("playing");
};

audio.onpause = () => {
  playBtn.innerText = "▶";
  cover.classList.remove("playing");
};

/* ================= MENU ================= */
function showAll() {
  currentView = "home";

  renderPlaylist(songs);

  setActive("Home");
}

function showFavorites() {
  currentView = "favorites";

  renderPlaylist(favorites);

  setActive("Favorites");
}

function setActive(name) {
  document.querySelectorAll(".menu").forEach(menu => {
    menu.classList.toggle(
      "active",
      menu.innerText === name
    );
  });
}

/* ================= SEARCH ================= */
search.addEventListener("input", () => {
  let source =
    currentView === "favorites"
      ? favorites
      : songs;

  let filtered = source.filter(song =>
    song.title
      .toLowerCase()
      .includes(search.value.toLowerCase()) ||
    song.artist
      .toLowerCase()
      .includes(search.value.toLowerCase())
  );

  renderPlaylist(filtered);
});

/* ================= FAVORITES ================= */
function toggleFav(song) {
  let exist = favorites.find(
    f => f.title === song.title
  );

  if (exist) {
    favorites = favorites.filter(
      f => f.title !== song.title
    );
  } else {
    favorites.push(song);
  }

  localStorage.setItem(
    "favorites",
    JSON.stringify(favorites)
  );

  renderPlaylist(
    currentView === "favorites"
      ? favorites
      : songs
  );
}

/* ================= VOLUME ================= */
volume.oninput = () => {
  audio.volume = volume.value;
};

/* ================= RENDER ================= */
function renderPlaylist(list) {
  playlistDiv.innerHTML = "";

  list.forEach(song => {
    let div = document.createElement("div");

    div.className = "song";

    let fav = favorites.find(
      f => f.title === song.title
    );

    div.innerHTML = `
      ${song.title} - ${song.artist}
      <span style="float:right;cursor:pointer">
        ${fav ? "❤️" : "🤍"}
      </span>
    `;

    /* PLAY SONG */
    div.onclick = () => {
      currentIndex = songs.findIndex(
        s => s.title === song.title
      );

      loadSong(currentIndex);

      audio.play();
    };

    /* FAVORITE */
    div.querySelector("span").onclick = e => {
      e.stopPropagation();

      toggleFav(song);
    };

    playlistDiv.appendChild(div);
  });

  setTimeout(highlight, 50);
}

/* ================= ACTIVE SONG ================= */
function highlight() {
  document.querySelectorAll(".song").forEach(el => {
    el.classList.toggle(
      "active",
      el.innerText.includes(currentSongTitle)
    );
  });
}

/* ================= PROGRESS ================= */
audio.ontimeupdate = () => {
  if (audio.duration) {
    progress.value =
      (audio.currentTime / audio.duration) * 100;
  }
};

progress.oninput = () => {
  if (audio.duration) {
    audio.currentTime =
      (progress.value / 100) * audio.duration;
  }
};

/* ================= INIT ================= */
loadSongs();