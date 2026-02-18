const animals = [
  { key: "1", name: "Cat", icon: "🐱", file: "sounds/cat.mp3" },
  { key: "2", name: "Dog", icon: "🐶", file: "sounds/dog.mp3" },
  { key: "3", name: "Cow", icon: "🐮", file: "sounds/cow.mp3" },
  { key: "4", name: "Horse", icon: "🐴", file: "sounds/horse.mp3" },
  { key: "5", name: "Sheep", icon: "🐑", file: "sounds/sheep.mp3" },
  { key: "6", name: "Lion", icon: "🦁", file: "sounds/lion.mp3" },
  { key: "7", name: "Elephant", icon: "🐘", file: "sounds/elephant.mp3" },
  { key: "8", name: "Duck", icon: "🦆", file: "sounds/duck.mp3" },
];

const grid = document.getElementById("grid");
const stopAllBtn = document.getElementById("stopAll");
const volumeEl = document.getElementById("volume");
const singlePlayEl = document.getElementById("singlePlay");

const players = new Map(); // name -> { audio, button }

function makeButton(animal) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "card";
  btn.setAttribute("aria-label", `Play ${animal.name} sound`);
  btn.dataset.key = animal.key;
  btn.dataset.name = animal.name;

  btn.innerHTML = `
    <div class="top">
      <span class="badge">Key ${animal.key}</span>
      <span class="badge">${animal.name}</span>
    </div>
    <div class="animal">
      <div class="icon" aria-hidden="true">${animal.icon}</div>
      <div class="meta">
        <p class="name">${animal.name}</p>
        <p class="file">${animal.file}</p>
      </div>
    </div>
  `;

  btn.addEventListener("click", () => playAnimal(animal.name));
  return btn;
}

function ensureAudio(animalName) {
  if (players.has(animalName)) return players.get(animalName);

  const animal = animals.find(a => a.name === animalName);
  const audio = new Audio(animal.file);
  audio.preload = "auto";
  audio.volume = Number(volumeEl.value);

  audio.addEventListener("play", () => setPlaying(animalName, true));
  audio.addEventListener("pause", () => setPlaying(animalName, false));
  audio.addEventListener("ended", () => setPlaying(animalName, false));

  const entry = { audio, button: null };
  players.set(animalName, entry);
  return entry;
}

function setPlaying(animalName, isPlaying) {
  const entry = players.get(animalName);
  if (!entry?.button) return;
  entry.button.classList.toggle("playing", isPlaying);
}

function stopAll() {
  for (const [name, entry] of players.entries()) {
    entry.audio.pause();
    entry.audio.currentTime = 0;
    setPlaying(name, false);
  }
}

async function playAnimal(animalName) {
  if (singlePlayEl.checked) stopAll();

  const entry = ensureAudio(animalName);
  entry.audio.volume = Number(volumeEl.value);

  // restart if already playing
  if (!entry.audio.paused) entry.audio.currentTime = 0;

  try {
    await entry.audio.play();
  } catch (err) {
    console.error(err);
    alert(
      "Could not play audio. Make sure the sound file exists (e.g., sounds/cat.mp3) and open this using a local server."
    );
  }
}

function init() {
  for (const animal of animals) {
    const btn = makeButton(animal);
    grid.appendChild(btn);

    const entry = ensureAudio(animal.name);
    entry.button = btn;
  }

  stopAllBtn.addEventListener("click", stopAll);

  volumeEl.addEventListener("input", () => {
    const v = Number(volumeEl.value);
    for (const entry of players.values()) entry.audio.volume = v;
  });

  window.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    const animal = animals.find(a => a.key === e.key);
    if (!animal) return;
    playAnimal(animal.name);
  });
}

init();
