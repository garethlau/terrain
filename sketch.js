let rows;
let cols;
let scl = 4;
let w = 512;
let h = 512;
let terrain = [];

let currAudio;
let index = 0;
let fft;
let spectrum;

// Flags
let loadingSong = true;

// HTML Elements
let playBtn;
let pauseBtn;
let nextBtn;
let prevBtn;
let songTitle;
let volumeSlider;

const SMOOTHING = 0.5;
const ACTIONS_CONTAINER_OFFSET = 130;

const BACKGROUND_COLOR = "#42b3f5";
const BINS = 128;

const songs = [
  {
    displayName: "Shelter - Porter Robinson",
    path: "songs/Porter Robinson & Madeon - Shelter.mp3",
  },
  {
    displayName: "The Ocean - Mike Perry",
    path: "songs/Mike Perry Ft  Shy Martin  - The Ocean.mp3",
  },
  {
    displayName: "Claire de lune - Claude Debussy",
    path: "songs/clairedelune.mp3",
  },
  {
    displayName: "New Dior - DigDat x D-Block Europe",
    path: "songs/DigDat x D-Block Europe - New Dior (lyric video).mp3",
  },
  {
    displayName: "Alone - Alan Walker",
    path: "songs/Alan Walker - Alone.mp3",
  },
  {
    displayName: "SICKO MODE ft. Drake - Travis Scott",
    path: "songs/Travis Scott - SICKO MODE ft. Drake (Official Video).mp3",
  },
  {
    displayName: "Free - Kidswaste",
    path: "songs/Kidswaste - Free.mp3",
  },
  {
    displayName: "ADDYS (feat. Nechie) - Gunna",
    path: "songs/Gunna - ADDYS (feat. Nechie) [Official Audio].mp3",
  },
  {
    displayName: "Meh - Playboi Carti",
    path: "songs/Playboi Carti - Meh (Lyrics).mp3",
  },
  {
    displayName: "Knots - Filous",
    path: "songs/Filous - Knots (feat. klei).mp3",
  },
];

function changeSong() {
  currAudio.pause();
  loadingSong = true;

  currAudio = loadSound(songs[index].path, () => {
    playBtn.show();
    pauseBtn.hide();
    loadingSong = false;
  });

  setTimeout(() => {
    clearTerrain();
    drawTerrain();
  }, 100);
}

function positionUI() {
  cols = w / scl;
  rows = h / scl;
  playBtn.center();
  nextBtn.center();
  prevBtn.center();
  pauseBtn.center();
  songTitle.center();
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    goPrev();
  } else if (keyCode === RIGHT_ARROW) {
    goNext();
  } else if (keyCode === UP_ARROW) {
    increaseVolume();
  } else if (keyCode === DOWN_ARROW) {
    decreaseVolume();
  } else if (keyCode === 32) {
    if (!currAudio.isLoaded()) return;
    if (currAudio.isPlaying()) {
      pause();
    } else {
      play();
    }
  }
}

function pause() {
  pauseBtn.hide();
  playBtn.show();
  currAudio.pause();
}

function play() {
  playBtn.hide();
  pauseBtn.show();
  currAudio.play();
}
function goNext() {
  index = (index + 1) % songs.length;
  changeSong();
}
function goPrev() {
  if (index === 0) index = songs.length - 1;
  else index -= 1;
  changeSong();
}

function increaseVolume() {
  let currVolume = volumeSlider.value();
  volumeSlider.value(currVolume + 0.05);
}

function decreaseVolume() {
  let currVolume = volumeSlider.value();
  volumeSlider.value(currVolume - 0.05);
}

function setup() {
  soundFormats("mp3");
  createCanvas(windowWidth, windowHeight, WEBGL);

  window.addEventListener("wheel", function (event) {
    if (event.deltaY < 0) {
      increaseVolume();
    } else if (event.deltaY > 0) {
      decreaseVolume();
    }
  });

  playBtn = createButton("PLAY");

  pauseBtn = createButton("PAUSE");
  pauseBtn.hide();

  nextBtn = createButton("NEXT");

  prevBtn = createButton("PREV");

  nextBtn.mousePressed(goNext);

  prevBtn.mousePressed(goPrev);

  pauseBtn.mousePressed(pause);

  playBtn.mousePressed(play);

  currAudio = loadSound(songs[index].path, () => {
    loadingSong = false;
  });

  songTitle = createP(songs[index].displayName);
  songTitle.class("song-title");

  positionUI();
  prevBtn.class("control-btn prev");
  nextBtn.class("control-btn next");
  playBtn.class("control-btn play");
  pauseBtn.class("control-btn pause");

  sliderContainer = createDiv();
  sliderContainer.id("slider-container");

  volumeSlider = createSlider(0, 1, 0.5, 0.01);
  volumeSlider.id("volume-slider");
  sliderContainer.child(volumeSlider);

  fft = new p5.FFT(SMOOTHING, BINS);
  clearTerrain();
  drawTerrain();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionUI();
  drawTerrain();
}

function draw() {
  songTitle.html(songs[index].displayName);
  if (currAudio.isPlaying()) {
    // console.log(currAudio)
    currAudio.setVolume(volumeSlider.value());

    populateTerrain();
    drawTerrain();
  }

  positionUI();
  if (loadingSong) {
    playBtn.style("opacity", 0.5);
    playBtn.attribute("disabled", "");
  } else {
    playBtn.style("opacity", 1);
    playBtn.removeAttribute("disabled");
  }
}

function clearTerrain() {
  for (var x = 0; x < cols; x++) {
    terrain[x] = [];
    for (var y = 0; y < rows; y++) {
      terrain[x][y] = 0; //specify a default value for now
    }
  }
}

function populateTerrain() {
  spectrum = fft.analyze();

  terrain.shift();
  let lastRow = [];
  for (let i = 0; i < cols; i++) {
    lastRow[cols - 1 - i] = map(spectrum[i], 0, 255, 0, 100);
  }
  terrain.push(lastRow);
}

function drawTerrain() {
  background(BACKGROUND_COLOR);
  translate(0, 100);
  rotateX(PI / 3);
  rotateZ(PI + PI / 4);
  translate(-w / 2, -h / 2);
  noStroke();

  for (let y = 0; y < rows - 1; y++) {
    beginShape(TRIANGLE_STRIP);
    for (let x = 0; x < cols; x++) {
      fill(255, map(terrain[y][x], 0, rows - 1, 255, 50), 0);
      vertex(x * scl, y * scl, terrain[y][x]);
      vertex(x * scl, (y + 1) * scl, terrain[y + 1][x]);
    }
    endShape();
  }
  rotateX(-PI / 3);
  rotateZ(-PI / 4);
  translate(w / 2, h / 2);
}
