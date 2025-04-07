// Filename: ../../scripts/shared-dashboard.js
// Desc: Contains shared functionality for dashboard pages like timer, nav, wallet check, and election status.

// --- Firebase SDKs and Config (Ensure HTML includes SDKs first) ---
const firebaseConfigShared = {
    apiKey: "AIzaSyARAZIOFSKWTYDnb3E3OO8U1jIeMuoj-CA", // Replace with your actual config if different
    authDomain: "testthon-5b972.firebaseapp.com",
    databaseURL: "https://testthon-5b972-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "testthon-5b972",
    storageBucket: "testthon-5b972.appspot.com",
    messagingSenderId: "412241224515",
    appId: "1:412241224515:web:2fcab1a4a77f9d5c3f05f6",
    measurementId: "G-EX0QHTY41J"
};

// Initialize Firebase APP (check if already initialized)
let firebaseAppShared;
if (typeof firebase !== 'undefined' && !firebase.apps.length) { // Add check for firebase object existence
    try {
        firebaseAppShared = firebase.initializeApp(firebaseConfigShared);
        console.log("[SharedDash] Firebase initialized by shared-dashboard."); // Added Log
    } catch (e) {
        console.error("Error initializing Firebase in shared-dashboard:", e);
        alert("Critical Error: Could not initialize Firebase. Please check console.");
    }
} else if (typeof firebase !== 'undefined') {
    firebaseAppShared = firebase.app(); // Get existing app
    console.log("[SharedDash] Firebase app already exists, using existing instance."); // Added Log
} else {
    console.error("Firebase SDK not loaded before shared-dashboard.js");
    alert("Critical Error: Firebase SDK not loaded. Check script order in HTML.");
}

// Initialize Firestore DB (only if Firebase app was initialized successfully)
let firestoreDB = null;
if (firebaseAppShared && typeof firebase.firestore === 'function') {
    try {
        firestoreDB = firebase.firestore(); // Make DB accessible globally from this script
        console.log("[SharedDash] Firestore DB object CREATED:", firestoreDB); // Added Log + Variable Name
    } catch(e) {
         console.error("Error initializing Firestore:", e);
         alert("Critical Error: Could not initialize Firestore Database. Check console.");
    }

} else {
     console.error("Cannot initialize Firestore because Firebase app is not available or firestore function missing.");
}


// --- Countdown Timer ---
let countdownIntervalShared = null; // Prevent multiple intervals

function startVotingCountdown() {
    // Target date (adjust as needed - consider fetching this from Firestore too!)
    const targetDate = new Date('May 30, 2025 00:00:00').getTime(); // EXAMPLE DATE - **UPDATE THIS**

    const daysSpan = document.getElementById('days');
    const hoursSpan = document.getElementById('hours');
    const minutesSpan = document.getElementById('minutes');
    const secondsSpan = document.getElementById('seconds');
    const countdownLabel = document.querySelector('#countdown .label'); // Get label element

    if (!daysSpan || !hoursSpan || !minutesSpan || !secondsSpan) {
        console.warn("Countdown timer elements not found on this page.");
        return;
    }

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        // Select elements inside the update function in case they are added dynamically
        const currentDaysSpan = document.getElementById('days');
        const currentHoursSpan = document.getElementById('hours');
        const currentMinutesSpan = document.getElementById('minutes');
        const currentSecondsSpan = document.getElementById('seconds');
        const currentCountdownLabel = document.querySelector('#countdown .label'); // Re-select label

        if (!currentDaysSpan || !currentHoursSpan || !currentMinutesSpan || !currentSecondsSpan) {
             if (countdownIntervalShared) clearInterval(countdownIntervalShared);
             return; // Stop if elements disappear
        }

        if (distance <= 0) {
            currentDaysSpan.textContent = '0d ';
            currentHoursSpan.textContent = '0h ';
            currentMinutesSpan.textContent = '0m ';
            currentSecondsSpan.textContent = '0s';
            if (currentCountdownLabel) currentCountdownLabel.textContent = "Voting Period Over"; // Update label
            if (countdownIntervalShared) clearInterval(countdownIntervalShared);
            // Note: This timer ending doesn't automatically set the *Firestore* status to ENDED.
            // The admin should explicitly end the election via the admin panel.
            return;
        }

        if (currentCountdownLabel) currentCountdownLabel.textContent = "Voting ends in:"; // Update label for active countdown

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        currentDaysSpan.textContent = `${days}d `;
        currentHoursSpan.textContent = `${hours}h `;
        currentMinutesSpan.textContent = `${minutes}m `;
        currentSecondsSpan.textContent = `${seconds}s`;
    }

    if (countdownIntervalShared) clearInterval(countdownIntervalShared); // Clear any previous interval
    countdownIntervalShared = setInterval(updateCountdown, 1000);
    updateCountdown(); // Initial call to set timer immediately
}

