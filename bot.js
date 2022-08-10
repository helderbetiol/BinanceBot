const { Telegraf } = require('telegraf')
const { addTrader, listTraders, removeTrader } = require('./traders');

const BOT_TOKEN = "5429619338:AAHUsu6kIJCjwTrCyJ824zMi44atmS_5A7g"
const bot = new Telegraf(BOT_TOKEN)
const msgParams = { 
  disable_web_page_preview: true,
  parse_mode: 'MarkdownV2'
}
var channels = [];

const getMsgHeader = (traderName, traderLink) => `Nouvel ordre de [${traderName}](${traderLink})\n`;
const formatMsg = (msg) => msg.replaceAll('.', '\\.').replaceAll('-', '\\-');

function startBot() {
  bot.start((ctx) => {
    ctx.reply('Welcome')
    console.log(ctx.from)
    if (!channels.includes(ctx.from.id))
      channels.push(ctx.from.id);
  })
  bot.help((ctx) => ctx.reply('Send me a sticker'))
  bot.on('sticker', (ctx) => ctx.reply('👍'))
  bot.hears('Hi', (ctx) => ctx.reply('Hey there'))

  bot.on('text', async (ctx) => {
  if (ctx.message.text.includes('Add')) {
    var traderId = ctx.message.text.replace('Add ', '');
    var response = await addTrader(traderId);
    ctx.reply(formatMsg(response), msgParams);
  } else if (ctx.message.text.includes('List')) {
    ctx.reply(formatMsg(listTraders()), msgParams)
  } else if (ctx.message.text.includes('Remove')) {
    var traderId = ctx.message.text.replace('Remove ', '');
    ctx.reply(formatMsg(removeTrader(traderId)), msgParams)
  }
  })
  bot.launch()
}

function sendNewPositionMsg(traderName, traderLink, symbol, entryPrice, amount) {
  var msg = `🟢 ` + getMsgHeader(traderName, traderLink)
            +`J'achete ${symbol}\nPrix d'entrée : ${entryPrice.toFixed(2)}\nQuantite : ${amount}`;
  for (channel of channels)
    bot.telegram.sendMessage(channel, formatMsg(msg), msgParams);
}

function sendUpdatePositionMsg(traderName, traderLink, symbol, price, variation) {
  var msg = getMsgHeader(traderName, traderLink);
  if (variation >= 0)
    msg = '📈 ' + msg + `J'augmente la position \\(long\\) : ${symbol}\n`
            + `J'augmente ma postion de ${variation.toFixed(2)}%\nPrix d'entrée : ${price.toFixed(2)}`;
  else 
    msg = '📉 ' + msg + `Je réduis la position \\(short\\) : ${symbol}\n`
            + `Je réduis ma postion de ${variation.toFixed(2)}%\nPrix de clôture : ${price.toFixed(2)}`;
  for (channel of channels)
    bot.telegram.sendMessage(channel, formatMsg(msg), msgParams);
}

function sendDeletePositionMsg(traderName, traderLink, symbol, price, profit) {
  var msg = `❌ ` + getMsgHeader(traderName, traderLink)
            +`Je clôture la position : ${symbol}\n`
            + `Prix de clôture : ${price.toFixed(2)}\nProfit : ${profit.toFixed(2)}%`;
  for (channel of channels)
    bot.telegram.sendMessage(channel, formatMsg(msg), msgParams);
}

module.exports = { startBot, sendNewPositionMsg, sendUpdatePositionMsg, sendDeletePositionMsg };
