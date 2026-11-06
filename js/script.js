// Find the date inputs, button, and gallery on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.getElementById('getImages');
const gallery = document.getElementById('gallery');

// Set up the date inputs using the helper in dateRange.js
setupDateInputs(startInput, endInput);

function formatApiDate(date) {
  // Convert the input date from YYYY-MM-DD to the API's YYMMDD format
  const [year, month, day] = date.split('-');
  return `${year.slice(2)}${month}${day}`;
}

function getRandomImages(images) {
  const uniqueImages = [];
  const imageUrls = new Set();

  images.forEach((image) => {
    if (image.hdurl && !imageUrls.has(image.hdurl)) {
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
  let loadingMessage;

  try {
    if (!startInput.value || !endInput.value || startInput.value > endInput.value) {
      throw new Error('Choose a valid date range.');
    }

    loadingMessage = document.createElement('p');
    loadingMessage.className = 'placeholder';
    loadingMessage.textContent = 'Loading space images...';
    loadingMessage.setAttribute('role', 'status');
    gallery.append(loadingMessage);

    const url = new URL('https://science.nasa.gov/wp-json/wp/v2/apod-basic');
    url.searchParams.set('date_from', formatApiDate(startInput.value));
    url.searchParams.set('date_to', formatApiDate(endInput.value));

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`NASA API request failed with status ${response.status}`);
    }

    const images = getRandomImages(await response.json());
    gallery.replaceChildren();

    images.forEach((image, index) => {
      const galleryItem = document.createElement('button');
      const explanationId = `apod-explanation-${index}`;
      galleryItem.className = 'gallery-item';
      galleryItem.type = 'button';
      galleryItem.setAttribute('aria-expanded', 'false');
      galleryItem.setAttribute('aria-controls', explanationId);
      
      let imageElement;
      if (image.media_type === 'image') {
        imageElement = document.createElement('img');
        imageElement.src = image.hdurl;
        imageElement.alt = image.title;
      } else if (image.media_type === 'video') {
        imageElement = document.createElement('img');
        imageElement.src = image.hdurl;
        imageElement.alt = image.title;
      }
      const details = document.createElement('span');
      details.className = 'gallery-item-details';

      const title = document.createElement('span');
      title.className = 'gallery-item-title';
      title.textContent = image.title;

      const date = document.createElement('span');
      date.className = 'gallery-item-date';
      date.textContent = image.date;

      const explanation = document.createElement('div');
      explanation.className = 'gallery-item-explanation';
      explanation.id = explanationId;
      explanation.innerHTML = image.explanation;
      explanation.hidden = true;

      details.append(title, date);
      galleryItem.append(imageElement, details, explanation);
      galleryItem.addEventListener('click', () => {
        const isExpanded = galleryItem.getAttribute('aria-expanded') === 'true';
        galleryItem.setAttribute('aria-expanded', String(!isExpanded));
        explanation.hidden = isExpanded;
      });
      gallery.append(galleryItem);
    });
  } catch (error) {
    loadingMessage?.remove();
    console.error('Could not load the gallery:', error);
  }
}

getImagesButton.addEventListener('click', showSpaceImages);
