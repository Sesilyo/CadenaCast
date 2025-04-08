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
        if (lc) lc.innerHTML = '<p style="color:red;text-align:center;font-weight:bold;">Page Error: Load Failed.</p>';
        return;
    }
    if (!isWalletConnected()) { redirectToWalletPage(); return; }

    const loggedInUserNID = sessionStorage.getItem('loggedInUserNID');
    if (!loggedInUserNID) {
        console.error(`[${positionDisplayName}] User NID not found.`);
        alert("Authentication error.");
        const lc = document.getElementById(containerElementId) || document.getElementById('main');
        if (lc) lc.innerHTML = '<p style="color:red; text-align:center;">Cannot vote. User session missing.</p>';
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
                attachVisibilityListener();
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

    function setupVoteButtons() {
        voteButtons = candidatesContainer.querySelectorAll(`button[data-position-id="${expectedPositionId}"]`);
        console.log(`[${positionDisplayName}] Found ${voteButtons.length} active vote buttons.`);
        if (voteButtons.length === 0 && !candidatesContainer.querySelector('.already-voted-message')) {
            console.warn(`[${positionDisplayName}] No vote buttons found for this position. Check HTML data-attributes.`);
            candidatesContainer.innerHTML = `<p style="color:orange; text-align:center;">No candidate options currently available for ${positionDisplayName}.</p>`;
            return;
        }
        voteButtons.forEach(button => {
            button.removeEventListener('click', handleVoteSubmit);
            button.addEventListener('click', handleVoteSubmit);
        });
        console.log(`[${positionDisplayName}] Event listeners added/updated.`);
    }

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
        } else {
            console.error(`[${positionDisplayName}] candidatesContainer (ID: ${containerElementId}) not found for locked state.`);
        }
    }

    function showVoteConfirmationModal(candidateName, positionName) {
        return new Promise((resolve) => {
            modalTitle.textContent = 'Confirm Your Vote';
            modalBody.innerHTML = `You are about to vote for:<br><br>Candidate: <strong>${candidateName}</strong><br>Position: <strong>${positionName}</strong><br><br>This action cannot be undone. Proceed?`;
            modalConfirmBtn.textContent = 'Confirm';
            modalCancelBtn.style.display = '';

            const confirmHandler = () => { cleanupModalHandlers(); resolve(true); };
            const cancelHandler = () => { cleanupModalHandlers(); resolve(false); };
            const outsideClickHandler = (event) => { if (event.target === modal) cancelHandler(); };

            modalConfirmBtn.onclick = confirmHandler;
            modalCancelBtn.onclick = cancelHandler;
            modal.onclick = outsideClickHandler;

            modal.classList.remove('hidden');
        });
    }

    function showVoteSuccessModal(candidateName, positionName) {
        return new Promise((resolve) => {
            modalTitle.textContent = 'Vote Submitted Successfully!';
            modalBody.innerHTML = `Your vote for <strong>${candidateName}</strong> for the position of <strong>${positionName}</strong> has been recorded.`;
            modalConfirmBtn.textContent = 'OK';
            modalCancelBtn.style.display = 'none';

            const confirmHandler = () => { cleanupModalHandlers(); resolve(true); };
            const outsideClickHandler = (event) => { if (event.target === modal) confirmHandler(); };

            modalConfirmBtn.onclick = confirmHandler;
            modal.onclick = outsideClickHandler;

            modal.classList.remove('hidden');
            console.log(`[${positionDisplayName}] Vote success modal shown.`);
        });
    }

    function cleanupModalHandlers() {
        if (modalConfirmBtn) modalConfirmBtn.onclick = null;
        if (modalCancelBtn) modalCancelBtn.onclick = null;
        if (modal) modal.onclick = null;
        if (modal) modal.classList.add('hidden');
        if (modalCancelBtn) modalCancelBtn.style.display = '';
        console.log(`[${positionDisplayName}] Modal handlers cleaned up.`);
    }

    async function handleVoteSubmit(event) {
        const button = event.currentTarget;
        const candidateId = button.dataset.candidateId;
        const positionId = button.dataset.positionId;
        const candidateName = button.dataset.candidateName || 'this candidate';

        if (!candidateId || !positionId) {
            console.error(`[${positionDisplayName}] Missing data attributes (candidateId or positionId) on button:`, button);
            alert("Error: Could not process vote due to missing button information.");
            return;
        }
        if (positionId !== expectedPositionId) {
            console.warn(`[${positionDisplayName}] Button positionId (${positionId}) doesn't match expected (${expectedPositionId}). Ignoring click.`);
            return;
        }

        console.log(`[${positionDisplayName}] Vote button clicked for ${candidateName} (ID: ${candidateId})`);

        const isConfirmed = await showVoteConfirmationModal(candidateName, positionDisplayName);
        if (!isConfirmed) {
            console.log(`[${positionDisplayName}] Vote cancelled by user.`);
            return;
        }

        console.log(`[${positionDisplayName}] User confirmed. Attempting vote transaction...`);
        disableAllVoteButtons(true, 'Submitting...');

        const userVoteDocId = `${loggedInUserNID}_${positionId}`;
        const userVoteRef = firestoreDB.collection('userVotes').doc(userVoteDocId);
        const candidateRef = firestoreDB.collection('candidates').doc(candidateId);

        try {
            await firestoreDB.runTransaction(async (transaction) => {
                const userVoteDoc = await transaction.get(userVoteRef);
                if (userVoteDoc.exists) {
                    throw new Error(`You have already voted for ${positionDisplayName}.`);
                }

                const candidateDoc = await transaction.get(candidateRef);
                if (!candidateDoc.exists) {
                    throw new Error(`Candidate data for ID ${candidateId} not found. Vote cannot be recorded.`);
                }

                transaction.update(candidateRef, {
                    voteCount: firebase.firestore.FieldValue.increment(1)
                });
                transaction.set(userVoteRef, {
                    voted: true,
                    candidateId: candidateId,
                    candidateName: candidateName,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
            });

            console.log(`[${positionDisplayName}] Vote transaction successful!`);
            hasVotedThisSession = true;
            detachVisibilityListener();
            await showVoteSuccessModal(candidateName, positionDisplayName);
            displayLockedUIState();
        } catch (error) {
            console.error(`[${positionDisplayName}] Vote submission failed:`, error);
            if (error.message.includes("already voted")) {
                alert(`Vote failed: ${error.message}`);
                hasVotedThisSession = true;
                detachVisibilityListener();
                displayLockedUIState();
            } else {
                alert(`Vote failed: ${error.message}. Please try again.`);
                disableAllVoteButtons(false);
            }
        }
    }

    function disableAllVoteButtons(disable = true, text = 'Vote') {
        const currentButtons = candidatesContainer?.querySelectorAll(`button[data-position-id="${expectedPositionId}"]`);
        currentButtons?.forEach(button => {
            button.disabled = disable;
            button.textContent = text;
        });
        console.log(`[${positionDisplayName}] Buttons ${disable ? 'disabled' : 'enabled'}.`);
    }

    console.log(`[${positionDisplayName}] Starting initial checkVotingStatusAndSetup...`);
    checkVotingStatusAndSetup();
});