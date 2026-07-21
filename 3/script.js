const track = document.getElementById("track");
let imgUrls = [];
let cards = [];
let currentIndex = 0;
const angleStep = 22; // Distance between cards in degrees

function buildGalleryUrls(manifest) {
  const urls = [];
  const categories = ["Male", "Female"];

  categories.forEach((category) => {
    const maxImages = Number(manifest[category]) || 0;
    for (let i = 1; i <= maxImages; i++) {
      urls.push(`../img/gallery/${category}/${i}.jpg`);
    }
  });

  return urls;
}

function renderCards() {
  track.innerHTML = "";

  imgUrls.forEach((url) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.backgroundImage = `url(${url})`;
    track.appendChild(card);
  });

  cards = Array.from(document.querySelectorAll(".card"));
  currentIndex = imgUrls.length > 0 ? Math.floor(imgUrls.length / 2) : 0;
  updateCards();
}

async function loadGalleryImages() {
  try {
    const response = await fetch(`../gallery_manifest.json?v=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`Failed to load manifest: ${response.status}`);
    }

    const manifest = await response.json();
    imgUrls = buildGalleryUrls(manifest);
  } catch (error) {
    console.error("Unable to load gallery images", error);
    imgUrls = [];
  }

  renderCards();
}

function updateCards() {
  if (cards.length === 0) {
    return;
  }

  cards.forEach((card, i) => {
    // Calculate the rotation for THIS card based on the current center index
    const cardRotation = (i - currentIndex) * angleStep;

    card.style.transform = `rotate(${cardRotation}deg)`;

    // Toggle active classes
    if (i === currentIndex) {
      card.classList.add("active");
    } else {
      card.classList.remove("active");
    }
  });
}

function move(dir) {
  const newIndex = currentIndex + dir;
  if (newIndex >= 0 && newIndex < imgUrls.length) {
    currentIndex = newIndex;
    updateCards();
  }
}

// Run on load
loadGalleryImages();

// Mouse Wheel
let lastScroll = 0;
window.addEventListener("wheel", (e) => {
  if (Date.now() - lastScroll < 600) return;
  lastScroll = Date.now();
  move(e.deltaY > 0 ? 1 : -1);
});