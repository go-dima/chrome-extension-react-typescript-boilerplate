console.log("Content script works!");
console.log("Must reload extension for modifications to take effect.");

// this code will be executed after page load
console.log("Function works");

const changeTitle = async () => {
  const url = new URL(window.location.href);
  const pathParts = url.pathname
    .split("/")
    .filter((part) => part && part != "job");
  if (pathParts.length >= 3) {
    const jobName = pathParts[1];
    const branch = pathParts[2];

    const buildPart = pathParts[3] ? ` #${pathParts[3]}` : "";
    document.title = `${jobName} [${branch}${buildPart}]`;
  }

  fetch(`${url}/api/json`)
    .then((response) => response.json())
    .then((asJson) => {
      const lastBuildUrl = asJson?.lastBuild?.url;
      if (!lastBuildUrl) {
        return;
      }

      fetch(`${lastBuildUrl}/api/json`)
        .then((response) => response.json())
        .then((lastBuildAsJson) => {
          const { inProgress, result } = lastBuildAsJson;
          const statusToEmoji: Record<string, string> = {
            SUCCESS: "✅",
            FAILURE: "❌",
            ABORTED: "⛔",
          };

          const emoji = (inProgress ? "🔄" : statusToEmoji[result]) || "🤷‍♂️";
          document.title = emoji + " " + document.title;
        });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

// check that the href matches jenkins.*.dev
const hrefRegex = /jenkins\..*\.dev/;
if (hrefRegex.test(window.location.href)) {
  changeTitle();
  chrome.runtime.sendMessage({ contentMounted: true }, (response) => {
    if (!chrome.runtime.lastError) {
      console.log("Content script received response", response.farewell);
    } else {
      console.log(
        "Content script received error",
        chrome.runtime.lastError.message
      );
    }
  });
}

// Sample for long-lived connections
let port = chrome.runtime.connect({ name: "contentScript" });
port.postMessage({ portMounted: true });
port.onMessage.addListener((response) => {
  console.log("Content script received response", response.farewell);
  console.log("Content script received data", response.data);
  let targetElement = document.getElementById("repository-container-header");
  if (targetElement) {
    let newParagraph = document.createElement("p");
    newParagraph.textContent = "This is the added data: " + response.data;
    targetElement.insertAdjacentElement("afterend", newParagraph);
  }
});
