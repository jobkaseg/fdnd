// Listen for mouseup event to detect text selection
document.addEventListener('mouseup', function () {
    const selectedText = window.getSelection().toString().trim();

    // Update 'search-input' if it exists
    if (selectedText) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            const separator = `\n---------------------------------------------\n`; // Line separator
            searchInput.value += searchInput.value ? `${separator}${selectedText}` : selectedText;
        }
    }

    // If text is selected, handle prompter behavior
    if (selectedText !== "") {
        if (document.getElementsByClassName("prompt-popup").length > 0) {
            // If the prompter is already open, update the textarea
            const textArea = document.getElementById("prompt-area");
            textArea.value = selectedText;
            textArea.focus();
			getCorrection("English", selectedText); // Automatically fetch correction
        } else {
            // Open the prompter
            showVerify();
        }
    }
});
