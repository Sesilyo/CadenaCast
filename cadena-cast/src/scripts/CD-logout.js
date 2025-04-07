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