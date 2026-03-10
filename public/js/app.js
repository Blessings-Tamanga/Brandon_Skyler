// Hamburger Menu
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen);
});

document.querySelectorAll('.nav-menu a').forEach((link) => {
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
    themeToggle.textContent = isLight ? 'Dark' : 'Light';
});

if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.textContent = 'Dark';
} else {
    themeToggle.textContent = 'Light';
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

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function onClick(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

const CONTENT_SYNC_CHANNEL = 'site-content-sync';
const CONTENT_SYNC_EVENT = 'siteContentUpdatedAt';
let contentSyncChannel = null;
const API_REFRESH_INTERVAL_MS = 0;
let refreshIntervalId = null;
const CACHE_PREFIX = 'publicSiteCache:';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const REALTIME_POLL_INTERVAL_MS = 5000;
let realtimeEnabled = false;

async function fetchCollection(resource) {
    const url = `/api/${resource}?_t=${Date.now()}`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Failed to fetch ${resource} (${response.status})`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
}

async function fetchAllCollections() {
    const url = `/api/publicContent?_t=${Date.now()}`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Failed to fetch public content (${response.status})`);
    }
    const data = await response.json();
    return data && typeof data === 'object' ? data : {};
}

function readCachedCollection(resource) {
    try {
        const raw = localStorage.getItem(`${CACHE_PREFIX}${resource}`);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.items)) return null;
        if (Date.now() - (parsed.savedAt || 0) > CACHE_TTL_MS) return null;
        return parsed.items;
    } catch {
        return null;
    }
}

function writeCachedCollection(resource, items) {
    try {
        localStorage.setItem(`${CACHE_PREFIX}${resource}`, JSON.stringify({
            savedAt: Date.now(),
            items
        }));
    } catch {
        // ignore cache failures (private mode/quota)
    }
}

function hasSameContent(container, data) {
    if (!container) return false;
    const nextHash = JSON.stringify(data || []);
    if (container.dataset.contentHash === nextHash) return true;
    container.dataset.contentHash = nextHash;
    return false;
}

function getYouTubeEmbedUrl(urlOrId = '') {
    const raw = String(urlOrId || '').trim();
    if (!raw) return '';
    if (!raw.includes('http')) return `https://www.youtube.com/embed/${raw}`;
    try {
        const url = new URL(raw);
        if (url.hostname.includes('youtu.be')) {
            const id = url.pathname.replace('/', '');
            return id ? `https://www.youtube.com/embed/${id}` : '';
        }
        if (url.hostname.includes('youtube.com')) {
            const id = url.searchParams.get('v');
            if (id) return `https://www.youtube.com/embed/${id}`;
            if (url.pathname.startsWith('/embed/')) return raw;
        }
        return raw;
    } catch {
        return raw;
    }
}

// Filmography
async function loadFilms() {
    try {
        const grid = document.getElementById('releasesGrid');
        if (!grid) return;

        const cached = readCachedCollection('filmReleases');
        if (cached && !hasSameContent(grid, cached)) {
            renderFilms(grid, cached);
        }

        const films = await fetchCollection('filmReleases');
        writeCachedCollection('filmReleases', films);
        if (!hasSameContent(grid, films)) {
            renderFilms(grid, films);
        }
    } catch (error) {
        console.error('Error loading filmography:', error);
        const grid = document.getElementById('releasesGrid');
        if (grid) grid.innerHTML = '<p>Unable to load filmography.</p>';
    }
}

