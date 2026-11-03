
const API = "https://www.themealdb.com/api/json/v1/1";

const container = document.getElementById("recipeContainer");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const exploreToggle = document.getElementById("exploreToggle");
const filterSection = document.getElementById("filterSection");
const filterSubmit = document.getElementById("filterSubmit");
const detailsSection = document.getElementById("recipeDetails");
let meals = [];

async function getMeals(url) {
    container.innerHTML = "<p>Finding recipes... 🍳</p>";
    container.hidden = false;
    detailsSection.hidden = true;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Could not load recipes");
        }

        const data = await response.json();
        return data.meals || [];

    } catch (error) {
        container.innerHTML =
            "<p>Unable to load recipes. Please try again.</p>";
        return null;
    }
}

// Search recipes by name
async function searchRecipes() {
    const name = searchInput.value.trim();

    if (!name) {
        alert("Please enter a food name!");
        return;
    }

    const results = await getMeals(
        `${API}/search.php?s=${encodeURIComponent(name)}`
    );

    if (results !== null) {
        displayMeals(results);
    }
}

// Open and close Explore section
exploreToggle.addEventListener("click", () => {
    filterSection.hidden = !filterSection.hidden;

    exploreToggle.textContent = filterSection.hidden
        ? "Don't know what to cook? Explore recipes ↓"
        : "Hide recipe filters ↑";
});

// Submit selected filters
async function submitFilters() {
    const foodType = document.getElementById("foodType").value;
    const flavour = document.getElementById("flavour").value;
    const mealTime = document.getElementById("mealTime").value;
    const category = document.getElementById("foodCategory").value;

    let url = "";

    // Food type search
    if (foodType === "Vegetarian") {
        url = `${API}/filter.php?c=Vegetarian`;
    } else if (foodType === "Chicken") {
        url = `${API}/filter.php?i=chicken_breast`;
    } else if (foodType === "Beef") {
        url = `${API}/filter.php?i=beef`;
    } else if (foodType === "Paneer") {
        url = `${API}/filter.php?i=paneer`;
    } else if (foodType === "Seafood") {
        url = `${API}/filter.php?c=Seafood`;
    }

    // Food category search
    if (!foodType && category) {
        if (category === "Biriyani") {
            url = `${API}/search.php?s=biryani`;
        } else if (category === "Juices") {
            url = `${API}/search.php?s=juice`;
        } else if (category === "Curry") {
            url = `${API}/search.php?s=curry`;
        } else {
            url = `${API}/filter.php?c=${encodeURIComponent(category)}`;
        }
    }

    if (!url) {
        alert(
            "Please select a food type or food category. Flavour and meal-time filters are not directly supported by the recipe database yet."
        );
        return;
    }

    const results = await getMeals(url);

    if (results !== null) {
        // Ingredient/category filters return short results.
        // Fetch full recipe details for each result.
        const detailedMeals = await Promise.all(
            results.slice(0, 20).map(async meal => {
                try {
                    const response = await fetch(
                        `${API}/lookup.php?i=${meal.idMeal}`
                    );
                    const data = await response.json();
                    return data.meals ? data.meals[0] : null;
                } catch {
                    return null;
                }
            })
        );

        displayMeals(detailedMeals.filter(Boolean));
    }
}

filterSubmit.addEventListener("click", submitFilters);

// Display only photo and food name
function displayMeals(list) {
    meals = list;
    container.innerHTML = "";
    detailsSection.hidden = true;
    container.hidden = false;

    if (!list.length) {
        container.innerHTML =
            "<p>No recipes found. Try another search!</p>";
        return;
    }

    list.forEach(meal => {
        const card = document.createElement("div");
        card.className = "recipe-card";

        const image = document.createElement("img");
        image.src = meal.strMealThumb;
        image.alt = meal.strMeal;
        image.loading = "lazy";

        const name = document.createElement("h3");
        name.textContent = meal.strMeal;

        card.appendChild(image);
        card.appendChild(name);

        card.addEventListener("click", () => {
            showRecipeDetails(meal);
        });

        container.appendChild(card);
    });
}

// Get recipe ingredients
function getIngredients(meal) {
    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];

        if (ingredient && ingredient.trim()) {
            ingredients.push(
                `${measure || ""} ${ingredient}`.trim()
            );
        }
    }

    return ingredients;
}

// Show complete recipe after clicking a card

