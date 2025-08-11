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

const output = document.getElementById('output');
const input = document.getElementById('command-input');
const assistantOutput = document.getElementById('assistant-output');

let history = [];
let historyIndex = -1;

function print(text) {
  output.innerHTML += text + '\n';
  output.scrollTop = output.scrollHeight;
}

function updateAssistant(text) {
  assistantOutput.innerHTML += `<br>> ${text}`;
  assistantOutput.scrollTop = assistantOutput.scrollHeight;
}

input.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    const cmd = input.value.trim();
    history.push(cmd);
    historyIndex = history.length;

    print(`[>] ${cmd}`);
    input.value = '';

    await handleCommand(cmd.toLowerCase());
  }

  if (e.key === 'ArrowUp' && history[historyIndex - 1]) {
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

async function handleCommand(cmd) {
  if (cmd === '' || cmd === 'clear') {
    output.innerHTML = '';
    return;
  }

  if (cmd === 'help') {
    print(`
Available commands:
  help            - Show this help
  connect gmail   - Sign in to Gmail
  read emails     - List recent emails
  show progress   - Show assistant progress
  clear           - Clear terminal
  apps            - List available apps
`);
    return;
  }

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
  - Task Manager (coming soon)
  - File Sync (coming soon)

Use: add app <name> to install
`);
    return;
  }

  if (cmd.startsWith('add app')) {
    const appName = cmd.replace('add app ', '');
    updateAssistant(`App '${appName}' queued for installation...`);
    print(`[>] Installing '${appName}'... (Feature coming soon)`);
    return;
  }

  print(`[!] Command not recognized: ${cmd}`);
}

function initGapi() {
  gapi.client.init({
    apiKey: 'AIzaSyAICfMFKJbSi1DK6Nshop7IqFOdswI2Ap8',
    clientId: 'YOUR_CLIENT_ID', // ← REPLACE THIS!
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
        userId: 'me',
        id: msg.id
      });

      const headers = full.result.payload.headers;
      const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
      const subject = headers.find(h => h.name === 'Subject')?.value || '(No Subject)';
      print(`  From: ${from}`);
      print(`  Subject: ${subject}`);
      print(`  ———————`);
    }
  } catch (err) {
    print(`[!] Error: ${err.message}`);
  }
}
