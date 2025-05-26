let parsedContacts = [];
let sendingInProgress = false;
let cancelSending = false;
let messageLog = [];

const fileInput = document.getElementById('fileInput');
const tableContainer = document.getElementById('tableContainer');
const sendBtn = document.getElementById('sendMessagesBtn');
const cancelBtn = document.getElementById('cancelBtn');
const downloadLogBtn = document.getElementById('downloadLogBtn');
const logStatus = document.getElementById('logStatus');

fileInput.addEventListener('change', (event) => {
  resetState();
  const file = event.target.files[0];
  if (!file) return;

  if (file.name.endsWith('.csv')) {
    parseCSV(file);
  } else if (file.name.endsWith('.xlsx')) {
    parseXLSX(file);
  } else {
    alert('Unsupported file format. Please upload a .csv or .xlsx file.');
  }
});

function resetState() {
  cancelSending = false;
  sendingInProgress = false;
  messageLog = [];
  parsedContacts = [];
  tableContainer.innerHTML = '';
  logStatus.textContent = '';
  updateUIState();
}

function updateUIState() {
  sendBtn.disabled = sendingInProgress || parsedContacts.length === 0;
  cancelBtn.disabled = !sendingInProgress;
  downloadLogBtn.disabled = messageLog.length === 0;
}

cancelBtn.addEventListener('click', () => {
  if (sendingInProgress) {
    cancelSending = true;
    logStatus.textContent = 'Cancel requested...';
  }
});

downloadLogBtn.addEventListener('click', () => {
  if (messageLog.length === 0) {
    alert('No message logs to download.');
    return;
  }
  downloadCSVLog();
});

sendBtn.addEventListener('click', () => {
  if (sendingInProgress) return;
  cancelSending = false;
  sendingInProgress = true;
  updateUIState();
  messageLog = [];
  logStatus.textContent = '';

  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (!tabs.length) {
      alert('No active tab found.');
      sendingInProgress = false;
      updateUIState();
      return;
    }
    const tabId = tabs[0].id;
    const url = tabs[0].url;

    if (!url.includes('https://web.whatsapp.com/')) {
      alert('Please open WhatsApp Web in the active tab before sending messages.');
      sendingInProgress = false;
      updateUIState();
      return;
    }

    try {
      // Inject sidebar UI for Day 5
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['sidebar.js']
      });

      for (let i = 0; i < parsedContacts.length; i++) {
        if (cancelSending) {
          addLog(parsedContacts[i], 'Cancelled by user');
          break;
        }

        const contact = parsedContacts[i];
        const personalizedMessage = replacePlaceholders(contact.Message || contact.message || '', contact);

        const response = await sendMessageToContentScript(tabId, {
          Name: contact.Name || contact.name || '',
          Number: contact.Number || contact.number || '',
          Message: personalizedMessage
        });

        if (response.status === "completed") {
          addLog(contact, 'Success');
        } else {
          addLog(contact, `Failed: ${response.error || 'Unknown error'}`);
        }
        updateLogStatus(i + 1, parsedContacts.length);

        // Random delay 5-15 seconds (Day 4)
        const delayMs = Math.floor(Math.random() * 11000) + 5000;
        await new Promise(r => setTimeout(r, delayMs));
      }

      alert('Message sending completed. You can download the message log now.');
    } catch (err) {
      alert('Failed to inject or communicate with content script: ' + err.message);
    }
    sendingInProgress = false;
    updateUIState();
  });
});

function replacePlaceholders(message, contact) {
  return message.replace(/\{\{(.*?)\}\}/g, (match, p1) => {
    const key = p1.trim();
    return contact[key] || match;
  });
}

function sendMessageToContentScript(tabId, contact) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, {
      type: "SEND_SINGLE_MESSAGE",
      contact: contact
    }, (response) => {
      if (chrome.runtime.lastError) {
        resolve({ status: "error", error: chrome.runtime.lastError.message });
        return;
      }
      if (!response) {
        resolve({ status: "error", error: "No response from content script" });
        return;
      }
      resolve(response);
    });
  });
}

function addLog(contact, status) {
  messageLog.push({
    Name: contact.Name || contact.name || '',
    Number: contact.Number || contact.number || '',
    Message: contact.Message || contact.message || '',
    Status: status,
    Timestamp: new Date().toISOString()
  });
  localStorage.setItem('whatsblitzMessageLog', JSON.stringify(messageLog));
}

function updateLogStatus(current, total) {
  logStatus.textContent = `Sending message ${current} of ${total}...`;
}

function downloadCSVLog() {
  const headers = ['Name', 'Number', 'Message', 'Status', 'Timestamp'];
  const rows = messageLog.map(log => headers.map(h => `"${(log[h] || '').replace(/"/g, '""')}"`).join(','));
  const csvContent = [headers.join(','), ...rows].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'WhatsBlitz_MessageLog.csv';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function parseCSV(file) {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      parsedContacts = results.data;
      displayTable(parsedContacts);
      updateUIState();
    },
    error: function(err) {
      alert('Error parsing CSV: ' + err.message);
    }
  });
}

function parseXLSX(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    parsedContacts = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    displayTable(parsedContacts);
    updateUIState();
  };
  reader.onerror = function() {
    alert('Error reading Excel file');
  };
  reader.readAsArrayBuffer(file);
}

function displayTable(data) {
  if (!data || data.length === 0) {
    tableContainer.innerHTML = '<p>No data found in file.</p>';
    sendBtn.disabled = true;
    return;
  }

  let html = '<table><thead><tr><th>Name</th><th>Number</th><th>Message</th></tr></thead><tbody>';
  data.forEach(row => {
    const name = row.Name || row.name || '';
    const number = row.Number || row.number || '';
    const message = row.Message || row.message || '';
    html += `<tr><td>${escapeHtml(name)}</td><td>${escapeHtml(number)}</td><td>${escapeHtml(message)}</td></tr>`;
  });
  html += '</tbody></table>';

  tableContainer.innerHTML = html;
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
}
