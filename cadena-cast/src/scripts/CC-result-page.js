let currentAction = '';

function closeModal() {
  modal.classList.add('hidden');
  modalTitle.textContent = '';
  modalBody.textContent = '';
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

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();
}

window.onload = () => {
  startVotingCountdown();
};

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('#main-nav a');
  const currentPath = window.location.pathname.split('/').pop();

  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href').split('/').pop();
    if (linkPath === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});

const sampleData = {
    positions: {
        labels: ['Position 1', 'Position 2', 'Position 3', 'Position 4', 'Position 5'],
        data: [12, 19, 3, 5, 2]
    },
    position1: {
        labels: ['Candidate A', 'Candidate B', 'Candidate C', 'Candidate D'],
        data: [20, 12, 30, 40]
    },
    position2: {
        labels: ['Candidate X', 'Candidate Y', 'Candidate Z'],
        data: [60, 15, 25]
    },
    position3: {
        labels: ['Candidate 1', 'Candidate 2', 'Candidate 3'],
        data: [10, 25, 35]
    },
    position4: {
        labels: [],
        data: []
    }
};

let chart;

function createChart(labels, data) {
  const ctx = document.getElementById('barChart').getContext('2d');

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Votes',
          data: data,
          backgroundColor: '#a69ef7',
          borderColor: '#6f6be0',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function updateChart(position) {
    const data = sampleData[position];
  
    const chartContainer = document.querySelector('.chart-container');
    const canvas = document.getElementById('barChart');
  
    if (!data || data.labels.length === 0 || data.data.every(val => val === 0)) {
      if (chart) chart.destroy();
      canvas.style.display = 'none';
  
      let noResultDiv = document.querySelector('.no-result');
      if (!noResultDiv) {
        noResultDiv = document.createElement('div');
        noResultDiv.classList.add('no-result');
        noResultDiv.textContent = '🚫 No results available yet for this position.';
        chartContainer.appendChild(noResultDiv);
      }
    } else {
      const noResultDiv = document.querySelector('.no-result');
      if (noResultDiv) noResultDiv.remove();
  
      canvas.style.display = 'block';
      createChart(data.labels, data.data);
    }
  }

document.querySelectorAll('.position-btn').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.position-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const position = button.textContent.toLowerCase().replace(/\s+/g, '');
    updateChart(position);
  });
});

updateChart('positions');
