
const API = "https://www.themealdb.com/api/json/v1/1";

// HTML elements
const container = document.getElementById("recipeContainer");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const exploreToggle = document.getElementById("exploreToggle");
const filterSection = document.getElementById("filterSection");
const filterSubmit = document.getElementById("filterSubmit");
const detailsSection = document.getElementById("recipeDetails");
const languageSelect = document.getElementById("languageSelect");

let meals = [];
let selectedMeal = null;
let currentLanguage = localStorage.getItem("recipeLanguage") || "en";

// Language translations
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
        enter: "Please enter a food name!",
        choose: "Please select at least one filter.",
        unavailable: "Instructions are not available.",
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
        instructions: "പാചകം ചെയ്യുന്ന വിധം",
        video: "പാചക വീഡിയോ കാണുക",
        noResults: "വിഭവങ്ങൾ കണ്ടെത്താനായില്ല!",
        loading: "വിഭവങ്ങൾ തിരയുന്നു... 🍳",
        error: "ലോഡ് ചെയ്യാനായില്ല. വീണ്ടും ശ്രമിക്കുക.",
        enter: "ഒരു ഭക്ഷണത്തിന്റെ പേര് നൽകുക!",
        choose: "ഒരു ഫിൽട്ടറെങ്കിലും തിരഞ്ഞെടുക്കുക.",
        unavailable: "പാചകരീതി ലഭ്യമല്ല.",
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
        enter: "खाने का नाम लिखें!",
        choose: "कम से कम एक फ़िल्टर चुनें।",
        unavailable: "बनाने की विधि उपलब्ध नहीं है।",
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
        enter: "உணவின் பெயரை உள்ளிடவும்!",
        choose: "குறைந்தது ஒரு வடிகட்டியைத் தேர்ந்தெடுக்கவும்.",
        unavailable: "செய்முறை கிடைக்கவில்லை.",
        any: "ஏதேனும்"
    }
};

function text(key) {
    return translations[currentLanguage][key] || translations.en[key];
}

// Translate recipe content
async function translateText(value) {
    if (!value || currentLanguage === "en") return value;

    try {
        const chunks = [];
        let remaining = value;

        while (remaining.length > 450) {
            let cut = remaining.lastIndexOf(" ", 450);
            if (cut < 1) cut = 450;

            chunks.push(remaining.slice(0, cut));
            remaining = remaining.slice(cut).trim();
        }

        if (remaining) chunks.push(remaining);

        const output = [];

        for (const chunk of chunks) {
            const url =
                "https://api.mymemory.translated.net/get?q=" +
                encodeURIComponent(chunk) +
                "&langpair=en|" + currentLanguage;

            const response = await fetch(url);
            const data = await response.json();

            output.push(
                data.responseData?.translatedText || chunk
            );
        }

        return output.join(" ");
    } catch {
        return value;
    }
}

// Apply website language
function applyLanguage() {
    const t = translations[currentLanguage];

    document.querySelector(".search-section h2").textContent = t.heading;
    document.querySelector(".search-section p").textContent = t.subtitle;

    searchInput.placeholder = t.placeholder;
    searchBtn.textContent = t.search;

    exploreToggle.textContent = filterSection.hidden
        ? t.explore
        : t.hide;

    document.querySelector("#filterSection h2").textContent = t.exploreTitle;

    document.querySelector('label[for="foodType"]').textContent = t.foodType;
    document.querySelector('label[for="flavour"]').textContent = t.flavour;
    document.querySelector('label[for="mealTime"]').textContent = t.mealTime;
    document.querySelector('label[for="foodCategory"]').textContent = t.category;

    filterSubmit.textContent = t.submit;
    document.getElementById("resultsHeading").textContent = t.results;

    ["foodType", "flavour", "mealTime", "foodCategory"].forEach(id => {
        document.getElementById(id).options[0].textContent = t.any;
    });

    if (selectedMeal) {
        showRecipeDetails(selectedMeal);
    }
}

// Language selector
if (languageSelect) {
    languageSelect.value = currentLanguage;

    languageSelect.addEventListener("change", () => {
        currentLanguage = languageSelect.value;
        localStorage.setItem("recipeLanguage", currentLanguage);
        applyLanguage();
    });
}

