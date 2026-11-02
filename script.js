const API = "https://www.themealdb.com/api/json/v1/1";

const container = document.getElementById("recipeContainer");
const searchInput = document.getElementById("searchInput");
const ingredientInput = document.getElementById("ingredientInput");
const searchBtn = document.getElementById("searchBtn");

let meals = [];
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

async function getMeals(url) {
    container.innerHTML = "<p>Finding delicious recipes... 🍳</p>";

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.meals || [];
    } catch (error) {
        container.innerHTML = "<p>Something went wrong. Please try again!</p>";
        return [];
    }
}

function getIngredients(meal) {
    let ingredients = [];

    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];

        if (ingredient && ingredient.trim()) {
            ingredients.push(`${measure || ""} ${ingredient}`.trim());
        }
    }

    return ingredients;
}

function displayMeals(list) {
    meals = list;
    container.innerHTML = "";

    if (!list.length) {
        container.innerHTML = "<p>No recipes found. Try another food! 🍽️</p>";
        return;
    }

    list.forEach(meal => {
        const card = document.createElement("div");
        card.className = "recipe-card";

        const saved = favorites.includes(meal.idMeal);

        card.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <h3>${meal.strMeal}</h3>
            <p>${meal.strArea || "Various"} Cuisine</p>
            <button class="details-btn">View Recipe</button>
            <button class="favorite-btn">
                ${saved ? "❤️ Saved" : "♡ Favorite"}
            </button>
            <div class="recipe-details" style="display:none">
                <h4>Ingredients</h4>
                <ul>
                    ${getIngredients(meal).map(item => `<li>${item}</li>`).join("")}
                </ul>
                <h4>Cooking Instructions</h4>
                <p>${meal.strInstructions || "No instructions available."}</p>
                ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank">Watch Video</a>` : ""}
            </div>
        `;

        card.querySelector(".details-btn").addEventListener("click", () => {
            const details = card.querySelector(".recipe-details");
            details.style.display =
                details.style.display === "none" ? "block" : "none";
        });

        card.querySelector(".favorite-btn").addEventListener("click", () => {
            toggleFavorite(meal.idMeal);
        });

        container.appendChild(card);
    });
}

function toggleFavorite(id) {
    if (favorites.includes(id)) {
        favorites = favorites.filter(item => item !== id);
    } else {
        favorites.push(id);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
    displayMeals(meals);
}

async function searchRecipes() {
    const name = searchInput?.value.trim() || "";
    const ingredients = ingredientInput?.value.trim() || "";

    if (name) {
        const results = await getMeals(
            `${API}/search.php?s=${encodeURIComponent(name)}`
        );
        displayMeals(results);
        return;
    }

    if (ingredients) {
        const firstIngredient = ingredients.split(",")[0].trim();

        const results = await getMeals(
            `${API}/filter.php?i=${encodeURIComponent(firstIngredient)}`
        );

        const detailedMeals = await Promise.all(
            results.slice(0, 12).map(async meal => {
                const response = await fetch(
                    `${API}/lookup.php?i=${meal.idMeal}`
                );
                const data = await response.json();
                return data.meals ? data.meals[0] : null;
            })
        );

        displayMeals(detailedMeals.filter(Boolean));
        return;
    }

    alert("Enter a food name or an ingredient!");
}

searchBtn?.addEventListener("click", searchRecipes);

searchInput?.addEventListener("keydown", event => {
    if (event.key === "Enter") searchRecipes();
});

ingredientInput?.addEventListener("keydown", event => {
    if (event.key === "Enter") searchRecipes();
});
