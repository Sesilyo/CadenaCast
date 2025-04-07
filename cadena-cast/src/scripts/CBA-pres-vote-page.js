document.addEventListener('DOMContentLoaded', () => {
    const expectedPositionId = 'president';
    const positionDisplayName = 'President';
    const containerElementId = 'president-candidates'; 

    console.log(`[${positionDisplayName}] Loading vote page.`);

    let voteButtons = [];
    let hasVotedThisSession = false;
    let visibilityChangeListenerAttached = false;
    let tingSound = null; 

    if (typeof isWalletConnected !== 'function' || typeof redirectToWalletPage !== 'function' || typeof firestoreDB === 'undefined' || !firestoreDB) {
        console.error(`[${positionDisplayName}] Critical dependency missing (shared script / DB).`);
        alert("Page loading error.");
        const lc = document.getElementById(containerElementId) || document.getElementById('main');
        if(lc) lc.innerHTML = '<p style="color:red;text-align:center;font-weight:bold;">Page Error: Load Failed.</p>';
        return;
    }
    if (!isWalletConnected()) { redirectToWalletPage(); return; }
    const loggedInUserNID = sessionStorage.getItem('loggedInUserNID');
    if (!loggedInUserNID) {
        console.error(`[${positionDisplayName}] User NID not found.`); alert("Authentication error.");
        const lc = document.getElementById(containerElementId) || document.getElementById('main');
        if(lc) lc.innerHTML = '<p style="color:red; text-align:center;">Cannot vote. User session missing.</p>';
        return;
    }
    console.log(`[${positionDisplayName}] User NID for voting: ${loggedInUserNID}`);

    const candidatesContainer = document.getElementById(containerElementId);
    const mainElement = document.getElementById('main'); 
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalConfirmBtn = document.getElementById('confirm-btn');
    const modalCancelBtn = document.getElementById('cancel-btn');

    if (!mainElement || !candidatesContainer || !modal || !modalTitle || !modalBody || !modalConfirmBtn || !modalCancelBtn) {
         console.error(`[${positionDisplayName}] Missing critical UI elements. Check HTML IDs (main, ${containerElementId}, modal, modal-title, etc.).`);
         alert("Page error: Cannot display voting interface correctly.");
         return;
    }
    console.log(`[${positionDisplayName}] All critical UI elements found.`);

    // --- Visibility Change Handler ---
    const handleVisibilityChange = () => {
        // Only trigger if page is hidden AND vote hasn't been successfully cast in this session
        if (document.hidden && !hasVotedThisSession) {
            console.warn(`[${positionDisplayName}] Page hidden before vote cast. Playing sound and redirecting.`);
            if (tingSound) {
                tingSound.play().catch(e => console.error("Error playing sound:", e)); // Play sound
            }
            // Detach listener *before* alert to prevent potential issues if alert blocks
            detachVisibilityListener();
            alert("Warning: You navigated away from the voting page before completing your vote.\nYour current selection was not submitted.\n\nYou will be returned to the position selection page.");
            window.location.href = './CB-vote-page.html'; // Redirect to main vote page
        }
    };

    function attachVisibilityListener() {
        if (!visibilityChangeListenerAttached) {
            console.log(`[${positionDisplayName}] Attaching visibility change listener.`);
            // Preload sound
            try {
                // !!! ADJUST PATH TO YOUR SOUND FILE !!!
                tingSound = new Audio('../../assets/sounds/ting.wav'); // Or .mp3 etc.
                tingSound.load(); // Start loading
                console.log(`[${positionDisplayName}] Ting sound object created.`);
            } catch (e) {
                console.error("Could not create or load audio:", e);
                tingSound = null;
            }
            document.addEventListener('visibilitychange', handleVisibilityChange);
            visibilityChangeListenerAttached = true;
        }
    }

    function detachVisibilityListener() {
        if (visibilityChangeListenerAttached) {
            console.log(`[${positionDisplayName}] Detaching visibility change listener.`);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            visibilityChangeListenerAttached = false;
            if (tingSound) {
                tingSound.pause(); // Stop playback if any
                tingSound.src = ''; // Release resource potentially
            }
            tingSound = null; // Release audio object reference
        }
    }

    // --- Voting Status Check ---
    async function checkVotingStatusAndSetup() {
         console.log(`[${positionDisplayName}] Checking voting status...`);
         const userVoteDocId = `${loggedInUserNID}_${expectedPositionId}`;
         const userVoteRef = firestoreDB.collection('userVotes').doc(userVoteDocId);
         try {
             const docSnap = await userVoteRef.get();
             if (docSnap.exists) {
                 console.log(`[${positionDisplayName}] Already voted (detected on load).`);
                 hasVotedThisSession = true; // Mark as voted for this session logic
                 displayLockedUIState();
                 // DO NOT attach visibility listener if already voted
                 return true;
             } else {
                 console.log(`[${positionDisplayName}] Not voted yet.`);
                 setupVoteButtons();
                 attachVisibilityListener(); // Attach listener only if voting is possible
                 return false;
             }
         } catch (error) {
             console.error(`[${positionDisplayName}] Error checking voting status:`, error);
             alert(`Error checking voting status: ${error.message}.`);
             if (candidatesContainer) candidatesContainer.innerHTML = `<p style="color:red; text-align:center;">Error checking status.</p>`;
             hasVotedThisSession = true; // Prevent potential redirect loops on error check failure
             // DO NOT attach listener on error
             return true;
         }
    }

    // --- Setup Vote Buttons ---
    function setupVoteButtons() {
        // Ensure we query within the specific container
        voteButtons = candidatesContainer.querySelectorAll(`button[data-position-id="${expectedPositionId}"]`);
        console.log(`[${positionDisplayName}] Found ${voteButtons.length} active vote buttons.`);
        if (voteButtons.length === 0 && !candidatesContainer.querySelector('.already-voted-message')) {
             console.warn(`[${positionDisplayName}] No vote buttons found for this position. Check HTML data-attributes.`);
             candidatesContainer.innerHTML = `<p style="color:orange; text-align:center;">No candidate options currently available for ${positionDisplayName}.</p>`;
             return;
        }
        voteButtons.forEach(button => {
             // Remove potential old listeners before adding new ones (safer if re-running setup)
             button.removeEventListener('click', handleVoteSubmit);
             button.addEventListener('click', handleVoteSubmit);
        });
        console.log(`[${positionDisplayName}] Event listeners added/updated.`);
    }

    // --- Display Locked/Voted Message IN PLACE OF BUTTONS ---
    function displayLockedUIState() {
        console.log(`[${positionDisplayName}] Displaying Locked UI State.`);
        if (candidatesContainer) {
            const lockedHTML = `<div class="already-voted-message" style="text-align:center; padding: 30px; border: 1px solid #ddd; background-color:#f8f8f8; border-radius: 8px; margin-top: 20px;">
                <h3 style='color:#333; margin-bottom: 15px;'>Vote Recorded</h3>
                <p style="font-weight:bold;">You have already cast your vote for ${positionDisplayName}.</p>
                <br>
                <a href="./CB-vote-page.html" style="text-decoration: none; background-color: #555; color: white; padding: 10px 18px; border-radius: 5px; font-size: 0.9em;">Back to Positions</a>
             </div>`;
            candidatesContainer.innerHTML = lockedHTML;
            console.log(`[${positionDisplayName}] Locked UI displayed.`);
        } else { console.error(`[${positionDisplayName}] candidatesContainer (ID: ${containerElementId}) not found for locked state.`); }
    }

    // --- Show Custom Confirmation Modal (BEFORE vote) ---
    function showVoteConfirmationModal(candidateName, positionName) {
        return new Promise((resolve) => {
            modalTitle.textContent = 'Confirm Your Vote';
            modalBody.innerHTML = `You are about to vote for:<br><br>Candidate: <strong>${candidateName}</strong><br>Position: <strong>${positionName}</strong><br><br>This action cannot be undone. Proceed?`;
            modalConfirmBtn.textContent = 'Confirm';
            modalCancelBtn.style.display = ''; // Ensure cancel button is visible

            // Define temporary handlers
            const confirmHandler = () => { cleanupModalHandlers(); resolve(true); };
            const cancelHandler = () => { cleanupModalHandlers(); resolve(false); };
            const outsideClickHandler = (event) => { if (event.target === modal) cancelHandler(); };

            // Assign handlers
            modalConfirmBtn.onclick = confirmHandler;
            modalCancelBtn.onclick = cancelHandler;
            modal.onclick = outsideClickHandler; // Handle click outside modal content

            modal.classList.remove('hidden');
        });
    }

    // Show Modal AFTER Successful Vote
    function showVoteSuccessModal(candidateName, positionName) {
        return new Promise((resolve) => { // Return a promise for chaining if needed later
            modalTitle.textContent = 'Vote Submitted Successfully!';
            modalBody.innerHTML = `Your vote for <strong>${candidateName}</strong> for the position of <strong>${positionName}</strong> has been recorded.`;
            modalConfirmBtn.textContent = 'OK';
            modalCancelBtn.style.display = 'none'; // Hide cancel for success modal

            // Define temporary handlers
            const confirmHandler = () => { cleanupModalHandlers(); resolve(true); }; // Resolve when OK is clicked
            const outsideClickHandler = (event) => { if (event.target === modal) confirmHandler(); }; // Also close on outside click

            // Assign handlers
            modalConfirmBtn.onclick = confirmHandler;
            modal.onclick = outsideClickHandler;

            modal.classList.remove('hidden');
            console.log(`[${positionDisplayName}] Vote success modal shown.`);
        });
    }

    // Helper to remove onclick handlers and reset modal state
    function cleanupModalHandlers() {
        if (modalConfirmBtn) modalConfirmBtn.onclick = null;
        if (modalCancelBtn) modalCancelBtn.onclick = null;
        if (modal) modal.onclick = null; // Remove the general modal click listener too
        if (modal) modal.classList.add('hidden'); // Ensure modal is hidden
        if (modalCancelBtn) modalCancelBtn.style.display = ''; // Restore cancel button visibility for next use
        console.log(`[${positionDisplayName}] Modal handlers cleaned up.`);
    }

    // --- Handle Vote Button Click -> Confirmation -> Firestore -> Success Modal -> Lock UI ---
    async function handleVoteSubmit(event) {
        const button = event.currentTarget;
        const candidateId = button.dataset.candidateId;
        const positionId = button.dataset.positionId;
        const candidateName = button.dataset.candidateName || 'this candidate'; // Fallback name

        // Basic validation
        if (!candidateId || !positionId) {
            console.error(`[${positionDisplayName}] Missing data attributes (candidateId or positionId) on button:`, button);
            alert("Error: Could not process vote due to missing button information.");
            return;
        }
        if (positionId !== expectedPositionId) {
             console.warn(`[${positionDisplayName}] Button positionId (${positionId}) doesn't match expected (${expectedPositionId}). Ignoring click.`);
             return; // Should not happen if querySelector is correct, but good safeguard
        }

        console.log(`[${positionDisplayName}] Vote button clicked for ${candidateName} (ID: ${candidateId})`);

        // --- Step 1: Show Confirmation Modal ---
        const isConfirmed = await showVoteConfirmationModal(candidateName, positionDisplayName);
        if (!isConfirmed) {
            console.log(`[${positionDisplayName}] Vote cancelled by user.`);
            return; // Stop if user cancels
        }

        // --- Step 2: Attempt Firestore Transaction ---
        console.log(`[${positionDisplayName}] User confirmed. Attempting vote transaction...`);
        disableAllVoteButtons(true, 'Submitting...'); // Disable buttons while processing

        const userVoteDocId = `${loggedInUserNID}_${positionId}`;
        const userVoteRef = firestoreDB.collection('userVotes').doc(userVoteDocId);
        const candidateRef = firestoreDB.collection('candidates').doc(candidateId);

        try {
            await firestoreDB.runTransaction(async (transaction) => {
                // Check if user already voted WITHIN the transaction for atomicity
                const userVoteDoc = await transaction.get(userVoteRef);
                if (userVoteDoc.exists) {
                    // Throw specific error to be caught below
                    throw new Error(`You have already voted for ${positionDisplayName}.`);
                }

                // Check if candidate exists
                const candidateDoc = await transaction.get(candidateRef);
                if (!candidateDoc.exists) {
                    throw new Error(`Candidate data for ID ${candidateId} not found. Vote cannot be recorded.`);
                }

                // Perform updates if checks pass
                transaction.update(candidateRef, {
                    voteCount: firebase.firestore.FieldValue.increment(1)
                });
                transaction.set(userVoteRef, {
                    voted: true,
                    candidateId: candidateId,
                    candidateName: candidateName, // Store name for potential later display
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
            });

            // --- Step 3: Handle SUCCESS ---
            console.log(`[${positionDisplayName}] Vote transaction successful!`);
            hasVotedThisSession = true; // Mark vote as complete for this session
            detachVisibilityListener(); // <<< Detach listener on successful vote
            await showVoteSuccessModal(candidateName, positionDisplayName); // Show success modal (await might not be strictly needed but good practice)
            displayLockedUIState(); // Lock the UI to show vote recorded message

        } catch (error) {
            // --- Step 4: Handle ERRORS ---
            console.error(`[${positionDisplayName}] Vote submission failed:`, error);
            // Check for the specific "already voted" error from the transaction
            if (error.message.includes("already voted")) {
                alert(`Vote failed: ${error.message}`); // Inform user
                hasVotedThisSession = true; // Mark as voted for session logic
                detachVisibilityListener(); // <<< Detach listener if confirmed already voted
                displayLockedUIState(); // Ensure UI is locked if they somehow bypassed initial check
            } else {
                // For other errors (e.g., candidate not found, network issue, permissions)
                alert(`Vote failed: ${error.message}. Please try again.`);
                 disableAllVoteButtons(false); // Re-enable buttons only on potentially recoverable errors
                 // DO NOT detach listener on these errors, allow retry/visibility warning
            }
        }
    }

    // Helper to disable/enable vote buttons within this position's container
    function disableAllVoteButtons(disable = true, text = 'Vote') {
         const currentButtons = candidatesContainer?.querySelectorAll(`button[data-position-id="${expectedPositionId}"]`);
         currentButtons?.forEach(button => {
             button.disabled = disable;
             button.textContent = text; // Update text (e.g., to 'Submitting...')
         });
         console.log(`[${positionDisplayName}] Buttons ${disable ? 'disabled' : 'enabled'}.`);
    }

    // --- Initial Load Action ---
    console.log(`[${positionDisplayName}] Starting initial checkVotingStatusAndSetup...`);
    checkVotingStatusAndSetup();

    // Timer and navigation highlighting are assumed to be handled by a shared script (e.g., shared-dashboard.js)

}); // End DOMContentLoaded