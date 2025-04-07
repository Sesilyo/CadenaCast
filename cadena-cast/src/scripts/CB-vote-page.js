// Filename: ../../scripts/CB-vote-page.js
// Desc: Main voting page. Checks GLOBAL status, user's vote status, shows NAV confirmation modal, and adds VISIBILITY informational warning.

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
    let targetVotePage = '';
    let visibilityChangeListenerAttached = false;
    let isVotingGloballyEnabled = false; // <<<--- Add state variable to track global status

    // --- Visibility Change Handler (Informational Only - Keep as before) ---
    const handleVisibilityChange = () => { /* ... console.info logs ... */ if (document.hidden) { console.info("[CBVotePage] Position selection page hidden."); } else { console.info("[CBVotePage] Position selection page visible."); } };
    function attachVisibilityListener() { if (!visibilityChangeListenerAttached) { console.log("[CBVotePage] Attaching visibility listener."); document.addEventListener('visibilitychange', handleVisibilityChange); visibilityChangeListenerAttached = true; } }
    function detachVisibilityListener() { if (visibilityChangeListenerAttached) { console.log("[CBVotePage] Detaching visibility listener."); document.removeEventListener('visibilitychange', handleVisibilityChange); visibilityChangeListenerAttached = false; } }

    // --- Disable Links Function (Keep as before) ---
    function setPositionLinksState(enabled, message = "") {
        // ... (Keep the implementation that targets #pos and hides/shows <p> tags) ...
         console.log(`[CBVotePage-SetState] Called with enabled=${enabled}, message="${message}"`);
        if (!positionLinksContainer) { console.error("[CBVotePage-SetState] #pos null!"); return; }
        let messageElement = positionLinksContainer.querySelector('.election-status-message');
        if (!messageElement) { messageElement = document.createElement('div'); messageElement.className = 'election-status-message'; /* Apply styles */ messageElement.style.cssText = "text-align:center; padding: 30px; margin-top: 20px; font-weight: bold; color: #555; border: 1px solid #ddd; border-radius: 8px; background-color: #f8f8f8; display: none;"; positionLinksContainer.appendChild(messageElement); console.log("[CBVotePage-SetState] Created message element."); }
        const linkParagraphs = positionLinksContainer.querySelectorAll('p.position-row');
        if (enabled) { console.log("[CBVotePage-SetState] Enabling links."); positionLinks.forEach(link => { link.style.opacity = '1'; link.style.pointerEvents = 'auto'; link.style.cursor = 'pointer'; }); linkParagraphs.forEach(p => p.style.display = ''); messageElement.style.display = 'none'; messageElement.textContent = '';
        } else { console.log("[CBVotePage-SetState] Disabling links."); positionLinks.forEach(link => { link.style.opacity = '0.5'; link.style.pointerEvents = 'none'; link.style.cursor = 'not-allowed'; }); linkParagraphs.forEach(p => p.style.display = 'none'); messageElement.textContent = message; messageElement.style.display = 'block'; }
        console.log("[CBVotePage-SetState] State update complete.");
    }

     // --- Function to Check User Vote Status (Keep as before) ---
    async function checkIfAlreadyVoted(positionId) { /* ... */ console.log(`[CBVotePage-CheckVote] Checking vote for ${positionId}`); if (!loggedInUserNID) throw new Error("NID missing."); if (!positionId) throw new Error("Pos ID missing."); if (!firestoreDB) throw new Error("DB error."); const voteId = `${loggedInUserNID}_${positionId}`; const voteRef = firestoreDB.collection('userVotes').doc(voteId); try { const doc = await voteRef.get(); return doc.exists; } catch (err) { console.error(`Vote check error:`, err); throw new Error(`DB error.`); } }

    // --- Modal Functions (Keep as before, ensure detach listener only on proceed) ---
    function openNavigationConfirmModal(positionName) {
        console.log(`[CBVotePage-Modal] Opening nav confirm for ${positionName}`);
        if (!modalElementsExist) { if(confirm(`Proceed to vote for ${positionName}?`)) { detachVisibilityListener(); if (targetVotePage) window.location.href = targetVotePage; } else { console.log("Nav cancelled."); } return; }
        modalTitle.textContent = `Proceed to Vote for ${positionName}?`; modalBody.textContent = `Navigate to the ${positionName} voting page?`; modalConfirmBtn.textContent = 'Proceed'; modalCancelBtn.style.display = '';
        const confirmH = () => { console.log("Proceed clicked."); detachVisibilityListener(); /* Detach here */ if (targetVotePage) { window.location.href = targetVotePage; } else { console.error("Target missing."); alert("Nav error."); } closeModal(); };
        const cancelH = () => { console.log("Cancel clicked."); closeModal(); }; const outsideH = (e) => { if (e.target === modal) { console.log("Outside click cancel."); closeModal(); } };
        modalConfirmBtn.onclick = confirmH; modalCancelBtn.onclick = cancelH; modal.onclick = outsideH; modal.classList.remove('hidden');
    }
    function openAlreadyVotedModal(positionName) { /* ... (Keep as before) ... */ console.log(`[CBVotePage-Modal] Opening already voted modal for ${positionName}`); if (!modalElementsExist) { alert(`Already voted for ${positionName}.`); return; } modalTitle.textContent = "Vote Already Cast"; modalBody.textContent = `Already voted for ${positionName}.`; modalConfirmBtn.textContent = 'OK'; modalCancelBtn.style.display = 'none'; modalConfirmBtn.onclick = closeModal; modal.onclick = (e) => { if (e.target === modal) closeModal(); }; modal.classList.remove('hidden'); }
    function closeModal() { /* ... (Keep as before) ... */ console.log("[CBVotePage-Modal] Closing modal."); if (!modalElementsExist) return; modal.classList.add('hidden'); targetVotePage = ''; modalConfirmBtn.onclick = null; modalCancelBtn.onclick = null; modal.onclick = null; modalCancelBtn.style.display = ''; }


    // --- Handler for Position Link Click (Added Global Check) ---
    async function handlePositionLinkClick(event) {
        event.preventDefault();

        // ----- ADDED CHECK: Ensure voting is actually enabled globally -----
        if (!isVotingGloballyEnabled) {
            console.warn("[CBVotePage-LinkClick] Click detected but voting is not globally enabled. Ignoring.");
            // Optionally briefly show the disabled message again
            // setPositionLinksState(false, "Voting is currently closed or paused.");
            return; // Do nothing if voting isn't enabled
        }
        // -------------------------------------------------------------------

        const link = event.currentTarget;
        const positionId = link.dataset.positionId;
        const positionDisplayName = link.dataset.positionName || link.textContent.trim();
        const nextPageUrl = link.href;
        console.log(`[CBVotePage-LinkClick] Processing click for ${positionDisplayName}`);

        if (!positionId || !nextPageUrl || nextPageUrl === '#') { console.error("Link missing data."); alert("Link error."); return; }

        console.log("[CBVotePage-LinkClick] Checking user vote status...");
        link.style.opacity = '0.6'; const originalPointerEvents = link.style.pointerEvents; link.style.pointerEvents = 'none';

        try {
            const hasVotedForThisPosition = await checkIfAlreadyVoted(positionId);
            targetVotePage = nextPageUrl;
            if (hasVotedForThisPosition) { openAlreadyVotedModal(positionDisplayName); } else { openNavigationConfirmModal(positionDisplayName); }
        } catch (error) { console.error(`[CBVotePage-LinkClick] Error:`, error); alert(`Could not check status: ${error.message}`); targetVotePage = ''; }
        finally { link.style.opacity = '1'; link.style.pointerEvents = originalPointerEvents || 'auto'; console.log(`[CBVotePage-LinkClick] Finished click processing.`); }
    }

    // --- Attach/Detach Link Listeners (Robust version) ---
    const attachedListeners = new WeakMap(); // Keep track of attached listeners

    function attachPositionLinkListeners() {
        console.log("[CBVotePage-Listeners] Attaching click listeners...");
        let count = 0;
        positionLinks.forEach(link => {
            if (!attachedListeners.has(link)) { // Check if listener already attached
                 link.addEventListener('click', handlePositionLinkClick);
                 attachedListeners.set(link, handlePositionLinkClick); // Store reference
                 count++;
             }
        });
         console.log(`[CBVotePage-Listeners] Attached ${count} new listeners.`);
    }

     function detachPositionLinkListeners() {
         console.log("[CBVotePage-Listeners] Detaching click listeners...");
         let count = 0;
         positionLinks.forEach(link => {
             if (attachedListeners.has(link)) {
                 const handler = attachedListeners.get(link);
                 link.removeEventListener('click', handler);
                 attachedListeners.delete(link); // Remove from tracking
                 count++;
             }
         });
          console.log(`[CBVotePage-Listeners] Detached ${count} listeners.`);
     }


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
            isVotingGloballyEnabled = false; // Reset global state flag
            let attachPageVisibilityListener = false;

            switch (electionStatus) {
                case "ONGOING":
                    console.log("[CBVotePage-Init] Status ONGOING. Enabling voting & visibility listener.");
                    isVotingGloballyEnabled = true; // <-- SET GLOBAL FLAG
                    attachPageVisibilityListener = true;
                    message = "";
                    break;
                case "NOT_STARTED": message = "Voting has not started yet."; break;
                case "PAUSED": message = "Voting is currently paused."; break;
                case "ENDED": message = "Voting has now closed."; break;
                default: message = "Election status unavailable."; break;
            }

            console.log(`[CBVotePage-Init] Calling setPositionLinksState(${isVotingGloballyEnabled}, "${message}")`);
            setPositionLinksState(isVotingGloballyEnabled, message);

            // Attach/Detach click listeners based on votingEnabled flag
            if (isVotingGloballyEnabled) {
                console.log("[CBVotePage-Init] Attaching link listeners.");
                attachPositionLinkListeners();
            } else {
                 console.log("[CBVotePage-Init] Detaching link listeners.");
                 detachPositionLinkListeners();
            }

            // Attach/Detach visibility listener based on attachPageVisibilityListener flag
            if (attachPageVisibilityListener) { attachVisibilityListener(); }
            else { detachVisibilityListener(); }

        } catch (error) {
            console.error("[CBVotePage-Init] FAILED to get initial election status:", error);
            alert(`Error loading page configuration: ${error.message}. Please refresh.`);
            isVotingGloballyEnabled = false; // Ensure flag is false on error
            setPositionLinksState(false, `Error loading election status: ${error.message}. Please refresh.`);
            detachPositionLinkListeners();
            detachVisibilityListener();
        }
        console.log("[CBVotePage-Init] initializeVotePage function finished.");
    }

    // --- Run Initialization ---
    console.log("[CBVotePage] Setting up DOMContentLoaded runner.");
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initializeVotePage); } else { initializeVotePage(); }
    console.log("[CBVotePage] CB-vote-page.js script execution finished setup.");

}); // End DOMContentLoaded