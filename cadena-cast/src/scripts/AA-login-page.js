// Filename: ../../scripts/AA-login-page.js
// Desc: Handles login/registration logic, including admin check.

// --- Firebase Config ---
const firebaseConfig = {
    apiKey: "AIzaSyARAZIOFSKWTYDnb3E3OO8U1jIeMuoj-CA", // Replace with your actual config if different
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
    if (typeof firebase !== 'undefined' && !firebase.apps.length) { // Check if firebase exists first
         firebase.initializeApp(firebaseConfig);
         console.log("[Init] Firebase App initialized.");
    } else if (typeof firebase !== 'undefined') {
         firebase.app(); // Get existing app
         console.log("[Init] Firebase App already initialized.");
    } else {
         throw new Error("Firebase SDK not loaded."); // Throw error if firebase object missing
    }

    // Check if services exist before getting them
    if (typeof firebase.auth === 'function') {
        auth = firebase.auth();
        console.log("[Init] Firebase Auth service obtained.");
    } else {
         console.warn("[Init] Firebase Auth service not available.");
    }

    if (typeof firebase.firestore === 'function') {
         db = firebase.firestore();
         console.log("[Init] Firebase Firestore service obtained.");
         if (!db) throw new Error("Firestore service object is null/undefined after initialization!");
    } else {
         throw new Error("Firestore service not available."); // Throw error if firestore missing
    }


} catch (error) {
    console.error("CRITICAL: Firebase Initialization Failed!", error);
    alert("Error initializing Firebase connection. The application cannot function correctly. Please check the console (F12). Details: " + error.message);
    // Optionally disable the form
    const initForm = document.getElementById("form1");
    if (initForm) {
        initForm.innerHTML = '<p style="color:red; text-align:center;">Application initialization failed. Cannot proceed.</p>';
    }
    // Stop further script execution if Firebase fails critically
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

// --- Location Data (Using original placeholders - Update with your actual data) ---
const locationData = {
    'Region A': { 'Province A1': ['City A1-1', 'City A1-2'], 'Province A2': ['City A2-1', 'City A2-2'] },
    'Region B': { 'Province B1': ['City B1-1', 'City B1-2'], 'Province B2': ['City B2-1', 'City B2-2'] },
    // !!! Add your actual regions, provinces, and cities here !!!
};

// --- Admin Configuration ---
const ADMIN_NATIONAL_ID = "JomafaAdmin123"; // The exact ID the admin uses
// ** IMPORTANT: Adjust this path based on where AA-login-page.html is located **
const ADMIN_DASHBOARD_PATH = './admin-dashboard-pages/BA-admin-dashboard.html'; // Example Path - VERIFY THIS
// ** IMPORTANT: Adjust this path based on where AA-login-page.html is located **
const USER_DASHBOARD_PATH = './user-dashboard-pages/CA-connect-metamask-page.html'; // Example Path - VERIFY THIS


// --- Helper Functions ---
function populateSelect(selectElement, options, defaultOptionText) {
    if (!selectElement) return;
    selectElement.innerHTML = `<option value="">-- ${defaultOptionText} --</option>`; // Add default empty option
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option; // Use the option text as the value
        opt.textContent = option;
        selectElement.appendChild(opt);
    });
}

function handleRegionChange() {
    if (!regionSelect || !provinceSelect || !citySelect) return;
    const selectedRegion = regionSelect.value;
    provinceSelect.disabled = true; // Disable province dropdown initially
    citySelect.disabled = true; // Disable city dropdown initially
    provinceSelect.innerHTML = '<option value="">-- Select Province --</option>'; // Reset province options
    citySelect.innerHTML = '<option value="">-- Select City/Municipality --</option>'; // Reset city options

    if (selectedRegion && locationData[selectedRegion]) {
        const provinces = Object.keys(locationData[selectedRegion]);
        populateSelect(provinceSelect, provinces, 'Select Province');
        provinceSelect.disabled = false; // Enable province dropdown
    }
    // No need to call handleProvinceChange here, it will be called when province changes
}

