let rows;
let cols;
let scl = 4;
let w = 512;
let h = 512;
let terrain = [];
let flying = 0;

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
let loaderDiv;

const SMOOTHING = 0.3;
const ACTIONS_CONTAINER_OFFSET = 130;

const BACKGROUND_COLOR = "#00FFE6";
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
    displayName: "Alone - Alan Walker",
    path: "songs/Alan Walker - Alone.mp3",
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
  loaderContainer.center();
}

function setup() {
  soundFormats("mp3");
  createCanvas(windowWidth, windowHeight, WEBGL);

  playBtn = createButton("PLAY");

  pauseBtn = createButton("PAUSE");
  pauseBtn.hide();

  nextBtn = createButton("NEXT");

  prevBtn = createButton("PREV");

  nextBtn.mousePressed(() => {
    index = (index + 1) % songs.length;
    changeSong();
  });

  prevBtn.mousePressed(() => {
    if (index === 0) index = songs.length - 1;
    else index -= 1;
    changeSong();
  });

  pauseBtn.mousePressed(() => {
    pauseBtn.hide();
    playBtn.show();
    currAudio.pause();
  });

  playBtn.mousePressed(() => {
    playBtn.hide();
    pauseBtn.show();
    currAudio.play();
  });

  currAudio = loadSound(songs[index].path, () => {
    loadingSong = false;
  });

  loader = createDiv();
  loaderContainer = createDiv();
  loaderContainer.child(loader);
  loaderContainer.class("loader-container");
  songTitle = createP(songs[index].displayName);
  songTitle.class("song-title");

  positionUI();
  loader.addClass("loader");
  prevBtn.class("control-btn prev");
  nextBtn.class("control-btn next");
  playBtn.class("control-btn play");
  pauseBtn.class("control-btn pause");

  fft = new p5.FFT(SMOOTHING, BINS);
  clearTerrain();
  drawTerrain();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionUI();
  drawTerrain();
}

function loadProgress() {
  console.log("Loading");
}
function loadError() {
  console.log("error");
}
function loadDone() {
  console.log("Done loading");
}

function draw() {
  songTitle.html(songs[index].displayName);
  if (currAudio.isPlaying()) {
    populateTerrain();
    drawTerrain();
  }

  positionUI();
  if (loadingSong) {
    playBtn.hide();
    pauseBtn.hide();
    nextBtn.hide();
    prevBtn.hide();
    loader.show();
  } else {
    playBtn.show();
    nextBtn.show();
    prevBtn.show();
    loader.hide();
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
  flying -= 0.1;
  var yoff = flying;

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
    // fill(255, map(y, 0, rows - 1, 0, 255), 0, map(y, 0, rows - 1, 100, 255));
    // fill(255, map(y, 0, rows - 1, 0, 255), 0);
    
    beginShape(TRIANGLE_STRIP);
    for (let x = 0; x < cols; x++) {
      // console.log(terrain[y][x])
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
