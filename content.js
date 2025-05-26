console.log('🚀 WhatsBlitz content script loaded on WhatsApp Web');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SEND_SINGLE_MESSAGE") {
    typeMessageOnly(message.contact).then(
      () => sendResponse({ status: "completed" }),
      (err) => sendResponse({ status: "error", error: err.message || err.toString() })
    );
    return true; // Keep message channel open for async response
  }
});

async function typeMessageOnly(contact) {
  if (!contact || !contact.Number) {
    throw new Error("Invalid contact or missing number");
  }

  const number = formatNumber(contact.Number);
  if (!number) {
    throw new Error("Invalid phone number format");
  }

  const messageText = contact.Message || '';

  // Navigate WhatsApp Web to the chat with phone number
  window.location.href = `https://web.whatsapp.com/send?phone=${number}`;

  // Wait for the chat and input box to load
  await waitForChatLoad();

  // Type the message inside input box (do NOT send)
  await typeMessage(messageText);

  // Wait briefly before finishing
  await delay(1000);
}

function formatNumber(number) {
  let num = number.toString().replace(/\D/g, '');
  if (!num) return null;
  return num;
}

function waitForChatLoad() {
  return new Promise((resolve, reject) => {
    let tries = 0;
    const maxTries = 40; // up to 20 seconds
    const interval = setInterval(() => {
      const chatInput = document.querySelector('[contenteditable="true"][data-tab="10"]');
      if (chatInput) {
        clearInterval(interval);
        resolve();
      } else if (tries++ >= maxTries) {
        clearInterval(interval);
        reject(new Error('Chat input box did not load in time'));
      }
    }, 500);
  });
}

function typeMessage(message) {
  return new Promise((resolve, reject) => {
    try {
      const chatInput = document.querySelector('[contenteditable="true"][data-tab="10"]');
      if (!chatInput) return reject(new Error('Chat input box not found'));

      chatInput.focus();

      // Clear any existing content
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);

      // Insert message text
      chatInput.textContent = message;

      // Dispatch input event so WhatsApp UI updates
      chatInput.dispatchEvent(new InputEvent('input', { bubbles: true }));

      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