function handleProvinceChange() {
    if (!regionSelect || !provinceSelect || !citySelect) return;
    const selectedRegion = regionSelect.value;
    const selectedProvince = provinceSelect.value;
    citySelect.disabled = true; // Disable city dropdown initially
    citySelect.innerHTML = '<option value="">-- Select City/Municipality --</option>'; // Reset city options

    if (selectedRegion && selectedProvince && locationData[selectedRegion]?.[selectedProvince]) {
        const cities = locationData[selectedRegion][selectedProvince];
        populateSelect(citySelect, cities, 'Select City/Municipality');
        citySelect.disabled = false; // Enable city dropdown
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
        // Disable all form elements during loading
        form.querySelectorAll('input, select, button').forEach(el => { el.disabled = true; });
        // Ensure continue button is explicitly disabled
        continueButton.disabled = true;
    } else {
        loadingSpinner.style.display = 'none';
         // Re-enable all form elements
        form.querySelectorAll('input, select, button').forEach(el => { el.disabled = false; });
        // Re-apply specific disabled/visibility states based on current form state
        handleRegionChange(); // This will re-disable province/city if region isn't selected
        if (provinceSelect && !provinceSelect.value) citySelect.disabled = true; // Ensure city is disabled if province isn't selected
        if (noMiddleNameCheckbox && middleNameInput) middleNameInput.disabled = noMiddleNameCheckbox.checked;
        if (suffixSelect && otherSuffixInput && backToDropdownBtn) {
            if (suffixSelect.value === "Others") {
                suffixSelect.style.display = "none"; otherSuffixInput.style.display = "block"; backToDropdownBtn.style.display = "inline-block";
            } else {
                suffixSelect.style.display = "block"; otherSuffixInput.style.display = "none"; backToDropdownBtn.style.display = "none";
            }
        }
         // Ensure continue button is explicitly enabled
        continueButton.disabled = false;
    }
}

function getErrorMessage(error) {
    console.error("Error encountered:", error); // Log the full error
    let message = 'An unexpected error occurred. Please try again or check the console.'; // Default message
    if (error && error.message) {
        message = error.message; // Use the error's message if available
        // Customize based on specific known error messages
        if (error.message.includes("User data mismatch")) { message = error.message; }
        else if (error.code) { // Handle Firestore/Auth error codes if needed
             // e.g., if (error.code === 'unavailable') message = 'Network error. Please check connection.';
             message = `Error: ${error.message} (Code: ${error.code})`; // Include code for debugging
        }
    }
    return message;
}

// --- Event Listeners ---
if (suffixSelect) {
    suffixSelect.addEventListener("change", function () {
        if (!otherSuffixInput || !backToDropdownBtn) return;
        if (suffixSelect.value === "Others") {
            suffixSelect.style.display = "none";
            otherSuffixInput.style.display = "block";
            backToDropdownBtn.style.display = "inline-block";
            otherSuffixInput.focus(); // Focus the input field
        } else {
            otherSuffixInput.style.display = "none";
            backToDropdownBtn.style.display = "none";
            suffixSelect.style.display = "block";
        }
    });
}
if (backToDropdownBtn) {
    backToDropdownBtn.addEventListener("click", function () {
        if (!otherSuffixInput || !suffixSelect) return;
        otherSuffixInput.style.display = "none";
        backToDropdownBtn.style.display = "none";
        suffixSelect.style.display = "block";
        suffixSelect.value = "None"; // Reset dropdown value
        otherSuffixInput.value = ""; // Clear the 'other' input
    });
}
if (noMiddleNameCheckbox && middleNameInput) {
    noMiddleNameCheckbox.addEventListener("change", function () {
        middleNameInput.disabled = noMiddleNameCheckbox.checked;
        if (noMiddleNameCheckbox.checked) {
            middleNameInput.value = ''; // Clear value if disabled
        }
    });
}
if (regionSelect) regionSelect.addEventListener('change', handleRegionChange);
if (provinceSelect) provinceSelect.addEventListener('change', handleProvinceChange);

