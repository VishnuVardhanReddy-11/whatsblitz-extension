console.log("🚀 WhatsBlitz content script loaded on WhatsApp Web");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "SEND_MESSAGES") {
    startSendingMessages(request.contacts)
      .then(() => sendResponse({ status: "completed" }))
      .catch(err => sendResponse({ status: "error", error: err.message }));
    return true;
  }
});

async function startSendingMessages(contacts) {
  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    const number = contact.number?.toString().trim();
    let message = contact.message?.toString();

    if (!number || !message) {
      console.warn("⚠ Skipping invalid contact:", contact);
      continue;
    }

    // Replace placeholders
    if (contact.name) {
      message = message.replace(/\{\{name\}\}/g, contact.name);
    }

    console.log(➡ Navigating to chat with ${number}...);
    await navigateToChat(number, message);

    const messageBox = await waitForElement("[contenteditable='true'][data-tab]", 30000);
    if (!messageBox) {
      console.error(❌ Could not find message box for ${number});
      continue;
    }

    await setInputValue(messageBox, message);

    const sendButton = await waitForElement("button[data-testid='compose-btn-send']", 10000);
    if (sendButton) {
      sendButton.click();
      console.log(✅ Sent message to ${number} (${i + 1}/${contacts.length}));
    } else {
      console.error(❌ Send button not found for ${number});
    }

    // Random delay
    const delayMs = 5000 + Math.floor(Math.random() * 10000);
    console.log(⏳ Waiting ${delayMs / 1000}s before next...);
    await delay(delayMs);
  }

  console.log("✅ Finished sending all messages.");
}

async function navigateToChat(phone, message) {
  const url = https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)};
  window.location.assign(url);
  await waitForElement("[data-testid='conversation-info-header']", 15000);
}

function waitForElement(selector, timeout = 10000) {
  return new Promise(resolve => {
    const interval = 500;
    let elapsed = 0;

    const check = () => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      elapsed += interval;
      if (elapsed >= timeout) return resolve(null);
      setTimeout(check, interval);
    };

    check();
  });
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function setInputValue(el, text) {
  try {
    await navigator.clipboard.writeText(text);
    el.focus();
    document.execCommand('paste');
  } catch {
    el.textContent = text;
    el.dispatchEvent(new InputEvent('input', { bubbles: true }));
  }
}