async function showRecipeDetails(meal) {
    container.hidden = true;
    detailsSection.hidden = false;
    detailsSection.innerHTML = "<p>Loading recipe...</p>";

    const t = translations[currentLanguage];

    const titleText = await translateRecipeText(meal.strMeal);
    const ingredients = getIngredients(meal);
    const translatedIngredients = await translateRecipeText(
        ingredients.join("\n")
    );

    const instructions = (meal.strInstructions || "")
        .replace(/\r/g, "")
        .split(/\n+/)
        .map(step => step.trim())
        .filter(Boolean);

    const translatedInstructions = await Promise.all(
        instructions.map(step => translateRecipeText(step))
    );

    detailsSection.innerHTML = "";

    const backButton = document.createElement("button");
    backButton.textContent = t.back;
    backButton.addEventListener("click", () => {
        detailsSection.hidden = true;
        container.hidden = false;
    });

    const image = document.createElement("img");
    image.src = meal.strMealThumb;
    image.alt = meal.strMeal;
    image.style.width = "100%";
    image.style.maxWidth = "450px";

    const title = document.createElement("h2");
    title.textContent = titleText;

    const ingredientsTitle = document.createElement("h3");
    ingredientsTitle.textContent = t.ingredients;

    const ingredientsList = document.createElement("ul");

    const ingredientLines = translatedIngredients.split("\n");

    ingredientLines.forEach(item => {
        if (item.trim()) {
            const li = document.createElement("li");
            li.textContent = item;
            ingredientsList.appendChild(li);
        }
    });

    const instructionsTitle = document.createElement("h3");
    instructionsTitle.textContent = t.instructions;

    const steps = document.createElement("ol");

    translatedInstructions.forEach(step => {
        const li = document.createElement("li");
        li.textContent = step;
        steps.appendChild(li);
    });

    if (!translatedInstructions.length) {
        const li = document.createElement("li");
        li.textContent = "Instructions are not available.";
        steps.appendChild(li);
    }

    detailsSection.append(
        backButton,
        image,
        title,
        ingredientsTitle,
        ingredientsList,
        instructionsTitle,
        steps
    );

    if (meal.strYoutube) {
        const video = document.createElement("a");
        video.href = meal.strYoutube;
        video.target = "_blank";
        video.rel = "noopener";
        video.textContent = t.video;
        detailsSection.appendChild(video);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}


    const ingredientsTitle = document.createElement("h3");
    ingredientsTitle.textContent = "Ingredients";

    const ingredientsList = document.createElement("ul");

    getIngredients(meal).forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        ingredientsList.appendChild(li);
    });

    const instructionsTitle = document.createElement("h3");
    instructionsTitle.textContent = "Step-by-step Cooking Instructions";

    const steps = document.createElement("ol");

    const instructions = (meal.strInstructions || "")
        .replace(/\r/g, "")
        .split(/\n+/)
        .map(step => step.trim())
        .filter(Boolean);

    instructions.forEach(step => {
        const li = document.createElement("li");
        li.textContent = step;
        steps.appendChild(li);
    });

    if (!instructions.length) {
        const li = document.createElement("li");
        li.textContent = "Instructions are not available.";
        steps.appendChild(li);
    }

    detailsSection.append(
        backButton,
        image,
        title,
        ingredientsTitle,
        ingredientsList,
        instructionsTitle,
        steps
    );

    if (meal.strYoutube) {
        const video = document.createElement("a");
        video.href = meal.strYoutube;
        video.target = "_blank";
        video.rel = "noopener";
        video.textContent = "Watch cooking video";
        detailsSection.appendChild(video);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Search button and Enter key
searchBtn.addEventListener("click", searchRecipes);

searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        searchRecipes();
    }
});

// ===============================
// LANGUAGE SETTINGS
// ===============================

const languageSelect = document.getElementById("languageSelect");

