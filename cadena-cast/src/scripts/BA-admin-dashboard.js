// Filename: /cadena-cast/src/scripts/BA-admin-dashboard.js
// Desc: Handles admin controls for election state, displays status, and handles logout.

document.addEventListener('DOMContentLoaded', () => {
  console.log("[Admin Dashboard] Initializing...");

  // --- Dependency Checks ---
  // Assuming shared-dashboard.js provides these and initializes firestoreDB
  if (typeof getElectionStatus !== 'function' || typeof setElectionStatus !== 'function' || typeof firestoreDB === 'undefined' || !firestoreDB) {
      console.error("[Admin Dashboard] Critical dependency missing (shared functions or Firestore DB). Check script loading order and shared-dashboard.js.");
      alert("Admin Page Error: Core functions not loaded. Please refresh or contact support.");
      // Attempt to grab main element even if others fail, to show error
      const mainElForError = document.getElementById('main');
      if (mainElForError) mainElForError.innerHTML = '<p style="color:red; text-align:center; font-weight:bold;">Admin Page Load Error: Missing Dependencies</p>';
      return;
  }
   // --- Basic Admin Authentication Check ---
  const isAdmin = sessionStorage.getItem('isAdmin') === 'true'; // Using sessionStorage as placeholder
  if (!isAdmin) {
      console.warn("[Admin Dashboard] User is not identified as admin in sessionStorage. Blocking access.");
      alert("Access Denied. Admin privileges required.");
      // Option 1: Redirect (Uncomment if you have a login page)
       window.location.href = 'AA-login-page.html'; // Corrected redirect path if blocking
      return; // Stop script execution if blocking access
  }
  const adminId = sessionStorage.getItem('adminId') || 'Admin'; // Get Admin ID for display


  // --- UI Elements ---
  const statusBanner = document.getElementById('status-banner');
  const controlCards = document.querySelectorAll('.control-card');
  const adminIdDisplay = document.getElementById('admin-ID-display');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalConfirmBtn = document.getElementById('confirm-btn');
  const modalCancelBtn = document.getElementById('cancel-btn');
  const mainElement = document.getElementById('main');

  // Robust check for all necessary elements
  let missingElement = false;
  if (!statusBanner) { console.error("Missing UI Element: #status-banner"); missingElement = true; }
  if (controlCards.length === 0) { console.error("Missing UI Elements: .control-card"); missingElement = true; }
  if (!adminIdDisplay) { console.error("Missing UI Element: #admin-ID-display"); missingElement = true; }
  if (!modal) { console.error("Missing UI Element: #modal"); missingElement = true; }
  if (!modalTitle) { console.error("Missing UI Element: #modal-title"); missingElement = true; }
  if (!modalBody) { console.error("Missing UI Element: #modal-body"); missingElement = true; }
  if (!modalConfirmBtn) { console.error("Missing UI Element: #confirm-btn"); missingElement = true; }
  if (!modalCancelBtn) { console.error("Missing UI Element: #cancel-btn"); missingElement = true; }
  if (!mainElement) { console.error("Missing UI Element: #main"); missingElement = true; }

  if (missingElement) {
       alert("Admin Page Error: Critical UI elements are missing. Check the HTML structure and IDs/classes.");
       if(mainElement) mainElement.innerHTML = '<p style="color:red; text-align:center; font-weight:bold;">Admin Page UI Error: Elements Missing</p>';
       return;
  }
  console.log("[Admin Dashboard] All required UI elements found.");

  // --- State Variable ---
  let currentElectionStatus = "UNKNOWN"; // Store fetched status locally

  // --- Update Status Display & Controls ---
  function updateStatusDisplay(status) {
      currentElectionStatus = status; // Update local state variable
      let statusText = "UNKNOWN";
      let bannerClass = "status-unknown"; // CSS class for styling

      switch (status) {
          case "NOT_STARTED":
              statusText = "NOT STARTED";
              bannerClass = "status-not-started";
              break;
          case "ONGOING":
              statusText = "ONGOING";
              bannerClass = "status-ongoing";
              break;
          case "PAUSED":
              statusText = "PAUSED";
              bannerClass = "status-paused";
              break;
          case "ENDED":
              statusText = "ENDED";
              bannerClass = "status-ended";
              break;
           default:
               console.warn(`[Admin Dashboard] Received unrecognized status: ${status}. Displaying as UNKNOWN.`);
               statusText = "UNKNOWN";
               bannerClass = "status-unknown";
               break;
      }
      statusBanner.textContent = `STATUS OF ELECTION: ${statusText}`;

      // Remove previous status classes and add the current one
      statusBanner.className = ''; // Clear existing classes first
      statusBanner.classList.add(bannerClass); // Add the specific class for styling

      // --- Enable/Disable Control Cards based on Status ---
      controlCards.forEach(card => {
          const action = card.dataset.action;
          let shouldBeEnabled = true;

          // Determine which actions are valid given the current status
          switch(action) {
              case 'startElection':
                  shouldBeEnabled = (status === 'NOT_STARTED' || status === 'PAUSED'); // Can start/resume
                  break;
              case 'pauseVoting':
                  shouldBeEnabled = (status === 'ONGOING'); // Can only pause if ongoing
                  break;
              case 'endElection':
                  shouldBeEnabled = (status === 'ONGOING' || status === 'PAUSED'); // Can end if ongoing or paused
                  break;
              case 'logout': // Logout action on the card
                  shouldBeEnabled = true; // Logout is always possible
                  break;
               // Add cases for other actions if needed
          }

           // Apply visual indication of disabled state
           card.style.opacity = shouldBeEnabled ? '1' : '0.5';
           card.style.cursor = shouldBeEnabled ? 'pointer' : 'not-allowed';
           // Prevent clicks on disabled cards (more reliable than just pointerEvents)
           // Ensure originalClickHandler was stored before trying to assign/nullify
           if (typeof card.originalClickHandler === 'function' || !shouldBeEnabled) {
               card.onclick = shouldBeEnabled ? card.originalClickHandler : null;
           }


      });

      console.log(`[Admin Dashboard] Status display updated to: ${statusText}. Controls updated.`);
  }

  // --- Show Confirmation Modal ---
  function showConfirmationModal(title, body, confirmText = 'Confirm', cancelText = 'Cancel') {
      return new Promise((resolve) => {
          modalTitle.textContent = title;
          modalBody.innerHTML = body; // Use innerHTML to allow basic formatting like <br>
          modalConfirmBtn.textContent = confirmText;
          modalCancelBtn.textContent = cancelText;
          modalCancelBtn.style.display = ''; // Ensure cancel is visible

          // Define temporary handlers to prevent multiple listeners
          const confirmHandler = () => { cleanupModalHandlers(); resolve(true); };
          const cancelHandler = () => { cleanupModalHandlers(); resolve(false); };
          const outsideClickHandler = (event) => { if (event.target === modal) cancelHandler(); }; // Click outside closes as Cancel

          // Assign handlers
          modalConfirmBtn.onclick = confirmHandler;
          modalCancelBtn.onclick = cancelHandler;
          modal.onclick = outsideClickHandler;

          modal.classList.remove('hidden'); // Show the modal
      });
  }

  // --- Cleanup Modal ---
  function cleanupModalHandlers() {
      if (modalConfirmBtn) modalConfirmBtn.onclick = null;
      if (modalCancelBtn) modalCancelBtn.onclick = null;
      if (modal) modal.onclick = null; // Remove the general modal click listener too
      modal.classList.add('hidden'); // Hide the modal
      console.log("[Admin Dashboard] Modal handlers cleaned up.");
  }

  // --- Handle Control Card Clicks ---
  async function handleAdminAction(action) {
      console.log(`[Admin Dashboard] Action triggered: ${action}`);

      // Check if the action is currently allowed based on status (redundant check, defense in depth)
      let cardElement = null;
      controlCards.forEach(card => { if (card.dataset.action === action) cardElement = card; });
      // Check the style directly as the onclick might be temporarily nulled during update
      if (cardElement && cardElement.style.cursor === 'not-allowed') {
           console.log(`[Admin Dashboard] Action '${action}' is currently disabled.`);
           return; // Do nothing if the card is visually disabled
      }


      let newStatus = null;
      let confirmTitle = "";
      let confirmBody = "";
      let confirmButtonText = "Confirm";

      switch (action) {
          case "startElection":
              // Check if resuming from PAUSED or starting new
              newStatus = "ONGOING";
              confirmTitle = currentElectionStatus === "PAUSED" ? "Resume Election?"
                                                                : "Start Election?";
              confirmBody = currentElectionStatus === "PAUSED"
                  ? "Are you sure you want to resume the election? Voting will become available again."
                  : "Are you sure you want to start the election? Voting will become available to users.";
               confirmButtonText = currentElectionStatus === "PAUSED" ? "Resume" : "Start";
              break;
          case "pauseVoting":
              newStatus = "PAUSED";
              confirmTitle = "Pause Voting?";
              confirmBody = "Are you sure you want to pause voting? Users will temporarily be unable to vote.";
              confirmButtonText = "Pause";
              break;
          case "endElection":
              newStatus = "ENDED";
              confirmTitle = "End Election?";
              confirmBody = "<strong>Warning:</strong> Are you sure you want to permanently end the election?<br><br>Voting will be closed, and results can be finalized. This action cannot be easily undone.";
              confirmButtonText = "End Election";
              break;
          case "logout": // Handle logout action assigned to a card
               const confirmedLogout = await showConfirmationModal(
                  'Log Out',
                  'Are you sure you want to log out from the Admin Dashboard?',
                  'Log Out'
              );
              if (confirmedLogout) {
                  console.log("[Admin Dashboard] Logging out admin...");
                  sessionStorage.removeItem('isAdmin'); // Clear placeholder flag
                  sessionStorage.removeItem('adminId'); // Clear admin ID
                  alert("You have been logged out.");

                  window.location.href = '/AA-login-page.html';
                  // ***********************************

              } else {
                   console.log("[Admin Dashboard] Logout cancelled.");
              }
              return; // Stop further processing for logout
          default:
              console.warn(`[Admin Dashboard] Clicked on card with unknown or no action: ${action}`);
              return; // Exit if action is not recognized
      }

      // --- Confirmation for Status Changes ---
      const isConfirmed = await showConfirmationModal(confirmTitle, confirmBody, confirmButtonText);

      if (isConfirmed && newStatus) {
          console.log(`[Admin Dashboard] User confirmed action: ${action}. Setting status to ${newStatus}...`);
          try {
              // Provide visual feedback during update
              controlCards.forEach(card => {
                   card.style.opacity = '0.5';
                   card.style.cursor = 'wait';
                   card.onclick = null; // Temporarily disable clicks
               });
              statusBanner.textContent = "UPDATING STATUS...";
              statusBanner.className = 'status-updating'; // Optional styling for updating state

              // --- Call shared function to update Firestore ---
              // proper admin authentication and Firestore rules are implemented.
              await setElectionStatus(newStatus);
              // -------------------------------------------------

              // Success: Update UI immediately and show confirmation
              updateStatusDisplay(newStatus); // Update banner and enable/disable controls
              alert(`Election status successfully updated to ${newStatus}.`);

          } catch (error) {
              // Error during update
              console.error(`[Admin Dashboard] Failed to set status to ${newStatus}:`, error);
               // Display specific permission error if caught
               if (error.message && error.message.toLowerCase().includes("permission")) {
                   alert(`Error updating status: Permission Denied. Ensure admin user is properly authenticated with write privileges in Firestore rules.\n(${error.message})`);
               } else {
                  alert(`Error updating status: ${error.message}. Please try again.`);
               }
              // Restore previous state display on error
              updateStatusDisplay(currentElectionStatus); // Revert UI to the last known status
          } finally {
               // Re-enable controls visually is handled by updateStatusDisplay called above
               console.log("[Admin Dashboard] Status update attempt finished.");
          }
      } else {
          console.log(`[Admin Dashboard] Action '${action}' cancelled by user.`);
           // If cancelled, ensure controls are reset to correct state based on currentElectionStatus
           updateStatusDisplay(currentElectionStatus);
      }
  }

  // --- Attach Event Listeners to Control Cards ---
  controlCards.forEach(card => {
      const action = card.dataset.action;
      if (action) {
          // Store the handler function reference to manage enabling/disabling clicks
          const clickHandler = () => handleAdminAction(action);
          card.originalClickHandler = clickHandler; // Store it on the element
          card.addEventListener('click', clickHandler);
          console.log(`[Admin Dashboard] Attached listener for action: ${action}`);
      } else {
           console.warn("Control card found without a data-action attribute:", card);
      }
  });

  // --- Initial Load Actions ---
  async function initializeAdminDashboard() {
      console.log("[Admin Dashboard] Performing initial setup...");

      // Display Admin ID
      if (adminIdDisplay) {
          adminIdDisplay.textContent = adminId; // Display adminId fetched earlier
      } else {
           console.warn("Admin ID display element not found.");
      }


      // Fetch and display initial status
      statusBanner.textContent = "LOADING STATUS..."; // Initial placeholder
      statusBanner.className = 'status-loading';
      try {
          console.log("[Admin Dashboard] Fetching initial election status...");
          const initialStatus = await getElectionStatus();
          console.log(`[Admin Dashboard] Initial status fetched: ${initialStatus}`);
          updateStatusDisplay(initialStatus); // Update banner and controls based on fetched status
      } catch (error) {
          console.error("[Admin Dashboard] Failed to fetch initial election status:", error);
          statusBanner.textContent = "ERROR LOADING STATUS";
          statusBanner.className = 'status-error';
          alert(`Failed to load election status: ${error.message}`);
           // Disable all controls except logout on error
           controlCards.forEach(card => {
              const action = card.dataset.action;
              if(action !== 'logout') {
                  card.style.opacity = '0.5';
                  card.style.cursor = 'not-allowed';
                  card.onclick = null;
              }
          });
      }
      console.log("[Admin Dashboard] Initial setup complete.");
  }

  initializeAdminDashboard(); // Run the initial setup

});