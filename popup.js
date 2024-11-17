const countDisplay = document.getElementById('count');
const startButton = document.getElementById('start');

// Update the count in the popup
function updateCountDisplay(count) {
  countDisplay.innerText = count;
}

startButton.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ['content.js']
    });
  });
});

// Listen for updates from the background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'updatePopup') {
    console.log(`count received : ${message.count}`);
    updateCountDisplay(message.count);
  }
});

// Fetch initial count from background when the popup is opened
chrome.runtime.sendMessage({ type: 'getCount' }, (response) => {
  if (response && response.count !== undefined) {
    updateCountDisplay(response.count);
  }
});
