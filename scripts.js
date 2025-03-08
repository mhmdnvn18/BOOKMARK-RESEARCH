document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const clearButton = document.getElementById('clear-button');
    const loadingSpinner = document.getElementById('loading-spinner');
    const categoryFilters = document.getElementById('category-filters');
    const researchCards = document.getElementById('research-cards').children;
    const addResearchForm = document.getElementById('add-research-form');

    searchButton.addEventListener('click', () => {
        loadingSpinner.style.display = 'inline-block';
        setTimeout(() => {
            const query = searchInput.value.toLowerCase();
            for (let card of researchCards) {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const abstract = card.querySelector('p').textContent.toLowerCase();
                if (title.includes(query) || abstract.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
            loadingSpinner.style.display = 'none';
            clearButton.classList.remove('hidden');
        }, 500); // Simulate loading time
    });

    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        for (let card of researchCards) {
            card.style.display = 'block';
        }
        clearButton.classList.add('hidden');
    });

    categoryFilters.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            const category = event.target.getAttribute('data-category');
            for (let card of researchCards) {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
            // Highlight active filter button
            const buttons = categoryFilters.querySelectorAll('button');
            buttons.forEach(button => button.classList.remove('active'));
            event.target.classList.add('active');
        }
    });

    addResearchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(addResearchForm);
        const newCard = document.createElement('div');
        newCard.className = 'bg-white rounded-xl shadow-md card-hover group';
        newCard.setAttribute('data-category', formData.get('category'));
        newCard.innerHTML = `
            <div class="p-5 flex flex-col h-full">
                <div class="flex items-start mb-4">
                    <img src="${formData.get('image') || 'IMAGE_URL'}" 
                         class="w-20 h-20 object-cover rounded-lg border border-gray-200" alt="Research Image">
                    <div class="ml-4 flex-1">
                        <h3 class="text-lg font-bold text-gray-800 mb-1">
                            ${formData.get('title')}
                        </h3>
                        <div class="flex items-center text-sm text-gray-500 mb-2">
                            <i class="fas fa-user-graduate mr-2"></i>${formData.get('author')}
                        </div>
                        <div class="flex items-center text-sm text-gray-500">
                            <i class="fas fa-calendar-alt mr-2"></i>${formData.get('date')}
                        </div>
                    </div>
                </div>
                <p class="text-gray-600 text-sm mb-4 line-clamp-3">
                    Abstract: ${formData.get('abstract')}
                </p>
                <div class="mt-auto flex justify-between items-center">
                    <a href="${formData.get('pdf') || '#'}" class="text-green-600 hover:text-green-700 font-medium flex items-center">
                        <i class="fas fa-download mr-2"></i>Download PDF
                    </a>
                    <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        <i class="fas fa-tag mr-1"></i>${formData.get('category')}
                    </span>
                </div>
            </div>
        `;
        document.getElementById('research-cards').appendChild(newCard);
        addResearchForm.reset();
    });
});
