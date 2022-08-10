const { Telegraf } = require('telegraf')
const { getTradersPositions } = require('./positions');
const { startBot } = require('./bot');


function callApiEveryNSeconds(n) {
    setInterval(getTradersPositions, n * 1000);
}

startBot();
callApiEveryNSeconds(10);