// --- Form Submission Logic ---
if (form) {
    form.addEventListener("submit", async function (e) {
        e.preventDefault(); // Prevent default form submission
        if (!db) { // Double check db is available
             showStatus("Database connection error. Cannot proceed.", true);
             return;
        }
        clearStatus(); // Clear previous messages
        setLoading(true); // Show spinner, disable form

        const currentNationalID = nationalIDInput.value.trim();
        const currentFirstName = firstNameInput.value.trim();
        const currentLastName = lastNameInput.value.trim();
        const currentBirthDate = birthDateInput.value; // Assumes YYYY-MM-DD format

        if (!currentNationalID) {
            showStatus("National ID Card Number is required.");
            setLoading(false); // Re-enable form
            return;
        }

        // ***** START ADMIN CHECK *****
        if (currentNationalID === ADMIN_NATIONAL_ID) {
            console.log(`Admin ID detected (${currentNationalID}). Setting session and redirecting...`);

            try {
                // Set flags for the admin dashboard to check
                sessionStorage.setItem('isAdmin', 'true');
                sessionStorage.setItem('adminId', 'JomafaAdmin'); // Use a consistent admin identifier
                console.log("[DEBUG] Admin session storage set: isAdmin=true, adminId=JomafaAdmin");

                // Verification log - Check if items were set correctly *immediately*
                if (sessionStorage.getItem('isAdmin') === 'true' && sessionStorage.getItem('adminId') === 'JomafaAdmin') {
                    console.log("[DEBUG] Admin session storage verified successfully after setItem.");

                    // Show status message and redirect *after* successful verification
                    showStatus("Admin Login Successful! Redirecting...", false);
                    // Keep loading state during redirect timeout
                    // setLoading(true); // Already true

                    setTimeout(() => {
                        // Ensure the path is correct from the login page's location
                        let adminPath = ADMIN_DASHBOARD_PATH; // Defined at top
                        console.log(`Redirecting to admin path: ${adminPath}`);
                        window.location.href = adminPath; // Perform redirect
                    }, 500); // Short delay to show message

                    // No need to call setLoading(false) as we are navigating away
                    return; // Stop further execution for admin login

                } else {
                     // This indicates a problem setting sessionStorage itself
                     console.error("[DEBUG] Admin session storage verification FAILED immediately after setItem! Check browser permissions/settings.");
                     showStatus("Admin login error: Failed to set session info.", true);
                     setLoading(false); // Re-enable form
                     return; // Stop execution
                }
            } catch (sessionError) {
                // Catch potential errors during sessionStorage.setItem (e.g., storage full, security restrictions)
                console.error("Error setting admin sessionStorage:", sessionError);
                alert("Critical Error: Failed to save admin session information. Cannot proceed to admin dashboard.");
                showStatus("Admin login error: Could not save session.", true);
                setLoading(false); // Re-enable form
                return; // Stop execution
            }
        }
        // ***** END ADMIN CHECK *****

        // --- IF NOT ADMIN, PROCEED WITH REGULAR USER LOGIC ---
        try {
            // Attempt to find the NID in the index collection first
            const nidRef = db.collection('registeredNationalIDs').doc(currentNationalID);
            const nidDoc = await nidRef.get();

            if (nidDoc.exists) {
                // --- NID Found: Attempt Login ---
                console.log("NID found in index. Verifying user data...");
                let storedUserData = null;
                const nidData = nidDoc.data();
                let userUID = nidData?.uid; // Get UID from index if available

                // If UID found in index, fetch user data directly
                if (userUID) {
                    console.log(`Fetching user by UID from index: ${userUID}`);
                    const userDocRef = db.collection('users').doc(userUID);
                    const userDoc = await userDocRef.get();
                    if (userDoc.exists) {
                        storedUserData = userDoc.data();
                        console.log("User data fetched successfully via UID.");
                    } else {
                        console.error(`Data inconsistency: NID index ${currentNationalID} points to non-existent user UID ${userUID}.`);
                        // Fallback: Try querying by NID field just in case
                    }
                }

                // Fallback or if UID wasn't in index: Query users collection by NID field
                if (!storedUserData) {
                    console.warn(`UID not found in NID index for ${currentNationalID} or user doc missing. Querying users collection by NID field as fallback.`);
                    const userQuery = db.collection('users').where('nationalID', '==', currentNationalID).limit(1);
                    const userSnapshot = await userQuery.get();
                    if (!userSnapshot.empty) {
                         storedUserData = userSnapshot.docs[0].data();
                         userUID = userSnapshot.docs[0].id; // Get UID from the query result
                         console.log(`User data found via NID query fallback. UID: ${userUID}`);
                    }
                }

                // Final check if user data was found by either method
                if (!storedUserData) {
                    console.error(`Login failed: NID ${currentNationalID} found in index but no corresponding user data could be retrieved.`);
                    showStatus("Login failed. Registered user data cannot be found. Please contact support.");
                    setLoading(false); return;
                }
                console.log("Stored user data retrieved:", storedUserData);

                // --- Validate details IF user entered them (optional validation) ---
                if (currentFirstName || currentLastName || currentBirthDate) {
                    console.log("Validating entered details against stored record...");
                    const storedFirstName = storedUserData.firstName || '';
                    const storedLastName = storedUserData.lastName || '';
                    const storedBirthDate = storedUserData.birthDate || ''; // Assumes stored as YYYY-MM-DD

                    // Perform case-insensitive comparison for names
                    const firstNameMatch = currentFirstName.toLowerCase() === storedFirstName.toLowerCase();
                    const lastNameMatch = currentLastName.toLowerCase() === storedLastName.toLowerCase();
                    const birthDateMatch = currentBirthDate === storedBirthDate;

                    if (!firstNameMatch || !lastNameMatch || !birthDateMatch) {
                        console.warn(`Login validation failed. Stored: F[${storedFirstName}] L[${storedLastName}] B[${storedBirthDate}] | Entered: F[${currentFirstName}] L[${currentLastName}] B[${currentBirthDate}]`);
                        // Throw specific error for mismatch
                        throw new Error("User data mismatch: The First Name, Last Name, or Birth Date entered does not match the record for this National ID.");
                    }
                    console.log("Entered details match stored record.");
                } else {
                     console.log("Skipping detailed validation (name/birthdate fields were left empty). Proceeding with NID match only.");
                }

                // --- Check Email Verification Status ---
                // IMPORTANT: Ensure 'emailVerified' field exists and is reliably set in your user documents upon successful registration/verification
                if (!storedUserData.emailVerified) { // Check the field from Firestore
                     console.log("User email not marked as verified in Firestore user document.");
                     // Provide a more helpful message
                     alert("Login Failed: Your account registration is not yet complete or verified. Please check your email for verification steps or contact support if you already verified.");
                     showStatus("Login Failed: Account not verified.", true);
                     setLoading(false); // Re-enable form
                     return; // Stop login process
                }

                // --- SUCCESSFUL REGULAR USER LOGIN ---
                console.log("User details validated and email verified. Logging in...");
                showStatus("Login successful! Redirecting...", false);

                // ***** STORE NID IN SESSION STORAGE for User *****
                try {
                    sessionStorage.setItem('loggedInUserNID', currentNationalID);
                    console.log(`[DEBUG] User sessionStorage set: loggedInUserNID = ${currentNationalID}`);
                    // Verification log
                    if (sessionStorage.getItem('loggedInUserNID') === currentNationalID) {
                        console.log("[DEBUG] User Session storage verified successfully after setItem.");
                    } else {
                         console.error("[DEBUG] User Session storage verification FAILED after setItem!");
                    }
                } catch (sessionError) {
                    console.error("Error setting user sessionStorage:", sessionError);
                    alert("Failed to save session information. Login may not persist correctly across pages.");
                    // Decide if you should still redirect or stop
                }
                // ***********************************************

                setLoading(true); // Keep loading during timeout
                setTimeout(() => {
                     let userPath = USER_DASHBOARD_PATH; // Defined at top
                     // Adjust path if needed based on login page location
                     // userPath = './src/pages/' + USER_DASHBOARD_PATH;
                     console.log(`Redirecting to user path: ${userPath}`);
                     window.location.href = userPath;
                }, 1500); // Longer timeout for user to see success message


            } else {
                // --- NID Not Found: Start Registration ---
                console.log("NID not found in index. Starting Registration Step 1.");
                // Gather registration details from the form
                const regFirstName = currentFirstName;
                const regLastName = currentLastName;
                const regBirthDate = currentBirthDate;
                const regRegion = regionSelect?.value;
                const regProvince = provinceSelect?.value;
                const regCity = citySelect?.value;

                // Validate required registration fields
                if (!regFirstName || !regLastName || !regBirthDate || !regRegion || !regProvince || !regCity) {
                    showStatus("To register, please fill in all required personal and location details (First Name, Last Name, Birth Date, Region, Province, City).");
                    setLoading(false); // Re-enable form
                    return; // Stop registration if fields missing
                }

                // Get optional fields
                const suffixValue = suffixSelect ? (suffixSelect.value === "Others" ? otherSuffixInput.value.trim() : suffixSelect.value) : 'None';
                const middleNameValue = noMiddleNameCheckbox?.checked ? "" : (middleNameInput ? middleNameInput.value.trim() : '');

                // Prepare data for pending registration document
                const pendingData = {
                    firstName: regFirstName,
                    suffix: suffixValue || 'None', // Ensure suffix has a value
                    middleName: middleNameValue,
                    lastName: regLastName,
                    birthDate: regBirthDate, // Ensure format is consistent (YYYY-MM-DD)
                    region: regRegion,
                    province: regProvince,
                    city: regCity,
                    nationalID: currentNationalID, // The NID being registered
                    submittedAt: firebase.firestore.FieldValue.serverTimestamp() // Record submission time
                };

                console.log("Storing pending registration data:", pendingData);
                // Store data in 'pendingRegistrations' collection using NID as document ID
                const pendingRegRef = db.collection('pendingRegistrations').doc(currentNationalID);
                await pendingRegRef.set(pendingData);

                console.log("Pending registration data stored successfully. Redirecting to email confirmation page...");
                 showStatus("Registration data submitted. Redirecting to verification...", false);
                 setLoading(true); // Keep loading during redirect timeout
                 // Redirect to verification page, passing NID as a query parameter
                 setTimeout(() => {
                     window.location.href = `AB-verification-page.html?nid=${encodeURIComponent(currentNationalID)}`;
                 }, 1000);

            }

        } catch (error) {
            // Catch errors from Firestore operations or validation
            console.error("Error during form submission logic:", error);
            showStatus(getErrorMessage(error), true); // Show user-friendly error
            setLoading(false); // Ensure loading stops and form is re-enabled on error
        }
        // Note: setLoading(false) is handled within specific logic paths now or in catch block
    });
} else {
    console.error("Form with ID 'form1' not found! Cannot attach submit listener.");
}

