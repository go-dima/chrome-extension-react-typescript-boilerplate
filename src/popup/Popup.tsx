import React, { useEffect } from "react";
import "./Popup.css";

const Popup = () => {
  useEffect(() => {
    // Example of how to send a message to eventPage.ts.
    chrome.runtime.sendMessage({ popupMounted: true });
  }, []);

  return (
    <div className="popupComponent">
      <header className="popupHeader">
        <a>
          <button
            onClick={() => {
              chrome.tabs.create({
                url: "https://app.kodemsecurity.com",
              });
            }}>
            Open Kodem
          </button>
        </a>
      </header>
    </div>
  );
};

export default Popup;
