// Find the date inputs, button, and gallery on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.getElementById('getImages');
const gallery = document.getElementById('gallery');

// Set up the date inputs using the helper in dateRange.js
setupDateInputs(startInput, endInput);
gallery.replaceChildren();

function formatApiDate(date) {
  // Convert the input date from YYYY-MM-DD to the API's YYMMDD format
  const [year, month, day] = date.split('-');
  return `${year.slice(2)}${month}${day}`;
}

function getRandomImages(images) {
  const uniqueImages = [];
  const imageUrls = new Set();

  images.forEach((image) => {
    if (image.media_type === 'image' && image.hdurl && !imageUrls.has(image.hdurl)) {
      imageUrls.add(image.hdurl);
      uniqueImages.push(image);
    }
  });

  // Shuffle the unique images so the first 9 are randomly selected
  for (let index = uniqueImages.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [uniqueImages[index], uniqueImages[randomIndex]] = [uniqueImages[randomIndex], uniqueImages[index]];
  }

  return uniqueImages.slice(0, 9);
}

async function showSpaceImages() {
  gallery.replaceChildren();

  try {
    if (!startInput.value || !endInput.value || startInput.value > endInput.value) {
      throw new Error('Choose a valid date range.');
    }

    const url = new URL('https://science.nasa.gov/wp-json/wp/v2/apod-basic');
    url.searchParams.set('date_from', formatApiDate(startInput.value));
    url.searchParams.set('date_to', formatApiDate(endInput.value));

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`NASA API request failed with status ${response.status}`);
    }

    const images = getRandomImages(await response.json());

    images.forEach((image) => {
      const galleryItem = document.createElement('div');
      galleryItem.className = 'gallery-item';

      const imageElement = document.createElement('img');
      imageElement.src = image.hdurl;
      imageElement.alt = image.title;

      galleryItem.append(imageElement);
      gallery.append(galleryItem);
    });
  } catch (error) {
    console.error('Could not load the gallery:', error);
  }
}

getImagesButton.addEventListener('click', showSpaceImages);
