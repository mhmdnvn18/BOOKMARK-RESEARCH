document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('research-form');
    const editForm = document.getElementById('edit-research-form');
    const researchList = document.getElementById('research-list');
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

    async function displayResearchPapers(searchTerm = '') {
        researchList.innerHTML = '';
        const querySnapshot = await getDocs(collection(db, 'research-papers'));
        const categories = {};
        querySnapshot.forEach((doc) => {
            const research = doc.data();
            if (!categories[research.category]) {
                categories[research.category] = [];
            }
            categories[research.category].push({ ...research, id: doc.id });
        });

        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');

        for (const category in categories) {
            const categorySection = document.createElement('div');
            categorySection.classList.add('category-section');
            categorySection.innerHTML = `<h3 class="category-title">${category} (${categories[category].length})</h3>`;

            categories[category].forEach(research => {
                const researchElement = document.createElement('div');
                researchElement.classList.add('card', 'text-bg-primary', 'mb-3');
                researchElement.style.maxWidth = '18rem';
                researchElement.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">
                            <img src="https://www.google.com/s2/favicons?domain=${research.url}" class="favicon" alt="Favicon">
                            ${research.title}
                        </h5>
                        <p class="card-text">
                            <button class="btn btn-success btn-sm flex-fill me-1" onclick="window.open('${research.url}', '_blank')">Visit Site</button>
                        </p>
                        <p class="card-text">
                            <span class="research-category">${research.category}</span>
                            <div class="research-actions d-flex justify-content-between">
                                <button class="btn btn-warning btn-sm flex-fill me-1" onclick="editResearch('${research.id}')">Edit</button>
                                <button class="btn btn-danger btn-sm flex-fill me-1" onclick="confirmDeleteResearch('${research.id}')">Delete</button>
                            </div>
                        </p>
                    </div>
                `;
                if (document.body.classList.contains('dark-mode')) {
                    researchElement.classList.add('dark-mode');
                }
                categorySection.appendChild(researchElement);
            });

            categoryContainer.appendChild(categorySection);
        }

        researchList.appendChild(categoryContainer);

        // Initialize Bootstrap dropdowns
        const dropdownElements = document.querySelectorAll('.dropdown-toggle');
        dropdownElements.forEach(dropdown => {
            new bootstrap.Dropdown(dropdown);
        });
    }

    window.confirmDeleteResearch = function(id) {
        deleteIndex = id;
        confirmationDialog.style.display = 'block';
    }

    confirmDeleteButton.addEventListener('click', async function() {
        await deleteDoc(doc(db, 'research-papers', deleteIndex));
        confirmationDialog.style.display = 'none';
        displayResearchPapers();
    });

    cancelDeleteButton.addEventListener('click', function() {
        confirmationDialog.style.display = 'none';
    });

    window.editResearch = async function(id) {
        editIndex = id;
        const docSnap = await getDoc(doc(db, 'research-papers', id));
        const research = docSnap.data();
        document.getElementById('edit-title').value = research.title;
        document.getElementById('edit-url').value = research.url;
        document.getElementById('edit-category').value = research.category;
        document.getElementById('edit-research').style.display = 'block';
    }

    cancelEditButton.addEventListener('click', function() {
        editForm.reset();
        document.getElementById('edit-research').style.display = 'none';
    });

    editForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const title = document.getElementById('edit-title').value;
        const url = document.getElementById('edit-url').value;
        const category = document.getElementById('edit-category').value;
        await updateDoc(doc(db, 'research-papers', editIndex), { title, url, category });
        displayResearchPapers();
        editForm.reset();
        document.getElementById('edit-research').style.display = 'none';
    });

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        const title = document.getElementById('title').value;
        const url = document.getElementById('url').value;
        const category = document.getElementById('category').value;
        console.log('Adding research paper:', { title, url, category });
        try {
            await addDoc(collection(db, 'research-papers'), { title, url, category });
            console.log('Research paper added successfully');
            displayResearchPapers();
            form.reset();
        } catch (error) {
            console.error('Error adding research paper:', error);
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
        filterResearchPapers(query);
    });

    function filterResearchPapers(query) {
        const researchPapers = document.querySelectorAll('.card');
        researchPapers.forEach(research => {
            const title = research.querySelector('.card-title').textContent.toLowerCase();
            const url = research.querySelector('.research-url').textContent.toLowerCase();
            if (title.includes(query) || url.includes(query)) {
                research.style.display = '';
            } else {
                research.style.display = 'none';
            }
        });
    }

    displayResearchPapers();
});
