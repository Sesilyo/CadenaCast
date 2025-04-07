
document.addEventListener('DOMContentLoaded', () => {
    const connectForm = document.getElementById('form1');
    const connectWalletBtn = connectForm ? connectForm.querySelector('button') : null;

    if (typeof isWalletConnected !== 'function') {
        console.error("Shared dashboard script or isWalletConnected function not loaded before CA-connect-metamask.js!");
        alert("Page Initialization Error!");
        if(connectWalletBtn) connectWalletBtn.disabled = true;
        return;
    }

    function updateButtonState() {
        if (connectWalletBtn) {
            if (isWalletConnected()) {
                connectWalletBtn.textContent = 'Wallet Connected';
                connectWalletBtn.disabled = true;
            } else {
                connectWalletBtn.textContent = 'Connect Wallet';
                connectWalletBtn.disabled = false;
            }
        } else {
            console.error("Connect Wallet button not found in CA-connect-metamask.js.");
        }
    }

    updateButtonState();

    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', function() {
            console.log('Simulating wallet connection...');
            sessionStorage.setItem('walletConnected', 'true');

            updateButtonState();

            alert('Wallet Connected! You can now access Vote and Results.');
        });
    }
});