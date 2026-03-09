
        // ---------- HELPER: SERVER API REQUEST ----------
        async function apiRequest(resource, method = 'GET', body = null, queryParams = '') {
            let url = `/api/${resource}` + (queryParams ? `?${queryParams}` : '');
            const opts = { method, headers: { 'Content-Type': 'application/json' } };
            if (body) opts.body = JSON.stringify(body);
            const res = await fetch(url, opts);
            let payload;
            try {
                payload = await res.json();
            } catch {
                payload = null;
            }
            if (!res.ok) {
                const details = payload && payload.error ? `: ${payload.error}` : '';
                throw new Error(`API ${res.status} ${res.statusText}${details}`);
            }
            return payload;
        }

        // note: data is no longer kept in localStorage, server is the source of truth.
        // the initData() helper and sample data are removed; the backend will supply
        // any initial content (see /lib/db.js and /pages/api/*).
        
        // ---------- STATS ----------

        // ---------- LOGIN ----------
        async function handleLogin() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            if (username === 'admin' && password === 'password') {
                sessionStorage.setItem('adminAuth', 'true');
                document.getElementById('loginOverlay').style.display = 'none';
                document.getElementById('adminDashboard').style.display = 'block';
                try {
                    await loadStats();
                    await loadfilm();
                    await loadActing();
                    await loadGallery();
                    await loadTeam();
                    await loadMessages();
                } catch (err) {
                    alert(`Dashboard failed to load: ${err.message}`);
                }
            } else {
                alert('Invalid credentials');
            }
        }

        function logout() {
            sessionStorage.removeItem('adminAuth');
            document.getElementById('loginOverlay').style.display = 'flex';
            document.getElementById('adminDashboard').style.display = 'none';
        }

        if (sessionStorage.getItem('adminAuth') === 'true') {
            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'block';
            // fire-and-forget is okay, but we want stats to appear quickly
            loadStats();
            loadfilm();
            loadActing();
            loadGallery();
            loadTeam();
            loadMessages();
        }

        // ---------- STATS ----------
        async function loadStats() {
            // grab all collections in parallel
            const [film, acting, gallery, team, messages] = await Promise.all([
                apiRequest('filmReleases'),
                apiRequest('actingProjects'),
                apiRequest('galleryItems'),
                apiRequest('teamMembers'),
                apiRequest('contactMessages')
            ]);
            document.getElementById('statsContainer').innerHTML = `
                <div class="stat-card"><h3>${film.length}</h3><p>film Releases</p></div>
                <div class="stat-card"><h3>${acting.length}</h3><p>Acting Projects</p></div>
                <div class="stat-card"><h3>${gallery.length}</h3><p>Gallery Images</p></div>
                <div class="stat-card"><h3>${team.length}</h3><p>Team Members</p></div>
                <div class="stat-card"><h3>${messages.length}</h3><p>Messages</p></div>
            `;
        }

        // ---------- TAB SWITCHING ----------
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const tab = btn.dataset.tab;
                document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
                document.getElementById(tab + 'Panel').classList.add('active');
            });
        });

        // ---------- BUTTON WIRING ----------
        function wireStaticButtons() {
            document.getElementById('loginBtn').addEventListener('click', handleLogin);
            document.getElementById('logoutBtn').addEventListener('click', logout);
            document.getElementById('addfilmBtn').addEventListener('click', () => openfilmModal());
            document.getElementById('addActingBtn').addEventListener('click', () => openActingModal());
            document.getElementById('addGalleryBtn').addEventListener('click', () => openGalleryModal());
            document.getElementById('addTeamBtn').addEventListener('click', () => openTeamModal());
            document.getElementById('clearMessagesBtn').addEventListener('click', clearMessages);
            document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
        }

        // Handle dynamic Edit/Delete buttons rendered into lists
        function wireDelegatedActions() {
            document.addEventListener('click', (e) => {
                const actionBtn = e.target.closest('button[data-action]');
                if (!actionBtn) return;
                const action = actionBtn.dataset.action;
                const id = Number(actionBtn.dataset.id);

                if (action === 'edit-film') editfilm(id);
                if (action === 'delete-film') deletefilm(id);
                if (action === 'edit-acting') editActing(id);
                if (action === 'delete-acting') deleteActing(id);
                if (action === 'edit-gallery') editGallery(id);
                if (action === 'delete-gallery') deleteGallery(id);
                if (action === 'edit-team') editTeam(id);
                if (action === 'delete-team') deleteTeam(id);
            });
        }

        // ---------- film CRUD ----------
        async function loadfilm() {
            const items = await apiRequest('filmReleases');
            document.getElementById('filmList').innerHTML = items.map(item => `
                <div class="item-card">
                    <div class="item-info">
                        <h4>${item.title} (${item.year})</h4>
                        <p>${item.type}</p>
                    </div>
                    <div class="item-actions">
                        <button data-action="edit-film" data-id="${item.id}">Edit</button>
                        <button data-action="delete-film" data-id="${item.id}">Delete</button>
                    </div>
                </div>
            `).join('');
        }
        async function deletefilm(id) {
            await apiRequest('filmReleases', 'DELETE', null, `id=${id}`);
            await loadfilm();
            await loadStats();
        }
        async function editfilm(id) {
            const items = await apiRequest('filmReleases');
            const item = items.find(i => i.id === id);
            openfilmModal(item);
        }
        function openfilmModal(item = null) {
            document.getElementById('modalTitle').innerText = item ? 'Edit film Release' : 'Add film Release';
            document.getElementById('modalFields').innerHTML = `
                <input type="hidden" id="filmId" value="${item ? item.id : ''}">
                <input type="text" id="filmYear" placeholder="Year" value="${item ? item.year : ''}" required>
                <input type="text" id="filmTitle" placeholder="Title" value="${item ? item.title : ''}" required>
                <input type="text" id="filmType" placeholder="Type (Single/Album)" value="${item ? item.type : ''}" required>
                <input type="text" id="filmCover" placeholder="Cover icon class (e.g. fa-film)" value="${item ? item.cover : 'fa-film'}" required>
            `;
            document.getElementById('itemModal').classList.add('active');
            window.currentModalType = 'film';
        }

        // ---------- ACTING CRUD ----------
        async function loadActing() {
            const items = await apiRequest('actingProjects');
            document.getElementById('actingList').innerHTML = items.map(item => `
                <div class="item-card">
                    <div class="item-info">
                        <h4>${item.title}</h4>
                        <p>${(item.description || '').substring(0,60)}...</p>
                    </div>
                    <div class="item-actions">
                        <button data-action="edit-acting" data-id="${item.id}">Edit</button>
                        <button data-action="delete-acting" data-id="${item.id}">Delete</button>
                    </div>
                </div>
            `).join('');
        }
        async function deleteActing(id) {
            await apiRequest('actingProjects','DELETE',null,`id=${id}`);
            await loadActing();
            await loadStats();
        }
        async function editActing(id) {
            const items = await apiRequest('actingProjects');
            const item = items.find(i => i.id === id);
            openActingModal(item);
        }
        function openActingModal(item = null) {
            document.getElementById('modalTitle').innerText = item ? 'Edit Acting Project' : 'Add Acting Project';
            document.getElementById('modalFields').innerHTML = `
                <input type="hidden" id="actingId" value="${item ? item.id : ''}">
                <input type="text" id="actingTitle" placeholder="Title" value="${item ? item.title : ''}" required>
                <textarea id="actingDescription" placeholder="Description" required>${item ? item.description : ''}</textarea>
                <input type="text" id="actingVideo" placeholder="YouTube Video ID (e.g. dQw4w9WgXcQ)" value="${item ? item.video : ''}" required>
                <input type="text" id="actingLink" placeholder="Link (e.g. #)" value="${item ? item.link : '#'}" required>
            `;
            document.getElementById('itemModal').classList.add('active');
            window.currentModalType = 'acting';
        }

        // ---------- GALLERY CRUD ----------
        async function loadGallery() {
            const items = await apiRequest('galleryItems');
            document.getElementById('galleryList').innerHTML = items.map(item => `
                <div class="item-card">
                    <div class="item-info">
                        <h4>${item.title}</h4>
                        <p>${item.category}</p>
                    </div>
                    <div class="item-actions">
                        <button data-action="edit-gallery" data-id="${item.id}">Edit</button>
                        <button data-action="delete-gallery" data-id="${item.id}">Delete</button>
                    </div>
                </div>
            `).join('');
        }
        async function deleteGallery(id) {
            await apiRequest('galleryItems','DELETE',null,`id=${id}`);
            await loadGallery();
            await loadStats();
        }
        async function editGallery(id) {
            const items = await apiRequest('galleryItems');
            const item = items.find(i => i.id === id);
            openGalleryModal(item);
        }
        function openGalleryModal(item = null) {
            document.getElementById('modalTitle').innerText = item ? 'Edit Gallery Image' : 'Add Gallery Image';
            document.getElementById('modalFields').innerHTML = `
                <input type="hidden" id="galleryId" value="${item ? item.id : ''}">
                <input type="text" id="gallerySrc" placeholder="Image path (e.g. Media/Brandon_Sklenar.jpg)" value="${item ? item.src : 'Media/Brandon_Sklenar.jpg'}" required>
                <input type="text" id="galleryTitle" placeholder="Title" value="${item ? item.title : ''}" required>
                <input type="text" id="galleryCategory" placeholder="Category" value="${item ? item.category : ''}" required>
            `;
            document.getElementById('itemModal').classList.add('active');
            window.currentModalType = 'gallery';
        }

        // ---------- TEAM CRUD ----------
        async function loadTeam() {
            const items = await apiRequest('teamMembers');
            document.getElementById('teamList').innerHTML = items.map(item => `
                <div class="item-card">
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <p>${item.role}</p>
                    </div>
                    <div class="item-actions">
                        <button data-action="edit-team" data-id="${item.id}">Edit</button>
                        <button data-action="delete-team" data-id="${item.id}">Delete</button>
                    </div>
                </div>
            `).join('');
        }
        async function deleteTeam(id) {
            await apiRequest('teamMembers','DELETE',null,`id=${id}`);
            await loadTeam();
            await loadStats();
        }
        async function editTeam(id) {
            const items = await apiRequest('teamMembers');
            const item = items.find(i => i.id === id);
            openTeamModal(item);
        }
        function openTeamModal(item = null) {
            document.getElementById('modalTitle').innerText = item ? 'Edit Team Member' : 'Add Team Member';
            document.getElementById('modalFields').innerHTML = `
                <input type="hidden" id="teamId" value="${item ? item.id : ''}">
                <input type="text" id="teamName" placeholder="Name" value="${item ? item.name : ''}" required>
                <input type="text" id="teamRole" placeholder="Role" value="${item ? item.role : ''}" required>
                <textarea id="teamBio" placeholder="Bio" required>${item ? item.bio : ''}</textarea>
                <input type="text" id="teamImage" placeholder="Image path" value="${item ? item.image : 'Media/Brandon_Sklenar.jpg'}" required>
                <input type="text" id="teamSkills" placeholder="Skills (comma separated)" value="${item ? item.skills.join(', ') : ''}" required>
            `;
            document.getElementById('itemModal').classList.add('active');
            window.currentModalType = 'team';
        }

        // ---------- SAVE MODAL ----------
        async function saveModalItem(e) {
            e.preventDefault();
            const type = window.currentModalType;
            let route;
            let payload;
            if (type === 'film') {
                route = 'filmReleases';
                const id = document.getElementById('filmId').value;
                payload = {
                    id: id ? parseInt(id) : Date.now(),
                    year: document.getElementById('filmYear').value,
                    title: document.getElementById('filmTitle').value,
                    type: document.getElementById('filmType').value,
                    cover: document.getElementById('filmCover').value
                };
            } else if (type === 'acting') {
                route = 'actingProjects';
                const id = document.getElementById('actingId').value;
                payload = {
                    id: id ? parseInt(id) : Date.now(),
                    title: document.getElementById('actingTitle').value,
                    description: document.getElementById('actingDescription').value,
                    video: document.getElementById('actingVideo').value,
                    link: document.getElementById('actingLink').value
                };
            } else if (type === 'gallery') {
                route = 'galleryItems';
                const id = document.getElementById('galleryId').value;
                payload = {
                    id: id ? parseInt(id) : Date.now(),
                    src: document.getElementById('gallerySrc').value,
                    title: document.getElementById('galleryTitle').value,
                    category: document.getElementById('galleryCategory').value
                };
            } else if (type === 'team') {
                route = 'teamMembers';
                const id = document.getElementById('teamId').value;
                const skills = document.getElementById('teamSkills').value.split(',').map(s => s.trim());
                payload = {
                    id: id ? parseInt(id) : Date.now(),
                    name: document.getElementById('teamName').value,
                    role: document.getElementById('teamRole').value,
                    bio: document.getElementById('teamBio').value,
                    image: document.getElementById('teamImage').value,
                    skills: skills
                };
            }
            // choose POST for new vs PUT for existing item
            if (payload) {
                const method = payload.id && (await apiRequest(route)).some(i => i.id === payload.id) ? 'PUT' : 'POST';
                await apiRequest(route, method, payload);
            }
            await loadStats();
            if (type === 'film') await loadfilm();
            if (type === 'acting') await loadActing();
            if (type === 'gallery') await loadGallery();
            if (type === 'team') await loadTeam();
            closeModal();
        }

        function closeModal() {
            document.getElementById('itemModal').classList.remove('active');
        }

        // ---------- MESSAGES ----------
        async function loadMessages() {
            const messages = await apiRequest('contactMessages');
            const container = document.getElementById('messagesList');
            if (messages.length === 0) {
                container.innerHTML = '<p style="color: var(--text-tertiary);">No messages yet.</p>';
                return;
            }
            container.innerHTML = messages
                .slice() // copy so we can reverse without mutating
                .reverse()
                .map(m => `
                <div class="message-item">
                    <strong>${m.name}</strong> (${m.email}) · <small>${m.subject}</small>
                    <p>${m.message}</p>
                    <small>${new Date(m.timestamp).toLocaleString()}</small>
                </div>
            `).join('');
        }

        async function clearMessages() {
            if (confirm('Delete all messages?')) {
                // bulk delete isn't implemented yet; just overwrite with empty array
                await apiRequest('contactMessages', 'PUT', []);
                await loadMessages();
                await loadStats();
            }
        }

        // Close modal on outside click
        document.getElementById('itemModal').addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });

        wireStaticButtons();
        wireDelegatedActions();

        // Make functions global
        window.handleLogin = handleLogin;
        window.logout = logout;
        window.loadStats = loadStats;
        window.loadfilm = loadfilm;
        window.loadActing = loadActing;
        window.loadGallery = loadGallery;
        window.loadTeam = loadTeam;
        window.loadMessages = loadMessages;
        window.openfilmModal = openfilmModal;
        window.editfilm = editfilm;
        window.deletefilm = deletefilm;
        window.openActingModal = openActingModal;
        window.editActing = editActing;
        window.deleteActing = deleteActing;
        window.openGalleryModal = openGalleryModal;
        window.editGallery = editGallery;
        window.deleteGallery = deleteGallery;
        window.openTeamModal = openTeamModal;
        window.editTeam = editTeam;
        window.deleteTeam = deleteTeam;
        window.saveModalItem = saveModalItem;
        window.closeModal = closeModal;
        window.clearMessages = clearMessages;
    