// Fetch recipe list
async function fetchMealList(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Could not fetch recipes");
    }

    const data = await response.json();
    return data.meals || [];
}

// Show loading
function showLoading() {
    container.hidden = false;
    detailsSection.hidden = true;
    container.innerHTML = `<p>${text("loading")}</p>`;
}

// Search by name
async function searchRecipes() {
    const name = searchInput.value.trim();

    if (!name) {
        alert(text("enter"));
        return;
    }

    selectedMeal = null;
    showLoading();

    try {
        const results = await fetchMealList(
            `${API}/search.php?s=${encodeURIComponent(name)}`
        );

        displayMeals(results);
    } catch {
        container.innerHTML = `<p>${text("error")}</p>`;
    }
}

// Explore filters open/close
exploreToggle.addEventListener("click", () => {
    filterSection.hidden = !filterSection.hidden;

    exploreToggle.textContent = filterSection.hidden
        ? text("explore")
        : text("hide");
});

// Build API URL for food type
function getFoodTypeURL(type) {
    const urls = {
        Vegetarian: `${API}/filter.php?c=Vegetarian`,
        Chicken: `${API}/filter.php?i=chicken`,
        Beef: `${API}/filter.php?i=beef`,
        Paneer: `${API}/filter.php?i=paneer`,
        Seafood: `${API}/filter.php?c=Seafood`
    };

    return urls[type] || null;
}

// Build API URL for food category
function getCategoryURL(category) {
    if (category === "Biriyani") {
        return `${API}/search.php?s=biryani`;
    }

    if (category === "Juices") {
        return `${API}/search.php?s=juice`;
    }

    if (category === "Curry") {
        return `${API}/search.php?s=curry`;
    }

    if (category === "Dessert") {
        return `${API}/filter.php?c=Dessert`;
    }

    return `${API}/filter.php?c=${encodeURIComponent(category)}`;
}

// Keyword matching for flavour and meal time
function matchesLocalFilters(meal, flavour, mealTime) {
    const info = [
        meal.strMeal,
        meal.strCategory,
        meal.strTags,
        meal.strInstructions,
        ...getIngredients(meal)
    ].join(" ").toLowerCase();

    let flavourMatch = true;
    let timeMatch = true;

    if (flavour === "Sweet") {
        flavourMatch = /sugar|honey|chocolate|sweet|dessert|cake|syrup|fruit|jam/.test(info);
    } else if (flavour === "Spicy") {
        flavourMatch = /chilli|chili|pepper|spicy|curry|masala|hot sauce|paprika/.test(info);
    } else if (flavour === "Crispy") {
        flavourMatch = /crispy|crunchy|fried|fry|fritters|chips|roast|toast/.test(info);
    } else if (flavour === "Sour") {
        flavourMatch = /lemon|lime|vinegar|tamarind|yogurt|yoghurt|sour|tomato/.test(info);
    }

    if (mealTime === "Breakfast") {
        timeMatch = /breakfast|pancake|omelette|omelet|toast|cereal|porridge|egg/.test(info);
    } else if (mealTime === "Lunch") {
        timeMatch = /lunch|rice|sandwich|salad|wrap|bowl|soup/.test(info);
    } else if (mealTime === "Dinner") {
        timeMatch = /dinner|roast|steak|curry|lasagne|pasta|biryani/.test(info);
    } else if (mealTime === "Snacks") {
        timeMatch = /snack|fries|chips|samosa|roll|nugget|cookie|biscuit|popcorn|fritter/.test(info);
    }

    return flavourMatch && timeMatch;
}

