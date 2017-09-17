var mineflayer = require('mineflayer');
var readline = require("readline");
var navigatePlugin = require('mineflayer-navigate')(mineflayer);
var fs = require('fs')
const config = require('./config.json')

const bot = mineflayer.createBot({
  host: config.host,
  port: config.port,
  username: config.username,
  password: config.password,
  version: config.version
})

bot.chatAddPattern(/^.* <(.*)> (.*)$/, 'tagchat', 'Tag Chat');

console.log("Minecraft Selfbot made by LightWarp. http://github.com/LightWarp/Minecraft-Selfbot for updates.")
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.setPrompt('Command > ');
rl.prompt();

var follow = false
var foloutId = undefined
var attoutId = undefined
navigatePlugin(bot);

function chatEvent(username, message) {
	if (message.startsWith('bot.info')){
        bot.chat('Minecraft Selfbot by LightWarp. https://github.com/LightWarp/Minecraft-Selfbot')
    }
    if (message.startsWith('bot.advice')){
        var advice_text = fs.readFileSync("./advice.txt", {"encoding": "utf-8"});
        var lines = advice_text.split('\n');
        var advicetosend =lines[Math.floor(Math.random() * lines.length)];
        bot.chat(advicetosend)
    }
    if (message.startsWith('bot.quote')){
        var quotes = fs.readFileSync("./quotes.txt", {"encoding": "utf-8"});
        var lines = quotes.split('\n');
        var quotetosend =lines[Math.floor(Math.random() * lines.length)];
        bot.chat(quotetosend)
    }
    if (message.startsWith('bot.ask')){
        var answers = [
            'Maybe.', 'Lol no.', 'I really hope so.', 'Not in your wildest dreams.',
            'There is a good chance.', 'Quite likely.', 'I think so.', 'I hope not.',
            'I hope so.', 'Wtf no!', 'Fuhgeddaboudit.', 'Ahaha! Really?!?', 'Pfft.',
            'Sorry, bby.', 'fuck yes.', 'Hell to the no.', 'ehhhhhh, i dont know.',
            'The future is uncertain.', 'I would rather not say.', 'Who cares?',
            'Possibly.', 'Never, ever, ever.', 'There is a small chance.', 'Yes!'
        ];
        var answer = answers[Math.floor(Math.random() * answers.length)];
        bot.chat(answer);
    }
}

bot.on('tagchat', function(username, message, translate, jsonMsg, matches) {
    chatEvent(username, message);
});

bot.on('chat', function(username, message) {
    chatEvent(username, message);
});
rl.on('line', function (consolecmd) {
  if (consolecmd == 'info') {
    console.log('A Minecraft Selfbot Created by LightWarp. https://github.com/LightWarp/Minecraft-Selfbot')
  }
  if (consolecmd == 'help') {
    console.log('My commands are:\n follow <player> Follows the mentioned player around.\n attack <player> Attacks the mentioned player.\n goto <player> Navigates to the mentioned players Location.\n kill <player> Tries to Kill the mentioned player.\n cmd <command> Executes a command ingame (use without the "/" ofcourse)\n say <message> Sends a message to the Ingame chat.')
  }
  if (consolecmd == 'shutdown'){
    bot.quit()
    rl.close(); 
  }
  if (consolecmd == 'stop'){
    bot.navigate.stop()
    bot.clearControlStates()
    if (follow === true) {
      follow = false
      clearInterval(foloutId)
      clearInterval(attoutId)
      console.log("Stopping task.")
    }
  }
  if (consolecmd.startsWith('follow ')){
      follow = true
      var plnam = (consolecmd.substring(7)).trim()
      global.target = bot.players[plnam].entity;
      if (global.target != null) {
      foloutId = setInterval(followTarget, 1000);
      console.log("Started following " + plnam)
      } else {
        console.log("Could not find player.")
      }
  }
  if (consolecmd.startsWith('goto ')){
      clearInterval(foloutId)
      clearInterval(attoutId)
      var l_m = consolecmd
      var nav_player = l_m.substring(5)
      var target = bot.players[nav_player.trim()].entity;
      bot.navigate.to(target.position);
      console.log("Heading to position!")
  }
  if (consolecmd.startsWith('attack ')){
      var plnam = (consolecmd.substring(7)).trim()
      var attacktarg = bot.players[plnam].entity;
      if (attacktarg != null) {
        bot.attack(attacktarg)
        console.log("Attacking " + plnam,"info")
      } else {
        Console.log("ERROR: Could not find player")
      }
  }
  if (consolecmd.startsWith('kill ')){
      follow = true
      var plnam = (consolecmd.substring(5)).trim()
      global.target = bot.players[plnam].entity;
      if (global.target != null) {
        foloutId = setInterval(followTarget, 1000);
        attoutId = setInterval(attackTarget, 500);
        console.log("Attempting to kill " + plnam)
      } else {
      console.log("Could not find player.")
      }
  }
  if (consolecmd.startsWith('say ')){
    bot.chat(consolecmd.substring(4))
    console.log("Message sent ingame.")
  }
  if (consolecmd.startsWith("cmd ")) {
    var cmdtoexec = (consolecmd.substring(4)).trim()
    if (cmdtoexec != null) {
      bot.chat("/"+cmdtoexec)
      console.log("Command Executed.")
    } else {
    console.log("You need to specify a command")
  }
  }
  rl.prompt(); 
});

function followTarget() {
    var path = bot.navigate.findPathSync(global.target.position, {
      timeout: 999,
      endRadius: 1,
    });
    bot.navigate.walk(path.path)
}

function attackTarget() {
    bot.attack(global.target)
}
bot.on('entityGone', function(entity) {
    if (entity === global.target) {
      console.log("Player out of range.")
      bot.navigate.stop();
    }
});
bot.on('death', function() {
    console.log(config.death)
    clearInterval(foloutId)
    clearInterval(attoutId)
    bot.navigate.stop();
});

bot.on('login', function() {
    bot.chat(config.login)
});
