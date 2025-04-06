const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const confirmBtn = document.getElementById('confirm-btn');
const cancelBtn = document.getElementById('cancel-btn');

let currentAction = '';

document.querySelectorAll('.control-card').forEach(card => {
  card.addEventListener('click', () => {
    const action = card.dataset.action;
    openModal(action);
  });
});

function openModal(action) {
  currentAction = action;

  if (action === 'startElection') {
    modalTitle.textContent = 'START VOTING';
    modalBody.textContent = 'You are about to start the election process. All eligible voters will be able to cast their votes. Confirm?';
  } else if (action === 'pauseVoting') {
    modalTitle.textContent = 'PAUSE VOTING';
    modalBody.textContent = 'This will temporarily suspend all voting activity. Voters in the middle of voting will be interrupted. Continue?';
  } else if (action === 'endElection') {
    modalTitle.textContent = 'END ELECTION';
    modalBody.textContent = 'This will permanently close voting and prepare the system for results calculation. Confirm?';
  }

  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
  modalTitle.textContent = '';
  modalBody.textContent = '';
}

confirmBtn.addEventListener('click', () => {
  if (currentAction === 'startElection') {
    console.log('Starting the election...');
  } else if (currentAction === 'pauseVoting') {
    console.log('Pausing the voting...');
  } else if (currentAction === 'endElection') {
    console.log('Ending the election...');
  }
  closeModal();
});

cancelBtn.addEventListener('click', closeModal);


// Voting Timer
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
  
    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();
  }
  
  window.onload = () => {
    startVotingCountdown();
  };

  document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('#main-nav a');
    const currentPath = window.location.pathname.split('/').pop().toLowerCase();
  
    navLinks.forEach(link => {
      const linkPath = link.getAttribute('href').split('/').pop().toLowerCase();
      if (linkPath === currentPath) {
        link.classList.add('active');
        link.addEventListener('click', e => e.preventDefault()); // Disable click on active
      } else {
        link.classList.remove('active');
      }
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    fetch('sidebar.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('sidebar-container').innerHTML = html;
        
        highlightActiveNav();
        startVotingCountdown();
      });
  });

  function highlightActiveNav() {
    const navLinks = document.querySelectorAll('#main-nav a');
    const currentPath = window.location.pathname.split('/').pop().toLowerCase();
  
    navLinks.forEach(link => {
      const linkPath = link.getAttribute('href').split('/').pop().toLowerCase();
      if (linkPath === currentPath) {
        link.classList.add('active');
        link.addEventListener('click', e => e.preventDefault());
      } else {
        link.classList.remove('active');
      }
    });
  }