// Submit all filters together
async function submitFilters() {
    const foodType = document.getElementById("foodType").value;
    const flavour = document.getElementById("flavour").value;
    const mealTime = document.getElementById("mealTime").value;
    const category = document.getElementById("foodCategory").value;

    if (!foodType && !flavour && !mealTime && !category) {
        alert(text("choose"));
        return;
    }

    selectedMeal = null;
    showLoading();

    try {
        const urls = [];

        const typeURL = getFoodTypeURL(foodType);
        const categoryURL = getCategoryURL(category);

        if (typeURL) urls.push(typeURL);
        if (categoryURL) urls.push(categoryURL);

        // If no API-based filter is selected, get recipes from categories.
        if (urls.length === 0) {
            const categories = await fetchMealList(`${API}/categories.php`);

            for (const item of categories) {
                urls.push(
                    `${API}/filter.php?c=${encodeURIComponent(item.strCategory)}`
                );
            }
        }

        const lists = await Promise.all(
            urls.map(url => fetchMealList(url))
        );

        let candidates;

        if (lists.length === 1) {
            candidates = lists[0];
        } else {
            // Intersection: recipe must match both selected API filters.
            const firstIDs = new Set(lists[0].map(meal => meal.idMeal));
            candidates = lists[1].filter(meal => firstIDs.has(meal.idMeal));
        }

        // Remove duplicates
        candidates = [
            ...new Map(candidates.map(meal => [meal.idMeal, meal])).values()
        ];

        // Fetch full details for candidates
        const detailedMeals = await Promise.all(
            candidates.slice(0, 60).map(async meal => {
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

        let results = detailedMeals.filter(Boolean);

        // Apply flavour and meal-time filters
        results = results.filter(meal =>
            matchesLocalFilters(meal, flavour, mealTime)
        );

        displayMeals(results);

    } catch (error) {
        container.innerHTML = `<p>${text("error")}</p>`;
    }
}

// Display recipe cards
function displayMeals(list) {
    meals = list;
    container.innerHTML = "";
    container.hidden = false;
    detailsSection.hidden = true;

    if (!list.length) {
        container.innerHTML = `<p>${text("noResults")}</p>`;
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

        card.append(image, name);

        card.addEventListener("click", () => {
            showRecipeDetails(meal);
        });

        container.appendChild(card);
    });
}

// Get ingredients and measurements
function getIngredients(meal) {
    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];

        if (ingredient && ingredient.trim()) {
            ingredients.push(`${measure || ""} ${ingredient}`.trim());
        }
    }

    return ingredients;
}

// Display full recipe details
async function showRecipeDetails(meal) {
    selectedMeal = meal;

    container.hidden = true;
    detailsSection.hidden = false;
    detailsSection.innerHTML = `<p>${text("loading")}</p>`;

    const translatedTitle = await translateText(meal.strMeal);

    const ingredients = getIngredients(meal);
    const translatedIngredients = await Promise.all(
        ingredients.map(item => translateText(item))
    );

    const instructions = (meal.strInstructions || "")
        .replace(/\r/g, "")
        .split(/\n+/)
        .map(step => step.trim())
        .filter(Boolean);

    const translatedSteps = await Promise.all(
        instructions.map(step => translateText(step))
    );

    // Prevent outdated translation from replacing current recipe
    if (selectedMeal !== meal) return;

    detailsSection.innerHTML = "";

    const backButton = document.createElement("button");
    backButton.textContent = text("back");

    backButton.addEventListener("click", () => {
        selectedMeal = null;
        detailsSection.hidden = true;
        container.hidden = false;
    });

    const image = document.createElement("img");
    image.src = meal.strMealThumb;
    image.alt = meal.strMeal;
    image.style.width = "100%";
    image.style.maxWidth = "450px";

    const title = document.createElement("h2");
    title.textContent = translatedTitle;

    const ingredientsTitle = document.createElement("h3");
    ingredientsTitle.textContent = text("ingredients");

    const ingredientsList = document.createElement("ul");

    translatedIngredients.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        ingredientsList.appendChild(li);
    });

    const instructionsTitle = document.createElement("h3");
    instructionsTitle.textContent = text("instructions");

    const steps = document.createElement("ol");

    translatedSteps.forEach(step => {
        const li = document.createElement("li");
        li.textContent = step;
        steps.appendChild(li);
    });

    if (!translatedSteps.length) {
        const li = document.createElement("li");
        li.textContent = text("unavailable");
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
        video.textContent = text("video");
        detailsSection.appendChild(video);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Event listeners
searchBtn.addEventListener("click", searchRecipes);

searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        searchRecipes();
    }
});

filterSubmit.addEventListener("click", submitFilters);

// Start with saved language
applyLanguage();

