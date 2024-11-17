(function () {
  let connectionCount = 0;
  let isSendingRequests = false;
  let requestTimeouts = []; // To store timeouts so they can be cleared when stopping

  // Ensure overlay is created only once
  function createOverlay() {
    const existingOverlay = document.getElementById("linkedin-overlay");
    if (existingOverlay) return; // Don't create a new overlay if one already exists

    const overlay = document.createElement("div");
    overlay.id = "linkedin-overlay";
    overlay.style.position = "fixed";
    overlay.style.bottom = "10px";
    overlay.style.left = "10px";
    overlay.style.width = "200px";
    overlay.style.height = "200px";
    overlay.style.backgroundColor = "#fff";
    overlay.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    overlay.style.zIndex = "10000";
    overlay.style.borderRadius = "8px";
    overlay.style.padding = "10px";
    overlay.style.fontFamily = "Arial, sans-serif";

    overlay.innerHTML = `
      <div style="text-align: center;">
        <div class="spinner" id="spinner" style="margin: auto; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div> <!-- Spinner with animation -->
        <div class="count" id="overlay-count" style="margin-top: 10px; font-size: 20px; font-weight: bold;">0</div>
        <button id="start" style="margin-top: 10px; padding: 10px 20px; font-size: 16px; background-color: #3498db; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Start Sending Requests</button>
        <button id="stop" style="margin-top: 10px; padding: 10px 20px; font-size: 16px; background-color: #e74c3c; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Stop Sending Requests</button>
      </div>
    `;

    document.body.appendChild(overlay);

    const startButton = document.getElementById("start");
    const stopButton = document.getElementById("stop");

    startButton.addEventListener("click", () => {
      startSendingRequests();
    });

    stopButton.addEventListener("click", () => {
      stopSendingRequests();
    });
  }

  // Function to update the overlay count
  function updateOverlayCount(count) {
    const overlayCountDisplay = document.getElementById("overlay-count");
    if (overlayCountDisplay) {
      overlayCountDisplay.innerText = count;
    }
  }

  // Function to start sending requests sequentially
  function startSendingRequests() {
    if (isSendingRequests) return; // Prevent starting multiple request processes
    isSendingRequests = true;
    connectionCount = 0; // Reset count when starting
    requestTimeouts = []; // Reset timeouts

    // Start the spinner
    const spinner = document.getElementById("spinner");
    if (spinner) {
      spinner.style.animation = "spin 1s linear infinite"; // Ensure spinner starts spinning
    }

    const connectButtons = Array.from(
      document.querySelectorAll("button")
    ).filter((button) => button.innerText.includes("Connect"));

    let index = 0;

    function clickConnectButton() {
      if (!isSendingRequests || index >= connectButtons.length) {
        console.log(
          "All connection requests on this page have been sent or stopped."
        );
        return;
      }

      connectButtons[index].click();
      console.log(`Clicked connect button ${index + 1}`);

      setTimeout(() => {
        // Check if the "Add a note" screen appears
        const sendButton = document.querySelector(
          'button[aria-label="Send now"]'
        );
        if (sendButton) {
          sendButton.click();
          connectionCount++;
          console.log(`Connection requests sent: ${connectionCount}`);

          // Send updated count to popup
          chrome.runtime.sendMessage({
            type: "updateCount",
            count: connectionCount,
          });

          // Send updated count to overlay
          updateOverlayCount(connectionCount);
        } else {
          // If the "Add a note" screen does not appear, we directly click the send button (if it's available)
          const noNoteSendButton = document.querySelector(
            'button[aria-label="Send without a note"]'
          );
          if (noNoteSendButton) {
            noNoteSendButton.click();
            connectionCount++;
            console.log(`Connection requests sent: ${connectionCount}`);

            // Send updated count to popup
            chrome.runtime.sendMessage({
              type: "updateCount",
              count: connectionCount,
            });

            // Send updated count to overlay
            updateOverlayCount(connectionCount);
          }
        }

        index++;
        const timeoutId = setTimeout(clickConnectButton, 2000); // Delay between requests
        requestTimeouts.push(timeoutId); // Store timeout to be cleared if stopping
      }, 2000);
    }

    clickConnectButton();
  }

  // Function to stop sending requests
  function stopSendingRequests() {
    isSendingRequests = false;

    // Stop the spinner
    const spinner = document.getElementById("spinner");
    if (spinner) {
      spinner.style.animation = "none"; // Stop spinner animation
    }

    // Clear all timeouts that are pending
    requestTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    console.log("Sending requests stopped.");
  }

  createOverlay();

  // CSS for spinner animation (added @keyframes and style)
  const style = document.createElement("style");
  style.innerHTML = `
    /* Spinner Rotation Animation */
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
})();
