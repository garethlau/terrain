let rows;
let cols;
let scl = 2;
let w = 400;
let h = 400;
let terrain = [];
let flying = 0;

let currAudio;
let fft;
let spectrum;

let playBtn;
let pauseBtn;
let select;

let songs = {
  alone: {
    displayName: "Alone - Alan Walker",
    path: "songs/Alan Walker - Alone.mp3",
  },
  claireDeLune: {
    displayName: "Claire de lune - Claude Debussy",
    path: "songs/clairedelune.mp3",
  },
  theOcean: {
    displayName: "The Ocean - Mike Perry",
    path: "songs/Mike Perry Ft  Shy Martin  - The Ocean.mp3",
  },
  shelter: {
    displayName: "Shelter - Porter Robinson",
    path: "songs/Porter Robinson & Madeon - Shelter.mp3",
  },
};

function preload() {
  soundFormats("mp3");
  Object.keys(songs).forEach((song) => {
    songs[song].audio = loadSound(
      songs[song].path,
      loadDone,
      loadError,
      loadProgress
    );
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  background(0);
  cols = w / scl;
  console.log(cols);
  rows = h / scl;

  playBtn = createButton("Play");
  playBtn.position((9 * width) / 10, (9 * height) / 10);
  pauseBtn = createButton("Pause");
  pauseBtn.position((9 * width) / 10, (9 * height) / 10);
  pauseBtn.hide();

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

  let select = createSelect();
  select.position((1 * width) / 10, (9 * height) / 10);
  select.option(songs.alone.displayName);
  select.option(songs.claireDeLune.displayName);
  select.option(songs.theOcean.displayName);
  select.option(songs.shelter.displayName);
  select.selected(songs.shelter.displayName);
  currAudio = songs.shelter.audio;
  select.changed(() => {

    clearTerrain();
    currAudio.pause();
    playBtn.show();
    pauseBtn.hide();
    Object.keys(songs).forEach((song) => {
      if (select.value() === songs[song].displayName) {
        currAudio = songs[song].audio;
        return;
      }
    });
  });

  fft = new p5.FFT(0.75, 256);
  clearTerrain();
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
  if (currAudio.isPlaying()) {
    drawSpectrum();
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

function drawSpectrum() {
  spectrum = fft.analyze();
  flying -= 0.1;
  var yoff = flying;

  terrain.shift();
  let lastRow = [];
  for (let i = 0; i < cols; i++) {
    lastRow[i] = map(spectrum[i], 0, 255, 0, 100);
  }
  terrain.push(lastRow);
  background(0);
  translate(0, 50);
  rotateX(PI / 3);
  /// noFill();
  // stroke(255)
  translate(-w / 2, -h / 2);

  for (let y = 0; y < rows - 1; y++) {
    fill(255, map(y, 0, rows - 1, 0, 255), 0, map(y, 0, rows - 1, 100, 255));
    beginShape(TRIANGLE_STRIP);
    for (let x = 0; x < cols; x++) {
      vertex(x * scl, y * scl, terrain[y][x]);
      vertex(x * scl, (y + 1) * scl, terrain[y + 1][x]);
    }
    endShape();
  }
}
