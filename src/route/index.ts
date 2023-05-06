import {Request} from '@hapi/hapi';

module.exports = {
	method: 'GET',
	path: '/',
	handler: async function(request: Request, h: any) {
		const ccxt = require('ccxt');
		const CONFIG = require('../config');
		const cache = require('../cache');
		const intervals = [
			['', 'интервал'], ['1m', '1 минута'], ['5m', '5 минут'], ['15m', '15 минут'], ['30m', '30 минут'],
			['1h', '1 час'], ['4h', '4 часа'], ['1d', '1 день']//, ['1w', '1 неделя']
		];
		function initExchanges() {
			let selected = context.exchange;
			context.exchange = ccxt.exchanges.map((exchange: string) => {
				return {
					value: exchange,
					text: exchange,
					selected: exchange === selected
				};
			});
			context.exchange.unshift({
				value: '',
				text: 'биржа'
			});
		}
		function initIntervals() {
			let selected = context.interval || '';
			context.interval = [];
			for (const [value, text] of intervals)
				context.interval.push({
					value,
					text,
					selected: value === selected
				});
		}
		function isValidInterval(interval: string) {
			return interval && intervals.some(current => current[0] == interval);
		}
		async function fetchOHLCV() {
			let exchange = new ccxt[context.exchange]();
			let middle = +new Date(context.date + 'T' + context.time + 'Z');
			let parts = context.interval.match(/(\d+)(\w+)/);
			let minutes = +parts[1];
			switch (parts[2]) {
				case 'h':
					minutes *= 60;
					break;
				case 'd':
					minutes *= 24 * 60;
					break;
				case 'w':
					minutes *= 7 * 24 * 60;
			}
			let interval = minutes * 60 * 1000;
			middle = Math.floor(middle / interval) * interval;
			let start = middle - interval * CONFIG.EXTRA_INTERVALS;
			let limit = CONFIG.EXTRA_INTERVALS * 2 + 1;
			let end = start + (limit - 1) * interval;
			let [before, after] = await cache.getCached({
				exchange: context.exchange,
				symbol: context.symbol,
				interval,
				from: start,
				to: end
			});
			context.ohlcv = before;
			limit -= before.length + after.length;
			if (limit) {
				let params: any = {};
				switch (context.exchange) {
					case 'bybit':
					case 'mexc':
					case 'mexc3':
						params.endTime = end - (after.length - 1) * interval;
						break;
				}
				let ohlcv = await exchange.fetchOHLCV(context.symbol, context.interval, start + before.length * interval, limit, params);
				context.ohlcv.push(...ohlcv);
				cache.save({
					exchange: context.exchange,
					symbol: context.symbol,
					interval
				}, ohlcv);
			}
			context.ohlcv.push(...after);
			let format = new Intl.DateTimeFormat('ru-RU', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
				timeZone: 'GMT'
			});
			context.ohlcv = context.ohlcv.map((ohlcv: any) => {
				let result;
				if (ohlcv instanceof Array)
					result =  {
						datetime: format.format(ohlcv[0]),
						open: ohlcv[1],
						high: ohlcv[2],
						low: ohlcv[3],
						close: ohlcv[4],
						volume: ohlcv[5],
						selected: ohlcv[0] === middle
					};
				else {
					result = ohlcv;
					result.selected = result.datetime === middle;
					result.datetime = format.format(result.datetime);
				}
				return result;
			});
		}
		function prepareContext() {
			let error;
			if (query.time && query.time.match(/^\d\d:\d\d$/))
				context.time = query.time;
			else
				error = 'Выберите время';
			if (query.date && query.date.match(/^\d{4}-\d\d-\d\d$/))
				context.date = query.date;
			else
				error = 'Выберите дату';
			if (isValidInterval(query.interval))
				context.interval = query.interval;
			else
				error = 'Выберите интервал';
			if (query.symbol)
				context.symbol = query.symbol;
			else
				error = 'Введите символ (например: BTC/USDT или BTC/USDT:USDT)';
			if (query.exchange === 'huobi')
				error = 'API huobi не позволяет задать дату/время';
			else  if (query.exchange in ccxt)
				context.exchange = query.exchange;
			else
				error = 'Выберите биржу';
			if (error)
				throw new Error(error);
		}
		let context: any = {};
		let query = request.query;
		try {
			if (query.show) {
				prepareContext();
				await fetchOHLCV();
			}
		}
		catch (error: any) {
			context.error = error.toString();
		}
		initExchanges();
		initIntervals();
		return h.view('index', context);
	}
};
