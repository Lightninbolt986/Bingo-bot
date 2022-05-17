const gameBoards = require("../../data/boards.json");
const { MessageEmbed } = require("discord.js");
const { paginate } = require("../../functions");
module.exports = {
  name: "view-gameboards",
  description: "View the various game boards",
  type: "CHAT_INPUT",
  async execute(interaction) {
    let embeds = Object.values(gameBoards).map((e) => {
      const embed = new MessageEmbed()
        .setTitle(`${e.name} Board`)
        .setImage(e.url)
        .setColor(e.hex);
      return embed;
    });
    paginate(embeds, interaction);
  },
};
