// Floating message function
function showFloatingMessage(message) {
    const floatingMessage = document.getElementById('floating-message');
    floatingMessage.textContent = message;
    floatingMessage.classList.remove('hidden');
    setTimeout(() => {
        floatingMessage.classList.add('hidden');
    }, 3000);
}

// Back to home button functionality
const backHomeBtn = document.getElementById('back-home-btn');

backHomeBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});
