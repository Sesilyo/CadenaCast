
document.addEventListener('DOMContentLoaded', async () => { // Make async for Firestore fetch

  // --- Access Control ---
   if (typeof isWalletConnected !== 'function' || typeof redirectToWalletPage !== 'function') {
        console.error("Shared functions not loaded!");
        alert("Page loading error. Please refresh.");
         document.body.innerHTML = "<p style='color:red; text-align:center;'>Page Error. Cannot load components.</p>";
        return;
   }
  if (!isWalletConnected()) {
      redirectToWalletPage();
      return; // Stop execution
  }
  console.log("Results page: Wallet connected. Access granted.");

  // --- Firebase Setup ---
  if (typeof firestoreDB === 'undefined' || !firestoreDB) { // Add check for null/undefined
       console.error("Firestore DB not initialized!");
       alert("Database connection error.");
       return;
  }

  // --- Chart Setup ---
  const canvas = document.getElementById('barChart');
  const ctx = canvas?.getContext('2d'); // Get context safely
  let resultsChart = null;
  let allCandidatesData = [];
  const positionButtons = document.querySelectorAll('.position-btn');
  const chartContainer = document.querySelector('.chart-container');

  if (!canvas || !ctx || !chartContainer) {
      console.error("Chart elements (canvas, container, or context) not found!");
      const mainContent = document.getElementById('main-content');
      if (mainContent) mainContent.innerHTML = "<p style='color:red;text-align:center;'>Error displaying results chart components.</p>";
      return;
  }

  const positionMap = {
       'Position 1': 'president',
       'Position 2': 'vice-president',
       'Position 3': 'secretary',
       'Position 4': 'treasurer'
  };
  // Determine the default position to show (e.g., president)
  const defaultPositionId = 'president';

  // --- Fetch All Candidate Data ---
  async function fetchResults() {
      console.log("Fetching election results from Firestore...");
      showLoadingState(true);
      clearNoResultsMessage();
      try {
          const snapshot = await firestoreDB.collection('candidates')
                                   .orderBy('positionId') // Group by position
                                   .orderBy('ballotNumber') // Order within position
                                   .get();

          allCandidatesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log("Fetched candidates:", allCandidatesData);

          if (allCandidatesData.length === 0) {
              displayNoResults("No candidate data found in the database. Setup Firestore 'candidates' collection.");
              disablePositionButtons(); // Disable buttons if no data
          } else {
              setupPositionButtons(); // Setup button listeners
              updateChartForPosition(defaultPositionId); // Show default position results
              setActiveButton(defaultPositionId); // Highlight default button
          }

      } catch (error) {
          console.error("Error fetching results:", error);
          displayNoResults(`Failed to load results: ${error.message}`);
          disablePositionButtons();
      } finally {
          showLoadingState(false);
      }
  }

  // --- Update Chart ---
  function updateChartForPosition(positionId) {
      console.log("Updating chart for position:", positionId);
      const positionCandidates = allCandidatesData.filter(c => c.positionId === positionId);

      if (positionCandidates.length === 0) {
          // This case might happen if a button exists but no candidates were fetched for it
          displayNoResults(`No candidates configured for position: ${positionId}`);
          return;
      }

      // Sort by vote count descending
      positionCandidates.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));

      const labels = positionCandidates.map(c => `${c.name || c.fullName || c.id} (#${c.ballotNumber})`);
      const data = positionCandidates.map(c => c.voteCount || 0);

      if (data.every(val => val === 0)) {
           displayNoResults(`No votes recorded yet for position: ${positionId}`);
           return;
      }

      clearNoResultsMessage();
      canvas.style.display = 'block';

      const chartData = {
          labels: labels,
          datasets: [{
              label: 'Votes',
              data: data,
              backgroundColor: generateColors(data.length),
              borderColor: generateColors(data.length, true),
              borderWidth: 1
          }]
      };

      const chartOptions = {
          indexAxis: 'y', // Horizontal bar chart
          responsive: true,
          maintainAspectRatio: false,
          scales: {
              x: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 }, title: { display: true, text: 'Number of Votes' } },
              y: { title: { display: false } }
          },
          plugins: {
              legend: { display: false },
              tooltip: {
                 callbacks: {
                     label: function(context) {
                         return `${context.dataset.label || 'Votes'}: ${context.parsed.x ?? 0}`;
                     }
                 }
              }
          }
      };

      if (resultsChart) resultsChart.destroy();
      resultsChart = new Chart(ctx, { type: 'bar', data: chartData, options: chartOptions });
  }

  // --- UI Helpers ---
  function showLoadingState(isLoading) {
       console.log(isLoading ? "Loading results..." : "Finished loading results.");
       if (chartContainer) chartContainer.style.opacity = isLoading ? '0.5' : '1';
  }

  function displayNoResults(message) {
      if (resultsChart) resultsChart.destroy();
      canvas.style.display = 'none';
      let noResultDiv = chartContainer.querySelector('.no-result-message');
      if (!noResultDiv) {
          noResultDiv = document.createElement('div');
          noResultDiv.className = 'no-result-message';
          Object.assign(noResultDiv.style, { textAlign: 'center', padding: '30px', fontWeight: 'bold', color: '#555' });
          chartContainer.appendChild(noResultDiv);
      }
      noResultDiv.textContent = `🚫 ${message}`;
  }

  function clearNoResultsMessage() {
       const noResultDiv = chartContainer.querySelector('.no-result-message');
       if (noResultDiv) noResultDiv.remove();
  }

  function generateColors(count, forBorder = false) {
      const colors = ['#a69ef7','#6f6be0','#4e49a4','#ffd700','#ffb14e','#fa8775','#ff6b6b','#f06595','#cc5de8','#845ef7','#5c7cfa','#339af0','#22b8cf','#20c997','#51cf66','#94d82d','#fcc419','#ff922b'];
      const generated = [];
      for (let i = 0; i < count; i++) {
          let color = colors[i % colors.length];
          if (forBorder) {
               try { // Add error handling for color parsing
                    let rgb = parseInt(color.substring(1), 16);
                    let r = Math.max(0, (rgb >> 16 & 0xFF) - 30);
                    let g = Math.max(0, (rgb >> 8 & 0xFF) - 30);
                    let b = Math.max(0, (rgb & 0xFF) - 30);
                    color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
               } catch { /* Use original color if parsing fails */ }
          }
          generated.push(color);
      }
      return generated;
  }

  function disablePositionButtons() {
      positionButtons.forEach(button => button.disabled = true);
  }

  function setActiveButton(activePositionId) {
       positionButtons.forEach(btn => {
           if (positionMap[btn.textContent] === activePositionId) {
               btn.classList.add('active');
           } else {
               btn.classList.remove('active');
           }
       });
  }

  // --- Setup Position Buttons ---
  function setupPositionButtons() {
      if (positionButtons.length === 0) { console.warn("Position buttons not found."); return; }

      positionButtons.forEach(button => {
          const buttonText = button.textContent;
          // Disable the generic "Positions" button if it exists and shouldn't be clickable
          if (buttonText === 'Positions') {
               button.disabled = true;
               button.style.opacity = 0.6;
               return; // Skip adding click listener to this one
          }

          button.addEventListener('click', () => {
              positionButtons.forEach(btn => btn.classList.remove('active')); // Deactivate all
              button.classList.add('active'); // Activate clicked

              const positionId = positionMap[buttonText];
              if (positionId) {
                   updateChartForPosition(positionId);
              } else {
                   console.warn("No mapping found for button:", buttonText);
                   displayNoResults("Invalid position selected.");
              }
          });
      });
  }

  // --- Initial Fetch ---
  fetchResults();

  // Timer and nav handled by shared-dashboard.js

});