function renderFilms(grid, films) {
    if (!films || films.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-tertiary);">No film projects yet.</p>';
        return;
    }

    grid.innerHTML = films.map((film) => {
        const filmTitle = film.title || '';
        const filmYear = film.year || '';
        const filmRole = film.role || film.type || '';
        const filmPoster = film.poster || film.cover || 'Media/Brandon_Sklenar.jpg';
        const filmTrailerUrl = film.trailerUrl || film.trailer || '';
        return `
            <div class="release-card">
                <div class="release-image">
                    <img class="release-poster" src="${filmPoster}" alt="${filmTitle} poster">
                </div>
                <div class="release-info">
                    <p class="release-year">${filmYear}</p>
                    <h3 class="release-title">${filmTitle}</h3>
                    <p class="release-type">${filmRole}</p>
                    ${filmTrailerUrl ? `<a href="${filmTrailerUrl}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Watch Trailer</a>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Acting Projects
async function loadActingProjects() {
    try {
        const grid = document.getElementById('actingGrid');
        if (!grid) return;

        const cached = readCachedCollection('actingProjects');
        if (cached && !hasSameContent(grid, cached)) {
            renderActing(grid, cached);
        }

        const projects = await fetchCollection('actingProjects');
        writeCachedCollection('actingProjects', projects);
        if (!hasSameContent(grid, projects)) {
            renderActing(grid, projects);
        }
    } catch (error) {
        console.error('Error loading acting projects:', error);
    }
}

function renderActing(grid, projects) {
    if (!projects || projects.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-tertiary);">No projects yet.</p>';
        return;
    }

    grid.innerHTML = projects.map((project) => `
        <div class="acting-card">
            <h3>${project.title || ''}</h3>
            <p>${project.description || ''}</p>
            <div class="video-container">
                <iframe src="${getYouTubeEmbedUrl(project.video || '')}" allowfullscreen></iframe>
            </div>
            <a href="${project.link || '#'}" class="btn btn-primary">View Details</a>
        </div>
    `).join('');
}

// Gallery (store items globally for carousel)
let galleryItems = [];

async function loadGallery() {
    try {
        const grid = document.getElementById('galleryGrid');
        if (!grid) return;

        const cached = readCachedCollection('galleryItems');
        if (cached) {
            galleryItems = cached;
            if (!hasSameContent(grid, cached)) {
                renderGallery(grid, cached);
            }
        }

        const fresh = await fetchCollection('galleryItems');
        galleryItems = fresh;
        writeCachedCollection('galleryItems', fresh);
        if (!hasSameContent(grid, fresh)) {
            renderGallery(grid, fresh);
        }
    } catch (error) {
        console.error('Error loading gallery:', error);
    }
}

function renderGallery(grid, items) {
    if (!items || items.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-tertiary);">No gallery images yet.</p>';
        document.getElementById('totalImages').textContent = '0';
        return;
    }

    grid.innerHTML = items.map((item, index) => `
        <div class="gallery-item" onclick="openGalleryCarousel(${index})">
            <div class="gallery-image">
                <img src="${item.src}" alt="${item.title}">
                <i class="fas fa-search-plus gallery-zoom-icon"></i>
            </div>
            <div class="gallery-overlay">
                <div class="gallery-title">${item.title}</div>
                <div class="gallery-category">${item.category}</div>
            </div>
        </div>
    `).join('');

    document.getElementById('totalImages').textContent = items.length;
}

// Team
async function loadTeam() {
    try {
        const grid = document.getElementById('teamGrid');
        if (!grid) return;

        const cached = readCachedCollection('teamMembers');
        if (cached && !hasSameContent(grid, cached)) {
            renderTeam(grid, cached);
        }

        const team = await fetchCollection('teamMembers');
        writeCachedCollection('teamMembers', team);
        if (!hasSameContent(grid, team)) {
            renderTeam(grid, team);
        }
    } catch (error) {
        console.error('Error loading team:', error);
    }
}

