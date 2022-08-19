const { Telegraf } = require('telegraf')
const { addTraders, listTraders, removeTraders } = require('./traders');

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN)
const msgParams = { 
  disable_web_page_preview: true,
  parse_mode: 'MarkdownV2'
}
var channels = [];

const getMsgHeader = (traderName, traderLink) => `Nouvel ordre de [${traderName}](${traderLink})\n`;
const formatMsg = (msg) => msg.replaceAll('.', '\\.').replaceAll('-', '\\-');
const msgDecimals = (price) => price < 10 ? 4 : 2;
const numberWithCommas = (x) => x.toFixed(msgDecimals(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

function startBot() {
  // add channel id on start
  bot.start((ctx) => {
    ctx.reply('Welcome')
    console.log(ctx.from)
    if (!channels.includes(ctx.from.id))
      channels.push(ctx.from.id);
  })

  // test
  bot.help((ctx) => ctx.reply('Send me a sticker'))
  bot.on('sticker', (ctx) => ctx.reply('👍'))
  bot.hears('Hi', (ctx) => ctx.reply('Hey there'))

  // traders control
  bot.on('text', async (ctx) => {
  if (ctx.message.text.includes('Add')) {
    var traderIds = ctx.message.text.replace('Add ', '').split(',');
    var response = await addTraders(traderIds);
    ctx.reply(formatMsg(response), msgParams);
  } else if (ctx.message.text.includes('List')) {
    ctx.reply(formatMsg(listTraders()), msgParams)
  } else if (ctx.message.text.includes('Remove')) {
    var traderIds = ctx.message.text.replace('Remove ', '').split(',');
    ctx.reply(formatMsg(removeTraders(traderIds)), msgParams)
  }
  })

  bot.launch()
}

function sendNewPositionMsg(traderName, traderLink, symbol, price, amount) {
  var msg = getMsgHeader(traderName, traderLink);
  if (amount >= 0)
    msg = `🟢 ` + msg
            +`J'achète ${symbol}\nPrix d'entrée : ${price.toFixed(msgDecimals(price))}\nQuantite : ${amount}`;
  else
    msg = `🔴 ` + msg
            +`Je vends ${symbol}\nPrix d'entrée : ${price.toFixed(msgDecimals(price))}\nQuantite : ${amount}`;
  for (channel of channels)
    bot.telegram.sendMessage(channel, formatMsg(msg), msgParams);
}

function sendUpdatePositionMsg(traderName, traderLink, symbol, price, variation, amount) {
  var totalPrice = price*amount;
  var msg = getMsgHeader(traderName, traderLink);
  if (variation >= 0)
    msg = '📈 ' + msg + `J'augmente la position \\(long\\) : ${symbol}\n`
            + `J'augmente ma postion de $${numberWithCommas(totalPrice)} \\(${variation.toFixed(2)}%\\)\n`
            + `Prix d'entrée : ${price.toFixed(msgDecimals(price))}`;
  else 
    msg = '📉 ' + msg + `Je réduis la position \\(short\\) : ${symbol}\n`
            + `Je réduis ma postion de $${numberWithCommas(totalPrice)} \\(${variation.toFixed(2)}%\\)\n`
            + `Prix de clôture : ${price.toFixed(msgDecimals(price))}`;
  for (channel of channels)
    bot.telegram.sendMessage(channel, formatMsg(msg), msgParams);
}

function sendDeletePositionMsg(traderName, traderLink, symbol, price, profit) {
  var msg = `❌ ` + getMsgHeader(traderName, traderLink)
            +`Je clôture la position : ${symbol}\n`
            + `Prix de clôture : ${price.toFixed(msgDecimals(price))}\nProfit : ${(profit).toFixed(msgDecimals(profit))}%`;
  for (channel of channels)
    bot.telegram.sendMessage(channel, formatMsg(msg), msgParams);
}

module.exports = { startBot, sendNewPositionMsg, sendUpdatePositionMsg, sendDeletePositionMsg };
