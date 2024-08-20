const OPEN_API_KEY = "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";
const PROMPTS_URLS = [
    "https://jobkaseg.github.io/host_api/prompts.json", 
    "https://jobkaseg.github.io/host_api/prompts1.json", 
    "https://jobkaseg.github.io/host_api/prompts2.json", 
    "https://jobkaseg.github.io/host_api/prompts3.json", 
    "https://jobkaseg.github.io/host_api/prompts4.json", 
    "https://jobkaseg.github.io/host_api/prompts5.json", 
    "https://jobkaseg.github.io/host_api/prompts6.json", 
    "https://jobkaseg.github.io/host_api/prompts7.json", 
    "https://jobkaseg.github.io/host_api/prompts8.json", 
    "https://jobkaseg.github.io/host_api/prompts9.json", 
    "https://jobkaseg.github.io/host_api/prompts10.json"
];
const ICONS_URL = "https://jobkaseg.github.io/host_api/images.json"; // Replace with the correct URL of your JSON file

document.addEventListener('click', function(e) {
    let selectedText = window.getSelection().toString().trim();
    
    if (!e.target.closest('#language-popup') && !e.target.classList.contains('translation-icon')) {
        document.querySelectorAll('.translation-icon-container').forEach(container => container.remove());
    }

    if (selectedText.length > 0 && !e.target.closest('#language-popup') && !e.target.classList.contains('translation-icon')) {
        let container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '800px'; 
        container.style.height = 'auto';
        container.style.zIndex = '2147483647';
        container.classList.add('translation-icon-container');

        let icon = document.createElement('img');
        icon.style.position = 'absolute';
        icon.style.top = e.clientY + 'px';
        icon.style.left = e.clientX + 'px';
        icon.style.cursor = 'pointer';

        // Fetch the image from the JSON file
        fetch(ICONS_URL)
            .then(response => response.json())
            .then(data => {
                icon.src = 'data:image/png;base64,' + data.icon;
            })
            .catch(error => {
                console.error('Error fetching icon:', error);
            });

        container.appendChild(icon);
        document.body.appendChild(container);

        icon.onclick = function(event) {
            event.stopPropagation(); 
            if (!document.getElementById('language-popup')) {
                createPopup(e.clientX, e.clientY, selectedText, container);
            }
        };
    }
});

function createPopup(x, y, selectedText, container) {
    let popup = document.createElement('div');
    popup.id = 'language-popup';
    popup.style.position = 'absolute';
    popup.style.maxWidth = '600px';
    popup.style.backgroundColor = 'white';
    popup.style.border = '1px solid black';
    popup.style.zIndex = '2147483647';
    popup.style.padding = '10px';

    const popupWidth = 600; 
    const popupHeight = 150; 
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (x + popupWidth > windowWidth) {
        x = windowWidth - popupWidth - 100;
    }

    if (y + popupHeight > windowHeight) {
        y = windowHeight - popupHeight - 100;
    }

    popup.style.top = y + 'px';
    popup.style.left = x + 'px';

    // Create language selection menus
    PROMPTS_URLS.forEach((url, index) => {
        let select = document.createElement('select');
        select.id = `language-select-${index}`;
        select.style.padding = '5px';
        select.style.borderRadius = '5px';
        select.style.border = '1px solid #ccc';
        select.style.maxHeight = '150px'; 
        select.style.overflowY = 'auto'; 

        // Fetch prompts and populate the select menu
        fetch(url)
            .then(response => response.json())
            .then(prompts => {
                prompts.forEach((prompt, i) => {
                    let opt = document.createElement('option');
                    opt.value = i;
                    opt.textContent = `${prompt.language} - Prompt ${i + 1}`;
                    select.appendChild(opt);
                });

                select.addEventListener('change', (e) => {
                    const selectedPrompt = prompts[e.target.value];
                    getCorrection(selectedPrompt.language, selectedPrompt.prompt);
                });

                popup.appendChild(select);

                // Default prompt
                const defaultPrompt = prompts[0];
                select.value = 0;
                getCorrection(defaultPrompt.language, defaultPrompt.prompt);
            })
            .catch(error => {
                console.error(`Error fetching prompts from ${url}:`, error);
            });
    });

    let loading = document.createElement('div');
    loading.id = 'loading';
    loading.textContent = 'Loading...';
    popup.appendChild(loading);

    let correction = document.createElement('p');
    popup.appendChild(correction);

    function getCorrection(language, prompt) {
        loading.style.display = 'block';
        fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPEN_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: prompt.replace("{selectedText}", selectedText)
                }],
                max_tokens: 4000
            })
        })
        .then(response => response.json())
        .then(data => {
            loading.style.display = 'none';
            if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
                correction.textContent = data.choices[0].message.content.trim();
            } else {
                console.error('Sorry, I can\'t get the correction.');
            }
        })
        .catch(error => {
            loading.style.display = 'none';
            console.error('Error:', error);
        });
    }

    container.appendChild(popup);
}
