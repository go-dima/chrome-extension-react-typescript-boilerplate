// Listen to messages sent from other parts of the extension.
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  (async () => {
    if (request.contentMounted) {
      console.log("eventPage notified that contebt.ts has mounted.");
      try {
        let data = await changeTitle();
        console.log("eventPage fetched data:", data);
      } catch (error) {
        console.error(error);
      }
      console.log("eventPage is sending a response.");
      sendResponse({ farewell: "eventPage says goodbye!" });
    }

    if (request.popupMounted) {
      console.log("eventPage notified that Popup.tsx has mounted.");
      console.log("eventPage is sending a response.");
      const currentTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      sendResponse({
        farewell: "eventPage says goodbye!",
        data: `eventPage data time: ${currentTime}`,
      });
    }
  })();

  // onMessage must return "true" if response is async.
  return true;
});

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (msg) => {
    if (msg.contentMounted) {
      console.log("eventPage notified that content.ts has mounted.");
      try {
        let data = await longFetch();
        console.log("eventPage fetched data:", data);
        port.postMessage({ farewell: "eventPage says goodbye!", data: data });
      } catch (error) {
        console.error(error);
      }
    }
  });
});

async function longFetch() {
  console.log("Fetching data");
  // sleep for 3 seconds to simulate async fetch
  await new Promise((resolve) => setTimeout(resolve, 3000));
  console.log("Data fetched");
  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return `fetched at ${currentTime}`;
}
