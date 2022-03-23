const {Client, MessageEmbed, MessageButton, MessageActionRow} = require("discord.js"),
config = require("./config.js"),
db = require("quick.db"),
ms = require("ms"),
client = new Client({intents: 32767})

client.login(config.token);

client.on("ready", () =>{
  console.log(`Logged in as  ${client.user.username}\nDeveloper: https://github.com/ino-dev`)
  setInterval(()=>{
    client.guilds.cache.forEach(async guild =>{
      const channelId = db.get(`${guild.id}.channel`)
      if(!channelId) return;
      const channel = guild.channels.cache.get(channelId)
      if(!channel) return;
      const user = client.users.cache.random();
      const embed = new MessageEmbed({footer: {text: user.username}})
      .setTitle("Pfp")
      .setURL("https://github.com/ino-dev")
      .setImage(user.displayAvatarURL({dynamic: true, format: "png", size: 512}))
      .setColor(config.color);
      const button = new MessageButton()
      .setEmoji("↗")
      .setLabel("Pfp")
      .setURL(user.displayAvatarURL({dynamic: true, format: "png", size: 512}))
      .setStyle("LINK");
      const row = new MessageActionRow().addComponents(button)
      channel.send({embeds: [embed], components: [row]});
    })
  }, ms("30s"))
  
})

function checkAdmin(message){
  if(message.member.permissions.has("ADMINSISTRATOR")) return true
      else return false
};

 client.on("messageCreate", async(message) =>{
  if(message.author.bot || !message.content.startsWith(config.prefix) )return;
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args[0]?.toLowerCase()
  args.shift()

  if(command === "help"){
    const embed = new MessageEmbed()
    .setTitle("Help")
    .setURL("https://github.com/ino-dev")
    .addFields([
      {name: `${config.prefix}help`, value: "Bot help page"},
      {name: `${config.prefix}set-channel`, value: "Set channel of pfps"},
      {name: `${config.prefix}stop`, value: "stop pfps"}
    ])
    .setColor(config.color)
    message.channel.send({embeds: [embed]})
  }else if(command === "set-channel"){
   const admin =  await checkAdmin(message)
   if(!admin) return;
   const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0] || message.channelId);
   if(!channel) return message.channel.send("No channel found!")
    await db.set(`${message.guildId}.channel`, channel.id)
    message.channel.send(`The new channel of pfps is ${channel}!`)
  }else if(command === "stop"){
    const admin = await checkAdmin(message)
    if(!admin) return;
    await db.delete(message.guildId.toString());
    message.channel.send("Stopped pfps!")
  }
})
  