const translations = {
    en: {
        heading: "Discover Your Next Favourite Meal",
        subtitle: "What would you love to eat today?",
        placeholder: "Search food... e.g. Biriyani, Pizza",
        search: "Search",
        explore: "Don't know what to cook? Explore recipes ↓",
        hide: "Hide recipe filters ↑",
        exploreTitle: "Explore Recipes",
        foodType: "Food Type",
        flavour: "Flavour",
        mealTime: "Meal Time",
        category: "Food Category",
        submit: "Submit",
        results: "Recipes",
        back: "← Back to recipes",
        ingredients: "Ingredients",
        instructions: "Step-by-step Cooking Instructions",
        video: "Watch cooking video",
        noResults: "No recipes found. Try another search!",
        loading: "Finding recipes... 🍳",
        error: "Unable to load recipes. Please try again.",
        any: "Any"
    },
    ml: {
        heading: "നിങ്ങളുടെ പ്രിയപ്പെട്ട ഭക്ഷണം കണ്ടെത്തൂ",
        subtitle: "ഇന്ന് എന്താണ് കഴിക്കാൻ ആഗ്രഹിക്കുന്നത്?",
        placeholder: "ഭക്ഷണം തിരയൂ...",
        search: "തിരയുക",
        explore: "എന്ത് പാചകം ചെയ്യണമെന്ന് അറിയില്ലേ? ↓",
        hide: "ഫിൽട്ടറുകൾ മറയ്ക്കുക ↑",
        exploreTitle: "വിഭവങ്ങൾ കണ്ടെത്തുക",
        foodType: "ഭക്ഷണ തരം",
        flavour: "രുചി",
        mealTime: "ഭക്ഷണ സമയം",
        category: "വിഭവ വിഭാഗം",
        submit: "സമർപ്പിക്കുക",
        results: "വിഭവങ്ങൾ",
        back: "← തിരികെ പോകുക",
        ingredients: "ചേരുവകൾ",
        instructions: "പാചകം ചെയ്യേണ്ട വിധം",
        video: "പാചക വീഡിയോ കാണുക",
        noResults: "വിഭവങ്ങൾ കണ്ടെത്താനായില്ല!",
        loading: "വിഭവങ്ങൾ തിരയുന്നു... 🍳",
        error: "ലോഡ് ചെയ്യാനായില്ല. വീണ്ടും ശ്രമിക്കുക.",
        any: "ഏതെങ്കിലും"
    },
    hi: {
        heading: "अपना पसंदीदा खाना खोजें",
        subtitle: "आज आप क्या खाना चाहेंगे?",
        placeholder: "खाना खोजें...",
        search: "खोजें",
        explore: "समझ नहीं आ रहा क्या बनाएं? ↓",
        hide: "फ़िल्टर छिपाएं ↑",
        exploreTitle: "रेसिपी खोजें",
        foodType: "खाने का प्रकार",
        flavour: "स्वाद",
        mealTime: "भोजन का समय",
        category: "खाने की श्रेणी",
        submit: "जमा करें",
        results: "रेसिपी",
        back: "← वापस जाएं",
        ingredients: "सामग्री",
        instructions: "बनाने की विधि",
        video: "कुकिंग वीडियो देखें",
        noResults: "कोई रेसिपी नहीं मिली!",
        loading: "रेसिपी खोज रहे हैं... 🍳",
        error: "लोड नहीं हुआ। फिर कोशिश करें।",
        any: "कोई भी"
    },
    ta: {
        heading: "உங்களுக்கு பிடித்த உணவைக் கண்டறியுங்கள்",
        subtitle: "இன்று என்ன சாப்பிட விரும்புகிறீர்கள்?",
        placeholder: "உணவைத் தேடுங்கள்...",
        search: "தேடு",
        explore: "என்ன சமைப்பது என்று தெரியவில்லையா? ↓",
        hide: "வடிகட்டிகளை மறை ↑",
        exploreTitle: "சமையல் குறிப்புகள்",
        foodType: "உணவு வகை",
        flavour: "சுவை",
        mealTime: "உணவு நேரம்",
        category: "உணவு பிரிவு",
        submit: "சமர்ப்பி",
        results: "சமையல் குறிப்புகள்",
        back: "← மீண்டும் செல்லவும்",
        ingredients: "தேவையான பொருட்கள்",
        instructions: "செய்முறை",
        video: "சமையல் வீடியோவைப் பார்க்கவும்",
        noResults: "சமையல் குறிப்புகள் கிடைக்கவில்லை!",
        loading: "தேடுகிறது... 🍳",
        error: "ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
        any: "ஏதேனும்"
    }
};

let currentLanguage = localStorage.getItem("recipeLanguage") || "en";

function applyLanguage() {
    const t = translations[currentLanguage];

    document.querySelector(".search-section h2").textContent = t.heading;
    document.querySelector(".search-section p").textContent = t.subtitle;
    searchInput.placeholder = t.placeholder;
    searchBtn.textContent = t.search;

    exploreToggle.textContent = filterSection.hidden ? t.explore : t.hide;

    document.querySelector("#filterSection h2").textContent = t.exploreTitle;

    document.querySelector('label[for="foodType"]').textContent = t.foodType;
    document.querySelector('label[for="flavour"]').textContent = t.flavour;
    document.querySelector('label[for="mealTime"]').textContent = t.mealTime;
    document.querySelector('label[for="foodCategory"]').textContent = t.category;

    filterSubmit.textContent = t.submit;
    document.getElementById("resultsHeading").textContent = t.results;

    // Change "Any" options
    ["foodType", "flavour", "mealTime", "foodCategory"].forEach(id => {
        const firstOption = document.getElementById(id).options[0];
        firstOption.textContent = t.any;
    });

    document.querySelector("footer p").textContent = "Made with ❤️ by Haari_Codes";
}

if (languageSelect) {
    languageSelect.value = currentLanguage;

    languageSelect.addEventListener("change", () => {
        currentLanguage = languageSelect.value;
        localStorage.setItem("recipeLanguage", currentLanguage);
        applyLanguage();
    });
}

applyLanguage();

// ===============================
// RECIPE CONTENT TRANSLATION
// ===============================

async function translateRecipeText(text) {
    if (!text || currentLanguage === "en") return text;

    try {
        const chunks = [];
        let remaining = text;

        while (remaining.length > 450) {
            let cut = remaining.lastIndexOf(" ", 450);
            if (cut < 1) cut = 450;
            chunks.push(remaining.slice(0, cut));
            remaining = remaining.slice(cut).trim();
        }

        if (remaining) chunks.push(remaining);

        const translated = [];

        for (const chunk of chunks) {
            const url =
                "https://api.mymemory.translated.net/get?q=" +
                encodeURIComponent(chunk) +
                "&langpair=en|" + currentLanguage;

            const response = await fetch(url);
            const data = await response.json();

            translated.push(
                data.responseData?.translatedText || chunk
            );
        }

        return translated.join(" ");
    } catch (error) {
        return text;
    }
}

