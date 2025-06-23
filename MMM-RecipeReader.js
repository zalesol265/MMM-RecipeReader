Module.register("MMM-RecipeReader", {
  defaults: {
  },

  start() {
    this.recipe = null;
  },

  getStyles() {
    return ["MMM-RecipeReader.css"];
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "RECIPE_RESULT") {
      this.recipe = payload;
      this.updateDom();
    }
  },

  decodeHtmlEntities(str) {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  },

  getDom() {
    const wrapper = document.createElement("div");
    wrapper.className = "MMM-RecipeReader-wrapper";
  
    if (!this.recipe) {
      wrapper.innerHTML = "<i>Waiting for recipe...</i>";
      return wrapper;
    }
  
    const { title, image, ingredients, instructions } = this.recipe;
  

    // Top container
    const topContainer = document.createElement("div");
    topContainer.className = "MMM-RecipeReader-top";
  
    const titleIng = document.createElement("div");
    // Title
    const titleEl = document.createElement("h2");
    titleEl.className = "MMM-RecipeReader-title";
    titleEl.innerText = title;
    titleIng.appendChild(titleEl);
      
    // Ingredients
    const ingList = document.createElement("ul");
    ingList.className = "MMM-RecipeReader-ingredients";
    ingredients.forEach((i) => {
      const li = document.createElement("li");
      li.innerText = this.decodeHtmlEntities(i);
      ingList.appendChild(li);
    });
    titleIng.appendChild(ingList);

    topContainer.appendChild(titleIng);

    // Image
    if (image) {
      const img = document.createElement("img");
      img.src = image;
      img.className = "MMM-RecipeReader-image";
      topContainer.appendChild(img);
    }
    wrapper.appendChild(topContainer);
  
    // Instructions
    const instr = document.createElement("ol");
    instr.className = "MMM-RecipeReader-instructions";
    instructions.forEach((i) => {
      const li = document.createElement("li");
      li.innerText = i;
      instr.appendChild(li);
    });
    wrapper.appendChild(instr);
    console.log(wrapper);
    return wrapper;
  },

  notificationReceived(notification, payload) {
    if (notification === "FETCH_RECIPE") {
      this.sendSocketNotification("FETCH_RECIPE", {
        url: payload.url
      });
    }
  }
});
