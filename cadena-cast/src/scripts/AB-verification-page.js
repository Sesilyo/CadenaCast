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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- DOM Elements ---
const form = document.getElementById('form1');
const emailInput = document.getElementById('input-email');
const sendButton = document.getElementById('send-verification-button');
const statusDiv = document.getElementById('verification-status');
const spinner = document.getElementById('loading-spinner');

let submittedNID = null; // Variable to store NID from URL

// --- Helper Functions ---
function showStatus(message, isError = true) {
    if (!statusDiv) return;
    statusDiv.textContent = message;
    statusDiv.style.color = isError ? 'red' : 'green';
    statusDiv.style.display = 'block';
}

function clearStatus() {
    if (!statusDiv) return;
    statusDiv.style.display = 'none';
    statusDiv.textContent = '';
}

function setLoading(isLoading) {
    // Check if elements exist before trying to modify them
    if (!spinner || !sendButton || !emailInput) {
        console.error("Required elements for setLoading not found.");
        return;
    }
    if (isLoading) {
        spinner.style.display = 'block';
        sendButton.disabled = true;
        emailInput.disabled = true;
    } else {
        spinner.style.display = 'none';
        sendButton.disabled = false;
        emailInput.disabled = false;
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function generateTemporaryPassword() {
    // Still needed for user creation
    return 'TempP@ss_' + Math.random().toString(36).substring(2, 10) + Date.now();
}

function getErrorMessage(error) {
    console.error("Firebase Error:", error);
    let message = error.message || 'An unexpected error occurred. Please try again.';

    if (error.code) {
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'This email address is already registered. Please use a different email or try logging in.';
                break;
            case 'auth/invalid-email':
                message = 'The email address format is invalid.';
                break;
            case 'firestore/permission-denied':
                message = 'Database permission error. Could not access registration data. Check rules or contact support.';
                break;
            case 'auth/network-request-failed':
                 message = 'Network error. Please check your internet connection.';
                 break;
        }
    }
    if (error.message.includes("National ID number has already been registered")) {
        message = error.message;
    } else if (error.message.includes("pending registration data not found")) {
        message = error.message;
    } else if (error.message.includes("Registration data mismatch")) {
        message = error.message;
    } else if (error.message.includes("Could not verify National ID uniqueness")) {
        message = "Error checking NID uniqueness. Please try again.";
    }

    return message;
}

// Function to check NID uniqueness in the final index
async function checkFinalNationalIDUniqueness(nationalIDToCheck) {
    if (!nationalIDToCheck) return false;
    const trimmedNID = nationalIDToCheck.trim();
    console.log(`Checking final uniqueness for NID: ${trimmedNID} in 'registeredNationalIDs'`);
    try {
        const docRef = db.collection('registeredNationalIDs').doc(trimmedNID);
        const docSnap = await docRef.get();
        console.log(`NID ${trimmedNID} exists in final index: ${docSnap.exists}`);
        return docSnap.exists;
    } catch (error) {
        console.error(`Error checking final uniqueness for NID ${trimmedNID}:`, error);
        throw new Error("Could not verify National ID uniqueness due to a database error.");
    }
}


// --- Main Logic ---

// Get NID from URL on page load
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    submittedNID = urlParams.get('nid');

    if (!submittedNID) {
        showStatus('Error: Registration identifier (NID) missing from URL. Please start the registration process again.', true);
        if(sendButton) sendButton.disabled = true;
        if(emailInput) emailInput.disabled = true;
        if(form) form.style.opacity = '0.5';
        return;
    }
    console.log("Received NID for verification:", submittedNID);

    if (form) {
        form.addEventListener('submit', handleFinalRegistrationStep);
        clearStatus(); // Clear status on load
    } else {
        console.error("Verification form (#form1) not found!");
         }
});


