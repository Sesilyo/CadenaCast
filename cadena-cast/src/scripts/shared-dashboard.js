// Filename: ../../scripts/shared-dashboard.js
// Desc: Contains shared functionality for dashboard pages like timer, nav, wallet check.

// --- Firebase SDKs and Config (Ensure HTML includes SDKs first) ---
const firebaseConfigShared = {
    apiKey: "AIzaSyARAZIOFSKWTYDnb3E3OO8U1jIeMuoj-CA",
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
if (!firebase.apps.length) {
    firebaseAppShared = firebase.initializeApp(firebaseConfigShared);
} else {
    firebaseAppShared = firebase.app(); // Get existing app
}
const firestoreDB = firebase.firestore(); // Make DB accessible globally from this script

// --- Countdown Timer ---
let countdownIntervalShared = null; // Prevent multiple intervals

function startVotingCountdown() {
    // Target date (adjust as needed)
    const targetDate = new Date('May 12, 2025 00:00:00').getTime(); // EXAMPLE DATE

    const daysSpan = document.getElementById('days');
    const hoursSpan = document.getElementById('hours');
    const minutesSpan = document.getElementById('minutes');
    const secondsSpan = document.getElementById('seconds');

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

        if (!currentDaysSpan || !currentHoursSpan || !currentMinutesSpan || !currentSecondsSpan) {
             if (countdownIntervalShared) clearInterval(countdownIntervalShared);
             return; // Stop if elements disappear
        }

        if (distance <= 0) {
            currentDaysSpan.textContent = '0d ';
            currentHoursSpan.textContent = '0h ';
            currentMinutesSpan.textContent = '0m ';
            currentSecondsSpan.textContent = '0s';
            if (countdownIntervalShared) clearInterval(countdownIntervalShared);
            // Optionally update a status banner here
             const statusBanner = document.getElementById('status-banner');
             if (statusBanner) statusBanner.textContent = "STATUS OF ELECTION: LIVE / ENDED";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        currentDaysSpan.textContent = `${days}d `;
        currentHoursSpan.textContent = `${hours}h `;
        currentMinutesSpan.textContent = `${minutes}m `;
        currentSecondsSpan.textContent = `${seconds}s`;
    }

    if (countdownIntervalShared) clearInterval(countdownIntervalShared);
    countdownIntervalShared = setInterval(updateCountdown, 1000);
    updateCountdown(); // Initial call
}

// --- Navigation Highlighting ---
function highlightActiveNav() {
    const navLinks = document.querySelectorAll('#main-nav a.nav-item');
    if (navLinks.length === 0) {
        // console.warn("Navigation links not found for highlighting.");
        return;
    }
    const currentPath = window.location.pathname.split('/').pop().toLowerCase();
    if (!currentPath) return; // Handle root path if necessary

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href')?.split('/').pop()?.toLowerCase(); // Add checks
        if (linkPath && linkPath === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

 // --- Wallet Connection Check (Prototype) ---
 function isWalletConnected() {
    // Check sessionStorage for the flag set by CA-connect-metamask.js
    const connected = sessionStorage.getItem('walletConnected') === 'true';
    console.log("Checking wallet connection status:", connected);
    return connected;
 }

 function redirectToWalletPage() {
     console.log("Redirecting to wallet connection page.");
     // Determine path relative to current location
     // This assumes the script is called from pages within user-dashboard-pages/
     // If called from other locations, adjust the path accordingly
     let redirectPath = './CA-connect-metamask-page.html';
     // Example adjustment if called from one level deeper:
     // if (window.location.pathname.includes('/some-subfolder/')) {
     //    redirectPath = '../CA-connect-metamask-page.html';
     // }
     alert("Please connect your wallet first to access this page.");
     window.location.href = redirectPath;
 }


// --- Run functions on page load ---
// Use a named function for the listener for potential removal if needed
function initializeDashboardPage() {
    console.log("Shared dashboard DOMContentLoaded triggered.");
    startVotingCountdown();
    highlightActiveNav();
}

if (document.readyState === 'loading') { // Loading hasn't finished yet
    document.addEventListener('DOMContentLoaded', initializeDashboardPage);
} else { // `DOMContentLoaded` has already fired
    initializeDashboardPage();
}


console.log("Shared dashboard script loaded and running.");