// --- Navigation Highlighting ---
function highlightActiveNav() {
    const navLinks = document.querySelectorAll('#main-nav a.nav-item');
    if (navLinks.length === 0) {
        console.warn("Navigation links ('#main-nav a.nav-item') not found for highlighting.");
        return;
    }

    // Get current page filename (e.g., "cb-vote-page.html")
    const currentFilename = window.location.pathname.split('/').pop().toLowerCase();
    if (!currentFilename) {
        console.warn("Could not determine current filename for navigation highlighting.");
        return; // Handle root path or error case
    }


    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (!linkHref) return; // Skip links without href

        // Get the filename from the link's href
        const linkFilename = linkHref.split('/').pop().toLowerCase();

        // Check for direct match or handle index.html cases if needed
        if (linkFilename && linkFilename === currentFilename) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

 // --- Wallet Connection Check (Using sessionStorage - Basic) ---
 function isWalletConnected() {
    // Check sessionStorage for the flag set by CA-connect-metamask.js or equivalent
    const connected = sessionStorage.getItem('walletConnected') === 'true';
    // console.log("Checking wallet connection status:", connected); // Keep for debugging if needed
    return connected;
 }

 function redirectToWalletPage() {
     console.log("Redirecting to wallet connection page.");
     // Determine path relative to current location
     // This assumes the script is called from pages within the same directory level
     // Adjust if your structure is deeper or different
     let redirectPath = './CA-connect-metamask-page.html';

     alert("Please connect your wallet first to access this page.");
     window.location.href = redirectPath;
 }


// --- Run functions on page load ---
// Use a named function for the listener for potential removal if needed
function initializeDashboardPage() {
    console.log("[SharedDash] DOMContentLoaded triggered. Initializing page (timer, nav)..."); // Added Log
    startVotingCountdown(); // Start/update the countdown timer
    highlightActiveNav();   // Highlight the current nav item
    console.log("[SharedDash] Shared initialization complete."); // Added Log
}

// Ensure DOM is ready before running initialization logic
if (document.readyState === 'loading') { // Loading hasn't finished yet
    document.addEventListener('DOMContentLoaded', initializeDashboardPage);
} else { // `DOMContentLoaded` has already fired
    initializeDashboardPage(); // Run immediately if already loaded
}

// ===============================================
// === ELECTION STATUS FUNCTIONS (Added Logs) ===
// ===============================================

/**
 * Fetches the current election status from Firestore.
 * @returns {Promise<string>} A promise that resolves with the current status string
 *                            (e.g., "NOT_STARTED", "ONGOING", "PAUSED", "ENDED")
 *                            or rejects on error. Returns "NOT_STARTED" if doc missing/no status.
 */
async function getElectionStatus() {
    console.log("[SharedDash-getElectionStatus] Function called."); // Added Log
    console.log("[SharedDash-getElectionStatus] Checking firestoreDB object:", firestoreDB); // Added Log - CRITICAL CHECK

    // Use the firestoreDB variable initialized earlier in this script
    if (!firestoreDB) {
        console.error("[SharedDash-getElectionStatus] Firestore DB is not available inside function!");
        // Potentially alert user or return a specific error status?
        return Promise.reject("Database connection error (firestoreDB null/undefined)"); // Reject the promise
    }
    const statusDocRef = firestoreDB.collection('electionSettings').doc('currentStatus');
    console.log("[SharedDash-getElectionStatus] Attempting to read:", statusDocRef.path); // Added Log
    try {
        const docSnap = await statusDocRef.get();
        console.log("[SharedDash-getElectionStatus] Firestore get() successful. Doc exists:", docSnap.exists); // Added Log
        if (docSnap.exists) {
            const status = docSnap.data().status;
             // Ensure status is one of the known values, default if not
             const validStatuses = ["NOT_STARTED", "ONGOING", "PAUSED", "ENDED"];
            if (validStatuses.includes(status)) {
                console.log("[SharedDash-getElectionStatus] Fetched valid status:", status);
                return status; // Resolve with the valid status
            } else {
                 console.warn(`[SharedDash-getElectionStatus] Invalid status "${status}" in doc at ${statusDocRef.path}. Defaulting to NOT_STARTED.`);
                 return "NOT_STARTED"; // Resolve with default status
            }
        } else {
            console.warn(`[SharedDash-getElectionStatus] Document ${statusDocRef.path} not found. Defaulting to NOT_STARTED.`);
            return "NOT_STARTED"; // Resolve with default status if doc doesn't exist
        }
    } catch (error) {
        // Log the specific Firestore error here BEFORE re-throwing
        console.error(`[SharedDash-getElectionStatus] Firestore read error for ${statusDocRef.path}:`, error);
        // *** THIS IS LIKELY WHERE YOUR PERMISSION ERROR IS BEING CAUGHT ***
        throw error; // Re-throw the error to be caught by the calling function
    }
}

/**
 * Updates the election status in Firestore. (Admin use only)
 * @param {string} newStatus - The new status ("NOT_STARTED", "ONGOING", "PAUSED", "ENDED").
 * @returns {Promise<void>} A promise that resolves when the update is complete, or rejects on error/permission issue.
 */
async function setElectionStatus(newStatus) {
    console.log("[SharedDash-setElectionStatus] Function called."); // Added Log
    console.log("[SharedDash-setElectionStatus] Checking firestoreDB object:", firestoreDB); // Added Log

    // Use the firestoreDB variable initialized earlier
    if (!firestoreDB) {
        console.error("[SharedDash-setElectionStatus] Firestore DB is not available.");
        return Promise.reject("Database connection error");
    }

    // !!! IMPORTANT: Placeholder Admin Check - Replace with a secure method !!!
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
         console.error("[SharedDash-setElectionStatus] Access denied. User is not identified as admin (sessionStorage check).");
         // Prevent unauthorized status changes
         return Promise.reject("Permission Denied: Admin privileges required.");
    }
    // --- End Placeholder Admin Check ---


    console.log(`[SharedDash-setElectionStatus] Admin attempting to set election status to: ${newStatus}`);
    const validStatuses = ["NOT_STARTED", "ONGOING", "PAUSED", "ENDED"];
    if (!validStatuses.includes(newStatus)) {
        console.error(`[SharedDash-setElectionStatus] Invalid status value "${newStatus}" provided.`);
        return Promise.reject(`Invalid status value "${newStatus}"`); // Reject promise for invalid status
    }

    const statusDocRef = firestoreDB.collection('electionSettings').doc('currentStatus');
    console.log("[SharedDash-setElectionStatus] Attempting to write to:", statusDocRef.path); // Added Log
    try {
        // Use set with merge:true to create the doc if it doesn't exist, or update if it does
        // Also add a timestamp for tracking when the status was last changed
        await statusDocRef.set({
            status: newStatus,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`[SharedDash-setElectionStatus] Status successfully set to ${newStatus} in Firestore.`);
        // Promise resolves automatically here if await doesn't throw
    } catch (error) {
        console.error(`[SharedDash-setElectionStatus] Error setting status to ${newStatus} at ${statusDocRef.path}:`, error);
        throw error; // Re-throw error so the calling function knows it failed
    }
}

// --- End of Election Status Functions ---


console.log("[SharedDash] shared-dashboard.js script fully loaded."); // Final confirmation log