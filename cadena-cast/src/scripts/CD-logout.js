<<<<<<< HEAD
// Filename: ../../scripts/CD-logout.js
// Desc: Handles clearing session and redirecting on logout.

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('button-logout');

    // Optional: Check wallet status - maybe disable logout if connected? Or just remind.
    if (typeof isWalletConnected === 'function' && isWalletConnected()) {
        console.log("Logout page: Wallet is connected (Reminder to disconnect if using real Metamask)");
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            console.log("Logging out...");

            // Clear session storage related to user state
            sessionStorage.removeItem('walletConnected'); // Clear prototype connection flag
            sessionStorage.removeItem('loggedInUserNID'); // Clear user identifier
            // Clear any other session items if you added them

            // Redirect to login page
            alert("You have been logged out.");
            // Adjust path if login page is elsewhere
            window.location.href = '../AA-login-page.html';
        });
    } else {
        console.error("Logout button (#button-logout) not found.");
    }

    // Timer and nav handled by shared-dashboard.js

}); // End DOMContentLoaded
=======
function startVotingCountdown() {
    const targetDate = new Date('May 12, 2025 00:00:00').getTime();
    
    const daysSpan = document.getElementById('days');
    const hoursSpan = document.getElementById('hours');
    const minutesSpan = document.getElementById('minutes');
    const secondsSpan = document.getElementById('seconds');
  
    let interval;  
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
    interval = setInterval(updateCountdown, 1000);  // Set the interval for the countdown
  }
  
  startVotingCountdown();
  
document.getElementById("button-logout").addEventListener("click", function (e) {
  e.preventDefault();

    // DO NOT touch localStorage — keep walletConnected as-is
    // Just go to the Connect Wallet page
  window.location.href = "./CA-connect-metamask-page.html";
});
>>>>>>> 15097ac9795b8410c4bb24c7145becdf21cd7e3b
