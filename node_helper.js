const NodeHelper = require("node_helper");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = NodeHelper.create({
  start() {
    this.apiKey = "";

    // Load the API key from the module's key folder (e.g., modules/MMM-RecipeReader/key/api-key.txt)
    const keyPath = path.join(__dirname, "key", "api-key.txt");
    try {
      this.apiKey = fs.readFileSync(keyPath, "utf8").trim();
      console.log("Loaded Spoonacular API key successfully.");
    } catch (error) {
      console.error("Failed to load API key from key/api-key.txt:", error);
    }
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "FETCH_RECIPE") {
      this.fetchRecipe(payload.url);
    }
  },

  async fetchRecipe(url) {
    if (!this.apiKey) {
      this.sendSocketNotification("RECIPE_RESULT", {
        error: "API key not set or failed to load."
      });
      return;
    }

    try {
      const recipeData = await this.callSpoonacularApi(url);
      this.sendSocketNotification("RECIPE_RESULT", recipeData);
    } catch (error) {
      this.sendSocketNotification("RECIPE_RESULT", {
        error: error.message || "Error fetching recipe."
      });
    }
  },

  async callSpoonacularApi(url) {
    // Spoonacular API endpoint for extracting recipe details by URL
    const apiUrl = `https://api.spoonacular.com/recipes/extract?url=${encodeURIComponent(url)}&apiKey=${this.apiKey}`;

    const response = await axios.get(apiUrl);

    // Extract useful info
    const data = response.data;

    return {
      title: data.title,
      image: data.image,
      ingredients: data.extendedIngredients.map(ing => ing.original),
      instructions: (data.analyzedInstructions?.[0]?.steps || []).map(step => step.step)
    };
    
  }
});