// --- Form Submission Handler (MODIFIED FOR PROTOTYPE - NO EMAIL VERIFICATION) ---
async function handleFinalRegistrationStep(e) {
    e.preventDefault();
    clearStatus();
    const email = emailInput.value.trim();

    if (!validateEmail(email)) {
        showStatus('Please enter a valid email address format.', true);
        return;
    }
    if (!submittedNID) {
        showStatus('Cannot proceed without a registration identifier (NID). Please restart registration.', true);
        return;
    }

    setLoading(true);
    let user = null; // For potential cleanup

    try {
        // 1. Retrieve pending data
        console.log(`Retrieving pending registration for NID: ${submittedNID}`);
        const pendingDocRef = db.collection('pendingRegistrations').doc(submittedNID);
        const pendingDoc = await pendingDocRef.get();

        if (!pendingDoc.exists) {
            throw new Error('Your registration session data was not found. Please start the registration again.');
        }
        const pendingUserData = pendingDoc.data();
        console.log("Retrieved pending data:", pendingUserData);

        const nationalIDFromData = pendingUserData.nationalID?.trim();
        if (!nationalIDFromData || nationalIDFromData !== submittedNID) {
            throw new Error("Registration data mismatch. Please start again.");
        }

        // 2. Check FINAL National ID Uniqueness
        const isNIDAlreadyRegistered = await checkFinalNationalIDUniqueness(nationalIDFromData);
        if (isNIDAlreadyRegistered) {
            try { await pendingDocRef.delete(); } catch (delErr) {} // Attempt cleanup
            throw new Error(`This National ID number (${nationalIDFromData}) has already been registered.`);
        }

        // 3. Check if email is already in use in Firebase Auth
        console.log(`Checking if email ${email} is in use...`);
        const methods = await auth.fetchSignInMethodsForEmail(email);
        if (methods.length > 0) {
            throw new Error(`This email address (${email}) is already registered.`);
        }

        // 4. Create Firebase Auth User
        const tempPassword = generateTemporaryPassword();
        console.log(`Creating Auth user for ${email}...`);
        const userCredential = await auth.createUserWithEmailAndPassword(email, tempPassword);
        user = userCredential.user;
        console.log(`Auth user created successfully: UID ${user.uid}`);

        // 5. Store FINAL user data in 'users' collection
        console.log(`Storing final user data in 'users/${user.uid}'...`);
        const finalUserData = {
            ...pendingUserData,
            email: user.email,
            uid: user.uid,
            emailVerified: true,
            // *************************************************************
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            nationalID: nationalIDFromData
        };
        delete finalUserData.submittedAt; // Remove temporary timestamp
        await db.collection('users').doc(user.uid).set(finalUserData);
        console.log("Final user data stored successfully.");

        // 6. Add National ID to the public 'registeredNationalIDs' index
        console.log(`Adding NID to public index: registeredNationalIDs/${nationalIDFromData}`);
        try {
            await db.collection('registeredNationalIDs').doc(nationalIDFromData).set({
                registeredAt: firebase.firestore.FieldValue.serverTimestamp(),
                uid: user.uid
            });
            console.log("NID added successfully to public index.");
        } catch (indexError) {
             console.error("CRITICAL WARNING: Failed to add NID to public index:", indexError);
             // Allow continuation but log the error
        }

        // 7.
        console.log("Skipping email verification step for prototype.");

        // 8. Delete the pending registration document
        console.log(`Deleting pending registration document: pendingRegistrations/${submittedNID}`);
        await pendingDocRef.delete();
        console.log("Pending registration data deleted.");

        // 9.
        console.log("Skipping sign out for prototype flow.");
        // ***************************************************

        // 10. Show success message and redirect back to LOGIN page
        showStatus(`Success! Registration complete for ${email}. You can now log in using your National ID. Redirecting...`, false); // Changed message
        setTimeout(() => {
            // Redirect to AA-login-page with a success message parameter
            window.location.href = 'AA-login-page.html?message=registration_successful';
        }, 4000); // 4 seconds before redirect

    } catch (error) {
        console.error('Registration process failed:', error);
        showStatus(getErrorMessage(error), true);

        // Cleanup attempt for partially created user
        if (user && user.uid && !['auth/email-already-in-use'].includes(error.code) && !error.message.includes("National ID number has already been registered")) {
            console.warn("Attempting cleanup: Deleting partially created auth user", user.uid);
            try {
                await user.delete();
                console.log("Auth user cleanup successful.");
            } catch (deleteError) {
                console.error("Failed to cleanup partially created auth user:", deleteError);
            }
        }
        setLoading(false); // Re-enable form after error
    }
}