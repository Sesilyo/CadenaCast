// Filename: ../../scripts/CBC-sec-vote-page.js
// Desc: Handles voting for Secretary with modal confirmation, success modal, locking, and visibility check warning.

document.addEventListener('DOMContentLoaded', () => {
    // --- !!! CONFIGURATION FOR THIS POSITION !!! ---
    const expectedPositionId = 'secretary';          // *** CHANGED ***
    const positionDisplayName = 'Secretary';         // *** CHANGED ***
    const containerElementId = 'secretary-candidates'; // *** CHANGED *** (MUST MATCH ID in CBC-sec-vote-page.html)
    // ----------------------------------------------

    console.log(`[${positionDisplayName}] Loading vote page.`);

    // --- State Variables ---
    let voteButtons = [];
    let hasVotedThisSession = false;
    let visibilityChangeListenerAttached = false;
    let tingSound = null;

    // --- Access Control & Setup Checks ---
    if (typeof isWalletConnected !== 'function' || typeof redirectToWalletPage !== 'function' || typeof firestoreDB === 'undefined' || !firestoreDB) {
        console.error(`[${positionDisplayName}] Critical dependency missing.`); alert("Page loading error.");
        const lc = document.getElementById(containerElementId) || document.getElementById('main'); if(lc) lc.innerHTML='<p>Error</p>'; return;
    }
    if (!isWalletConnected()) { redirectToWalletPage(); return; }
    const loggedInUserNID = sessionStorage.getItem('loggedInUserNID');
    if (!loggedInUserNID) {
        console.error(`[${positionDisplayName}] User NID not found.`); alert("Authentication error.");
        const lc = document.getElementById(containerElementId) || document.getElementById('main'); if(lc) lc.innerHTML='<p>Error</p>'; return;
    }
    console.log(`[${positionDisplayName}] User NID for voting: ${loggedInUserNID}`);

    // --- UI Elements ---
    const candidatesContainer = document.getElementById(containerElementId);
    const mainElement = document.getElementById('main');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalConfirmBtn = document.getElementById('confirm-btn');
    const modalCancelBtn = document.getElementById('cancel-btn');

    if (!mainElement || !candidatesContainer || !modal || !modalTitle || !modalBody || !modalConfirmBtn || !modalCancelBtn) {
         console.error(`[${positionDisplayName}] Missing critical UI elements. Check IDs.`); alert("Page error."); return;
    }
    console.log(`[${positionDisplayName}] All critical UI elements found.`);

    // --- Visibility Change Handler ---
     const handleVisibilityChange = () => {
        if (document.hidden && !hasVotedThisSession) {
            console.warn(`[${positionDisplayName}] Page hidden before vote cast. Playing sound and redirecting.`);
            if (tingSound) {
                tingSound.play().catch(e => console.error("Error playing sound:", e));
            }
            detachVisibilityListener();
            alert("Warning: You navigated away from the voting page before completing your vote.\nYour current selection was not submitted.\n\nYou will be returned to the position selection page.");
            window.location.href = './CB-vote-page.html';
        }
    };

    function attachVisibilityListener() {
        if (!visibilityChangeListenerAttached) {
            console.log(`[${positionDisplayName}] Attaching visibility change listener.`);
            try {
                // !!! ADJUST PATH TO YOUR SOUND FILE !!!
                tingSound = new Audio('../../assets/sounds/ting.wav');
                tingSound.load();
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
                tingSound.pause();
                tingSound.src = '';
            }
            tingSound = null;
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
                 hasVotedThisSession = true;
                 displayLockedUIState();
                 return true;
             } else {
                 console.log(`[${positionDisplayName}] Not voted yet.`);
                 setupVoteButtons();
                 attachVisibilityListener(); // Attach listener
                 return false;
             }
         } catch (error) {
             console.error(`[${positionDisplayName}] Error checking voting status:`, error);
             alert(`Error checking voting status: ${error.message}.`);
             if (candidatesContainer) candidatesContainer.innerHTML = `<p style="color:red; text-align:center;">Error checking status.</p>`;
             hasVotedThisSession = true;
             return true;
         }
    }

    // --- Setup Vote Buttons ---
    function setupVoteButtons() {
        voteButtons = candidatesContainer.querySelectorAll(`button[data-position-id="${expectedPositionId}"]`);
        console.log(`[${positionDisplayName}] Found ${voteButtons.length} active vote buttons.`);
        if (voteButtons.length === 0 && !candidatesContainer.querySelector('.already-voted-message')) {
             console.warn(`[${positionDisplayName}] No vote buttons found.`);
             candidatesContainer.innerHTML = `<p style="color:orange; text-align:center;">No candidate options available.</p>`;
             return;
        }
        voteButtons.forEach(button => {
            button.removeEventListener('click', handleVoteSubmit);
            button.addEventListener('click', handleVoteSubmit);
        });
        console.log(`[${positionDisplayName}] Event listeners added/updated.`);
    }

    // --- Display Locked/Voted Message ---
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
        } else { console.error(`[${positionDisplayName}] Container not found.`); }
    }

    // --- Show Custom Confirmation Modal ---
    function showVoteConfirmationModal(candidateName, positionName) {
        return new Promise((resolve) => {
            modalTitle.textContent = 'Confirm Your Vote';
            modalBody.innerHTML = `Vote for: <strong>${candidateName}</strong> (${positionName})?<br><br>This cannot be undone.`;
            modalConfirmBtn.textContent = 'Confirm'; modalCancelBtn.style.display = '';

            const confirmHandler = () => { cleanupModalHandlers(); resolve(true); };
            const cancelHandler = () => { cleanupModalHandlers(); resolve(false); };
            const outsideClickHandler = (event) => { if (event.target === modal) cancelHandler(); };

            modalConfirmBtn.onclick = confirmHandler;
            modalCancelBtn.onclick = cancelHandler;
            modal.onclick = outsideClickHandler;

            modal.classList.remove('hidden');
        });
    }

    // Show Success Modal
    function showVoteSuccessModal(candidateName, positionName) {
         return new Promise((resolve) => {
            modalTitle.textContent = 'Vote Submitted!';
            modalBody.innerHTML = `Vote for <strong>${candidateName}</strong> (${positionName}) recorded.`;
            modalConfirmBtn.textContent = 'OK'; modalCancelBtn.style.display = 'none';

            const confirmHandler = () => { cleanupModalHandlers(); resolve(true); };
            const outsideClickHandler = (event) => { if (event.target === modal) confirmHandler(); };

            modalConfirmBtn.onclick = confirmHandler;
            modal.onclick = outsideClickHandler;

            modal.classList.remove('hidden');
            console.log(`[${positionDisplayName}] Success modal shown.`);
        });
    }

    // Cleanup modal handlers
    function cleanupModalHandlers() {
        if (modalConfirmBtn) modalConfirmBtn.onclick = null;
        if (modalCancelBtn) modalCancelBtn.onclick = null;
        if (modal) modal.onclick = null;
        if (modal) modal.classList.add('hidden');
        if (modalCancelBtn) modalCancelBtn.style.display = '';
        console.log(`[${positionDisplayName}] Modal handlers cleaned up.`);
    }

    // --- Handle Vote Button Click ---
    async function handleVoteSubmit(event) {
        const button = event.currentTarget;
        const candidateId = button.dataset.candidateId;
        const positionId = button.dataset.positionId;
        const candidateName = button.dataset.candidateName || 'this candidate';

        if (!candidateId || !positionId || positionId !== expectedPositionId) { return; }

        console.log(`[${positionDisplayName}] Vote clicked for ${candidateName}`);
        const isConfirmed = await showVoteConfirmationModal(candidateName, positionDisplayName);
        if (!isConfirmed) { console.log(`[${positionDisplayName}] Vote cancelled.`); return; }

        console.log(`[${positionDisplayName}] Confirmed. Submitting vote...`);
        disableAllVoteButtons(true, 'Submitting...');
        const userVoteDocId = `${loggedInUserNID}_${positionId}`;
        const userVoteRef = firestoreDB.collection('userVotes').doc(userVoteDocId);
        const candidateRef = firestoreDB.collection('candidates').doc(candidateId);

        try {
            await firestoreDB.runTransaction(async (transaction) => {
                const userVoteDoc = await transaction.get(userVoteRef);
                if (userVoteDoc.exists) throw new Error(`Already voted for ${positionDisplayName}.`);
                const candidateDoc = await transaction.get(candidateRef);
                if (!candidateDoc.exists) throw new Error(`Candidate not found.`);
                transaction.update(candidateRef, { voteCount: firebase.firestore.FieldValue.increment(1) });
                transaction.set(userVoteRef, {
                    voted: true, candidateId: candidateId, candidateName: candidateName,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
            });
            console.log(`[${positionDisplayName}] Vote success!`);
            hasVotedThisSession = true;
            detachVisibilityListener(); // Detach listener
            await showVoteSuccessModal(candidateName, positionDisplayName);
            displayLockedUIState();
        } catch (error) {
            console.error(`[${positionDisplayName}] Vote failed:`, error);
            if (error.message.includes("already voted")) {
                alert(`Vote failed: ${error.message}`);
                hasVotedThisSession = true;
                detachVisibilityListener(); // Detach listener
                displayLockedUIState();
            } else {
                alert(`Vote failed: ${error.message}. Please try again.`);
                disableAllVoteButtons(false); // Re-enable
            }
        }
    }

    // Disable/enable buttons helper
    function disableAllVoteButtons(disable = true, text = 'Vote') {
         const currentButtons = candidatesContainer?.querySelectorAll(`button[data-position-id="${expectedPositionId}"]`);
         currentButtons?.forEach(button => { button.disabled = disable; button.textContent = text; });
         console.log(`[${positionDisplayName}] Buttons ${disable ? 'disabled' : 'enabled'}.`);
    }

    // --- Initial Load Action ---
    console.log(`[${positionDisplayName}] Starting initial check...`);
    checkVotingStatusAndSetup();

}); // End DOMContentLoaded