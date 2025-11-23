// Submit Add Book Form
async function submitForm(event) {
    event.preventDefault();

    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const genre = document.getElementById('genre').value.trim();

    // Validation
    if (!title || !author || !genre) {
        showAlert('Please fill all fields', 'error');
        return;
    }

    // Disable submit button
    const submitBtn = document.querySelector('#addBookForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding...';

    try {
        const response = await fetch('/api/add-book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                author: author,
                genre: genre
            })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('✓ Book added successfully!', 'success');
            
            // Reset form
            document.getElementById('addBookForm').reset();

            // Switch to view section after 1.5 seconds
            setTimeout(() => {
                document.getElementById('add').classList.remove('active');
                document.getElementById('view').classList.add('active');
                
                document.querySelectorAll('.nav-btn')[0].classList.add('active');
                document.querySelectorAll('.nav-btn')[1].classList.remove('active');
                
                loadBooks();
            }, 1500);
        } else {
            showAlert(data.message || 'Error adding book', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Server error while adding book', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Show Alert Messages
function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);

    // Auto remove after 4 seconds
    setTimeout(() => {
        alert.remove();
    }, 4000);
}