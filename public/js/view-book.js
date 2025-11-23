// Show/Hide Sections
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    const buttons = document.querySelectorAll('.nav-btn');

    sections.forEach(section => section.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));

    document.getElementById(sectionId).classList.add('active');
    event.target.classList.add('active');

    if (sectionId === 'view') {
        loadBooks();
    }
}

// Load Books from API
async function loadBooks() {
    const container = document.getElementById('booksContainer');
    container.innerHTML = '<div class="loading"><div class="spinner"></div> Loading books...</div>';

    try {
        const response = await fetch('/view-book');
        const data = await response.json();
        displayBooks(data.books || []);
    } catch (error) {
        console.error('Error loading books:', error);
        container.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;"><p>❌ Error loading books</p></div>';
    }
}

// Display Books in Grid
function displayBooks(books) {
    const container = document.getElementById('booksContainer');

    if (books.length === 0) {
        container.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;"><p>📭 No books found. Start by adding one!</p></div>';
        return;
    }

    container.innerHTML = books.map(book => `
        <div class="book-card">
            <button class="delete-btn" onclick="deleteBookHandler('${book.bookId}', event)">✕</button>
            <h3>${escapeHtml(book.title)}</h3>
            <p><span class="label">Author:</span> ${escapeHtml(book.author)}</p>
            <p><span class="label">Status:</span> ${escapeHtml(book.status)}</p>
            <span class="genre">${escapeHtml(book.genre)}</span>
        </div>
    `).join('');
}

// Filter Books by Search Term
function filterBooks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.book-card');

    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const author = card.querySelector('p').textContent.toLowerCase();
        const genre = card.querySelector('.genre').textContent.toLowerCase();

        if (title.includes(searchTerm) || author.includes(searchTerm) || genre.includes(searchTerm)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load books when page loads
window.addEventListener('load', loadBooks);