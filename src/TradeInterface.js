module.exports = ((ATA)=>{
	// this file is for binance tarde system.
	// modules
	const Request1 = ATA.Require("request");
	const Crypto = ATA.Require("crypto");
	const Thread = ATA.Require("./Thread");
	
	const Request = async function(opts, resp){
		//console.log("REQUEST => ", arguments.callee.caller.name);
		console.log("REQUEST => ", opts.url);
		return await Request1(opts, resp);
	};
	
	// get api and secret key
	const config = ATA.Require("./binance.config.json");
	const PancakeSwap = ATA.Require("./PancakeSwap");
	var SELECTED_API = 0;
	
	// endpoints
	const BASE_URL = "https://api.binance.com";
    const BASE_URL_F = "https://fapi.binance.com";
    
	var _dataUpdate = function(){};
	
	ATA.Setups.push(async()=>{
		const OpenThread = (codes)=>{
			var wor = new(Thread);
			wor.OnExit = (e)=>{
				wor.Create();
				wor.Run(codes);
			};
			wor.Run(codes);
			wor.OnMessage = (data)=>{
				switch(data.ID){
					case "DU":
						data.Answer.map(_dataUpdate);
					break;
					case "LOG":
						console.log(data);
					break;
				}
			};
		};
		OpenThread(()=>{
			ATA()._R = "WSOCKET";
			//const BASE_WS_BT = "wss://stream.binance.com:9443/ws/!bookTicker";
			const BASE_WS_PT = "wss://stream.binance.com:9443/ws/!ticker@arr";
			const WebSocket = ATA().Require("./WSSysytem");
			const WS_PT = new WebSocket(BASE_WS_PT);
			const _pool = {};
			var _changedList = {};
			const GetPair = (pairkey)=>{
				_changedList[pairkey] = true;
				if(_pool[pairkey])return _pool[pairkey];
				else{
					_pool[pairkey] = {
						symbol:pairkey,
						Price:0,
						Buy:0,
						Sell:0,
						dailyVolume:0,
					};
				}
				return _pool[pairkey];
			};
			const JSONTryParse = (msg)=>{
				try{
					return JSON.parse(msg);
				}catch(e){}
				return {error:true,data:msg};
			};
			/*
			const WS_BT = new WebSocket(BASE_WS_BT);
			WS_BT.OnMessage = (data)=>{
				JSONTryParse(data).map(async(item,index)=>{
					const time = (new Date(Number(item.E))).getTime();
					const timenow = (new Date()).getTime();
					if((time + 10*60*1000) < timenow){
						process.exit();
						return;
					}
					const pairkey = item.s;
					const pair0 = GetPair(pairkey);
					_changedList[pairkey] = true;
					const buyprice = Number(item.b);
					const sellprice = Number(item.a);
					let price = (buyprice + sellprice) / 2;
					pair0.Price = price;
					pair0.Buy = buyprice;
					pair0.Sell = sellprice;
				});
			};
			//WS_BT.OnOpen = ()=>{};
			WS_BT.OnClose = ()=>{
				process.exit();
			};
			//WS_BT.OnPing = ()=>{};
			WS_BT.OnError = ()=>{
				process.exit();
			};
			*/
			WS_PT.OnMessage = (data)=>{
				JSONTryParse(data).map(async(item,index)=>{
					const time = (new Date(Number(item.E))).getTime();
					const timenow = (new Date()).getTime();
					if((time + 10*60*1000) < timenow){
						process.exit();
						return;
					}
					const pairkey = item.s;
					const pair0 = GetPair(pairkey);
					_changedList[pairkey] = true;
					let price = Number(item.c);
					const buyprice = Number(item.b);
					const sellprice = Number(item.a);
					//const bidQty = Number(item.B);
					//const askQty = Number(item.A);
					//const dailyHigh = Number(item.h);
					//const dailyLow = Number(item.l);
					//const WeightedPrice = Number(item.w);
					const dailyVolume = Number(item.v);
					
					if(buyprice>price)price = buyprice;
					if(sellprice<price)price = sellprice;
					
					pair0.Price = price;
					pair0.Buy = buyprice;
					pair0.Sell = sellprice;
					pair0.dailyVolume = dailyVolume;
				});
			};
			//WS_PT.OnOpen = ()=>{};
			WS_PT.OnClose = ()=>{
				process.exit();
			};
			//WS_PT.OnPing = ()=>{};
			WS_PT.OnError = ()=>{
				process.exit();
			};
			ATA().Loops.push(()=>{
				ATA().SendMessage({
					ID		: "DU",
					Answer	: Object.keys(_changedList).map((item)=>{
						return GetPair(item);
					})
				});
				_changedList = {};
			});
			console.log = function(){
				ATA().SendMessage({
					ID		: "LOG",
					Answer	: [...arguments]
				});
			};
			return true;
		});
    });
    
    // helpers and constants
    if (!Infinity)this.Infinity = 99999999999999999;
    const PInfinity = 0.0000000000000001;
	const FixedNumber = (num)=>{ // this function is for V8 number calculation errors
		const step10 = Math.floor(Math.log(num) * Math.LOG10E);
		const base10 = Math.floor(num / (10**step10));
		return Number((base10 * (10 ** step10)).toPrecision(7));
	};
	const JSONTryParse = (msg)=>{
		try{
			return JSON.parse(msg);
			if(data.msg)console.log(new Error(data.msg), data);
		}catch(e){}
		return {error:true,data:msg};
	};
	const GetQueryString = (query)=>{
		var arr = [];
		for(var key in query)arr.push(key + "=" + query[key]);
		return arr.join("&");
	};
	const GetHash = (query)=>{
		return Crypto.createHmac("sha256", config.Accounts[SELECTED_API].SECRETKEY).update(query).digest("hex");
	};
	const SetListenerUpdate = (func)=>{
		_dataUpdate = func;
	};
	const GetSpotPrices = async()=>{
		var path = "/api/v3/ticker/price";
		var url = BASE_URL;
		var recvWindow = 60000;
		var method = "GET";
		var reqOpts = {
			url:url + path,
			method:method,
			timeout:recvWindow,
			family:false,
			localAddress:false,
			forever:true,
			headers:{
				//"X-MBX-APIKEY": config.Accounts[SELECTED_API].APIKEY,
				"User-Agent": "Mozilla/4.0 (compatible; Node Binance API)",
				"Content-type": "application/x-www-form-urlencoded",
			},
		};
		var _data = false;
		var promise = new Promise(function(resolve, reject){
			Request(reqOpts,(err, res, body)=>{
				if(err){
					_data = err;
					resolve();
					return;
				}
				_data = res.body;
				resolve();
			});
		});
		await promise;
		return JSONTryParse(_data);
	};
	const GetSpotBidAskPrices = async()=>{
		var path = "/api/v3/ticker/bookTicker";
		var url = BASE_URL;
		var recvWindow = 60000;
		var method = "GET";
		var reqOpts = {
			url:url + path,
			method:method,
			timeout:recvWindow,
			family:false,
			localAddress:false,
			forever:true,
			headers:{
				//"X-MBX-APIKEY": config.Accounts[SELECTED_API].APIKEY,
				"User-Agent": "Mozilla/4.0 (compatible; Node Binance API)",
				"Content-type": "application/x-www-form-urlencoded",
			},
		};
		var _data = false;
		var promise = new Promise(function(resolve, reject){
			Request(reqOpts,(err, res, body)=>{
				if(err){
					_data = err;
					resolve();
					return;
				}
				_data = res.body;
				resolve();
			});
		});
		await promise;
		return JSONTryParse(_data);
	};
	const GetSpotOpenOrders = async()=>{
		var path = "/api/v3/openOrders";
		var url = BASE_URL;
		var timestamp = (new Date()).getTime();
		var recvWindow = 60000;
		var query = {
			recvWindow:recvWindow,
			timestamp:timestamp,
		};
		//query.symbol = symbol;
		var querystring = GetQueryString(query);
		var hash = GetHash(querystring);
		var method = "GET";
		var reqOpts = {
			url:url + path + "?" + querystring + "&signature=" + hash,
			method:method,
			timeout:recvWindow,
			family:false,
			localAddress:false,
			forever:true,
			qs:{
				timestamp:timestamp,
				recvWindow:recvWindow,
			},
			headers:{
				"X-MBX-APIKEY": config.Accounts[SELECTED_API].APIKEY,
				"User-Agent": "Mozilla/4.0 (compatible; Node Binance API)",
				"Content-type": "application/x-www-form-urlencoded",
			},
		};
		var _data = false;
		var promise = new Promise(function(resolve, reject){
			Request(reqOpts,(err, res, body)=>{
				if(err){
					_data = err;
					resolve();
					return;
				}
				_data = res.body;
				resolve();
			});
		});
		await promise;
		return JSONTryParse(_data);
	};
	const GetFuturesBidAskPrices = async()=>{
		var path = "/fapi/v1/ticker/bookTicker";
		var url = BASE_URL_F;
		var recvWindow = 60000;
		var method = "GET";
		var reqOpts = {
			url:url + path,
			method:method,
			timeout:recvWindow,
			family:false,
			localAddress:false,
			forever:true,
			headers:{
				//"X-MBX-APIKEY": config.Accounts[SELECTED_API].APIKEY,
				"User-Agent": "Mozilla/4.0 (compatible; Node Binance API)",
				"Content-type": "application/x-www-form-urlencoded",
			},
		};
		var _data = false;
		var promise = new Promise(function(resolve, reject){
			Request(reqOpts,(err, res, body)=>{
				if(err){
					_data = err;
					resolve();
					return;
				}
				_data = res.body;
				resolve();
			});
		});
		await promise;
		return JSONTryParse(_data);
	};
	const GetDepth = async(symbol)=>{
		var path = "/api/v1/depth";
		var url = BASE_URL;
		var recvWindow = 60000;
		var query = {};
		query.symbol = ("" + symbol).toUpperCase();
		query.limit = 5000;
		var querystring = GetQueryString(query);
		var method = "GET";
		var reqOpts = {
			url:url + path + "?" + querystring,
			method:method,
			timeout:recvWindow,
			family:false,
			localAddress:false,
			forever:true,
			headers:{
				//"X-MBX-APIKEY": config.Accounts[SELECTED_API].APIKEY,
				"User-Agent": "Mozilla/4.0 (compatible; Node Binance API)",
				"Content-type": "application/x-www-form-urlencoded",
			},
		};
		var _data = false;
		var promise = new Promise(function(resolve, reject){
			Request(reqOpts,(err, res, body)=>{
				if(err){
					_data = err;
					resolve();
					return;
				}
				_data = res.body;
				resolve();
			});
		});
		await promise;
		return JSONTryParse(_data);
	};
	const GetFutureExchangeInfo = async()=>{
		var path = "/fapi/v1/exchangeInfo";
		var url = BASE_URL_F;
		var recvWindow = 60000;
		var method = "GET";
		var reqOpts = {
			url:url + path,
			method:method,
			timeout:recvWindow,
			family:false,
			localAddress:false,
			forever:true,
			headers:{
				//"X-MBX-APIKEY": config.Accounts[SELECTED_API].APIKEY,
				"User-Agent": "Mozilla/4.0 (compatible; Node Binance API)",
				"Content-type": "application/x-www-form-urlencoded",
			},
		};
		var _data = false;
		var promise = new Promise(function(resolve, reject){
			Request(reqOpts,(err, res, body)=>{
				if(err){
					_data = err;
					resolve();
					return;
				}
				_data = res.body;
				resolve();
			});
		});
		await promise;
		return JSONTryParse(_data);
	};
	const GetSpotExchangeInfo = async()=>{
		var path = "/api/v3/exchangeInfo";
		var url = BASE_URL;
		var recvWindow = 60000;
		var method = "GET";
		var reqOpts = {
			url:url + path,
			method:method,
			timeout:recvWindow,
			family:false,
			localAddress:false,
			forever:true,
			headers:{
				//"X-MBX-APIKEY": config.Accounts[SELECTED_API].APIKEY,
				"User-Agent": "Mozilla/4.0 (compatible; Node Binance API)",
				"Content-type": "application/x-www-form-urlencoded",
			},
		};
		var _data = false;
		var promise = new Promise(function(resolve, reject){
			Request(reqOpts,(err, res, body)=>{
				if(err){
					_data = err;
					resolve();
					return;
				}
				_data = res.body;
				resolve();
			});
		});
		await promise;
		return JSONTryParse(_data);
	};
	const GetMarkPrices = async()=>{
		var path = "/fapi/v1/premiumIndex";
		var url = BASE_URL_F;
		var recvWindow = 60000;
		var method = "GET";
		var reqOpts = {
			url:url + path,
			method:method,
			timeout:recvWindow,
			family:false,
			localAddress:false,
			forever:true,
			headers:{
				//"X-MBX-APIKEY": config.Accounts[SELECTED_API].APIKEY,
				"User-Agent": "Mozilla/4.0 (compatible; Node Binance API)",
				"Content-type": "application/x-www-form-urlencoded",
			},
		};
		var _data = false;
		var promise = new Promise(function(resolve, reject){
			Request(reqOpts,(err, res, body)=>{
				if(err){
					_data = err;
					resolve();
					return;
				}
				_data = res.body;
				resolve();
			});
		});
		await promise;
		return JSONTryParse(_data);
	};
	const GetFuturePrices = async()=>{
		var path = "/fapi/v1/ticker/price";
		var url = BASE_URL_F;
		var recvWindow = 60000;
		var method = "GET";
		var reqOpts = {
			url:url + path,
			method:method,
			timeout:recvWindow,
			family:false,
			localAddress:false,
			forever:true,
			headers:{
				//"X-MBX-APIKEY": config.Accounts[SELECTED_API].APIKEY,
				"User-Agent": "Mozilla/4.0 (compatible; Node Binance API)",
				"Content-type": "application/x-www-form-urlencoded",
			},
		};
		var _data = false;
		var promise = new Promise(function(resolve, reject){
			Request(reqOpts,(err, res, body)=>{
				if(err){
					_data = err;
					resolve();
					return;
				}
				_data = res.body;
				resolve();
			});
		});
		await promise;
		return JSONTryParse(_data);
	};
	const GetFuturesOpenOrders = async()=>{
		var path = "/fapi/v1/allOrders";
		var url = BASE_URL_F;
		var timestamp = (new Date()).getTime();
		var recvWindow = 60000;
		var query = {
			recvWindow:recvWindow,
			timestamp:timestamp,
		};
		var querystring = GetQueryString(query);
		var hash = GetHash(querystring);
		var method = "GET";
		var reqOpts = {
			url:url + path + "?" + querystring + "&signature=" + hash,
			method:method,
			timeout:recvWindow,
			family:false,
			localAddress:false,
			forever:true,
			qs:{
				timestamp:timestamp,
				recvWindow:recvWindow,
			},
			headers:{
				"X-MBX-APIKEY": config.Accounts[SELECTED_API].APIKEY,
				"User-Agent": "Mozilla/4.0 (compatible; Node Binance API)",
				"Content-type": "application/x-www-form-urlencoded",
			},
		};
		var _data = false;
		var promise = new Promise(function(resolve, reject){
			Request(reqOpts,(err, res, body)=>{
				if(err){
					_data = err;
					resolve();
					return;
				}
				_data = res.body;
				resolve();
			});
		});
		await promise;
		return JSONTryParse(_data);
	};
	const GetSpotBalances = async()=>{
		var path = "/api/v3/account";
		var url = BASE_URL;
		var timestamp = (new Date()).getTime();
		var recvWindow = 60000;
		var query = {
			recvWindow:recvWindow,
			timestamp:timestamp,
		};
		var querystring = GetQueryString(query);
		var hash = GetHash(querystring);
		var method = "GET";
		var reqOpts = {
			url:url + path + "?" + querystring + "&signature=" + hash,
			method:method,
			timeout:recvWindow,
			family:false,
			localAddress:false,
			forever:true,
			qs:{
				timestamp:timestamp,
				recvWindow:recvWindow,
			},
			headers:{
				"X-MBX-APIKEY": config.Accounts[SELECTED_API].APIKEY,
				"User-Agent": "Mozilla/4.0 (compatible; Node Binance API)",
				"Content-type": "application/x-www-form-urlencoded",
			},
		};
		var _data = false;
		var promise = new Promise(function(resolve, reject){
			Request(reqOpts,(err, res, body)=>{
				if(err){
					_data = err;
					resolve();
					return;
				}
				_data = res.body;
				resolve();
			});
		});
		await promise;
		return JSONTryParse(_data);
	};
	const GetFutureBalances = async()=>{
		var path = "/fapi/v2/balance";
		var url = BASE_URL_F;
		var timestamp = (new Date()).getTime();
		var recvWindow = 60000;
		var query = {
			recvWindow:recvWindow,
			timestamp:timestamp,
		};
		var querystring = GetQueryString(query);
		var hash = GetHash(querystring);
		var method = "GET";
		var reqOpts = {
			url:url + path + "?" + querystring + "&signature=" + hash,
			method:method,
			timeout:recvWindow,
			family:false,
			localAddress:false,
			forever:true,
			qs:{
				timestamp:timestamp,
				recvWindow:recvWindow,
			},
			headers:{
				"X-MBX-APIKEY": config.Accounts[SELECTED_API].APIKEY,
				"User-Agent": "Mozilla/4.0 (compatible; Node Binance API)",
				"Content-type": "application/x-www-form-urlencoded",
			},
		};
		var _data = false;
		var promise = new Promise(function(resolve, reject){
			Request(reqOpts,(err, res, body)=>{
				if(err){
					_data = err;
					resolve();
					return;
				}
				_data = res.body;
				resolve();
			});
		});
		await promise;
		return JSONTryParse(_data);
	};
	const GetFutureAccount = async()=>{
		var path = "/fapi/v2/account";
		var url = BASE_URL_F;
		var timestamp = (new Date()).getTime();
		var recvWindow = 60000;
		var query = {
			recvWindow:recvWindow,
			timestamp:timestamp,
		};
		var querystring = GetQueryString(query);
		var hash = GetHash(querystring);
		var method = "GET";
		var reqOpts = {
			url:url + path + "?" + querystring + "&signature=" + hash,
			method:method,
			timeout:recvWindow,
			family:false,
			localAddress:false,
			forever:true,
			qs:{
				timestamp:timestamp,
				recvWindow:recvWindow,
			},
			headers:{
				"X-MBX-APIKEY": config.Accounts[SELECTED_API].APIKEY,
				"User-Agent": "Mozilla/4.0 (compatible; Node Binance API)",
				"Content-type": "application/x-www-form-urlencoded",
			},
		};
		var _data = false;
		var promise = new Promise(function(resolve, reject){
			Request(reqOpts,(err, res, body)=>{
				if(err){
					_data = err;
					resolve();
					return;
				}
				_data = res.body;
				resolve();
			});
		});
		await promise;
		return JSONTryParse(_data);
	};
	const GetMarginAccount = async()=>{
		var path = "/sapi/v1/margin/account";
		var url = BASE_URL;
		var timestamp = (new Date()).getTime();
		var recvWindow = 60000;
		var query = {
			recvWindow:recvWindow,
			timestamp:timestamp,
		};
		var querystring = GetQueryString(query);
		var hash = GetHash(querystring);
		var method = "GET";
		var reqOpts = {
			url:url + path + "?" + querystring + "&signature=" + hash,
			method:method,
			timeout:recvWindow,
			family:false,
			localAddress:false,
			forever:true,
			qs:{
				timestamp:timestamp,
				recvWindow:recvWindow,
			},
			headers:{
				"X-MBX-APIKEY": config.Accounts[SELECTED_API].APIKEY,
				"User-Agent": "Mozilla/4.0 (compatible; Node Binance API)",
				"Content-type": "application/x-www-form-urlencoded",
			},
		};
		var _data = false;
		var promise = new Promise(function(resolve, reject){
			Request(reqOpts,(err, res, body)=>{
				if(err){
					_data = err;
					resolve();
					return;
				}
				_data = res.body;
				resolve();
			});
		});
		await promise;
		return JSONTryParse(_data);
	};
	const GetPositionRisk = async()=>{
		var path = "/fapi/v2/positionRisk";
		var url = BASE_URL_F;
		var timestamp = (new Date()).getTime();
		var recvWindow = 60000;
		var query = {
			recvWindow:recvWindow,
			timestamp:timestamp,
		};
		var querystring = GetQueryString(query);
		var hash = GetHash(querystring);
		var method = "GET";
		var reqOpts = {
			url:url + path + "?" + querystring + "&signature=" + hash,
			method:method,
			timeout:recvWindow,
			family:false,
			localAddress:false,
			forever:true,
			qs:{
				timestamp:timestamp,
				recvWindow:recvWindow,
			},
			headers:{
				"X-MBX-APIKEY": config.Accounts[SELECTED_API].APIKEY,
				"User-Agent": "Mozilla/4.0 (compatible; Node Binance API)",
				"Content-type": "application/x-www-form-urlencoded",
			},
		};
		var _data = false;
		var promise = new Promise(function(resolve, reject){
			Request(reqOpts,(err, res, body)=>{
				if(err){
					_data = err;
					resolve();
					return;
				}
				_data = res.body;
				resolve();
			});
		});
		await promise;
		return JSONTryParse(_data);
	};
	const GetIncome = async()=>{
		var path = "/fapi/v1/income";
		var url = BASE_URL_F;
		var timestamp = (new Date()).getTime();
		var recvWindow = 60000;
		var query = {
			recvWindow:recvWindow,
			timestamp:timestamp,
		};
		var querystring = GetQueryString(query);
		var hash = GetHash(querystring);
		var method = "GET";
		var reqOpts = {
			url:url + path + "?" + querystring + "&signature=" + hash,
			method:method,
			timeout:recvWindow,
			family:false,
			localAddress:false,
			forever:true,
			qs:{
				timestamp:timestamp,
				recvWindow:recvWindow,
			},
			headers:{
				"X-MBX-APIKEY": config.Accounts[SELECTED_API].APIKEY,
				"User-Agent": "Mozilla/4.0 (compatible; Node Binance API)",
				"Content-type": "application/x-www-form-urlencoded",
			},
		};
		var _data = false;
		var promise = new Promise(function(resolve, reject){
			Request(reqOpts,(err, res, body)=>{
				if(err){
					_data = err;
					resolve();
					return;
				}
				_data = res.body;
				resolve();
			});
		});
		await promise;
		return JSONTryParse(_data);
	};
	const SetLeverage = async(symbol, leverage)=>{
		var path = "/fapi/v1/leverage";
		var url = BASE_URL_F;
		var timestamp = (new Date()).getTime();
		var recvWindow = 60000;
		var query = {
			recvWindow:recvWindow,
			timestamp:timestamp,
		};
		query.symbol = ("" + symbol).toUpperCase();
		query.leverage = Math.abs(leverage);
		var querystring = GetQueryString(query);
		var hash = GetHash(querystring);
		var method = "POST";
		var reqOpts = {
			url:url + path + "?" + querystring + "&signature=" + hash,
			method:method,
			timeout:recvWindow,
			family:false,
			localAddress:false,
			forever:true,
			qs:{
				timestamp:timestamp,
				recvWindow:recvWindow,
			},
			headers:{
				"X-MBX-APIKEY": config.Accounts[SELECTED_API].APIKEY,
				"User-Agent": "Mozilla/4.0 (compatible; Node Binance API)",
				"Content-type": "application/x-www-form-urlencoded",
			},
		};
		var _data = false;
		var promise = new Promise(function(resolve, reject){
			Request(reqOpts,function(err, res, body){
				if(err){
					_data = err;
					resolve();
					return;
				}
				_data = res.body;
				resolve();
			});
		});
		await promise;
		return JSONTryParse(_data);
	};
	const SetMarginType = async(symbol, marginType="ISOLATED")=>{
		var path = "/fapi/v1/marginType";
		var url = BASE_URL_F;
		var timestamp = (new Date()).getTime();
		var recvWindow = 60000;
		var query = {
			recvWindow:recvWindow,
			timestamp:timestamp,
		};
		query.symbol = ("" + symbol).toUpperCase();
		query.marginType = "" + marginType; // ISOLATED, CROSSED
		var querystring = GetQueryString(query);
		var hash = GetHash(querystring);
		var method = "POST";
		var reqOpts = {
			url:url + path + "?" + querystring + "&signature=" + hash,
			method:method,
			timeout:recvWindow,
			family:false,
			localAddress:false,
			forever:true,
			qs:{
				timestamp:timestamp,
				recvWindow:recvWindow,
			},
			headers:{
				"X-MBX-APIKEY": config.Accounts[SELECTED_API].APIKEY,
				"User-Agent": "Mozilla/4.0 (compatible; Node Binance API)",
				"Content-type": "application/x-www-form-urlencoded",
			},
		};
		var _data = false;
		var promise = new Promise(function(resolve, reject){
			Request(reqOpts,function(err, res, body){
				if(err){
					_data = err;
					resolve();
					return;
				}
				_data = res.body;
				resolve();
			});
		});
		await promise;
		return JSONTryParse(_data);
	};
	const MarketOrder = async(symbol, quantity, price=false)=>{
		var path = "/api/v3/order";
		var url = BASE_URL;
		var timestamp = (new Date()).getTime();
		var recvWindow = 60000;
		var query = {
			recvWindow:recvWindow,
			timestamp:timestamp,
		};
		query.symbol = ("" + symbol).toUpperCase();
		query.side = quantity > 0 ? "BUY" : "SELL";
		query.quantity = Math.abs(quantity);
		if(price){
			query.type = "LIMIT";
			query.timeInForce = "GTC";
			query.price = price;
		}else{
			query.type = "MARKET";
		}
		var querystring = GetQueryString(query);
		var hash = GetHash(querystring);
		var method = "POST";
		var reqOpts = {
			url:url + path + "?" + querystring + "&signature=" + hash,
			method:method,
			timeout:recvWindow,
			family:false,
			localAddress:false,
			forever:true,
			qs:{
				timestamp:timestamp,
				recvWindow:recvWindow,
			},
			headers:{
				"X-MBX-APIKEY": config.Accounts[SELECTED_API].APIKEY,
				"User-Agent": "Mozilla/4.0 (compatible; Node Binance API)",
				"Content-type": "application/x-www-form-urlencoded",
			},
		};
		var _data = false;
		var promise = new Promise(function(resolve, reject){
			Request(reqOpts,function(err, res, body){
				if(err){
					_data = err;
					resolve();
					return;
				}
				_data = res.body;
				resolve();
			});
		});
		await promise;
		return JSONTryParse(_data);
	};
	const MarketPosition = async(symbol, quantity, price=false)=>{
		var path = "/fapi/v1/order";
		var url = BASE_URL_F;
		var timestamp = (new Date()).getTime();
		var recvWindow = 60000;
		var query = {
			recvWindow:recvWindow,
			timestamp:timestamp,
		};
		query.symbol = ("" + symbol).toUpperCase();
		query.side = quantity > 0 ? "BUY" : "SELL";
		query.quantity = Math.abs(quantity);
		if(price){
			query.type = "LIMIT";
			query.timeInForce = "GTC";
			query.price = price;
		}else{
			query.type = "MARKET";
		}
		var querystring = GetQueryString(query);
		var hash = GetHash(querystring);
		var method = "POST";
		var reqOpts = {
			url:url + path + "?" + querystring + "&signature=" + hash,
			method:method,
			timeout:recvWindow,
			family:false,
			localAddress:false,
			forever:true,
			qs:{
				timestamp:timestamp,
				recvWindow:recvWindow,
			},
			headers:{
				"X-MBX-APIKEY": config.Accounts[SELECTED_API].APIKEY,
				"User-Agent": "Mozilla/4.0 (compatible; Node Binance API)",
				"Content-type": "application/x-www-form-urlencoded",
			},
		};
		var _data = false;
		var promise = new Promise(function(resolve, reject){
			Request(reqOpts,function(err, res, body){
				if(err){
					_data = err;
					resolve();
					return;
				}
				_data = res.body;
				resolve();
			});
		});
		await promise;
		return JSONTryParse(_data);
	};
	const Setup = ()=>{
		
	};
	const Loop = ()=>{
		
	};
	return{
		// ATA settings
		Setup,
		Loop,
		SetListenerUpdate,
		// get data global
		GetDepth,
		
		// get data personal
		
		// Spot
		
		// future
		
		// short function
		// helpers
		FixedNumber,
		
		GetSpotPrices,
		GetSpotBidAskPrices,
		GetSpotOpenOrders,
		GetFuturesBidAskPrices,
		GetSpotBalances,
		GetFutureAccount,
		GetFutureBalances,
		GetMarginAccount,
		GetPositionRisk,
		GetIncome,
		GetFutureExchangeInfo,
		GetSpotExchangeInfo,
		GetMarkPrices,
		GetFuturePrices,
		GetFuturesOpenOrders,
		SetLeverage,
		SetMarginType,
		MarketOrder,
		MarketPosition,
		
	};
})(ATA());