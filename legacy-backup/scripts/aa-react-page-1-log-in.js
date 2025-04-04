document.addEventListener("DOMContentLoaded", function () {
    const middleNameInput = document.querySelector(".middle-name-container input[type='text']");
    const noMiddleNameCheckbox = document.getElementById("no-middle-name");

    if (noMiddleNameCheckbox && middleNameInput) {
        noMiddleNameCheckbox.addEventListener("change", function () {
            middleNameInput.disabled = noMiddleNameCheckbox.checked;
        });
    }
});

function openPopup() {
    let popup = document.getElementById("popup");
    popup.style.display = "block";
    setTimeout(() => popup.classList.add("show"), 10); 
}

function closePopup() {
    let popup = document.getElementById("popup");
    popup.classList.remove("show");
    setTimeout(() => popup.style.display = "none", 500); 
}

window.onload = function() {
    openPopup();
};

