module.exports = {
  paginate: async function (embeds, message) {
    const Discord = require("discord.js");
    let first = new Discord.MessageButton()
      .setEmoji("<:first2:926539374546542622>")
      .setStyle("SECONDARY")
      .setCustomId(`first`);

    let previous = new Discord.MessageButton()
      .setEmoji("<:back2:926539569623613472>")
      .setStyle("SECONDARY")
      .setCustomId(`previous`);

    let next = new Discord.MessageButton()
      .setEmoji(`<:next2:926539617350611005>`)
      .setStyle("SECONDARY")
      .setCustomId(`next`);

    let last = new Discord.MessageButton()
      .setEmoji(`<:last2:926539452371857438>`)
      .setStyle("SECONDARY")
      .setCustomId(`last`);

    let dfirst = new Discord.MessageButton()
      .setEmoji("<:first2:926539374546542622>")
      .setStyle("SECONDARY")
      .setCustomId(`dfirst`)
      .setDisabled(true);

    let dprevious = new Discord.MessageButton()
      .setEmoji("<:back2:926539569623613472>")
      .setStyle("SECONDARY")
      .setCustomId(`dprevious`)
      .setDisabled(true);

    let dnext = new Discord.MessageButton()
      .setEmoji(`<:next2:926539617350611005>`)
      .setStyle("SECONDARY")
      .setCustomId(`dnext`)
      .setDisabled(true);

    let dlast = new Discord.MessageButton()
      .setEmoji(`<:last2:926539452371857438>`)
      .setStyle("SECONDARY")
      .setCustomId(`dlast`)
      .setDisabled(true);

    let currentPage = 1;

    let page = new Discord.MessageButton()
      .setStyle("SECONDARY")
      .setCustomId(`page`)
      .setLabel(`${currentPage}/${embeds.length}`)
      .setDisabled(true);
    let butts = [dfirst, dprevious, page, next, last];
    const m = await message.reply({
      embeds: [embeds[0]],
      components: [new Discord.MessageActionRow().addComponents(butts)],
      fetchReply: true,
    });
    message.author = message.user;
    const filter = (b) => {
      if (b.user.id === message.author.id) return true;
      return b.reply({
        content: "<:nx_cross:914921124670890064> These are not for you.",
        ephemeral: true,
      });
    };
    const collector = await m.createMessageComponentCollector({
      filter: filter,
      time: 300000,
    });

    collector.on("collect", async (i) => {
      i.deferUpdate();
      if (i.customId === "first") {
        currentPage = 1;

        let page = new Discord.MessageButton()
          .setStyle("SECONDARY")
          .setCustomId(`page`)
          .setLabel(`${currentPage}/${embeds.length}`)
          .setDisabled(true);

        const buttons = [dfirst, dprevious, page, next, last];
        const components = new Discord.MessageActionRow().addComponents(
          buttons
        );

        m.edit({
          embeds: [embeds[currentPage - 1]],
          components: [components],
        }).catch(() => {});
      }

      if (i.customId === "previous") {
        currentPage--;

        let page = new Discord.MessageButton()
          .setStyle("SECONDARY")
          .setCustomId(`page`)
          .setLabel(`${currentPage}/${embeds.length}`)
          .setDisabled(true);

        const dbuttons = [dfirst, dprevious, page, next, last];
        const dcomponents = new Discord.MessageActionRow().addComponents(
          dbuttons
        );
        const buttons = [first, previous, page, next, last];
        const components = new Discord.MessageActionRow().addComponents(
          buttons
        );

        m.edit({
          embeds: [embeds[currentPage - 1]],
          components: currentPage > 1 ? [components] : [dcomponents],
        }).catch(() => {});
      }

      if (i.customId === "next") {
        currentPage++;

        let page = new Discord.MessageButton()
          .setStyle("SECONDARY")
          .setCustomId(`page`)
          .setLabel(`${currentPage}/${embeds.length}`)
          .setDisabled(true);

        const dbuttons = [first, previous, page, dnext, dlast];
        const dcomponents = new Discord.MessageActionRow().addComponents(
          dbuttons
        );
        const buttons = [first, previous, page, next, last];
        const components = new Discord.MessageActionRow().addComponents(
          buttons
        );

        m.edit({
          embeds: [embeds[currentPage - 1]],
          components:
            currentPage < embeds.length ? [components] : [dcomponents],
        }).catch(() => {});
      }

      if (i.customId === "last") {
        currentPage = embeds.length;

        let page = new Discord.MessageButton()
          .setStyle("SECONDARY")
          .setCustomId(`page`)
          .setLabel(`${currentPage}/${embeds.length}`)
          .setDisabled(true);

        const buttons = [first, previous, page, dnext, dlast];
        const components = new Discord.MessageActionRow().addComponents(
          buttons
        );

        m.edit({
          embeds: [embeds[currentPage - 1]],
          components: [components],
        }).catch(() => {});
      }
    });

    collector.on("end", (mes, r) => {
      if (r == "time") {
        let lpage = new Discord.MessageButton()
          .setStyle("SECONDARY")
          .setCustomId(`page`)
          .setLabel(`${currentPage}/${embeds.length}`)
          .setDisabled(true);

        const dbutts = [dfirst, dprevious, lpage, dnext, dlast];
        m.edit({
          embeds: [embeds[currentPage - 1]],
          components: [new Discord.MessageActionRow().addComponents(dbutts)],
        });
      }
    });
  },
  getNumbers: function (num, max = 100, min = 0) {
    var arr = [];
    while (arr.length < num) {
      var r = Math.floor(Math.random() * max) + 1;
      if (arr.indexOf(r) === -1 && r > min) arr.push(r);
    }
    return arr;
  },
  generateArray: (n) => [...Array(n).keys()].map((foo) => foo + 1),
  shuffleArray: function (array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  },
  getBingos: function (nums) {
    let bingos = 0;
    //1st column
    if (
      nums[0].includes(" ") &&
      nums[1].includes(" ") &&
      nums[2].includes(" ") &&
      nums[3].includes(" ") &&
      nums[4].includes(" ")
    ) {
      bingos++;
    }
    //2nd column
    if (
      nums[5].includes(" ") &&
      nums[6].includes(" ") &&
      nums[7].includes(" ") &&
      nums[8].includes(" ") &&
      nums[9].includes(" ")
    ) {
      bingos++;
    }
    //3rd column
    if (
      nums[10].includes(" ") &&
      nums[11].includes(" ") &&
      nums[12].includes(" ") &&
      nums[13].includes(" ")
    ) {
      bingos++;
    }
    // 4th column
    if (
      nums[14].includes(" ") &&
      nums[15].includes(" ") &&
      nums[16].includes(" ") &&
      nums[17].includes(" ") &&
      nums[18].includes(" ")
    ) {
      bingos++;
    }
    //5th column
    if (
      nums[19].includes(" ") &&
      nums[20].includes(" ") &&
      nums[21].includes(" ") &&
      nums[22].includes(" ") &&
      nums[23].includes(" ")
    ) {
      bingos++;
    }

    //1st row
    if (
      nums[0].includes(" ") &&
      nums[5].includes(" ") &&
      nums[10].includes(" ") &&
      nums[14].includes(" ") &&
      nums[19].includes(" ")
    ) {
      bingos++;
    }

    //2nd row
    if (
      nums[1].includes(" ") &&
      nums[6].includes(" ") &&
      nums[11].includes(" ") &&
      nums[15].includes(" ") &&
      nums[20].includes(" ")
    ) {
      bingos++;
    }

    //3rd row
    if (
      nums[2].includes(" ") &&
      nums[7].includes(" ") &&
      nums[16].includes(" ") &&
      nums[21].includes(" ")
    ) {
      bingos++;
    }

    //4th row
    if (
      nums[3].includes(" ") &&
      nums[8].includes(" ") &&
      nums[12].includes(" ") &&
      nums[17].includes(" ") &&
      nums[22].includes(" ")
    ) {
      bingos++;
    }

    //5th row
    if (
      nums[4].includes(" ") &&
      nums[9].includes(" ") &&
      nums[13].includes(" ") &&
      nums[18].includes(" ") &&
      nums[23].includes(" ")
    ) {
      bingos++;
    }

    //top left to bottom right diagnal
    if (
      nums[0].includes(" ") &&
      nums[6].includes(" ") &&
      nums[17].includes(" ") &&
      nums[23].includes(" ")
    ) {
      bingos++;
    }

    //top right to bottom left diagnol
    if (
      nums[19].includes(" ") &&
      nums[15].includes(" ") &&
      nums[2].includes(" ") &&
      nums[8].includes(" ") &&
      nums[4].includes(" ")
    ) {
      bingos++;
    }

    return bingos;
  },
  formatArray: function (arr) {
    var outStr = "";
    if (arr.length === 1) {
      outStr = arr[0];
    } else if (arr.length === 2) {
      //joins all with "and" but no commas
      //example: "bob and sam"
      outStr = arr.join(" and ");
    } else if (arr.length > 2) {
      //joins all with commas, but last one gets ", and" (oxford comma!)
      //example: "bob, joe, and sam"
      outStr = arr.slice(0, -1).join(", ") + ", and " + arr.slice(-1);
    }
    return outStr;
  },
  arrayEquals: function (a, b) {
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index])
    );
  },
  ttsNumber: function (number) {
    if (parseInt(number).toString().length === 1) {
      return `Single digit ${number}.`;
    } else
      return `${number.toString()[0]} and ${number.toString()[1]}, ${number}.`;
  },
};
