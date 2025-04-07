// Filename: ../../scripts/CA-connect-metamask.js
// Desc: Handles prototype wallet connection simulation.

document.addEventListener('DOMContentLoaded', () => {
    // Get the button - Finds button inside the form with id="form1"
    const connectForm = document.getElementById('form1');
    const connectWalletBtn = connectForm ? connectForm.querySelector('button') : null;

    // Check if shared functions are loaded
    if (typeof isWalletConnected !== 'function') {
        console.error("Shared dashboard script or isWalletConnected function not loaded before CA-connect-metamask.js!");
        alert("Page Initialization Error!");
        if(connectWalletBtn) connectWalletBtn.disabled = true; // Disable button if error
        return;
    }

    // Update button text based on connection status on page load
    function updateButtonState() {
        if (connectWalletBtn) {
            if (isWalletConnected()) {
                connectWalletBtn.textContent = 'Wallet Connected';
                connectWalletBtn.disabled = true;
            } else {
                connectWalletBtn.textContent = 'Connect Wallet';
                connectWalletBtn.disabled = false;
            }
        } else {
            console.error("Connect Wallet button not found in CA-connect-metamask.js.");
        }
    }

    updateButtonState(); // Set initial state

    // Event listener for the Connect Wallet button
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', function() {
            // Simulate successful wallet connection for prototype
            console.log('Simulating wallet connection...');
            sessionStorage.setItem('walletConnected', 'true'); // Use sessionStorage

            updateButtonState(); // Update button after connection

            // Notify user
            alert('Wallet Connected! You can now access Vote and Results.');
        });
    }

    // Timer and nav are handled by shared-dashboard.js

}); // End DOMContentLoaded