// Filename: ../../scripts/CB-vote-page.js
// Desc: Main voting page. Checks GLOBAL status, user's vote status, shows NAV confirmation modal. Adds VISIBILITY *informational* warning for THIS page.

document.addEventListener('DOMContentLoaded', () => {
    console.log("[CBVotePage] DOMContentLoaded triggered. Initializing...");

    // --- Dependency & Auth Checks ---
    // (Keep checks as before)
    if (typeof isWalletConnected !== 'function' || typeof redirectToWalletPage !== 'function' ||
        typeof firestoreDB === 'undefined' || !firestoreDB || typeof getElectionStatus !== 'function') {
         console.error("CB Vote Page: Shared functions, Firestore DB, or getElectionStatus not loaded!");
         alert("Page loading error (Deps). Please refresh."); document.body.innerHTML = "<p>Error</p>"; return;
    }
    if (!isWalletConnected()) { redirectToWalletPage(); return; }
    const loggedInUserNID = sessionStorage.getItem('loggedInUserNID');
    if (!loggedInUserNID) { console.error("CB Vote Page: User NID not found."); alert("Auth error."); document.body.innerHTML = "<p>Error</p>"; return; }
    console.log(`[CBVotePage] User NID found: ${loggedInUserNID}`);

    // --- UI Elements ---
    // (Keep element checks as before)
    const mainElement = document.getElementById('main');
    const positionLinksContainer = document.getElementById('pos');
    const positionLinks = document.querySelectorAll('.position-link');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalConfirmBtn = document.getElementById('confirm-btn');
    const modalCancelBtn = document.getElementById('cancel-btn');
    const modalElementsExist = modal && modalTitle && modalBody && modalConfirmBtn && modalCancelBtn;
    if (!mainElement || !positionLinksContainer || positionLinks.length === 0) { console.error("[CBVotePage] Missing critical UI elements."); alert("Page setup error."); if (mainElement) mainElement.innerHTML = "<p>Error</p>"; return; }
    if (!modalElementsExist) { console.warn("[CBVotePage] Modal UI elements not found."); }
    console.log("[CBVotePage] UI elements check passed.");

    // --- State ---
    let targetVotePage = ''; // Store href for navigation action
    let visibilityChangeListenerAttached = false; // Track listener for THIS page
    // let navigatedAway = false; // REMOVED - We won't track explicit navigation this way

    // --- Visibility Change Handler (Informational Only) ---
    // ***** MODIFIED: Removed redirect, simpler warning *****
    const handleVisibilityChange = () => {
        // Only trigger if page becomes hidden
        if (document.hidden) {
            console.info("[CBVotePage] Position selection page hidden (tab switch, etc.).");
            // Optional: You could show a subtle indicator on the page itself when they return,
            // instead of an alert, e.g., "You switched away, please review your selection."
            // For now, we just log it. The primary protection is on the individual voting pages.
            // alert("Note: You navigated away from the position selection page."); // Removed alert as it's annoying on valid navigation
        } else {
            console.info("[CBVotePage] Position selection page became visible again.");
        }
    };

    function attachVisibilityListener() {
        if (!visibilityChangeListenerAttached) {
            console.log("[CBVotePage] Attaching visibility change listener for position selection page.");
            // navigatedAway = false; // REMOVED
            document.addEventListener('visibilitychange', handleVisibilityChange);
            visibilityChangeListenerAttached = true;
        }
    }

    function detachVisibilityListener() {
        if (visibilityChangeListenerAttached) {
            console.log("[CBVotePage] Detaching visibility change listener for position selection page.");
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            visibilityChangeListenerAttached = false;
        }
    }

    // --- Disable Links Function (Keep as before) ---
    function setPositionLinksState(enabled, message = "") {
        // ... (Keep the implementation that targets #pos and hides/shows <p> tags) ...
        console.log(`[CBVotePage-SetState] Called with enabled=${enabled}, message="${message}"`);
        if (!positionLinksContainer) { console.error("[CBVotePage-SetState] #pos null!"); return; }
        let messageElement = positionLinksContainer.querySelector('.election-status-message');
        if (!messageElement) { messageElement = document.createElement('div'); messageElement.className = 'election-status-message'; /* Apply styles */ messageElement.style.textAlign = 'center'; messageElement.style.padding = '30px'; messageElement.style.marginTop = '20px'; messageElement.style.fontWeight = 'bold'; messageElement.style.color = '#555'; messageElement.style.border = '1px solid #ddd'; messageElement.style.borderRadius = '8px'; messageElement.style.backgroundColor = '#f8f8f8'; messageElement.style.display = 'none'; positionLinksContainer.appendChild(messageElement); }
        const linkParagraphs = positionLinksContainer.querySelectorAll('p.position-row');
        if (enabled) { console.log("[CBVotePage-SetState] Enabling links."); positionLinks.forEach(link => { link.style.opacity = '1'; link.style.pointerEvents = 'auto'; link.style.cursor = 'pointer'; }); linkParagraphs.forEach(p => p.style.display = ''); messageElement.style.display = 'none'; messageElement.textContent = '';
        } else { console.log("[CBVotePage-SetState] Disabling links."); positionLinks.forEach(link => { link.style.opacity = '0.5'; link.style.pointerEvents = 'none'; link.style.cursor = 'not-allowed'; }); linkParagraphs.forEach(p => p.style.display = 'none'); messageElement.textContent = message; messageElement.style.display = 'block'; }
        console.log("[CBVotePage-SetState] State update complete.");
    }

     // --- Function to Check User Vote Status (Keep as before) ---
    async function checkIfAlreadyVoted(positionId) {
        // ... (Keep the implementation) ...
         console.log(`[CBVotePage-CheckVote] Checking if user ${loggedInUserNID} voted for ${positionId}`); if (!loggedInUserNID) throw new Error("User session missing."); if (!positionId) throw new Error("Position ID missing."); if (!firestoreDB) throw new Error("Database connection error."); const userVoteDocId = `${loggedInUserNID}_${positionId}`; const userVoteRef = firestoreDB.collection('userVotes').doc(userVoteDocId); try { const docSnap = await userVoteRef.get(); return docSnap.exists; } catch (error) { console.error(`[CBVotePage-CheckVote] Read error:`, error); throw new Error(`Database error.`); }
    }

    // --- Modal Functions ---
    function openNavigationConfirmModal(positionName) {
        console.log(`[CBVotePage-Modal] Opening navigation confirm modal for ${positionName}`);
        if (!modalElementsExist) { // Fallback
            if(confirm(`Proceed to vote for ${positionName}? Please complete your vote on the next page.`)) {
                // --- Detach listener ONLY when proceeding to vote ---
                detachVisibilityListener();
                // --------------------------------------------------
                if (targetVotePage) window.location.href = targetVotePage; else console.error("Target page URL missing.");
            } else { console.log("Navigation cancelled."); }
            return;
        }
        // Standard modal logic
        modalTitle.textContent = `Proceed to Vote for ${positionName}?`;
        modalBody.textContent = `You are about to navigate to the voting page for ${positionName}. Please complete your vote on that page before navigating elsewhere.`;
        modalConfirmBtn.textContent = 'Proceed';
        modalCancelBtn.style.display = '';

        const confirmHandler = () => {
            console.log("[CBVotePage-Modal] User clicked Proceed.");
            // --- Detach listener ONLY when proceeding to vote ---
            detachVisibilityListener();
            // --------------------------------------------------
            if (targetVotePage) { window.location.href = targetVotePage; }
            else { console.error("Target page URL was lost."); alert("Navigation error."); }
            closeModal();
        };
        const cancelHandler = () => { console.log("[CBVotePage-Modal] Navigation cancelled by button."); closeModal(); };
        const outsideClickHandler = (event) => { if (event.target === modal) { console.log("[CBVotePage-Modal] Navigation cancelled by clicking outside."); closeModal(); } };

        modalConfirmBtn.onclick = confirmHandler; modalCancelBtn.onclick = cancelHandler; modal.onclick = outsideClickHandler;
        modal.classList.remove('hidden');
    }

    // (Keep openAlreadyVotedModal and closeModal as before)
    function openAlreadyVotedModal(positionName) { /* ... */ console.log(`[CBVotePage-Modal] Opening already voted modal for ${positionName}`); if (!modalElementsExist) { alert(`You have already submitted your vote for ${positionName}.`); return; } modalTitle.textContent = "Vote Already Cast"; modalBody.textContent = `You have already submitted your vote for ${positionName}.`; modalConfirmBtn.textContent = 'OK'; modalCancelBtn.style.display = 'none'; modalConfirmBtn.onclick = () => { closeModal(); }; modal.onclick = (event) => { if (event.target === modal) closeModal(); }; modal.classList.remove('hidden'); }
    function closeModal() { /* ... */ console.log("[CBVotePage-Modal] Closing modal."); if (!modalElementsExist) return; modal.classList.add('hidden'); targetVotePage = ''; modalConfirmBtn.onclick = null; modalCancelBtn.onclick = null; modal.onclick = null; modalCancelBtn.style.display = ''; }


    // --- Handler for Position Link Click (Keep as before) ---
    async function handlePositionLinkClick(event) {
        // ... (Keep the implementation) ...
        event.preventDefault(); const link = event.currentTarget; const positionId = link.dataset.positionId; const positionDisplayName = link.dataset.positionName || link.textContent.trim(); const nextPageUrl = link.href; console.log(`[CBVotePage-LinkClick] Clicked link for ${positionDisplayName}`); if (!positionId || !nextPageUrl || nextPageUrl === '#') { return; } console.log("[CBVotePage-LinkClick] Checking user vote status..."); link.style.opacity = '0.6'; const originalPointerEvents = link.style.pointerEvents; link.style.pointerEvents = 'none'; try { const hasVoted = await checkIfAlreadyVoted(positionId); targetVotePage = nextPageUrl; if (hasVoted) { openAlreadyVotedModal(positionDisplayName); } else { openNavigationConfirmModal(positionDisplayName); } } catch (error) { console.error(`[CBVotePage-LinkClick] Error:`, error); alert(`Could not check status. Error: ${error.message}`); targetVotePage = ''; } finally { link.style.opacity = '1'; link.style.pointerEvents = originalPointerEvents || 'auto'; console.log(`[CBVotePage-LinkClick] Finished processing click.`); }
    }

    // --- Attach/Detach Link Listeners (Keep as before) ---
    function attachPositionLinkListeners() { /* ... */ console.log("[CBVotePage-Listeners] Attaching click listeners..."); let count = 0; positionLinks.forEach(link => { if (!link.hasClickListener) { link.addEventListener('click', handlePositionLinkClick); link.hasClickListener = true; count++; } }); console.log(`[CBVotePage-Listeners] Attached ${count} listeners.`); }
     function detachPositionLinkListeners() { /* ... */ console.log("[CBVotePage-Listeners] Detaching click listeners..."); let count = 0; positionLinks.forEach(link => { link.removeEventListener('click', handlePositionLinkClick); if (link.hasClickListener) count++; link.hasClickListener = false; }); console.log(`[CBVotePage-Listeners] Detached ${count} listeners.`); }


    // --- Initial Page Load Function ---
    async function initializeVotePage() {
        console.log("[CBVotePage-Init] initializeVotePage function started.");
        console.log("[CBVotePage-Init] Checking dependencies..."); // Log dependencies
        console.log("[CBVotePage-Init] typeof getElectionStatus:", typeof getElectionStatus);
        console.log("[CBVotePage-Init] firestoreDB object:", firestoreDB);

        setPositionLinksState(false, "Checking election status..."); // Initial loading state

        try {
            console.log("[CBVotePage-Init] Calling getElectionStatus()...");
            const electionStatus = await getElectionStatus();
            console.log(`[CBVotePage-Init] getElectionStatus() returned: ${electionStatus}`);

            let message = "";
            let votingEnabled = false;
            let attachPageVisibilityListener = false; // Flag specific for this page's listener

            switch (electionStatus) {
                case "ONGOING":
                    console.log("[CBVotePage-Init] Status ONGOING. Enabling voting & visibility listener.");
                    votingEnabled = true;
                    attachPageVisibilityListener = true; // Attach listener ONLY if ongoing
                    message = "";
                    break;
                // ... (other status cases) ...
                case "NOT_STARTED": message = "Voting has not started yet."; break;
                case "PAUSED": message = "Voting is currently paused."; break;
                case "ENDED": message = "Voting has now closed."; break;
                default: message = "Election status unavailable."; break;
            }

            console.log(`[CBVotePage-Init] Calling setPositionLinksState(${votingEnabled}, "${message}")`);
            setPositionLinksState(votingEnabled, message);

            if (votingEnabled) {
                console.log("[CBVotePage-Init] Attaching link listeners.");
                attachPositionLinkListeners();
            } else {
                 console.log("[CBVotePage-Init] Detaching link listeners.");
                 detachPositionLinkListeners();
            }

            // --- Handle Visibility Listener Attachment ---
            // Attach listener if election is ONGOING, detach otherwise
            if (attachPageVisibilityListener) {
                attachVisibilityListener();
            } else {
                detachVisibilityListener(); // Ensure listener is detached if not ongoing
            }

        } catch (error) {
            console.error("[CBVotePage-Init] FAILED to get initial election status:", error);
            alert(`Error loading page configuration: ${error.message}. Please refresh.`);
            setPositionLinksState(false, `Error loading election status: ${error.message}. Please refresh.`);
            detachPositionLinkListeners();
            detachVisibilityListener(); // Also detach visibility listener on error
        }
        console.log("[CBVotePage-Init] initializeVotePage function finished.");
    }

    // --- Run Initialization ---
    console.log("[CBVotePage] Setting up DOMContentLoaded runner.");
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initializeVotePage); } else { initializeVotePage(); }
    console.log("[CBVotePage] CB-vote-page.js script execution finished setup.");

}); // End DOMContentLoaded (outer wrapper)