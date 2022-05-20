const { MessageEmbed } = require("discord.js");
module.exports = async (Discord, client, guild) => {
  const channels = guild.channels.cache.filter((ch) =>
    ch.permissionsFor(guild.me).has("SEND_MESSAGES")
  );
  const channel =
    channel.find(
      (ch) =>
        ch.name.toLowerCase().includes("general") ||
        ch.name.toLowerCase().includes("lounge") ||
        ch.name.toLowerCase().includes("chat")
    ) || channels.first();
  if (!channel) return;
  channel.send({
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: "Bingo Bot",
          iconURL: client.user.displayAvatarURL(),
        })
        .setColor("RANDOM")
        .setTitle("Thanks for inviting me")
        .setDescription(
          "My only purpose in life is to host a BINGO! game that you enjoy. To get started and help me fullfill my life's purpose, start by running /bingo."
        ),
    ],
  });
};
