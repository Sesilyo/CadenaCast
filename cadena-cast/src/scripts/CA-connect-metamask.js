const connectWalletBtn = document.getElementById('connect-wallet-btn');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const confirmBtn = document.getElementById('confirm-btn');
const cancelBtn = document.getElementById('cancel-btn');
const protectedLinks = document.querySelectorAll('.protected-link');
const lockIcons = document.querySelectorAll('.lock-icon');


connectWalletBtn.addEventListener('click', function() {
  connectWallet();
});


function connectWallet() {

  alert('Wallet Connected!');

  connectWalletBtn.textContent = 'Wallet Connected';

  unlockProtectedLinks();
}

function unlockProtectedLinks() {

  const locks = document.querySelectorAll('.lock-icon');
  const protectedLinks = document.querySelectorAll('.protected-link');


  locks.forEach(lock => {
    lock.textContent = '🔓';
  });


  protectedLinks.forEach(link => {
    link.classList.remove('locked');
  });


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
