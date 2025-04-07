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
