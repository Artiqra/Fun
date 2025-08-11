// 🔒 Terminal Password Lock
(function () {
  const correctPassword = "laka1212";
  let isAuthenticated = false;

  while (!isAuthenticated) {
    const pass = prompt("🔐 Enter terminal password to proceed:");
    if (pass === null) {
      alert("Access cancelled.");
      window.location.href = "https://google.com";
      return;
    }
    if (pass === correctPassword) {
      isAuthenticated = true;
      break;
    } else {
      alert("❌ Incorrect password. Try again.");
    }
  }
})();

// Terminal & Assistant
const output = document.getElementById('output');
const input = document.getElementById('command-input');
const assistantOutput = document.getElementById('assistant-output');

// Command History
let history = [];
let historyIndex = -1;

// Add line to terminal output
function print(text) {
  output.innerHTML += text + '\n';
  output.scrollTop = output.scrollHeight;
}

// Update assistant panel
function updateAssistant(text) {
  assistantOutput.innerHTML += `<br>> ${text}`;
  assistantOutput.scrollTop = assistantOutput.scrollHeight;
}

// Handle command input
input.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    const cmd = input.value.trim();
    history.push(cmd);
    historyIndex = history.length;

    print(`[>] ${cmd}`);
    input.value = '';

    await handleCommand(cmd.toLowerCase());
  }

  // Command history navigation
  if (e.key === 'ArrowUp' && history[historyIndex - 1] !== undefined) {
    historyIndex--;
    input.value = history[historyIndex];
  }
  if (e.key === 'ArrowDown') {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      input.value = history[historyIndex];
    } else {
      input.value = '';
      historyIndex = history.length;
    }
  }
});

// Command Processor
async function handleCommand(cmd) {
  if (cmd === '' || cmd === 'clear') {
    output.innerHTML = '';
    return;
  }

  if (cmd === 'help') {
    print(`
Available commands:
  help                - Show this help
  connect gmail       - Sign in to Gmail
  read emails         - List recent emails
  ask gemini <q>      - Ask AI anything (fast)
  gemini <q>          - Short version
  clear               - Clear terminal
  apps                - List available apps
`);
    return;
  }

  // === GMAIL COMMANDS ===
  if (cmd === 'connect gmail') {
    gapi.load('client:auth2', initGapi);
    print('[>] Loading Gmail API...');
    return;
  }

  if (cmd === 'read emails' && window.gapi) {
    await listEmails();
    return;
  }

  if (cmd === 'show progress') {
    updateAssistant('Monitoring system... All systems nominal.');
    print('[>] Assistant status: Active');
    return;
  }

  if (cmd === 'apps') {
    print(`
Installed Apps:
  - Email Reader
  - Progress Tracker
  - Gemini Flash AI (Fast & Free)
  - Task Manager (coming soon)

Use: add app <name> to install
`);
    return;
  }

  // === GEMINI 1.5 FLASH: Fast, Free, Lightweight AI ===
  if (cmd.startsWith('ask gemini ') || cmd.startsWith('gemini ')) {
    const query = cmd.replace(/^(ask gemini |gemini )/, '').trim();
    if (!query) {
      print('[!] Usage: ask gemini <question>');
      return;
    }

    print(`[>] Asking AI: "${query}"...`);
    updateAssistant(`Querying Gemini Flash...`);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDOqzVfYxJCepOfe1cmOHG9bK0tVqAOYlQ`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: query }] }]
          })
        }
      );

      const data = await response.json();

      if (data.error) {
        print(`[!] AI Error: ${data.error.message}`);
        return;
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
      print(`[AI] ${text.replace(/\n/g, '<br>')}`);
      updateAssistant("AI responded.");
    } catch (err) {
      print(`[!] Request failed: ${err.message}`);
    }
    return;
  }

  // Unknown command
  print(`[!] Command not recognized: ${cmd}`);
}

// === GMAIL: Google API Setup ===
function initGapi() {
  gapi.client.init({
    apiKey: 'AIzaSyAICfMFKJbSi1DK6Nshop7IqFOdswI2Ap8',
    clientId: 'YOUR_CLIENT_ID', // ← Replace with your OAuth Client ID
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
    scope: 'https://www.googleapis.com/auth/gmail.readonly'
  }).then(() => {
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  });
}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    print('[>] Gmail: Signed in');
    updateAssistant('Gmail connected. Ready to read emails.');
  } else {
    print('[>] Gmail: Not signed in');
    gapi.auth2.getAuthInstance().signIn();
  }
}

async function listEmails() {
  const auth = gapi.auth2.getAuthInstance();
  if (!auth.isSignedIn.get()) {
    print('[>] Please sign in first: connect gmail');
    return;
  }

  try {
    const res = await gapi.client.gmail.users.messages.list({
      userId: 'me',
      maxResults: 5
    });

    const messages = res.result.messages;
    if (!messages || messages.length === 0) {
      print('[>] No recent emails.');
      return;
    }

    print('[>] Recent Emails:');
    for (let msg of messages) {
      const full = await gapi.client.gmail.users.messages.get({
        userId: '
