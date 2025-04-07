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
