Module.register("MMM-RecipeReader", {
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

    // === Top Section (Title, Ingredients, Image) ===
    const topContainer = document.createElement("div");
    topContainer.className = "MMM-RecipeReader-top";

    const titleIng = document.createElement("div");

    const titleEl = document.createElement("h2");
    titleEl.className = "MMM-RecipeReader-title";
    titleEl.innerText = title;
    titleIng.appendChild(titleEl);

    const ingList = document.createElement("ul");
    ingList.className = "MMM-RecipeReader-ingredients";
    ingredients.forEach((i) => {
      const li = document.createElement("li");
      li.innerText = this.decodeHtmlEntities(i);
      ingList.appendChild(li);
    });
    titleIng.appendChild(ingList);

    topContainer.appendChild(titleIng);

    if (image) {
      const img = document.createElement("img");
      img.src = image;
      img.className = "MMM-RecipeReader-image";
      topContainer.appendChild(img);
    }

    // === Instructions Section ===
    const instrList = document.createElement("ol");
    instrList.className = "MMM-RecipeReader-instructions";
    instructions.forEach((step) => {
      const li = document.createElement("li");
      li.innerText = step;
      instrList.appendChild(li);
    });

    // === Scrollable Container ===
    const scrollContainer = document.createElement("div");
    scrollContainer.className = "MMM-RecipeReader-scrollContainer";
    scrollContainer.appendChild(topContainer);
    scrollContainer.appendChild(instrList);

    // === Overflow Warning Message ===
    const overflowMsg = document.createElement("div");
    overflowMsg.className = "MMM-RecipeReader-overflowMsg";
    overflowMsg.style.display = "none";
    overflowMsg.innerText = "The display cannot show the full recipe.";

    // === Final Wrapper Composition ===
    wrapper.appendChild(overflowMsg);
    wrapper.appendChild(scrollContainer);

    // === Overflow Detection ===
    setTimeout(() => {
      if (scrollContainer.scrollHeight > scrollContainer.clientHeight) {
        overflowMsg.style.display = "block";
      }
    }, 100);

    return wrapper;
  },

  notificationReceived(notification, payload) {
    if (notification === "FETCH_RECIPE") {
      this.sendSocketNotification("FETCH_RECIPE", { url: payload.url });
    }
  }
});
