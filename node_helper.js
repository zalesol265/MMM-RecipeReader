const NodeHelper = require("node_helper");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const bodyParser = require("body-parser");

module.exports = NodeHelper.create({
  start() {
    this.apiKey = "";
    this.loadApiKey();
    this.setupRoutes();
  },

  loadApiKey() {
    const keyPath = path.join(__dirname, "key", "api-key.txt");
    try {
      this.apiKey = fs.readFileSync(keyPath, "utf8").trim();
      console.log("✅ Loaded Spoonacular API key successfully.");
    } catch (error) {
      console.error("❌ Failed to load API key:", error);
    }
  },

  setupRoutes() {
    this.expressApp.use(bodyParser.json());

    this.expressApp.post("/recipe/control", (req, res) => {
      const { action, payload } = req.body;
      console.log("📥 Remote control received:", action, payload);
    
      if (action === "setUrl") {
        const url = typeof payload === "string" ? payload : payload.url;
        if (url) {
          this.fetchRecipe(url);
        } else {
          console.warn("⚠️ No valid URL in payload.");
        }
      }
    });

    // GET: Serve the remote.html UI
    this.expressApp.get("/recipe/remote", (req, res) => {
      const filePath = path.join(__dirname, "remote.html");
      res.sendFile(filePath);
    });
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "FETCH_RECIPE") {
      console.log("📡 Received FETCH_RECIPE with URL:", payload.url);
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
    const apiUrl = `https://api.spoonacular.com/recipes/extract?url=${encodeURIComponent(url)}&apiKey=${this.apiKey}`;

    const response = await axios.get(apiUrl);
    const data = response.data;

    return {
      title: data.title,
      image: data.image,
      ingredients: data.extendedIngredients?.map(ing => ing.original) || [],
      instructions: (data.analyzedInstructions?.[0]?.steps || []).map(step => step.step)
    };
  }
});
