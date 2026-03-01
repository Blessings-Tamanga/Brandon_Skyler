// Hamburger Menu
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen);
});

document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', false);
    });
});

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');

themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    themeToggle.textContent = isLight ? '🌙 Dark' : '☀️ Light';
});

if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.textContent = '🌙 Dark';
} else {
    themeToggle.textContent = '☀️ Light';
}

// Modal Functions
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Form Submission – send data to server API instead of just alerting
async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        name: form.name.value,
        email: form.email.value,
        subject: form.subject.value,
        message: form.message.value,
        timestamp: Date.now()
    };
    try {
        await fetch('/api/contactMessages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        alert('Thank you for your message. We will respond within 24 hours.');
        form.reset();
    } catch (err) {
        console.error(err);
        alert('There was a problem submitting your message. Please try again later.');
    }
}

// Gallery Carousel
const galleryImages = [
    'Media/clear.png',
    'Media/clear.png',
    'Media/clear.png',
    'Media/clear.png',
    'Media/clear.png',
    'Media/clear.png'
];

let currentGalleryIndex = 0;

function openGalleryCarousel(index) {
    currentGalleryIndex = index;
    const carouselModal = document.getElementById('carouselModal');
    carouselModal.classList.add('active');
    updateCarouselImage();
}

function closeGalleryCarousel() {
    const carouselModal = document.getElementById('carouselModal');
    carouselModal.classList.remove('active');
}

function updateCarouselImage() {
    const imageDisplay = document.getElementById('carouselImageDisplay');
    imageDisplay.src = galleryImages[currentGalleryIndex];
    document.getElementById('currentImageIndex').textContent = currentGalleryIndex + 1;
    document.getElementById('totalImages').textContent = galleryImages.length;
}

function nextGalleryImage() {
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
    updateCarouselImage();
}

function previousGalleryImage() {
    currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
    updateCarouselImage();
}

// Close carousel on background click
document.getElementById('carouselModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeGalleryCarousel();
    }
});

// Keyboard navigation for carousel
document.addEventListener('keydown', function(e) {
    const carouselModal = document.getElementById('carouselModal');
    if (carouselModal.classList.contains('active')) {
        if (e.key === 'ArrowRight') nextGalleryImage();
        if (e.key === 'ArrowLeft') previousGalleryImage();
        if (e.key === 'Escape') closeGalleryCarousel();
    }
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// fetch and populate front‑end data from API
async function initializeFrontPage() {
    try {
        const releases = await fetch('/api/musicReleases').then(r => r.json());
        const grid = document.getElementById('releasesGrid');
        if (Array.isArray(releases)) {
            grid.innerHTML = releases.map(item => `
                <div class="release-card">
                    <div class="release-image"><i class="fas ${item.cover}"></i></div>
                    <div class="release-info">
                        <div class="release-year">${item.year}</div>
                        <h3 class="release-title">${item.title}</h3>
                        <p class="release-type">${item.type}</p>
                        <a href="#" class="btn btn-primary">Listen Now</a>
                    </div>
                </div>
            `).join('');
        } else {
            console.warn('API returned non-array', releases);
        }
    } catch (err) {
        console.error('Failed to load releases', err);
    }
}

window.addEventListener('DOMContentLoaded', initializeFrontPage);
