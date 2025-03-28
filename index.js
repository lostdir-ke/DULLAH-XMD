
const { default: makeWASocket, useMultiFileAuthState, Browsers, makeInMemoryStore } = require("@whiskeysockets/baileys");
const { zokou } = require("./framework/zokou");
const fs = require("fs");
const path = require("path");
const pino = require("pino");
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });

async function loadCommands() {
  const commandsDir = path.join(__dirname, "dullah");
  const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    try {
      const commandPath = path.join(commandsDir, file);
      if (fs.existsSync(commandPath)) {
        delete require.cache[require.resolve(commandPath)];
        require(commandPath);
        console.log(`✅ ${file} loaded successfully!`);
      }
    } catch (error) {
      console.error(`❌ Error loading ${file}:`, error.message);
    }
  }
}

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  
  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    browser: Browsers.macOS("Desktop"),
    logger: pino({ level: "silent" })
  });

  store.bind(sock.ev);
  await loadCommands();

  sock.ev.on("creds.update", saveCreds);
  
  return sock;
}

connectToWhatsApp();
