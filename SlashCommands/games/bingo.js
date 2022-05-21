// settings contants suck as locations of crosses on card and the rows. games variable stores all games across guilds
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
const {
  getNumbers,
  getBingos,
  arrayEquals,
  formatArray,
  ttsNumber,
} = require("../../functions");
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
const row3 = new MessageActionRow().addComponents(
  new MessageButton()
    .setLabel("End the game")
    .setStyle("DANGER")
    .setCustomId("end"),
  new MessageButton()
    .setLabel("Cancel the game")
    .setStyle("DANGER")
    .setCustomId("cancel")
);
module.exports = {
  name: "bingo",
  description: "Start a bingo game",
  type: "CHAT_INPUT",
  //setting options for game
  options: [
    {
      name: "gameboard",
      description:
        "The gamepad you want to use for the game. Use /view-gameboards to view all of them.",
      type: "STRING",
      required: false,
      choices: [
        { name: "Blue", value: "blue" },
        { name: "Light blue", value: "lightblue" },
        { name: "Red", value: "red" },
        { name: "Red-orange", value: "redorange" },
        { name: "Yellow", value: "yellow" },
        { name: "Blue - Dark", value: "blue-dark" },
        { name: "Cyan - Dark", value: "cyan-dark" },
        { name: "Light blue - Dark", value: "lightlue-dark" },
        { name: "Orange - Dark", value: "orange-dark" },
        { name: "Orange yellow - Dark", value: "orangeyellow-dark" },
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
    {
      name: "text-to-speech",
      description:
        "Enable text to speech number calling and announcing game winner. On by default",
      type: "BOOLEAN",
      requried: false,
    },
  ],
  async execute(interaction) {
    if (games.has(interaction.channel.id))
      return interaction.reply({
        content: "There is already a game ongoing in this channel.",
        ephemeral: true,
      });
    //Setting necessary variables in global games
    games.set(interaction.channel.id, new Collection());
    games.get(interaction.channel.id).set("players", new Collection());
    games.get(interaction.channel.id).set("nums", getNumbers(75, 75));
    games.get(interaction.channel.id).set("numsCalled", []);
    games.get(interaction.channel.id).set("host", interaction.user.id);
    //getting specified settings
    const board = interaction.options.getString("gameboard") || "red";
    const interval = interaction.options.getInteger("interval") || 15;
    const bingos = interaction.options.getInteger("bingos") || 3;
    const tts = interaction.options.getBoolean("text-to-speech") || true;
    const msg = await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle("BINGO!")
          .setDescription(
            "Click the button below to join the game and get a ticket. Game starts <t:" +
              Math.floor((Date.now() + 2 * 60 * 1000) / 1000) +
              ":R>"
          )
          .setColor(gameBoards[board].hex)
          .addFields(
            {
              name: "Card rules",
              value:
                "The card consists of 5 columns, each represented by a letter of the word BINGO. The B column has 5 cells, each with a random number from 1-15, I column with random numbers from 16-30 and so on. The only exception is N column with 5 cells, however only 4 remaining empty ones as the middle is a free space. Same number cant appear in a ticket twice.",
            },
            {
              name: "Getting a BINGO",
              value:
                "You get a BINGO when you cross out all the numbers in a row, column or diagnol. The center peice (free space) is considered as a crossed out space. Once you get required number of bingos, you can press the bingo button to win the game.",
            },
            {
              name: "Number calling and crossing out",
              value:
                "Once the game starts, numbers are randomly called out after the pre-specified interval. If the number is in your ticket, You can cross it out by clicking the respective button. You can get your latest card by pressing th corresponding button. ",
            },
            {
              name: "Timeout",
              value:
                "The button expires 30 seconds after being sent. Thirty seconds after the fifth turn after the number is called, it can no longer be crossed off. This means that you need to be active throughout the game to maximize your chances of winning.",
            },
            {
              name: "Information for hosts",
              value:
                "The cancel button stop the game immediately, thats it. The end button calculates the current winner(s) and announces them the winner.",
            }
          )
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
    //2 minutes for users to read through the rules
    const collector = msg.createMessageComponentCollector({ time: 120000 });
    collector.on("collect", async (int) => {
      //user joining the game
      await int.deferReply({ ephemeral: true });
      if (games.get(int.channel.id).get("players").has(int.user.id))
        return int.editReply({
          content: "You have already joined the game!",
          ephemral: true,
        });
      //generate numbers in each column separately due to diff range
      const column1 = getNumbers(5, 15);
      const column2 = getNumbers(5, 30, 15);
      const column3 = getNumbers(4, 45, 30);
      const column4 = getNumbers(5, 60, 45);
      const column5 = getNumbers(5, 75, 60);
      //Merging the columns
      let nums = [...column1, ...column2, ...column3, ...column4, ...column5];
      //creating the canvas
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
      if (gameBoards[board].dark) ctx.fillStyle = "white";
      //writing the numbers on the board
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
      //saving the player info incuding card for future reference
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
      //generate a description that can ensure that infinite number of players can play the game
      let temp = 0;
      const players = Array.from(
        games.get(interaction.channel.id).get("players").keys()
      ).map((r) => {
        if (temp <= 900) {
          temp = temp + `<@${r}>`.length;
          return `<@${r}>`;
        } else return undefined;
      });
      let finalPlayers = players
        .filter((e) => {
          return e;
        })
        .slice(0, -1)
        .join(" ");
      if (
        players.filter((e) => {
          return !e;
        }).length
      )
        finalPlayers =
          finalPlayers +
          ` + ${
            players.filter((e) => {
              return !e;
            }).length
          } more`;

      interaction.followUp({
        embeds: [
          new MessageEmbed()
            .setTitle("BINGO!")
            .setColor(gameBoards[board].hex)
            .setDescription(
              `${ppl} ${
                ppl === 1 ? "person" : "people"
              } joined the Bingo!\n**Participants**: ${finalPlayers}`
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
            //After all numbers are called
            games.delete(interaction.channel.id);
            clearInterval(games.get(interaction.channel.id).get("interval"));
            return interaction.followUp(
              "All numbers have been drawn, nobody won ig LOL"
            );
          }
          //the called number
          const number = games.get(interaction.channel.id).get("nums").shift();
          games.get(interaction.channel.id).get("numsCalled").push(number);
          //generate button for latest numbers called (max 5)
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
          //draw number
          const message = await interaction.followUp({
            embeds: [
              new MessageEmbed()
                .setTitle("Bingo number drawn!")
                .setColor(gameBoards[board].hex)
                .setDescription(`${number} was drawn!`)
                .setFooter({
                  text: `Next number will be drawn in ${interval} seconds`,
                }),
            ],
            components: [component, row2, row3],
            fetchReply: true,
          });

          if (tts)
            //send a temp message if tts is enabled so that people can hear the nuber being called
            message.channel
              .send({
                content: `Bingo number drawn. ${ttsNumber(number)}`,
                tts: true,
              })
              .then((e) =>
                setTimeout(() => {
                  e.delete();
                }, 15000)
              );
          const filter = function (i) {
            if (games.get(interaction.channel.id).get("players").has(i.user.id))
              return true;
            else
              return interaction.editReply({
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
              //use the saved canvas to send the card
              await i.deferReply({ ephemeral: true });
              const { canvas } = games
                .get(interaction.channel.id)
                .get("players")
                .get(i.user.id);
              const buffer = canvas.toBuffer();
              const attach = new MessageAttachment(buffer);
              return i.editReply({ files: [attach], ephemeral: true });
            } else if (i.customId == "bingo") {
              //check number of bingos user has
              const currentBingos = getBingos(
                games.get(interaction.channel.id).get("players").get(i.user.id)
                  .nums
              );
              //comparing it with the numebr of bingos required by the host to win
              if (currentBingos < bingos)
                return i.reply({
                  content: `You have ${currentBingos} bingos, you need ${bingos} to win!`,
                  ephemeral: true,
                });
              //user wins
              clearInterval(games.get(interaction.channel.id).get("interval"));

              games.delete(interaction.channel.id);
              if (tts)
                interaction.channel
                  .send({
                    content: `<@${i.user.id}> has won the bingo game`,
                    tts: true,
                  })
                  .then((e) =>
                    setTimeout(() => {
                      e.delete();
                    }, 15000)
                  );
              return interaction.followUp({
                embeds: [
                  new MessageEmbed()
                    .setColor(gameBoards[board].hex)
                    .setTitle("Bingo game ended!")
                    .setDescription(
                      `Bingo game has ended and <@${i.user.id}> has won the game! Thank you for playing.`
                    )
                    .setImage(
                      "https://i.gifer.com/origin/fa/fad5c76dcd3d90f7f3577df70efda285_w200.gif"
                    ),
                ],
              });
            } else if (i.customId == "end") {
              if (games.get(interaction.channel.id).get("host") !== i.user.id) {
                return i.reply({
                  content: "You are not the host!",
                  ephemeral: true,
                });
              }
              let row = [
                {
                  type: 1,
                  components: [
                    {
                      type: 2,
                      style: "PRIMARY",
                      custom_id: "Y",
                      label: "Yes",
                    },
                    {
                      type: 2,
                      style: "DANGER",
                      custom_id: "N",
                      label: "No",
                    },
                  ],
                },
              ];

              const mssg = await i.reply({
                content: `${i.user}, are you sure you want to end this game?`,
                components: row,
                fetchReply: true,
              });
              const colector = mssg.createMessageComponentCollector({
                componentType: "BUTTON",
                time: 30000,
              });

              colector.on("collect", async (ii) => {
                if (ii.user.id === i.user.id) {
                  if (ii.customId == "Y") {
                    //figure out who is currently winning
                    colector.stop("e");
                    const winners = games
                      .get(interaction.channel.id)
                      .get("players")
                      .sort((a, b) => getBingos(b.nums) - getBingos(a.nums));
                    const topBingo = getBingos(winners.first().nums);
                    const topBingoPeople = winners.filter(
                      (e) => getBingos(e.nums) >= topBingo
                    );
                    let description = "";
                    if (topBingoPeople.size === 1)
                      //if there is clear winner with highest number of bingos
                      description = `<@${
                        [...topBingoPeople.keys()][0]
                      }> had ${topBingo} bingos. As they had the highest bingos and were the only one with this many bingos, they have won!`;
                    else {
                      //find out numbers crossed by everyone to figure out who crossed most, in case theres a tie for most bingos
                      const topNums =
                        topBingoPeople
                          .sort(
                            (a, b) =>
                              b.nums.join(",").split(" ").length -
                              a.nums.join(",").split(" ").length
                          )
                          .first()
                          .nums.join(",")
                          .split(" ").length - 1;

                      const topNumsAndBingos = topBingoPeople.filter(
                        (a) =>
                          a.nums.join(",").split(" ").length - 1 === topNums
                      );
                      if (topNumsAndBingos.size === 1)
                        //clear winner in terms of nums crossed
                        description = `${formatArray(
                          [...topBingoPeople.keys()].map((e) => `<@${e}>`)
                        )} all had ${topBingo} bingos, but <@${
                          [...topNumsAndBingos.keys()][0]
                        }> has highest number of numbers crossed out(${topNums}), thus they are the winner.`;
                      else {
                        //In case theres still a tie
                        if (
                          arrayEquals(
                            [...topNumsAndBingos.keys()],
                            [...topBingoPeople.keys()]
                          )
                        ) {
                          description = `${formatArray(
                            [...topNumsAndBingos.keys()].map((e) => `<@${e}>`)
                          )} all had ${topBingo} bingos and ${topNums} numbers crossed, and thus have tied for first place.`;
                        } else {
                          description = `${formatArray(
                            [...topBingoPeople.keys()].map((e) => `<@${e}>`)
                          )} had the most number of bingos (${topBingo}) but from these ${formatArray(
                            [...topNumsAndBingos.keys()].map((e) => `<@${e}>`)
                          )}had largest number of numbers crossed (${topNums}) and thus these ${
                            [...topNumsAndBingos.keys()].map((e) => `<@${e}>`)
                              .length
                          } have tied for first place.`;
                        }
                      }
                    }
                    clearInterval(
                      games.get(interaction.channel.id).get("interval")
                    );
                    //user wins
                    games.delete(interaction.channel.id);
                    if (tts)
                      interaction.channel
                        .send({
                          content: description,
                          tts: true,
                        })
                        .then((e) =>
                          setTimeout(() => {
                            e.delete();
                          }, 15000)
                        );
                    return ii.reply({
                      embeds: [
                        new MessageEmbed()
                          .setTitle("Bingo game has been ended!")
                          .setColor(gameBoards[board].hex)
                          .setDescription(
                            description + " Thank you for playing."
                          )
                          .setImage(
                            "https://i.gifer.com/origin/fa/fad5c76dcd3d90f7f3577df70efda285_w200.gif"
                          ),
                      ],
                    });
                  } else {
                    colector.stop("e");
                    return ii.reply(`${emotes.cross} Cancelled ending`);
                  }
                } else {
                  return ii.reply({
                    content: `${emotes.cross} These buttons aren't for you!`,
                    ephemeral: true,
                  });
                }
              });

              colector.on("end", () => {
                msg.edit({
                  content: `${i.user}, are you sure you want to end this game?`,
                  components: row.map((e) => {
                    e.components = e.components.map((i) => {
                      i.disabled = true;
                      return i;
                    });
                    return e;
                  }),
                });
              });
            } else if (i.customId == "cancel") {
              if (games.get(interaction.channel.id).get("host") !== i.user.id) {
                return i.reply({
                  content: "You are not the host!",
                  ephemeral: true,
                });
              }
              let row = [
                {
                  type: 1,
                  components: [
                    {
                      type: 2,
                      style: "PRIMARY",
                      custom_id: "Y",
                      label: "Yes",
                    },
                    {
                      type: 2,
                      style: "DANGER",
                      custom_id: "N",
                      label: "No",
                    },
                  ],
                },
              ];

              const mssg = await i.reply({
                content: `${i.user}, are you sure you want to cancel this game?`,
                components: row,
                fetchReply: true,
              });
              const colector = mssg.createMessageComponentCollector({
                componentType: "BUTTON",
                time: 30000,
              });

              colector.on("collect", async (ii) => {
                if (ii.user.id === i.user.id) {
                  if (ii.customId == "Y") {
                    //end game without displaying a winner
                    colector.stop("e");
                    clearInterval(
                      games.get(interaction.channel.id).get("interval")
                    );

                    games.delete(interaction.channel.id);
                    return ii.reply({
                      embeds: [
                        new MessageEmbed()
                          .setTitle("Bingo game has been ended!")
                          .setColor(gameBoards[board].hex)
                          .setDescription("Thank you for playing")
                          .setImage(
                            "https://i.gifer.com/origin/fa/fad5c76dcd3d90f7f3577df70efda285_w200.gif"
                          ),
                      ],
                    });
                  } else {
                    colector.stop("e");
                    return ii.reply(`${emotes.cross} Cancelled cancelling`);
                  }
                } else {
                  return ii.reply({
                    content: `${emotes.cross} These buttons aren't for you!`,
                    ephemeral: true,
                  });
                }
              });

              colector.on("end", () => {
                msg.edit({
                  content: `${i.user}, are you sure you want to cancel this game?`,
                  components: row.map((e) => {
                    e.components = e.components.map((i) => {
                      i.disabled = true;
                      return i;
                    });
                    return e;
                  }),
                });
              });
              return;
            } else {
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
              ctx.drawImage(
                tick,
                locations[numIndex][0],
                locations[numIndex][1]
              );
              const buffer = ctx.canvas.toBuffer();
              const attach = new MessageAttachment(buffer);
              i.reply({ files: [attach], ephemeral: true });
            }
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
