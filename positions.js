var axios = require('axios');
const { sendNewPositionMsg, sendUpdatePositionMsg, sendDeletePositionMsg } = require('./bot');
const { getTraders } = require('./traders');

var call = 0;
function getTradersPositions() {
  var traders = getTraders();
  for (const [id, value] of Object.entries(traders)) {
    axios.post('https://www.binance.com/bapi/futures/v1/public/future/leaderboard/getOtherPosition', 
            {encryptedUid: id, tradeType: "PERPETUAL"}
           )
    .then(res => {
      console.log(`statusCode: ${res.status}`);
      if (!res.data.data.otherPositionRetList && !res.data.data.updateTimeStamp) {
        console.error('Unable to get data for trader ' + traders[id]['name'])
      } else {
        if (value['positions']) {
          console.log('Comparing positions for trader ' + traders[id]['name'])
          comparePositions(traders[id], res.data.data.otherPositionRetList);
          call += 1;
        }
        value['positions'] = Object.assign({}, ...res.data.data.otherPositionRetList.map((x) => ({[x.symbol]: x})));
      }
    })
    .catch(error => {
      console.error(error);
    });
  }
  
}

function comparePositions(trader, newPositions) {
  var currentPositions = trader['positions'];
  var newPositionsSymbols = [];

  // Check new or updated positions
  for (newPosition of newPositions) {
    // console.log(position['symbol']);
    newPositionsSymbols.push(newPosition['symbol']);
    if (!currentPositions[newPosition['symbol']]) {
      // new position
      console.log('new position')
      sendNewPositionMsg(trader['name'], trader['link'], newPosition['symbol'], newPosition['entryPrice'], newPosition['amount']);
    } else {
      var currentPosition = currentPositions[newPosition['symbol']];
      if (newPosition['updateTimeStamp'] > currentPosition.updateTimeStamp) {
        // update position
        console.log(newPosition)
        console.log(currentPosition)
        var amountDiff = newPosition['amount'] - currentPosition['amount'];
        var buyPrice = ((newPosition['entryPrice'] * newPosition['amount']) 
                        - (currentPosition['entryPrice'] * currentPosition['amount'])) / amountDiff;
        var variation = (amountDiff / currentPosition['amount'])*100;
        sendUpdatePositionMsg(trader['name'], trader['link'], newPosition['symbol'], 
          variation > 0 ? buyPrice : newPosition['markPrice'], variation, Math.abs(amountDiff));
        console.log('update position')
        console.log(buyPrice+' '+variation)
      }
    }
  }

  // Check deleted positions
  var missingSymbols = Object.keys(currentPositions).filter(x => !newPositionsSymbols.includes(x));
  if (missingSymbols.length > 0) {
    console.log('missing: '+ missingSymbols)
    for (symbol of missingSymbols)
      sendDeletePositionMsg(trader['name'], trader['link'], symbol, currentPositions[symbol]['markPrice'], 
        currentPositions[symbol]['roe']*100);
  }
}

module.exports = { getTradersPositions };