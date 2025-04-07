// Filename: ../../scripts/AA-login-page.js

// --- Firebase Config ---
const firebaseConfig = {
    apiKey: "AIzaSyARAZIOFSKWTYDnb3E3OO8U1jIeMuoj-CA",
    authDomain: "testthon-5b972.firebaseapp.com",
    databaseURL: "https://testthon-5b972-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "testthon-5b972",
    storageBucket: "testthon-5b972.appspot.com",
    messagingSenderId: "412241224515",
    appId: "1:412241224515:web:2fcab1a4a77f9d5c3f05f6",
    measurementId: "G-EX0QHTY41J"
};

// --- Initialize Firebase ---
let db = null; // Declare outside try block
let auth = null; // Declare outside try block

try {
    console.log("[Init] Attempting Firebase initialization...");
    if (!firebase.apps.length) {
         firebase.initializeApp(firebaseConfig);
         console.log("[Init] Firebase App initialized.");
    } else {
         firebase.app();
         console.log("[Init] Firebase App already initialized.");
    }
    auth = firebase.auth();
    console.log("[Init] Firebase Auth service obtained.");
    db = firebase.firestore();
    console.log("[Init] Firebase Firestore service obtained.");
    if (!db) throw new Error("Firestore service object is null/undefined after initialization!");

} catch (error) {
    console.error("CRITICAL: Firebase Initialization Failed!", error);
    alert("Error initializing Firebase connection. The application cannot function correctly. Please check the console (F12).");
    // Optionally disable the form
    const initForm = document.getElementById("form1");
    if (initForm) {
        initForm.innerHTML = '<p style="color:red; text-align:center;">Application initialization failed. Cannot proceed.</p>';
    }
    // Stop further script execution
    throw new Error("Firebase Init Failed");
}


// --- DOM Elements ---
const form = document.getElementById("form1");
const firstNameInput = document.getElementById("input-firstName");
const suffixSelect = document.getElementById("input-suffix");
const otherSuffixInput = document.getElementById("other-suffix");
const backToDropdownBtn = document.getElementById("back-to-dropdown");
const middleNameInput = document.getElementById("input-middleName");
const noMiddleNameCheckbox = document.getElementById("no-middle-name");
const lastNameInput = document.getElementById("input-lastName");
const birthDateInput = document.getElementById("input-birthDate");
const regionSelect = document.getElementById('region');
const provinceSelect = document.getElementById('province');
const citySelect = document.getElementById('city');
const nationalIDInput = document.getElementById("input-nationalIDNumber");
const continueButton = document.getElementById("continue-button");
const statusMessageDiv = document.getElementById("status-message");
const loadingSpinner = document.getElementById("loading-spinner");

// --- Location Data (Update with your actual data) ---
const locationData = {
    'Region A': { 'Province A1': ['City A1-1', 'City A1-2'], 'Province A2': ['City A2-1', 'City A2-2'] },
    'Region B': { 'Province B1': ['City B1-1', 'City B1-2'], 'Province B2': ['City B2-1', 'City B2-2'] },
    // Add your actual regions/provinces/cities here
};

// --- Admin Configuration ---
const ADMIN_NATIONAL_ID = "JomafaAdmin123";
const ADMIN_DASHBOARD_PATH = 'admin-dashboard-pages/BA-admin-dashboard.html';
const USER_DASHBOARD_PATH = 'user-dashboard-pages/CA-connect-metamask-page.html';


// --- Helper Functions ---
function populateSelect(selectElement, options, defaultOptionText) {
    if (!selectElement) return;
    selectElement.innerHTML = `<option value="">-- ${defaultOptionText} --</option>`;
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        selectElement.appendChild(opt);
    });
}

function handleRegionChange() {
    if (!regionSelect || !provinceSelect || !citySelect) return;
    const selectedRegion = regionSelect.value;
    provinceSelect.disabled = true;
    citySelect.disabled = true;
    provinceSelect.innerHTML = '<option value="">-- Select Province --</option>';
    citySelect.innerHTML = '<option value="">-- Select City/Municipality --</option>';
    if (selectedRegion && locationData[selectedRegion]) {
        const provinces = Object.keys(locationData[selectedRegion]);
        populateSelect(provinceSelect, provinces, 'Select Province');
        provinceSelect.disabled = false;
    } else {
         provinceSelect.disabled = true;
         citySelect.disabled = true;
    }
    handleProvinceChange();
}

