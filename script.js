
const recipes = [
    {
        name: "Egg Omelette",
        category: "Breakfast",
        ingredients: ["egg", "onion", "salt"],
        time: "10 minutes",
        description: "A simple and tasty egg omelette."
    },
    {
        name: "Tomato Rice",
        category: "Lunch",
        ingredients: ["rice", "tomato", "onion"],
        time: "25 minutes",
        description: "Delicious homemade tomato rice."
    },
    {
        name: "Banana Pancakes",
        category: "Breakfast",
        ingredients: ["banana", "egg", "milk"],
        time: "15 minutes",
        description: "Soft and sweet banana pancakes."
    },
    {
        name: "Vegetable Sandwich",
        category: "Snacks",
        ingredients: ["bread", "tomato", "onion"],
        time: "10 minutes",
        description: "A crunchy and healthy sandwich."
    },
    {
        name: "Chicken Curry",
        category: "Dinner",
        ingredients: ["chicken", "onion", "tomato"],
        time: "40 minutes",
        description: "A flavourful homemade chicken curry."
    }
];

const container = document.getElementById("recipeContainer");
const searchInput = document.getElementById("searchInput");
const ingredientInput = document.getElementById("ingredientInput");
const searchBtn = document.getElementById("searchBtn");

let selectedCategory = "All";

let favorites = JSON.parse(
    localStorage.getItem("favorites") || "[]"
);

function displayRecipes(list) {
    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = "<p>No recipes found!</p>";
        return;
    }

    list.forEach(recipe => {
        const isFavorite = favorites.includes(recipe.name);

        const card = document.createElement("div");
        card.className = "recipe-card";

        card.innerHTML = `
            <h3>${recipe.name}</h3>
            <p>${recipe.description}</p>
            <p>Category: ${recipe.category}</p>
            <p>Cooking time: ${recipe.time}</p>
            <p>Ingredients: ${recipe.ingredients.join(", ")}</p>
            <button class="favorite-btn">
                ${isFavorite ? "❤️ Saved" : "🤍 Favorite"}
            </button>
        `;

        card.querySelector(".favorite-btn").addEventListener(
            "click", () => toggleFavorite(recipe.name)
        );

        container.appendChild(card);
    });
}

function toggleFavorite(name) {
    if (favorites.includes(name)) {
        favorites = favorites.filter(item => item !== name);
    } else {
        favorites.push(name);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
    searchRecipes();
}

function searchRecipes() {
    const name = searchInput.value.toLowerCase().trim();

    const ingredients = ingredientInput.value
        .toLowerCase()
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);

    const filtered = recipes.filter(recipe => {
        const nameMatch = recipe.name.toLowerCase().includes(name);

        const categoryMatch =
            selectedCategory === "All" ||
            recipe.category === selectedCategory;

        const ingredientMatch =
            ingredients.length === 0 ||
            ingredients.every(item =>
                recipe.ingredients.includes(item)
            );

        return nameMatch && categoryMatch && ingredientMatch;
    });

    displayRecipes(filtered);
}

searchBtn.addEventListener("click", searchRecipes);

document.querySelectorAll(".categories button").forEach(button => {
    button.addEventListener("click", () => {
        selectedCategory = button.textContent;
        searchRecipes();
    });
});

displayRecipes(recipes);