// --- Initialization Tasks on Page Load ---
document.addEventListener("DOMContentLoaded", function () {
    let messageShown = false;
    console.log("[Init] DOM Content Loaded for AA-login-page.");

     // Check if Firebase services loaded correctly
     if (!db || !auth) {
         console.error("[Init] Firestore DB or Auth service not available on DOMContentLoaded. Aborting further setup.");
         // Display error to user if critical elements missing
         if(!document.getElementById("critical-error-display")) { // Prevent multiple messages
             const errorDiv = document.createElement('div');
             errorDiv.id = "critical-error-display";
             errorDiv.innerHTML = '<p style="color:red; font-weight:bold; text-align:center; padding: 20px; border: 1px solid red; background: #ffeeee;">Critical Error: Application services failed to load. Please check the console (F12) and refresh.</p>';
             form?.parentNode.insertBefore(errorDiv, form); // Insert before form if possible
         }
         return; // Stop initialization
     }

    // Populate initial regions dropdown
    if (regionSelect) {
        populateSelect(regionSelect, Object.keys(locationData), 'Select Region');
         handleRegionChange(); // Initialize province/city based on potential default/no selection
    } else {
        console.error("[Init] Region select element (#region) not found.");
    }

    // Check for messages passed via URL parameters (e.g., after successful registration)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const messageCode = urlParams.get('message');
        if (messageCode === 'registration_successful') {
            showStatus('Registration successful! You can now log in using your National ID.', false);
            messageShown = true;
            // Clean the URL parameters to prevent message re-showing on refresh
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (messageCode === 'verification_failed') {
             showStatus('Email verification failed or expired. Please try registering again or contact support.', true);
             messageShown = true;
             window.history.replaceState({}, document.title, window.location.pathname);
        }
         // Add handling for other message codes if needed
    } catch(e) { console.error("Error processing URL parameters:", e); }


    // Set initial state for middle name checkbox and input
     if (noMiddleNameCheckbox && middleNameInput) {
         middleNameInput.disabled = noMiddleNameCheckbox.checked;
         if (noMiddleNameCheckbox.checked) middleNameInput.value = ''; // Clear if checked initially
     }
     // Set initial state for suffix dropdown/input
     if (suffixSelect && otherSuffixInput && backToDropdownBtn){
         if (suffixSelect.value === "Others"){
            otherSuffixInput.style.display = "block";
            backToDropdownBtn.style.display = "inline-block";
            suffixSelect.style.display = "none";
        } else {
            otherSuffixInput.style.display = "none";
            backToDropdownBtn.style.display = "none";
            suffixSelect.style.display = "block";
        }
     }

     // Clear status message only if no message was shown from URL params
     if (!messageShown) {
         clearStatus();
     }

    console.log("[Init] AA-login-page initialization complete.");
});