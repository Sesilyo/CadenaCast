// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.syncUserVerificationStatus = functions.auth.user().onUpdate(
    async (change) => {
        // Use 4-space indent from here down
        const userAfter = change.after;
        const userBefore = change.before;

        // Check if emailVerified status changed from false to true
        if (!userBefore.emailVerified && userAfter.emailVerified) {
            functions.logger.log(
                `Email verified for user: ${userAfter.uid}, email: ` +
                `${userAfter.email}. Updating Firestore.`, // Line broken
            ); // Trailing comma added

            try {
                const userDocRef = db.collection("users").doc(userAfter.uid);
                // No spaces inside braces, trailing comma added
                await userDocRef.update({emailVerified: true});

                functions.logger.log(
                    `Successfully updated emailVerified=true for user ` +
                    `${userAfter.uid} in Firestore.`, // Line broken
                ); // Trailing comma added
            } catch (error) {
                functions.logger.error(
                    `Error updating emailVerified for user ${userAfter.uid} ` +
                    `in Firestore:`, // Line broken
                    error, // Trailing comma added
                ); // Trailing comma added
            }
        } else {
            // Log other auth updates
            if (userBefore.emailVerified === userAfter.emailVerified) {
                // Corrected indentation and line breaks
                functions.logger.log(
                    `Auth update for user ${userAfter.uid}, ` +
                    `but emailVerified status (${userAfter.emailVerified}) ` +
                    `did not change.`,
                ); // Trailing comma added
            } else {
                // Corrected indentation and line breaks
                functions.logger.log(
                    `Auth update for user ${userAfter.uid}. EmailVerified ` +
                    `changed from ${userBefore.emailVerified} to ` +
                    `${userAfter.emailVerified}.`,
                ); // Trailing comma added
            }
        }
        return null;
    }, // Trailing comma added
); // Ensure a newline character exists after this line