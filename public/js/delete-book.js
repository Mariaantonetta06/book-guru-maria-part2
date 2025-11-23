// Delete Book Handler
async function deleteBookHandler(bookId, event) {
    event.stopPropagation();

    // Confirmation dialog
    if (!confirm('⚠️ Are you sure you want to delete this book? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/delete-book/${bookId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('✓ Book deleted successfully!', 'success');
            
            // Reload books after 1 second
            setTimeout(() => {
                loadBooks();
            }, 1000);
        } else {
            showAlert(data.message || 'Error deleting book', 'error');
        }
    } catch (error) {
        console.error('Error deleting book:', error);
        showAlert('Server error while deleting book', 'error');
    }
}