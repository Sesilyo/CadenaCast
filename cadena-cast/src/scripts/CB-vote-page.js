// Filename: ../../scripts/CB-vote-page.js
// Desc: Main voting page, links to positions. Checks vote status *before* showing appropriate modal.

document.addEventListener('DOMContentLoaded', () => {
    console.log("CB Vote Page: Initializing...");

    // --- Access Control & Setup Checks ---
    if (typeof isWalletConnected !== 'function' || typeof redirectToWalletPage !== 'function' || typeof firestoreDB === 'undefined' || !firestoreDB) {
         console.error("CB Vote Page: Shared functions or Firestore DB not loaded! Cannot proceed.");
         alert("Page loading error. Please refresh.");
         document.body.innerHTML = "<p style='color:red; text-align:center;'>Page Error. Load Failed.</p>";
         return;
    }
    if (!isWalletConnected()) {
        console.log("CB Vote Page: Wallet not connected, redirecting.");
        redirectToWalletPage();
        return; // Stop script execution
    }
    const loggedInUserNID = sessionStorage.getItem('loggedInUserNID');
    if (!loggedInUserNID) {
        console.error("CB Vote Page: User NID not found in session storage.");
        alert("Authentication error. Please log in again.");
        // Optionally redirect to login or show a message
        document.body.innerHTML = "<p style='color:red; text-align:center;'>Authentication Error. Please log in.</p>";
        return; // Stop script execution
    }
    console.log(`CB Vote page: Wallet connected, User NID (${loggedInUserNID}) found.`);

    // --- Get Modal Elements ---
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalConfirmBtn = document.getElementById('confirm-btn');
    const modalCancelBtn = document.getElementById('cancel-btn');
    const modalElementsExist = modal && modalTitle && modalBody && modalConfirmBtn && modalCancelBtn;

    if (!modalElementsExist) {
        console.error("CB Vote Page: One or more modal elements (modal, modal-title, modal-body, confirm-btn, cancel-btn) not found! Modal functionality will be broken.");
        // We don't necessarily stop the script, but modals won't work as expected.
        // Fallback behavior (direct navigation) might be triggered later if modals are needed.
    } else {
         console.log("CB Vote Page: Modal elements found.");
    }

    // --- Position Link Logic ---
    const positionLinks = document.querySelectorAll('.position-link'); // Select all links with this class
    let targetVotePage = ''; // Store the href for the confirmed navigation action

    console.log(`CB Vote Page: Found ${positionLinks.length} position links.`);

    positionLinks.forEach(link => {
        link.addEventListener('click', async (event) => { // Make the event listener async
            event.preventDefault(); // ALWAYS prevent the default link navigation first

            // Extract info needed for check and navigation
            // Prefer data-* attributes, fallback to id/textContent if necessary
            const positionId = link.dataset.positionId; // e.g., data-position-id="president"
            const positionDisplayName = link.dataset.positionName || link.textContent.trim(); // e.g., data-position-name="President" or link text
            const nextPageUrl = link.href; // Where the link originally pointed

            // --- Robustness Checks ---
            if (!positionId) {
                console.error("Link is missing required 'data-position-id' attribute:", link);
                alert("Error: Could not determine which position was selected. Link setup issue.");
                return; // Stop processing this click
            }
             if (!nextPageUrl || nextPageUrl === '#') {
                console.error("Link is missing a valid 'href' attribute:", link);
                alert("Error: Navigation target for this position is missing.");
                return; // Stop processing this click
            }


            console.log(`Link clicked for ${positionDisplayName} (ID: ${positionId}). Checking vote status...`);
            link.style.pointerEvents = 'none'; // Temporarily disable link to prevent double clicks
            link.style.opacity = '0.6';       // Visual feedback: dim the link

            try {
                // ***** STEP 1: AWAIT the Firestore Check *****
                const hasVoted = await checkIfAlreadyVoted(positionId);
                targetVotePage = nextPageUrl; // Store the target URL *after* the check starts, needed if confirming navigation

                // ***** STEP 2: Decide which Modal to Show (or navigate if modal fails) *****
                if (hasVoted) {
                    console.log(`User already voted for ${positionDisplayName}. Showing 'Already Voted' info modal.`);
                    if (modalElementsExist) {
                        openAlreadyVotedModal(positionDisplayName);
                    } else {
                        // Fallback if modal elements are missing
                         console.warn("Modal elements missing, cannot show 'Already Voted' modal.");
                         alert(`You have already submitted your vote for the position of ${positionDisplayName}.`); // Simple alert fallback
                    }
                } else {
                    console.log(`User has not voted for ${positionDisplayName}. Opening 'Proceed?' confirmation modal.`);
                    if (modalElementsExist) {
                        openNavigationConfirmModal(positionDisplayName); // Show "Proceed?" modal
                    } else {
                        // Fallback if modal is broken - navigate directly after confirmation
                        console.warn("Modal elements missing, using confirm() fallback.");
                        if (confirm(`Proceed to vote for ${positionDisplayName}? Please complete your vote on the next page before navigating away.`)) {
                             console.log("Proceeding to:", targetVotePage);
                             window.location.href = targetVotePage; // Navigate directly
                        } else {
                             console.log("Navigation cancelled via confirm().");
                             targetVotePage = ''; // Clear target if cancelled
                        }
                    }
                }
            } catch (error) {
                // Error during the Firestore check itself
                console.error(`Error checking vote status for ${positionId}:`, error);
                alert(`Could not check your voting status due to a database error. Please try again later. Error: ${error.message}`);
                targetVotePage = ''; // Clear target on error
            } finally {
                 // ***** STEP 3: Always Re-enable the link *****
                 link.style.pointerEvents = 'auto'; // Re-enable link regardless of outcome
                 link.style.opacity = '1';         // Restore full opacity
                 console.log(`Finished processing click for ${positionDisplayName}. Link re-enabled.`);
            }
        });
    });

    // --- Function to Check Firestore if User Voted for a Position ---
    async function checkIfAlreadyVoted(positionId) {
        if (!loggedInUserNID) { // Pre-check NID again just in case
             console.error("checkIfAlreadyVoted: Cannot check vote status - User NID is missing.");
             throw new Error("User session information is missing."); // Throw error to be caught by the caller
        }
        if (!positionId) {
             console.error("checkIfAlreadyVoted: Cannot check vote status - positionId is missing.");
             throw new Error("Position ID was not provided for the status check.");
        }

        const userVoteDocId = `${loggedInUserNID}_${positionId}`;
        const userVoteRef = firestoreDB.collection('userVotes').doc(userVoteDocId);
        console.log(`Checking Firestore doc: userVotes/${userVoteDocId}`);
        try {
             const docSnap = await userVoteRef.get(); // Perform the Firestore read
             console.log(`Firestore check for ${userVoteDocId} - Document exists: ${docSnap.exists}`);
             return docSnap.exists; // Return true if the document exists, false otherwise
        } catch (error) {
            console.error(`Firestore read error for ${userVoteDocId}:`, error);
            // Re-throw a more user-friendly or specific error to the caller
            throw new Error(`Database error checking vote status.`);
        }
    }

    // --- Function to Open the "Proceed to Vote?" Confirmation Modal ---
    function openNavigationConfirmModal(positionName) {
        if (!modalElementsExist) return; // Should not be called if elements are missing, but check anyway

        modalTitle.textContent = `Proceed to Vote for ${positionName}?`;
        modalBody.textContent = `You are about to navigate to the voting page for ${positionName}. Please ensure you complete your vote on the next page before navigating away, otherwise your selection will not be recorded.`;
        modalConfirmBtn.textContent = 'Proceed';
        modalCancelBtn.style.display = ''; // Ensure cancel button is visible

        // Define temporary handlers for this specific modal instance
        const confirmHandler = () => {
            if (targetVotePage) {
                console.log("User confirmed navigation. Proceeding to:", targetVotePage);
                window.location.href = targetVotePage; // <<< Navigate on confirm
                // No need to call closeModal manually here, as page is navigating away
            } else {
                 console.error("Target page URL (targetVotePage) was lost or never set before confirm.");
                 alert("Error: Could not determine navigation target.");
                 closeModal(); // Close modal even on error
            }
        };
        const cancelHandler = () => {
            console.log("Navigation cancelled by user.");
            closeModal(); // Just close the modal
        };
        const outsideClickHandler = (event) => {
             if (event.target === modal) {
                 console.log("Navigation cancelled by clicking outside modal.");
                 cancelHandler(); // Treat click outside as cancel
             }
        };

        // Assign handlers
        modalConfirmBtn.onclick = confirmHandler;
        modalCancelBtn.onclick = cancelHandler;
        modal.onclick = outsideClickHandler;

        modal.classList.remove('hidden');
        console.log("Navigation confirmation modal opened.");
    }

    // --- Function to Open the "Already Voted" Informational Modal ---
    function openAlreadyVotedModal(positionName) {
        if (!modalElementsExist) return; // Should not be called if elements are missing

        modalTitle.textContent = "Vote Already Cast";
        modalBody.textContent = `You have already submitted your vote for the position of ${positionName}. You cannot vote again for this position.`;
        modalConfirmBtn.textContent = 'OK';
        modalCancelBtn.style.display = 'none'; // Hide the cancel button for info modal

        // Define temporary handlers
        const confirmHandler = () => {
             console.log("User acknowledged 'Already Voted' modal.");
             closeModal(); // Just close the modal
        };
         const outsideClickHandler = (event) => {
             if (event.target === modal) {
                 confirmHandler(); // Treat click outside as OK
             }
        };

        // Assign handlers
        modalConfirmBtn.onclick = confirmHandler;
        modal.onclick = outsideClickHandler; // Allow closing by clicking outside

        modal.classList.remove('hidden');
        console.log("Already voted info modal opened.");
    }


    // Function to close the modal and clean up handlers and state
    function closeModal() {
         if (!modalElementsExist) return; // Do nothing if modal elements aren't there

         modal.classList.add('hidden'); // Hide the modal visually
         targetVotePage = '';          // Clear the stored navigation target

         // VERY IMPORTANT: Remove the temporary onclick handlers to prevent memory leaks or unexpected behavior
         modalConfirmBtn.onclick = null;
         modalCancelBtn.onclick = null;
         modal.onclick = null;

         // Restore cancel button default visibility in case it was hidden
         modalCancelBtn.style.display = '';

         console.log("Modal closed and handlers cleaned up.");
    }

    // Timer and navigation highlighting are assumed to be handled by a shared script.

    console.log("CB Vote Page: Initialization complete. Event listeners attached.");

}); // End DOMContentLoaded