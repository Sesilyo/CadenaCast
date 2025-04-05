document.addEventListener("DOMContentLoaded", function () {
    const middleNameInput = document.querySelector(".middle-name-container input[type='text']");
    const noMiddleNameCheckbox = document.getElementById("no-middle-name");

    if (noMiddleNameCheckbox && middleNameInput) {
        noMiddleNameCheckbox.addEventListener("change", function () {
            middleNameInput.disabled = noMiddleNameCheckbox.checked;
        });
    }
});



document.addEventListener("DOMContentLoaded", function () {
    const suffixSelect = document.getElementById("input-suffix");
    const otherSuffixInput = document.getElementById("other-suffix");
    const backToDropdownBtn = document.getElementById("back-to-dropdown");

    suffixSelect.addEventListener("change", function () {
        if (suffixSelect.value === "Others") {
            suffixSelect.style.display = "none"; 
            otherSuffixInput.style.display = "block"; 
            backToDropdownBtn.style.display = "inline-block"; 
            otherSuffixInput.focus();
        }
    });

    backToDropdownBtn.addEventListener("click", function () {
        otherSuffixInput.style.display = "none"; 
        backToDropdownBtn.style.display = "none";
        suffixSelect.style.display = "block";
        suffixSelect.value = "None"; // Reset dropdown to default
    });
});



function closePopup() {
    let popup = document.getElementById("popup");
    popup.classList.remove("show");
    setTimeout(() => popup.style.display = "none", 500); 
}

window.onload = function() {
    openPopup();
};

