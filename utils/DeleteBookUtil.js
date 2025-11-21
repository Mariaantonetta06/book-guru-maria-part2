
const fs = require('fs').promises;
const path = require('path');

// json file that sotres all the books
const BOOKS_FILE = path.join('utils', 'library.json');

// delete api/books/:id
async function deleteBook(req, res) {
    try {
        const { id } = req.params;
        let books = [];

        try {
            const data = await fs.readFile(BOOKS_FILE, 'utf8');
            books = JSON.parse(data);
        } catch (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).json({ message: 'No books found to delete.' });
            } else {
                throw err;
            }
        }

        const bookIndex = books.findIndex(b => b.id == id);
        if (bookIndex === -1) {
            return res.status(404).json({ message: 'Book not found.' });
        }

        const deletedBook = books.splice(bookIndex, 1)[0];

        await fs.writeFile(BOOKS_FILE, JSON.stringify(books, null, 2), 'utf8');

        return res.status(200).json({
            message: 'Book deleted successfully!',
            deletedBook,
        });

    } catch (error) {
        console.error('Error deleting book:', error);
        return res.status(500).json({ message: 'Server error: ' + error.message });
    }
}

module.exports = { deleteBook };