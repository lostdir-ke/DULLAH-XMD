
const { zokou } = require("../framework/zokou");
const { cm } = require("../framework/zokou");

zokou(
  {
    name: "menu",
    category: "General",
    desc: "Display available commands",
    react: "📜"
  },
  async (origineMessage, zk) => {
    try {
      let categories = {};
      
      // Group commands by category
      for (let command of cm) {
        if (!categories[command.categorie]) {
          categories[command.categorie] = [];
        }
        categories[command.categorie].push(command.name);
      }

      // Build menu text
      let menuText = "*📜 DULLAH-XMD COMMAND MENU 📜*\n\n";
      
      for (let category in categories) {
        menuText += `*『 ${category.toUpperCase()} 』*\n`;
        for (let cmd of categories[category]) {
          menuText += `│ ⭔ .${cmd}\n`;
        }
        menuText += "\n";
      }

      menuText += "\n*Use .help <command> for detailed info*";

      await zk.reply(menuText);
      
    } catch (error) {
      console.error("Menu error:", error);
      await zk.reply("Error generating menu");
    }
  }
);
