Module.register("MMM-RecipeReader", {
  start() {
    this.recipe = null;
    this.sendSocketNotification("RECIPE_READER_READY");
  },

  getStyles() {
    return ["MMM-RecipeReader.css"];
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "RECIPE_READER_READY") {
      console.log("🎯 Frontend is ready! Now I can safely send notifications."); // Needed before can send notification from node_helper (or something.... i dunno why... doesn't work without)
    }

    if (notification === "RECIPE_RESULT") {
      this.recipe = payload;
      this.updateDom();
    }
  },

  notificationReceived(notification, payload) {

    if (notification === "FETCH_RECIPE") {
      this.sendSocketNotification("FETCH_RECIPE", { url: payload.url });
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

    // Top Section: title, ingredients, image
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

    // Instructions
    const instrList = document.createElement("ol");
    instrList.className = "MMM-RecipeReader-instructions";
    instructions.forEach((step) => {
      const li = document.createElement("li");
      li.innerText = step;
      instrList.appendChild(li);
    });

    // Scrollable container
    const scrollContainer = document.createElement("div");
    scrollContainer.className = "MMM-RecipeReader-scrollContainer";
    scrollContainer.appendChild(topContainer);
    scrollContainer.appendChild(instrList);

    // Overflow warning
    const overflowMsg = document.createElement("div");
    overflowMsg.className = "MMM-RecipeReader-overflowMsg";
    overflowMsg.style.display = "none";
    overflowMsg.innerText = "The display cannot show the full recipe.";

    wrapper.appendChild(overflowMsg);
    wrapper.appendChild(scrollContainer);

    // Display overflow warning if needed
    setTimeout(() => {
      if (scrollContainer.scrollHeight > scrollContainer.clientHeight) {
        overflowMsg.style.display = "block";
      }
    }, 100);

    return wrapper;
  }
});
