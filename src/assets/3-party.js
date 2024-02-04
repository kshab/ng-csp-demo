'use strict';

const FILE_URL = 'https://www.google-analytics.com/analytics.js';

function loadJS(fileUrl, async = true) {
  const scriptEl = document.createElement("script");

  scriptEl.setAttribute("src", fileUrl);
  scriptEl.setAttribute("type", "text/javascript");
  scriptEl.setAttribute("async", async);

  document.body.appendChild(scriptEl);

  scriptEl.addEventListener("load", () => {
    console.log("File loaded")
  });

  scriptEl.addEventListener("error", (ev) => {
    console.log("Error on loading file", ev);
  });
}
loadJS(FILE_URL, true);