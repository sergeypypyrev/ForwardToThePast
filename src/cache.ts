const sequelize = require('sequelize');

module.exports = {
	saving: 0,
	listeners: [],
	initialize: async function() {
		const CONFIG = require('./config');
		function double() {
			return {
				type: sequelize.DataTypes.DOUBLE,
				allowNull: false
			};
		}
		function unique(type: Object) {
			return {
				type,
				allowNull: false,
				unique: 'item'
			};
		}
		this.db = new sequelize.Sequelize({
			dialect: 'sqlite',
			storage: CONFIG.CACHE_FILE,
			logging: false
		});
		this.Cache = this.db.define('Cache', {
			exchange: unique(sequelize.DataTypes.STRING(40)),
			symbol: unique(sequelize.DataTypes.STRING(80)),
			interval: unique(sequelize.DataTypes.INTEGER),
			datetime: unique(sequelize.DataTypes.INTEGER),
			open: double(),
			high: double(),
			low: double(),
			close: double(),
			volume: double()
		});
		try {
			this.saving++;
			await this.Cache.sync();
		}
		finally {
			this.saving--;
			this.notifyListeners();
		}
	},
	need: async function(query: any) {
		let rows = await this.Cache.findAll({
			attributes: ['datetime'],
			where: {
				exchange: query.exchange,
				symbol: query.symbol,
				interval: query.interval,
				datetime: {
					[sequelize.Op.between]: [query.from, query.to]
				}
			}
		});
		let cached = new Set();
		rows.forEach((row: any) => cached.add(row.datetime));
		let min;
		for (let dt = query.from; dt <= query.to; dt += query.interval)
			if (!cached.has(dt)) {
				min = dt;
				break;
			}
		if (!min)
			return [];
		for (let dt = query.to; dt >= query.from; dt -= query.interval)
			if (!cached.has(dt))
				return [min, dt];
		return [min];
	},
	getOne: async function(query: any) {
		return this.Cache.findAll({
			where: {
				exchange: query.exchange,
				symbol: query.symbol,
				interval: query.interval,
				datetime: {
					[sequelize.Op.between]: [query.from, query.to]
				}
			}
		});
	},
	getCached: async function(query: any) {
		let before, after;
		let [min, max] = await this.need(query);
		if (min)
			before = await this.getOne({
				...query,
				to: min
			});
		else
			before = await this.getOne(query);
		if (max)
			after = await this.getOne({
				...query,
				from: max
			});
		else
			after = [];
		return [before, after];
	},
	save: async function(info: any, ohlcv: Array<Array<number>>) {
		try {
			this.saving++;
			let data = ohlcv.map((current: Array<number>) => {
				return {
					...info,
					datetime: current[0],
					open: current[1],
					high: current[2],
					low: current[3],
					close: current[4],
					volume: current[5]
				};
			});
			let recent = Date.now() - info.interval * 2;
			return this.Cache.bulkCreate(data.filter((current: any) => current.datetime < recent), {
				ignoreDuplicates: true
			});
		}
		finally {
			this.saving--;
			this.notifyListeners();
		}
	},
	addListener: function(listener: ()=>void) {
		this.listeners.push(listener);
	},
	notifyListeners: function() {
		if (!this.saving)
			this.listeners.forEach((listener: ()=>void) => listener());
	}
};

module.exports.initialize();
