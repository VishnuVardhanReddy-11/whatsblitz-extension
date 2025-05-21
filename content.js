console.log("WhatsBlitz content script injected.");

function waitForWhatsAppReady() {
  const messageBox = document.querySelector('[contenteditable="true"]');
  if (messageBox) {
    console.log("WhatsApp Web is ready!");
  } else {
    setTimeout(waitForWhatsAppReady, 1000);
  }
}

waitForWhatsAppReady();
