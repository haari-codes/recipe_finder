
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
function showRecipeDetails(meal) {
    container.hidden = true;
    detailsSection.hidden = false;
    detailsSection.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = meal.strMeal;

    const image = document.createElement("img");
    image.src = meal.strMealThumb;
    image.alt = meal.strMeal;
    image.style.width = "100%";
    image.style.maxWidth = "450px";

    const backButton = document.createElement("button");
    backButton.textContent = "← Back to recipes";
    backButton.addEventListener("click", () => {
        detailsSection.hidden = true;
        container.hidden = false;
    });

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

