<<<<<<< HEAD
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
=======
const connectWalletBtn = document.getElementById('connect-wallet-btn');
const protectedLinks = document.querySelectorAll('.protected-link');
const lockIcons = document.querySelectorAll('.lock-icon');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const confirmBtn = document.getElementById('confirm-btn');
const cancelBtn = document.getElementById('cancel-btn');

// === Run on page load to restore wallet state ===
window.addEventListener("DOMContentLoaded", () => {
  const walletState = localStorage.getItem("walletConnected");

  if (walletState === "true") {
    connectWalletBtn.textContent = "Disconnect Wallet";
    unlockProtectedLinks();
  } else {
    localStorage.setItem("walletConnected", "false"); // Set default
    connectWalletBtn.textContent = "Connect Wallet";
    lockProtectedLinks();
  }
});

// === Connect/Disconnect Button Handler ===
connectWalletBtn.addEventListener('click', () => {
  const isConnected = localStorage.getItem("walletConnected") === "true";

  if (isConnected) {
    showDisconnectModal();
  } else {
    connectWallet();
  }
});

// === Confirm & Cancel Disconnect ===
confirmBtn.addEventListener('click', () => {
  disconnectWallet();
  closeModal();
});

cancelBtn.addEventListener('click', closeModal);

// === Core Wallet Functions ===
function connectWallet() {
  alert("Wallet Connected!");
  connectWalletBtn.textContent = "Disconnect Wallet";
  localStorage.setItem("walletConnected", "true");
  unlockProtectedLinks();
}

function disconnectWallet() {
  alert("Wallet Disconnected.");
  connectWalletBtn.textContent = "Connect Wallet";
  localStorage.setItem("walletConnected", "false");
  lockProtectedLinks();
}

function unlockProtectedLinks() {
  lockIcons.forEach(lock => lock.textContent = '🔓');
  protectedLinks.forEach(link => link.classList.remove('locked'));
}

function lockProtectedLinks() {
  lockIcons.forEach(lock => lock.textContent = '🔒');
  protectedLinks.forEach(link => link.classList.add('locked'));
}

function showDisconnectModal() {
  modal.classList.remove('hidden');
  modalTitle.textContent = "Disconnect Wallet";
  modalBody.textContent = "Are you sure you want to disconnect your wallet?";
}

function closeModal() {
  modal.classList.add('hidden');
}

// === Voting Countdown ===
function startVotingCountdown() {
  const targetDate = new Date('May 12, 2025 00:00:00').getTime();

  const daysSpan = document.getElementById('days');
  const hoursSpan = document.getElementById('hours');
  const minutesSpan = document.getElementById('minutes');
  const secondsSpan = document.getElementById('seconds');

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      daysSpan.textContent = '0d ';
      hoursSpan.textContent = '0h ';
      minutesSpan.textContent = '0m ';
      secondsSpan.textContent = '0s';
      clearInterval(interval);
      return;
>>>>>>> 15097ac9795b8410c4bb24c7145becdf21cd7e3b
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