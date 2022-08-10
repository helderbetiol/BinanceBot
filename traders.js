var axios = require('axios');

var traders = {}
// var traders = {
//   "FCCCEEF43C768889B7516DD5F2AE1A8B": {
//     name: "RKW",
//   },
//   "DBD1E61B2BD7F50B9A501C07A87E72EE": {
//     name: "McBurgz",
//   },
//   "20D6A8AE696C8BB969B67BE3ACA6C02A": {
//     name: "Ravensky-Ciel",
//   }
// }

async function addTrader(id) {
	if (!Object.keys(traders).includes(id)) {
		var name = await getTraderName(id);
		if (name) {
			traders[id] = {
				name: name,
				link: 'https://www.binance.com/en/futures-activity/leaderboard?type=myProfile&encryptedUid='+id
			};
			return 'Trader added\\!\n'+listTraders();
		}
	}
	return 'Unable to add trader';
}

function removeTrader(id) {
	if (traders.hasOwnProperty(id))
		delete traders[id]
	return 'Trader removed\\!\n'+listTraders();
}

function getTraders() {
	return traders;
}

function listTraders() {
	console.log(traders)
	const ids = Object.keys(traders);
	return ids.length ? 'Traders:\n'+ids.map(key => `[${traders[key].name}](${traders[key].link})`).toString()
			 : 'No traders';
}

async function getTraderName(id) {
	return axios.post('https://www.binance.com/bapi/futures/v2/public/future/leaderboard/getOtherLeaderboardBaseInfo', 
            {encryptedUid: id}
           )
	  .then(res => {
	    console.log(`statusCode: ${res.status}`);
	    if (res.data.data)
	      return res.data.data.nickName;
	  })
	  .catch(error => {
	    console.error(error);
	    return null;
	  });
}

module.exports = { addTrader, getTraders, listTraders, removeTrader };