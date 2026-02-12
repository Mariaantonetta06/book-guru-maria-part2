// Submit Create Book Form
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
    const submitBtn = document.querySelector('#createBookForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';

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
            showAlert('✅ Book created successfully!', 'success');
            
            // Reset form
            document.getElementById('createBookForm').reset();

            // Switch to view section after 1.5 seconds
            setTimeout(() => {
                document.getElementById('create').classList.remove('active');
                document.getElementById('view').classList.add('active');
                
                document.querySelectorAll('.nav-btn')[0].classList.add('active');
                document.querySelectorAll('.nav-btn')[1].classList.remove('active');
                
                loadBooks();
            }, 1500);
        } else {
            showAlert(data.message || 'Error creating book', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Server error while creating book', 'error');
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