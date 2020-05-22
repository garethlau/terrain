let rows;
let cols;
let scl = 2;
let w = 256;
let h = 256;
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
let controlsContainer;

const SMOOTHING = 0.6;
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

function preload() {
  soundFormats("mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  background(BACKGROUND_COLOR);
  cols = w / scl;
  rows = h / scl;

  playBtn = createButton("PLAY");
  playBtn.class("control-btn play");
  playBtn.position(width / 2, height / 5 + ACTIONS_CONTAINER_OFFSET);
  playBtn.style("transform", "translate(-50%, -50%)");

  pauseBtn = createButton("PAUSE");
  pauseBtn.position(width / 2, height / 5 + ACTIONS_CONTAINER_OFFSET);
  pauseBtn.style("transform", "translate(-50%, -50%)");

  pauseBtn.class("control-btn pause");
  pauseBtn.hide();

  nextBtn = createButton("NEXT");
  nextBtn.class("control-btn next");

  nextBtn.position(width / 2 + 160, height / 5 + ACTIONS_CONTAINER_OFFSET);
  nextBtn.style("transform", "translate(-50%, -50%)");

  prevBtn = createButton("PREV");
  prevBtn.class("control-btn prev");
  prevBtn.position(width / 2 - 160, height / 5 + ACTIONS_CONTAINER_OFFSET);
  prevBtn.style("transform", "translate(-50%, -50%)");

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

  loaderContainer = createDiv();
  loaderContainer.position(width / 2, height / 5 + ACTIONS_CONTAINER_OFFSET);
  loaderContainer.style("transform", "translate(-50%, -50%)");
  loaderContainer.style("width", "41px");
  loaderContainer.style("height", "41px");
  loaderContainer.style("background-color", BACKGROUND_COLOR);
  loader = createDiv();
  loader.addClass("loader");
  loaderContainer.child(loader);

  songTitle = createP(songs[index].displayName);
  songTitle.position(width / 2, height / 5);
  songTitle.style("transform", "translate(-50%, -50%)");
  songTitle.class("song-title");

  controlsContainer = createDiv();
  controlsContainer.child(playBtn);
  controlsContainer.child(pauseBtn);
  controlsContainer.child(nextBtn);
  controlsContainer.child(prevBtn);

  fft = new p5.FFT(SMOOTHING, BINS);
  clearTerrain();
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

  if (loadingSong) {
    controlsContainer.hide();
    loaderContainer.show();
  } else {
    controlsContainer.show();
    loaderContainer.hide();
  }
}

function clearTerrain() {
  for (var x = 0; x < cols; x++) {
    terrain[x] = [];
    for (var y = 0; y < rows; y++) {
      terrain[x][y] = null; //specify a default value for now
    }
  }
}

function populateTerrain() {
  spectrum = fft.analyze();
  console.log(spectrum.length);
  flying -= 0.1;
  var yoff = flying;

  terrain.shift();
  let lastRow = [];
  for (let i = 0; i < cols; i++) {
    lastRow[i] = map(spectrum[i], 0, 255, 0, 100);
  }
  terrain.push(lastRow);
}

function drawTerrain() {
  background(BACKGROUND_COLOR);
  translate(0, 50);
  rotateX(PI / 3);
  rotateZ(PI / 4);
  translate(-w / 2, -h / 2);
  noStroke();

  for (let y = 0; y < rows - 1; y++) {
    // fill(255, map(y, 0, rows - 1, 0, 255), 0, map(y, 0, rows - 1, 100, 255));
    fill(255, map(y, 0, rows - 1, 0, 255), 0);
    // normalMaterial();
    beginShape(TRIANGLE_STRIP);
    for (let x = 0; x < cols; x++) {
      vertex(x * scl, y * scl, terrain[y][x]);
      vertex(x * scl, (y + 1) * scl, terrain[y + 1][x]);
    }
    endShape();
  }
  rotateX(-PI / 3);
  rotateZ(-PI / 4);
  translate(w / 2, h / 2);
}