function renderTeam(grid, team) {
    if (!team || team.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-tertiary);">No team members yet.</p>';
        return;
    }

    grid.innerHTML = team.map((member) => `
        <div class="team-card">
            <div class="team-image">
                <img src="${member.image}" alt="${member.name}">
            </div>
            <h3>${member.name}</h3>
            <p class="team-role">${member.role}</p>
            <p class="team-bio">${member.bio}</p>
            <div class="team-skills">
                ${(Array.isArray(member.skills) ? member.skills : []).map((skill) => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

function refreshDynamicSections() {
    loadAllCollections();
}

function refreshDynamicSection(resource) {
    switch (resource) {
        case 'filmReleases':
            loadFilms();
            return;
        case 'actingProjects':
            loadActingProjects();
            return;
        case 'galleryItems':
            loadGallery();
            return;
        case 'teamMembers':
            loadTeam();
            return;
        default:
            refreshDynamicSections();
    }
}

async function loadAllCollections() {
    try {
        const cachedFilms = readCachedCollection('filmReleases');
        const cachedActing = readCachedCollection('actingProjects');
        const cachedGallery = readCachedCollection('galleryItems');
        const cachedTeam = readCachedCollection('teamMembers');

        if (cachedFilms) renderFilms(document.getElementById('releasesGrid'), cachedFilms);
        if (cachedActing) renderActing(document.getElementById('actingGrid'), cachedActing);
        if (cachedGallery) renderGallery(document.getElementById('galleryGrid'), cachedGallery);
        if (cachedTeam) renderTeam(document.getElementById('teamGrid'), cachedTeam);

        const payload = await fetchAllCollections();
        const films = Array.isArray(payload.filmReleases) ? payload.filmReleases : [];
        const acting = Array.isArray(payload.actingProjects) ? payload.actingProjects : [];
        const gallery = Array.isArray(payload.galleryItems) ? payload.galleryItems : [];
        const team = Array.isArray(payload.teamMembers) ? payload.teamMembers : [];

        writeCachedCollection('filmReleases', films);
        writeCachedCollection('actingProjects', acting);
        writeCachedCollection('galleryItems', gallery);
        writeCachedCollection('teamMembers', team);

        renderFilms(document.getElementById('releasesGrid'), films);
        renderActing(document.getElementById('actingGrid'), acting);
        renderGallery(document.getElementById('galleryGrid'), gallery);
        renderTeam(document.getElementById('teamGrid'), team);
    } catch (error) {
        console.error('Error loading public content:', error);
    }
}

function setupCrossPageSync() {
    if ('BroadcastChannel' in window) {
        contentSyncChannel = new BroadcastChannel(CONTENT_SYNC_CHANNEL);
        contentSyncChannel.onmessage = (event) => {
            if (event?.data?.type === 'content-updated') {
                refreshDynamicSection(event.data.resource);
            }
        };
    }

    window.addEventListener('storage', (event) => {
        if (event.key === CONTENT_SYNC_EVENT && event.newValue) {
            refreshDynamicSections();
        }
    });
}

function setupSupabaseRealtime() {
    const config = window.__SUPABASE__ || {};
    if (!window.supabase || !window.supabase.createClient) return false;
    if (!config.url || !config.anonKey) return false;

    try {
        const client = window.supabase.createClient(config.url, config.anonKey);
        const tableMap = {
            filmReleases: 'filmReleases',
            actingProjects: 'actingProjects',
            galleryItems: 'galleryItems',
            teamMembers: 'teamMembers'
        };

        Object.entries(tableMap).forEach(([resource, table]) => {
            client
                .channel(`public:${table}`)
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table },
                    () => refreshDynamicSection(resource)
                )
                .subscribe();
        });

        return true;
    } catch (err) {
        console.warn('Realtime setup failed:', err);
        return false;
    }
}

let currentImageIndex = 0;

window.openGalleryCarousel = function openGalleryCarousel(index) {
    currentImageIndex = index;
    updateCarouselImage();
    document.getElementById('carouselModal').classList.add('active');
};

window.updateCarouselImage = function updateCarouselImage() {
    const img = document.getElementById('carouselImageDisplay');
    if (galleryItems.length > 0) {
        img.src = galleryItems[currentImageIndex].src;
        document.getElementById('currentImageIndex').textContent = currentImageIndex + 1;
    }
};

window.previousGalleryImage = function previousGalleryImage() {
    if (currentImageIndex > 0) {
        currentImageIndex -= 1;
        updateCarouselImage();
    }
};

window.nextGalleryImage = function nextGalleryImage() {
    if (currentImageIndex < galleryItems.length - 1) {
        currentImageIndex += 1;
        updateCarouselImage();
    }
};

window.closeGalleryCarousel = function closeGalleryCarousel() {
    document.getElementById('carouselModal').classList.remove('active');
};

document.getElementById('carouselModal').addEventListener('click', function onBackdropClick(e) {
    if (e.target === this) {
        closeGalleryCarousel();
    }
});

document.addEventListener('keydown', (e) => {
    const carouselModal = document.getElementById('carouselModal');
    if (carouselModal.classList.contains('active')) {
        if (e.key === 'ArrowRight') nextGalleryImage();
        if (e.key === 'ArrowLeft') previousGalleryImage();
        if (e.key === 'Escape') closeGalleryCarousel();
    }
});

window.handleSubmit = async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        timestamp: Date.now()
    };

    try {
        const response = await fetch('/api/contactMessages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to send message');
        alert('Message sent successfully!');
        form.reset();
    } catch (error) {
        alert('Error sending message. Please try again.');
        console.error(error);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.protocol === 'file:') {
        console.warn('API routes are unavailable on file://. Run with `npm run dev` and open http://localhost:3000');
    }
    setupCrossPageSync();
    realtimeEnabled = setupSupabaseRealtime();
    refreshDynamicSections();
    if (!realtimeEnabled && !refreshIntervalId) {
        refreshIntervalId = window.setInterval(refreshDynamicSections, REALTIME_POLL_INTERVAL_MS);
    } else if (API_REFRESH_INTERVAL_MS > 0 && !refreshIntervalId) {
        refreshIntervalId = window.setInterval(refreshDynamicSections, API_REFRESH_INTERVAL_MS);
    }
});

window.addEventListener('focus', refreshDynamicSections);
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        refreshDynamicSections();
    }
});
