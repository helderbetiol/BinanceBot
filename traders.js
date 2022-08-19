var axios = require('axios');

var traders = {}

async function addTraders(ids) {
	var response = '';
	for (id of ids) {
		id = id.trim();
		if (!Object.keys(traders).includes(id)) {
			var name = await getTraderName(id);
			if (name) {
				traders[id] = {
					name: name,
					link: 'https://www.binance.com/en/futures-activity/leaderboard?type=myProfile&encryptedUid='+id
				};
			} else {
				response += `Unable to add ${id}\n`;
			}
		}
	}
	if (!response)
		response = 'Trader\\(s\\) added\\!\n'
	return response+listTraders();;
}

function removeTraders(ids) {
	if (ids.length == 1 && ids[0].trim() == 'all')
		traders = {}
	else
		for (id of ids) {
			id = id.trim();
			if (traders.hasOwnProperty(id))
				delete traders[id]
		}
	return 'Trader\\(s\\) removed\\!\n'+listTraders();
}

function getTraders() {
	return traders;
}

function listTraders() {
	console.log(traders)
	const ids = Object.keys(traders);
	return ids.length ? 'Traders:\n'+ids.map(key => ` [${traders[key].name}](${traders[key].link})`).toString()
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

module.exports = { addTraders, getTraders, listTraders, removeTraders };