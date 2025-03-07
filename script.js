document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('bookmark-form');
    const editForm = document.getElementById('edit-bookmark-form');
    const bookmarkList = document.getElementById('bookmark-list');
    const themeToggle = document.getElementById('theme-toggle');
    const searchInput = document.getElementById('search-input');
    const confirmationDialog = document.getElementById('confirmation-dialog');
    const confirmDeleteButton = document.getElementById('confirm-delete');
    const cancelDeleteButton = document.getElementById('cancel-delete');
    const cancelEditButton = document.getElementById('cancel-edit');
    let editIndex = null;
    let deleteIndex = null;

    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyDSyI1drQSWkU1192Ol_7UnOztxxTZkerQ",
        authDomain: "bookmark-manager-7c5ab.firebaseapp.com",
        projectId: "bookmark-manager-7c5ab",
        storageBucket: "bookmark-manager-7c5ab.firebasestorage.app",
        messagingSenderId: "1098246411927",
        appId: "1:1098246411927:web:9a44915017f9d35fbefbd2",
        measurementId: "G-YF6CS3N1C6"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const spinner = document.createElement('div');
    spinner.classList.add('spinner');
    const confirmationDialog = document.createElement('div');
    confirmationDialog.classList.add('confirmation-dialog');
    confirmationDialog.style.display = 'none';
    confirmationDialog.innerHTML = `
        <p>Are you sure you want to delete this bookmark?</p>
        <button id="confirm-delete" class="btn btn-danger" aria-label="Confirm Delete">Yes</button>
        <button id="cancel-delete" class="btn btn-secondary" aria-label="Cancel Delete">No</button>
    `;
    document.body.appendChild(spinner);
    document.body.appendChild(confirmationDialog);

    async function displayBookmarks(searchTerm = '') {
        bookmarkList.innerHTML = '';
        const querySnapshot = await getDocs(collection(db, 'bookmarks'));
        const categories = {};
        querySnapshot.forEach((doc) => {
            const bookmark = doc.data();
            if (!categories[bookmark.category]) {
                categories[bookmark.category] = [];
            }
            categories[bookmark.category].push({ ...bookmark, id: doc.id });
        });

        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');

        for (const category in categories) {
            const categorySection = document.createElement('div');
            categorySection.classList.add('category-section');
            categorySection.innerHTML = `<h3 class="category-title">${category} (${categories[category].length})</h3>`;

            categories[category].forEach(bookmark => {
                const bookmarkElement = document.createElement('div');
                bookmarkElement.classList.add('card', 'text-bg-primary', 'mb-3');
                bookmarkElement.style.maxWidth = '18rem';
                bookmarkElement.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">
                            <img src="https://www.google.com/s2/favicons?domain=${bookmark.url}" class="favicon" alt="Favicon">
                            ${bookmark.title}
                        </h5>
                        <p class="card-text">
                            <button class="btn btn-success btn-sm flex-fill me-1" onclick="window.open('${bookmark.url}', '_blank')">Visit Site</button>
                        </p>
                        <p class="card-text">
                            <span class="bookmark-category">${bookmark.category}</span>
                            <div class="bookmark-actions d-flex justify-content-between">
                                <button class="btn btn-warning btn-sm flex-fill me-1" onclick="editBookmark('${bookmark.id}')">Edit</button>
                                <button class="btn btn-danger btn-sm flex-fill me-1" onclick="confirmDeleteBookmark('${bookmark.id}')">Delete</button>
                                <button class="btn btn-info btn-sm flex-fill" onclick="shareBookmark('${bookmark.url}', '${bookmark.title}')">Share</button>
                            </div>
                        </p>
                    </div>
                `;
                if (document.body.classList.contains('dark-mode')) {
                    bookmarkElement.classList.add('dark-mode');
                }
                categorySection.appendChild(bookmarkElement);
            });

            categoryContainer.appendChild(categorySection);
        }

        bookmarkList.appendChild(categoryContainer);

        // Initialize Bootstrap dropdowns
        const dropdownElements = document.querySelectorAll('.dropdown-toggle');
        dropdownElements.forEach(dropdown => {
            new bootstrap.Dropdown(dropdown);
        });
    }

    window.confirmDeleteBookmark = function(id) {
        deleteIndex = id;
        confirmationDialog.style.display = 'block';
    }

    confirmDeleteButton.addEventListener('click', async function() {
        await deleteDoc(doc(db, 'bookmarks', deleteIndex));
        confirmationDialog.style.display = 'none';
        displayBookmarks();
    });

    cancelDeleteButton.addEventListener('click', function() {
        confirmationDialog.style.display = 'none';
    });

    window.editBookmark = async function(id) {
        editIndex = id;
        const docSnap = await getDoc(doc(db, 'bookmarks', id));
        const bookmark = docSnap.data();
        document.getElementById('edit-title').value = bookmark.title;
        document.getElementById('edit-url').value = bookmark.url;
        document.getElementById('edit-category').value = bookmark.category;
        document.getElementById('edit-bookmark').style.display = 'block';
    }

    cancelEditButton.addEventListener('click', function() {
        editForm.reset();
        document.getElementById('edit-bookmark').style.display = 'none';
    });

    editForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const title = document.getElementById('edit-title').value;
        const url = document.getElementById('edit-url').value;
        const category = document.getElementById('edit-category').value;
        await updateDoc(doc(db, 'bookmarks', editIndex), { title, url, category });
        displayBookmarks();
        editForm.reset();
        document.getElementById('edit-bookmark').style.display = 'none';
    });

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        const title = document.getElementById('title').value;
        const url = document.getElementById('url').value;
        const category = document.getElementById('category').value;
        console.log('Adding bookmark:', { title, url, category });
        try {
            await addDoc(collection(db, 'bookmarks'), { title, url, category });
            console.log('Bookmark added successfully');
            displayBookmarks();
            form.reset();
        } catch (error) {
            console.error('Error adding bookmark:', error);
        }
    });

    window.logout = function() {
        localStorage.removeItem('loggedIn');
        window.location.href = 'login.html';
    }

    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        document.querySelectorAll('section').forEach(section => {
            section.classList.toggle('dark-mode');
        });
        document.querySelectorAll('.card').forEach(card => {
            card.classList.toggle('dark-mode');
        });
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        document.querySelectorAll('section').forEach(section => {
            section.classList.add('dark-mode');
        });
        document.querySelectorAll('.card').forEach(card => {
            card.classList.add('dark-mode');
        });
    }

    searchInput.addEventListener('input', function() {
        const query = searchInput.value.toLowerCase();
        filterBookmarks(query);
    });

    function filterBookmarks(query) {
        const bookmarks = document.querySelectorAll('.card');
        bookmarks.forEach(bookmark => {
            const title = bookmark.querySelector('.card-title').textContent.toLowerCase();
            const url = bookmark.querySelector('.bookmark-url').textContent.toLowerCase();
            if (title.includes(query) || url.includes(query)) {
                bookmark.style.display = '';
            } else {
                bookmark.style.display = 'none';
            }
        });
    }

    window.shareBookmark = function(url, title) {
        const shareData = {
            title: title,
            text: `Check out this bookmark: ${title}`,
            url: url
        };

        if (navigator.share) {
            navigator.share(shareData).catch(console.error);
        } else {
            const mailtoLink = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text)}%0A${encodeURIComponent(shareData.url)}`;
            window.location.href = mailtoLink;
        }
    }

    displayBookmarks();

    window.exportBookmarks = async function() {
        const querySnapshot = await getDocs(collection(db, 'bookmarks'));
        const bookmarks = [];
        querySnapshot.forEach((doc) => {
            bookmarks.push(doc.data());
        });
        const blob = new Blob([JSON.stringify(bookmarks, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bookmarks.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    window.importBookmarks = async function(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async function(e) {
            const bookmarks = JSON.parse(e.target.result);
            for (const bookmark of bookmarks) {
                await addDoc(collection(db, 'bookmarks'), bookmark);
            }
            displayBookmarks();
        }
        reader.readAsText(file);
    }

    function loadTheme() {
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
            document.querySelectorAll('section').forEach(section => {
                section.classList.add('dark-mode');
            });
            document.querySelectorAll('.card').forEach(card => {
                card.classList.add('dark-mode');
            });
        }
    }

    loadTheme();

    window.toggleSidebar = function() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('open');
    }
});