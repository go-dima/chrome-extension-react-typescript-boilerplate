console.log("Content script works!");
console.log("Must reload extension for modifications to take effect.");

// this code will be executed after page load
console.log("Function works");

const fetchData = async () => {
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
  fetchData();
} else {
  console.log("Not on a Jenkins page");
}