function handleProvinceChange() {
    if (!regionSelect || !provinceSelect || !citySelect) return;
    const selectedRegion = regionSelect.value;
    const selectedProvince = provinceSelect.value;
    citySelect.disabled = true;
    citySelect.innerHTML = '<option value="">-- Select City/Municipality --</option>';
    if (selectedRegion && selectedProvince && locationData[selectedRegion]?.[selectedProvince]) {
        const cities = locationData[selectedRegion][selectedProvince];
        populateSelect(citySelect, cities, 'Select City/Municipality');
        citySelect.disabled = false;
    } else {
         citySelect.disabled = true;
    }
}

function showStatus(message, isError = true) {
    if (!statusMessageDiv) return;
    statusMessageDiv.textContent = message;
    statusMessageDiv.style.color = isError ? 'red' : 'green';
    statusMessageDiv.style.display = 'block';
}

function clearStatus() {
    if (!statusMessageDiv) return;
    statusMessageDiv.textContent = '';
    statusMessageDiv.style.display = 'none';
}

function setLoading(isLoading) {
    if (!loadingSpinner || !form || !continueButton) {
        console.error("Required elements for setLoading not found."); return;
    }
    if (isLoading) {
        loadingSpinner.style.display = 'block';
        form.querySelectorAll('input, select, button').forEach(el => { el.disabled = true; });
        continueButton.disabled = true;
    } else {
        loadingSpinner.style.display = 'none';
        form.querySelectorAll('input, select, button').forEach(el => { el.disabled = false; });
        // Re-apply specific disabled/visibility states
        handleRegionChange();
        if (noMiddleNameCheckbox && middleNameInput) middleNameInput.disabled = noMiddleNameCheckbox.checked;
        if (suffixSelect && otherSuffixInput && backToDropdownBtn) {
            if (suffixSelect.value === "Others") {
                suffixSelect.style.display = "none"; otherSuffixInput.style.display = "block"; backToDropdownBtn.style.display = "inline-block";
                otherSuffixInput.disabled = false; backToDropdownBtn.disabled = false;
            } else {
                suffixSelect.style.display = "block"; otherSuffixInput.style.display = "none"; backToDropdownBtn.style.display = "none";
            }
            suffixSelect.disabled = false;
        }
        continueButton.disabled = false;
    }
}

function getErrorMessage(error) {
    console.error("Error:", error);
    let message = error.message || 'An unexpected error occurred. Please try again.';
    if (error.code) { /* Handle specific codes if needed */ }
    else if (error.message.includes("User data mismatch")) { message = error.message; }
    // Add other custom error message checks
    return message;
}

// --- Event Listeners ---
if (suffixSelect) {
    suffixSelect.addEventListener("change", function () {
        if (!otherSuffixInput || !backToDropdownBtn) return;
        if (suffixSelect.value === "Others") {
            suffixSelect.style.display = "none"; otherSuffixInput.style.display = "block"; backToDropdownBtn.style.display = "inline-block"; otherSuffixInput.focus();
        } else {
            otherSuffixInput.style.display = "none"; backToDropdownBtn.style.display = "none";
        }
    });
}
if (backToDropdownBtn) {
    backToDropdownBtn.addEventListener("click", function () {
        if (!otherSuffixInput || !suffixSelect) return;
        otherSuffixInput.style.display = "none"; backToDropdownBtn.style.display = "none";
        suffixSelect.style.display = "block"; suffixSelect.value = "None";
    });
}
if (noMiddleNameCheckbox && middleNameInput) {
    noMiddleNameCheckbox.addEventListener("change", function () {
        middleNameInput.disabled = noMiddleNameCheckbox.checked;
        if (noMiddleNameCheckbox.checked) middleNameInput.value = '';
    });
}
if (regionSelect) regionSelect.addEventListener('change', handleRegionChange);
if (provinceSelect) provinceSelect.addEventListener('change', handleProvinceChange);

