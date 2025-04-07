const connectWalletBtn = document.getElementById('connect-wallet-btn');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const confirmBtn = document.getElementById('confirm-btn');
const cancelBtn = document.getElementById('cancel-btn');
const protectedLinks = document.querySelectorAll('.protected-link');
const lockIcons = document.querySelectorAll('.lock-icon');

// Event listener for the Connect Wallet button
connectWalletBtn.addEventListener('click', function() {
  connectWallet();
});

// Simulate wallet connection
function connectWallet() {
  // Simulate successful wallet connection
  alert('Wallet Connected!');

  // Change button text
  connectWalletBtn.textContent = 'Wallet Connected';

  // Unlock protected links
  unlockProtectedLinks();
}

function unlockProtectedLinks() {
  // Unlock the links
  const locks = document.querySelectorAll('.lock-icon');
  const protectedLinks = document.querySelectorAll('.protected-link');

  // Change lock icon from 🔒 to 🔓
  locks.forEach(lock => {
    lock.textContent = '🔓';
  });

  // Remove locked class to unlock links
  protectedLinks.forEach(link => {
    link.classList.remove('locked');
  });

  // Optionally: Add "connected" indication somewhere, like changing the button text
  alert("Wallet connected! You can now vote.");
}

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
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysSpan.textContent = `${days}d `;
    hoursSpan.textContent = `${hours}h `;
    minutesSpan.textContent = `${minutes}m `;
    secondsSpan.textContent = `${seconds}s`;
  }

  updateCountdown();
  const interval = setInterval(updateCountdown, 1000);
}

startVotingCountdown();
