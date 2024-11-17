let requestCount = 0;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "updateCount") {
    requestCount = message.count;
    console.log(`Background updated count to: ${requestCount}`);
    // Send the updated count to the popup
    chrome.runtime.sendMessage({ type: "updatePopup", count: requestCount });
  }

  if (message.type === "getCount") {
    sendResponse({ count: requestCount });
  }
});