// --- Form Submission Logic ---
if (form) {
    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        if (!db) { // Double check db is available
             showStatus("Database connection error. Cannot proceed.", true);
             return;
        }
        clearStatus();
        setLoading(true);

        const currentNationalID = nationalIDInput.value.trim();
        const currentFirstName = firstNameInput.value.trim();
        const currentLastName = lastNameInput.value.trim();
        const currentBirthDate = birthDateInput.value;

        if (!currentNationalID) {
            showStatus("National ID Card Number is required.");
            setLoading(false);
            return;
        }

        // ***** START ADMIN CHECK *****
        if (currentNationalID === ADMIN_NATIONAL_ID) {
            console.log(`Admin ID detected (${currentNationalID}). Redirecting to admin dashboard.`);
            showStatus("Redirecting to Admin Dashboard...", false);
            setTimeout(() => { window.location.href = ADMIN_DASHBOARD_PATH; }, 500);
            return; // Stop execution for admin
        }
        // ***** END ADMIN CHECK *****

        // --- IF NOT ADMIN, PROCEED WITH REGULAR USER LOGIC ---
        try {
            const nidRef = db.collection('registeredNationalIDs').doc(currentNationalID);
            const nidDoc = await nidRef.get();

            if (nidDoc.exists) {
                // --- Regular User Login Logic ---
                console.log("NID found. Verifying user data...");
                let storedUserData = null;
                const nidData = nidDoc.data();

                if (nidData && nidData.uid) {
                    console.log(`Fetching user by UID: ${nidData.uid}`);
                    const userDoc = await db.collection('users').doc(nidData.uid).get();
                    if (userDoc.exists) storedUserData = userDoc.data();
                    else console.error(`Data inconsistency: NID index points to non-existent user UID ${nidData.uid}.`);
                }
                if (!storedUserData && (!nidData || !nidData.uid)) {
                    console.warn(`UID not found/user missing for NID index ${currentNationalID}. Querying users by NID field.`);
                     const userSnapshot = await db.collection('users').where('nationalID', '==', currentNationalID).limit(1).get();
                     if (!userSnapshot.empty) storedUserData = userSnapshot.docs[0].data();
                }

                if (!storedUserData) {
                    console.error(`Data inconsistency: NID ${currentNationalID} found in index but no matching user data found.`);
                    showStatus("Login failed. Registered user data not found. Please contact support.");
                    setLoading(false); return;
                }
                console.log("Stored user data found:", storedUserData);

                // Validate details if entered
                if (currentFirstName || currentLastName || currentBirthDate) {
                    console.log("Validating entered details against stored record...");
                    const storedFirstName = storedUserData.firstName || '';
                    const storedLastName = storedUserData.lastName || '';
                    const storedBirthDate = storedUserData.birthDate || '';
                    const firstNameMatch = currentFirstName.toLowerCase() === storedFirstName.toLowerCase();
                    const lastNameMatch = currentLastName.toLowerCase() === storedLastName.toLowerCase();
                    const birthDateMatch = currentBirthDate === storedBirthDate;

                    if (!firstNameMatch || !lastNameMatch || !birthDateMatch) {
                        console.warn(`Login validation failed. Stored: F[${storedFirstName}] L[${storedLastName}] B[${storedBirthDate}] | Entered: F[${currentFirstName}] L[${currentLastName}] B[${currentBirthDate}]`);
                        throw new Error("User data mismatch: The First Name, Last Name, or Birth Date entered does not match the record for this National ID.");
                    }
                    console.log("Entered details match stored record.");
                } else {
                     console.log("Skipping detailed validation (name/birthdate fields empty).");
                }

                // Check verification status
                if (!storedUserData.emailVerified) {
                     console.log("User email not marked as verified in Firestore.");
                     alert("Login Failed: Account requires verification. Please complete the registration process or contact support.");
                     showStatus("Login Failed: Account not verified.", true);
                     setLoading(false);
                } else {
                    // --- SUCCESSFUL REGULAR USER LOGIN ---
                    console.log("User verified. Saving NID to sessionStorage and redirecting...");
                    showStatus("Login successful! Redirecting...", false);

                    // ***** !!! STORE NID IN SESSION STORAGE !!! *****
                    try {
                        sessionStorage.setItem('loggedInUserNID', currentNationalID);
                        console.log(`[DEBUG] sessionStorage set: loggedInUserNID = ${currentNationalID}`);
                        // Verification log
                        if (sessionStorage.getItem('loggedInUserNID') === currentNationalID) {
                            console.log("[DEBUG] Session storage verified successfully after setItem.");
                        } else {
                             console.error("[DEBUG] Session storage verification FAILED after setItem!");
                        }
                    } catch (sessionError) {
                        console.error("Error setting sessionStorage:", sessionError);
                        alert("Failed to save session information. Login may not persist correctly.");
                        // Decide if you should still redirect or stop
                    }
                    // ***********************************************

                    setTimeout(() => {
                        window.location.href = USER_DASHBOARD_PATH;
                    }, 1500);
                    // Keep loading true during redirect timeout
                    // setLoading(true); // Already true from start
                }

            } else {
                // --- Regular User Registration Start ---
                console.log("NID not found. Starting Registration Step 1.");
                const regFirstName = currentFirstName; const regLastName = currentLastName; const regBirthDate = currentBirthDate;
                const regRegion = regionSelect?.value; const regProvince = provinceSelect?.value; const regCity = citySelect?.value;

                if (!regFirstName || !regLastName || !regBirthDate || !regRegion || !regProvince || !regCity) {
                    showStatus("To register, please fill in all required personal and location details.");
                    setLoading(false); return;
                }

                const suffixValue = suffixSelect ? (suffixSelect.value === "Others" ? otherSuffixInput.value.trim() : suffixSelect.value) : 'None';
                const middleNameValue = noMiddleNameCheckbox?.checked ? "" : (middleNameInput ? middleNameInput.value.trim() : '');

                const pendingData = { firstName: regFirstName, suffix: suffixValue, middleName: middleNameValue, lastName: regLastName, birthDate: regBirthDate, region: regRegion, province: regProvince, city: regCity, nationalID: currentNationalID, submittedAt: firebase.firestore.FieldValue.serverTimestamp() };

                console.log("Storing pending registration data:", pendingData);
                const pendingRegRef = db.collection('pendingRegistrations').doc(currentNationalID);
                await pendingRegRef.set(pendingData);

                console.log("Pending data stored. Redirecting to email confirmation page...");
                window.location.href = `AB-verification-page.html?nid=${encodeURIComponent(currentNationalID)}`;
                 // setLoading(true); // Already true
            }

        } catch (error) {
            console.error("Error during registration/login check:", error);
            showStatus(getErrorMessage(error), true);
            setLoading(false); // Ensure loading stops on error
        }
    });
} else {
    console.error("Form with ID 'form1' not found!");
}

