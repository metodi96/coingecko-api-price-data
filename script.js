const xlsx = require('node-xlsx');
const axios = require('axios')
const XLSX = require('xlsx')
const Bottleneck = require("bottleneck/es5");
const obj = xlsx.parse(__dirname + '/test.xlsx'); // parses a file
const data = obj[0].data

let dataArrayOfObjects = [];
const limiter = new Bottleneck({
    minTime: 1300,
    maxConcurrent: 1,
});

const promiseAll = (promises, errors) => {
    return Promise.all(promises.map(p => {
        return p.catch(e => {
            errors.push(e.response);
            return null;
        })
    }))
}

const editDateFormat = () => {
	for (item of data) {
		const date = new Date(1900, 0, item[1] - 1)
		const yyyy = date.getFullYear();
		let mm = date.getMonth() + 1; // Months start at 0!
		let dd = date.getDate();
		if (dd < 10) dd = '0' + dd;
		if (mm < 10) mm = '0' + mm;
		dataArrayOfObjects.push({ coinName: item[0], date: `${dd}-${mm}-${yyyy}`, priceUsd: ''})
	}
}

editDateFormat()

const scheduleRequest =(endpoint) => {
    return limiter.schedule(() => {
        return axios.get(endpoint);
    })
}

const getCoingeckoData = async (data) => {
    const errors = []
        const promises = data.map(item => {
            let endpoint = `https://api.coingecko.com/api/v3/coins/${item.coinName.toLowerCase()}/history?date=${item.date}`;
        return scheduleRequest(endpoint);
    });
    const resolutions = await promiseAll(promises, errors);

    return {
        resolutions,
        errors
    }
}

const populateExcel = async () => {
    const result = await getCoingeckoData(dataArrayOfObjects)
    const resultArr = result.resolutions.map((item,index) => {
        return item !== null ? item.status !== 404 && typeof item.data.market_data !== 'undefined' ? {coinName: dataArrayOfObjects[index].coinName, date: dataArrayOfObjects[index].date, priceUsd: item.data.market_data.current_price.usd} :
            { coinName: dataArrayOfObjects[index].coinName, date: dataArrayOfObjects[index].date, priceUsd: "" } :
            { coinName: dataArrayOfObjects[index].coinName, date: dataArrayOfObjects[index].date, priceUsd: "" }
    })
    let binaryWS = XLSX.utils.json_to_sheet(resultArr);
    // Create a new Workbook
    var wb = XLSX.utils.book_new()
    // Name your sheet
    XLSX.utils.book_append_sheet(wb, binaryWS, 'Crypto Prices')
    // export your excel
    XLSX.writeFile(wb, 'Output.xlsx');
}
populateExcel()
