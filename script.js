const themeToggle = document.querySelector(".theme-toggle");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const promptForm = document.querySelector(".prompt-form");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");
//HUGGING FACE API KEY
const API_KEY = "hf_TfNMIBZoahlGPTcRGPiDMMUMWopBcBedRqL";

const examplePrompts = [
    "A magic forest with glowing plants and fairy homes among giant mushrooms",
    "An old steampunk airship floating through golden clouds at sunset",
    "A future Mars colony with glass domes and gardens against red mountains",
    "A dragon sleeping on gold coins in a crystal cave",
    "An underwater kingdom with merpeople and glowing coral buildings",
    "A floating island with waterfalls pouring into clouds below",
    "A witch's cottage in fall with magic herbs in the garden",
    "A robot painting in a sunny studio with art supplies around it",
    "A magical library with floating glowing books and spiral staircases",
    "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
    "A cosmic beach with glowing sand and an aurora in the night sky",
    "A medieval marketplace with colorful tents and street performers",
    "A cyberpunk city with neon signs and flying cars at night",
    "A peaceful bamboo forest with a hidden ancient temple",
    "A giant turtle carrying a village on its back in the ocean",
];
//set theme based on saved preference or system default
(() => {
    const saveTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme:dark)").matches;
    const isDarkTheme = saveTheme === "dark" || (!saveTheme && systemPrefersDark);
    document.body.classList.toggle("dark-theme", isDarkTheme);
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
})();
//switch between light and dark theme
const toggleTheme = () => {
    const isDarkTheme = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
}

//calculate with and height based on chosen ratio
const getImageDimensions = (aspectRatio, baseSize = 512) => {
    const [width, height] = aspectRatio.split("/").map(Number);
    const scaleFactor = baseSize / Math.sqrt(width * height);

    let calculateWidth = Math.round(width * scaleFactor);
    let calculateHeight = Math.round(height * scaleFactor);

    //ensure dimension are multiples of 16(AI model requrements)
    calculateWidth = Math.floor(calculateWidth / 16) * 16;
    calculateHeight = Math.floor(calculateHeight / 16) * 16;
    return { width: calculateWidth, height: calculateHeight };
}
//replace loading spinner with the actual imge
const updateImageCard = (imgIndex, imgUrl) => {
    const imgCard = document.getElementById(`img-card-${imgIndex}`);
    if (!imgCard) return;

    imgCard.classList.remove("loading");
    imgCard.innerHTML = `  <img src="${imgUrl}" alt="" class="result-img">
                        <div class="img-overlay">
                            <a href="${imgUrl}" class="img-download-btn download = "${Date.now()}.png">
                                <i class="fa-solid fa-download"></i>
                            </a>
                        </div>`;
}
//send requests to hugging face api to create images
const generateImages = async (selectedModel, imgeCount, aspectRatio, promptText) => {
    const MODEL_URL = `https:api-inference.huggingface.co/models/${selectedModel}`;
    const { width, height } = getImageDimensions(aspectRatio);
    //create an array of image generation promises
    const imgePromises = Array.from({ length: imgeCount }, async (_, i) => {
        try {
            const response = await fetch(MODEL_URL, {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                    "x-use-cache": "false",
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: promptText,
                    parameters: { width, height },

                }),
            });
            if (!response.ok) throw Error((await response.json())?.error);

            //convert response to an image url and update the img card
            const result = await response.blob();
            updateImageCard = (i, URL.createObjectURL(result));
        }
        catch (error) {
            console.log(error);
        }
    })
    await Promise.allSettled(imgePromises);
}

//create placeholder cards with loading spinners
const createImageCards = (selectedModel, imgeCount, aspectRatio, promptText) => {
    gridGallery.innerHTML = "";
    for (let i = 0; i < imgeCount; i++) {
        gridGallery.innerHTML += `<div class="img-card loading id="img-card-${i}" style = "aspect-ratio:${aspectRatio}">
                        <div class="status-container">
                            <div class="spinner"></div>
                            <i class="fa-solid fa-triangle-exclamation"></i>
                               <p class="status-text">Generating...</p>
                        </div>
                        <img src="test.png" alt="" class="result-img">
                       
                    </div>`;
    }
    generateImages(selectedModel, imgeCount, aspectRatio, promptText);

}
//handle form submission
const handleFormSubmit = (e) => {
    e.preventDefault();
    //Get form values
    const selectedModel = modelSelect.value;
    const imgeCount = parseInt(countSelect.value) || 1;
    const aspectRatio = ratioSelect.value || "1/1";
    const promptText = promptInput.value.trim();
    createImageCards(selectedModel, imgeCount, aspectRatio, promptText);
}
//fill prompt input with random example
promptBtn.addEventListener("click", () => {
    const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    promptInput.value = prompt;
    promptInput.focus();
})
promptForm.addEventListener("submit", handleFormSubmit);
themeToggle.addEventListener("click", toggleTheme);