// --- Initialization Tasks on Page Load ---
document.addEventListener("DOMContentLoaded", function () {
    let messageShown = false;
    console.log("[Init] DOM Content Loaded for AA-login-page.");

    // Populate initial regions
    if (regionSelect) {
        populateSelect(regionSelect, Object.keys(locationData), 'Select Region');
    } else { console.error("[Init] Region select element not found"); }

    // Set initial disabled states
    if (provinceSelect) provinceSelect.disabled = true;
    if (citySelect) citySelect.disabled = true;

    // Check for messages from redirect
    const urlParams = new URLSearchParams(window.location.search);
    const messageCode = urlParams.get('message');
    if (messageCode === 'registration_successful') {
        showStatus('Registration successful! You can now log in using your National ID.', false);
        messageShown = true;
        window.history.replaceState({}, document.title, window.location.pathname);
    }
     // Add handling for other message codes if needed

    // Initial state for middle name
     if (noMiddleNameCheckbox && middleNameInput) {
         middleNameInput.disabled = noMiddleNameCheckbox.checked;
     }
     // Initial state for suffix
     if (suffixSelect && otherSuffixInput && backToDropdownBtn){
         if (suffixSelect.value === "Others"){ /* Show 'Others' input */ otherSuffixInput.style.display = "block"; backToDropdownBtn.style.display = "inline-block"; suffixSelect.style.display = "none"; }
         else { /* Hide 'Others' input */ otherSuffixInput.style.display = "none"; backToDropdownBtn.style.display = "none"; suffixSelect.style.display = "block"; }
     }

     // Clear status only if no message was shown
     if (!messageShown) { clearStatus(); }

     // Initial location dropdown setup
     if(regionSelect && !regionSelect.value) { handleRegionChange(); }
});