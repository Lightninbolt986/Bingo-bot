const locations = {
  0: [63, 118],
  1: [63, 199],
  2: [63, 280],
  3: [63, 361],
  4: [63, 442],
  5: [144, 118],
  6: [144, 199],
  7: [144, 280],
  8: [144, 361],
  9: [144, 442],
  10: [225, 118],
  11: [225, 199],
  12: [225, 361],
  13: [225, 442],
  14: [306, 118],
  15: [306, 199],
  16: [306, 280],
  17: [306, 361],
  18: [306, 442],
  19: [387, 118],
  20: [387, 199],
  21: [387, 280],
  22: [387, 361],
  23: [387, 442],
};

const gameBoards = require("../../data/boards.json");
const { createCanvas, loadImage } = require("canvas");
const {
  MessageAttachment,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  Collection,
} = require("discord.js");
const { getNumbers, getBingos } = require("../../functions");
const games = new Collection();
const row2 = new MessageActionRow().addComponents(
  new MessageButton()
    .setLabel("Show my card")
    .setStyle("SUCCESS")
    .setCustomId("showcard"),
  new MessageButton()
    .setLabel("BINGO!")
    .setStyle("SUCCESS")
    .setCustomId("bingo")
);
module.exports = {
  name: "bingo",
  description: "Start a race game",
  type: "CHAT_INPUT",
  options: [
    {
      name: "gameboard",
      description:
        "The gamepad you want to use for the game. Use /view-gameboards to view all of them.",
      type: "STRING",
      required: false,
      choices: [
        {
          name: "Blue",
          value: "blue",
        },
        {
          name: "Light blue",
          value: "lightblue",
        },
        {
          name: "Red",
          value: "red",
        },
        {
          name: "Red-orange",
          value: "redorange",
        },
        {
          name: "Yellow",
          value: "yellow",
        },
        { name: "Blue - Dark", value: "blue-dark" },
        { name: "Light blue - Dark", value: "lightlue-dark" },
        { name: "Orange - Dark", value: "orange-dark" },
        { name: "Orange yellow - Dark", value: "orangeyellow-dark" },
        { name: "Cyan - Dark", value: "cyan-dark" },
      ],
    },
    {
      name: "bingos",
      description: "Number of bingos required to win. 3 by default",
      type: "INTEGER",
      required: false,
      minValue: 1,
      maxValue: 12,
    },
    {
      name: "interval",
      description:
        "The interval between the numbers chosen (in seconds). 15s by default.",
      type: "INTEGER",
      required: false,
      minValue: 10,
      maxValue: 60,
    },
  ],
  async execute(interaction) {
    if (games.has(interaction.channel.id))
      return interaction.reply({
        content: "There is already a game ongoing in this channel.",
        ephemeral: true,
      });
    games.set(interaction.channel.id, new Collection());
    games.get(interaction.channel.id).set("round", 0);
    games.get(interaction.channel.id).set("players", new Collection());
    games.get(interaction.channel.id).set("nums", getNumbers(75, 75));
    games.get(interaction.channel.id).set("numsCalled", []);
    const board = interaction.options.getString("gameboard") || "red";
    const interval = interaction.options.getInteger("interval") || 15;
    const bingos = interaction.options.getInteger("bingos") || 3;
    const msg = await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle("BINGO!")
          .setDescription(
            "Click the button below to join the game and get a ticket."
          )
          .setFooter({ text: "Starts in 60 seconds" })
          .setImage(
            "https://media.discordapp.net/attachments/815891006255923212/975245893160816640/bingo_sign.jpg?width=351&height=234"
          ),
      ],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setStyle("SUCCESS")
            .setLabel("JOIN")
            .setCustomId("join")
        ),
      ],
      fetchReply: true,
    });
    const collector = msg.createMessageComponentCollector({ time: 60000 });
    collector.on("collect", async (int) => {
      await int.deferReply({ ephemeral: true });
      if (games.get(int.channel.id).get("players").has(int.user.id))
        return int.reply({
          content: "You have already joined the game!",
          ephemral: true,
        });
      const column1 = getNumbers(5, 15);
      const column2 = getNumbers(5, 30, 15);
      const column3 = getNumbers(4, 45, 30);
      const column4 = getNumbers(5, 60, 45);
      const column5 = getNumbers(5, 75, 60);
      let nums = [...column1, ...column2, ...column3, ...column4, ...column5];
      const canvas = createCanvas(518, 547);
      const ctx = canvas.getContext("2d");
      const image = await loadImage(gameBoards[board].url);
      ctx.drawImage(image, 0, 0);
      ctx.font = "50px Impact";
      nums = nums.map((num) =>
        num.toLocaleString("en-US", {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })
      );
      if(gameBoards[board].dark) ctx.fillStyle = 'white'
      ctx.fillText(nums[0], 77, 180);
      ctx.fillText(nums[1], 77, 260);
      ctx.fillText(nums[2], 77, 340);
      ctx.fillText(nums[3], 77, 419);
      ctx.fillText(nums[4], 77, 498);

      ctx.fillText(nums[5], 154, 180);
      ctx.fillText(nums[6], 154, 260);
      ctx.fillText(nums[7], 154, 340);
      ctx.fillText(nums[8], 154, 419);
      ctx.fillText(nums[9], 154, 498);

      ctx.fillText(nums[10], 231, 180);
      ctx.fillText(nums[11], 231, 260);
      ctx.fillText(nums[12], 231, 419);
      ctx.fillText(nums[13], 231, 498);

      ctx.fillText(nums[14], 308, 180);
      ctx.fillText(nums[15], 308, 260);
      ctx.fillText(nums[16], 308, 340);
      ctx.fillText(nums[17], 308, 419);
      ctx.fillText(nums[18], 308, 498);

      ctx.fillText(nums[19], 385, 180);
      ctx.fillText(nums[20], 385, 260);
      ctx.fillText(nums[21], 385, 340);
      ctx.fillText(nums[22], 385, 419);
      ctx.fillText(nums[23], 385, 498);
      const buffer = canvas.toBuffer();
      games
        .get(int.channel.id)
        .get("players")
        .set(int.user.id, { nums, canvas, ctx });
      const attach = new MessageAttachment(buffer);
      int.editReply({ files: [attach], ephemeral: true });
    });
    collector.on("end", () => {
      msg.components[0].components[0].disabled = true;
      msg.edit({ components: msg.components });
      if (!!!games.get(interaction.channel.id).get("players").size) {
        games.delete(interaction.channel.id);
        return interaction.followUp("Nobody joined LOL");
      }
      const ppl = games.get(interaction.channel.id).get("players").size;
      interaction.followUp({
        embeds: [
          new MessageEmbed()
            .setTitle("BINGO!")
            .setDescription(
              `${ppl} ${
                ppl === 1 ? "person" : "people"
              } joined the Bingo!\n**Participants**: ${Array.from(
                games.get(interaction.channel.id).get("players").keys()
              ).map((e) => `<@${e}>`)}`
            )
            .setImage(
              "https://media.discordapp.net/attachments/815891006255923212/975245893160816640/bingo_sign.jpg?width=351&height=234"
            ),
        ],
      });

      games.get(interaction.channel.id).set(
        "interval",
        setInterval(async () => {
          if (!games.get(interaction.channel.id).get("nums").length) {
            games.delete(interaction.channel.id);
            clearInterval(games.get(interaction.channel.id).get("interval"));
            return interaction.followUp(
              "All numbers have been drawn, nobody won ig LOL"
            );
          }
          const number = games.get(interaction.channel.id).get("nums").shift();
          games.get(interaction.channel.id).get("numsCalled").push(number);

          const component = new MessageActionRow().addComponents(
            games
              .get(interaction.channel.id)
              .get("numsCalled")
              .slice(-5)
              .reverse()
              .map((e) =>
                new MessageButton()
                  .setLabel(`${e}`)
                  .setCustomId(`${e}`)
                  .setStyle("PRIMARY")
              )
          );

          const message = await interaction.followUp({
            embeds: [
              new MessageEmbed()
                .setTitle("Bingo number drawn!")
                .setDescription(`${number} was drawn!`)
                .setFooter({
                  text: `Next number will be drawn in ${interval} seconds`,
                }),
            ],
            components: [component, row2],
            fetchReply: true,
          });
          const filter = function (i) {
            if (games.get(interaction.channel.id).get("players").has(i.user.id))
              return true;
            else
              return interaction.reply({
                content: "You arent a part of the game!",
                ephemeral: true,
              });
          };
          const collector = message.createMessageComponentCollector({
            filter,
            time: 30000,
          });
          collector.on("collect", async (i) => {
            const numClicked = i.customId;
            if (i.customId == "showcard") {
              await i.deferReply({ ephemeral: true });
              const { canvas } = games
                .get(interaction.channel.id)
                .get("players")
                .get(i.user.id);
              const buffer = canvas.toBuffer();
              const attach = new MessageAttachment(buffer);
              return i.editReply({ files: [attach], ephemeral: true });
            }
            if (i.customId == "bingo") {
              const currentBingos = getBingos(
                games.get(interaction.channel.id).get("players").get(i.user.id)
                  .nums
              );
              if (currentBingos < bingos)
                return i.reply({
                  content: `You have ${currentBingos}, you need ${bingos} to win!`,
                  ephemeral: true,
                });
              //user wins
              clearInterval(games.get(interaction.channel.id).get("interval"));

              games.delete(interaction.channel.id);
              return interaction.followUp({
                embeds: [
                  new MessageEmbed()
                    .setTitle("Bingo game ended!")
                    .setDescription(
                      `Bingo game has ended and <@${i.user.id}> has won the game! Thank you for playing.`
                    )
                    .setImage(
                      "https://media.discordapp.net/attachments/815891006255923212/975621627997986887/bingo.jpeg?width=257&height=129"
                    ),
                ],
              });
            }
            const player = games
              .get(interaction.channel.id)
              .get("players")
              .get(i.user.id);
            const numIndex = player.nums
              .map((e) => parseInt(e))
              .indexOf(parseInt(numClicked));
            if (numIndex === -1)
              return i.reply({
                content: "You don't have that number in your ticket!",
                ephemeral: true,
              });
            if (player.nums[numIndex].includes(" "))
              return i.reply({
                content: "You already marked that number in your ticket!",
                ephemeral: true,
              });
            games
              .get(interaction.channel.id)
              .get("players")
              .get(i.user.id).nums[numIndex] = `${player.nums[numIndex]} `;
            const ctx = games
              .get(interaction.channel.id)
              .get("players")
              .get(i.user.id).ctx;
            const tick = await loadImage(
              "https://media.discordapp.net/attachments/726083288170627125/975720729544916992/e.png?width=75&height=75"
            );
            ctx.drawImage(tick, locations[numIndex][0], locations[numIndex][1]);
            const buffer = ctx.canvas.toBuffer();
            const attach = new MessageAttachment(buffer);
            i.reply({ files: [attach], ephemeral: true });
          });
          collector.on("end", () => {
            message.edit({
              components: message.components.map((e) => {
                e.components = e.components.map((i) => {
                  i.disabled = true;
                  return i;
                });
                return e;
              }),
            });
          });
        }, interval * 1000)
      );
    });
  },
};
