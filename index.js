((ATA)=>{
	ATA.isReady = true;
	ATA.isDebug = false;
	ATA.isMaster = true;
	ATA._R = "MAIN";
	
	const Console = ATA.Require("./Logger");
	const DBManager = ATA.Require("./DBManager");
	
	const FAnalyzer = ATA.Require("./Financial.Analyzer");
	
	
	ATA.Require("../package.json");
	const Url = ATA.Require("url");
	const {SetDataUpdate} = ATA.Require("./TradingAnalyzer");
	const {CreateHttpService} = ATA.Require("./Server");
	ATA.Require("./TMoney");
	const TradeInterface = ATA.Require("./TradeInterface");
	const {GetPairList, CandleStick, Candle, Instrument, Pair, FinancialPosition, GetPair, SetMakeOrder, SetPosition, isActiveforPosition} = ATA.Require("./FinancialClasses");
	
	TradeInterface.SetListenerUpdate((x)=>{
		const pair0 = GetPair(x.symbol);
		if(!pair0)return;
		const vol = Math.abs(x.dailyVolume - pair0.dailyVolume);
		pair0.Update(x.Price, vol);
		pair0.UpdateBidAsk(x.Buy, x.Sell);
		pair0.dailyVolume = x.dailyVolume;
	});
	/*
	
	
				Point       : target / data[LastIndex].close - 1,
				Start       : data[latestSignal].time,
				Target      : target,
				Side        : "LONG",
				Last        : lastprice,
				leverage    : leverage,
				Available   : data[LastIndex].high != range[0] && data[LastIndex - 1].high != range[0],
	
	*/
	SetDataUpdate((data)=>{
		data.filter((item)=>{
			console.log("SIGNAL => ", item.P);
			return item.Available;
		}).sort((a, b)=>{
			const apoint = Math.abs(a.Point);
			const bpoint = Math.abs(b.Point);
			if(apoint > bpoint) return -1;
			else if(apoint < bpoint) return +1;
			return 0;
		}).slice(-1).map((item)=>{
			StrategicOrder(item);
		});
	});
	ATA.Loops.push(()=>{
		ATA.Execute("STR2", // STR2 is everyone
			function(){
				
			}, []);
		
	});
	
	
	
	const margin = true;
	const Order = async(symbol, quantity, price=false, leverage=false)=>{
		if(margin){
			if(leverage){
				if(leverage > 10) leverage = leverage - 2;
				await TradeInterface.SetLeverage(symbol, leverage);
				await TradeInterface.SetMarginType(symbol, "ISOLATED");
			}
			return await TradeInterface.MarketPosition(symbol, quantity, price);
		}else{
			return await TradeInterface.MarketOrder(symbol, quantity, price=false)
		}
	};
	ATA.Setups.push(()=>{
		SetMakeOrder(async function(symbol, quantity, price=false, leverage=false){
			console.log("TRADER (INDEX.JS) => ", symbol, quantity, price, leverage);
			//return 1;
			const resp = await TradeInterface.MarketPosition(symbol, quantity, price);
			if(resp.orderId > 0)return 1;
			return -1;
		});
	});
	const StrategicOrder = async(signal)=>{
		if(!isActiveforPosition()){
			const symbol = signal.P;
			const stime = new Date(signal.Start);
			const target = signal.Target;
			const isLong = signal.isLong;
			const leverage = signal.leverage;
			const ls_side = signal.Side; // isLong ? "LONG/BUY" : "SHORT/SELL";
			const crossEdge = signal.Range[isLong ? 1 : 0];
			SetPosition(symbol, target, leverage, isLong, crossEdge);
			console.log("TRADER [" + symbol + "] => " + isLong + " " + target + " (" + stime + ") " + leverage + "x Last=" + signal.Last);
		}
	};
	
	// web ui and TradingView apis
	CreateHttpService("TIME", (Request, Resources, Next)=>{
		Resources.set("Content-Type","text/plain");
		Resources.send(""+Math.floor((new Date()).getTime()/1000));
	});
	CreateHttpService("CONFIG", (Request, Resources, Next)=>{
		Resources.set("Content-Type","application/json");
		Resources.send(JSON.stringify({
			exchanges:[{
				value:"ATAEX",
				name:"ATAEX",
				desc:"ATA Exchange"
			},{
				value:"ATAIN",
				name:"ATAIN",
				desc:"ATA Index"
			}],
            symbols_types: [{
				value:"crypto",
				name:"Cryptocurrency"
			}],
			supported_resolutions:["1"],//['1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '3D', '1W', '1M'],
			supports_search:true,
			supports_group_request:false,
			supports_marks:false,
			supports_timescale_marks:false,
			supports_time:true
		}, null, "\t"));
	});
	CreateHttpService("SYMBOL_INFO", (Request, Resources, Next)=>{
		const list = GetPairList();
		const _itemtemp = {
			currency_code:null,
			data_status:"streaming",
			description:null,
			exchange:"ATAEX",
			full_name:null,
			has_daily:true,
			has_intraday:true,
			has_weekly_and_monthly:true,
			listed_exchange:"ATAEX",
			minmov:1,
			minmov2:0,
			minmovement:1,
			minmovement2:0,
			name:null,
			//pricescale:null,
			session:"24x7",
			supported_resolutions:["3"],// (15) ['1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '3D', '1W', '1M']
			symbol:null,
			ticker:null,
			timezone:"UTC",
			type:"crypto",
		};
		_itemtemp.description = Object.keys(list).map(function(item){return list[item]});
		_itemtemp.full_name = Object.keys(list).map(function(item){return list[item].symbol});
		_itemtemp.name = _itemtemp.full_name;
		_itemtemp.symbol = _itemtemp.full_name;
		_itemtemp.ticker = _itemtemp.full_name;
		_itemtemp.pricescale = Object.keys(list).map(function(item){return Math.round(1000)});
		Resources.set("Content-Type","application/json");
		Resources.send(JSON.stringify(_itemtemp, null, "\t"));
	});
	CreateHttpService("SYMBOLS", (Request, Resources, Next)=>{
		const opts = Url.parse(Request.url, true);
		var symbol = (opts.query.symbol+"").split(":");
		symbol = (symbol.length>1?symbol[1]:symbol[0]).toUpperCase();
		const pair0 = GetPair(symbol);
		Resources.set("Content-Type","application/json");
		if(!pair0){
			Resources.send(JSON.stringify({"s":"error","errmsg":"Symbol Not Found"}, null, "\t"),404);
			return;
		}
		const _itemtemp = {
			currency_code:null,
			data_status:"streaming",
			description:null,
			exchange:"ATAEX",
			full_name:null,
			has_daily:true,
			has_intraday:true,
			has_weekly_and_monthly:true,
			listed_exchange:"ATAEX",
			minmov:1,
			minmov2:0,
			minmovement:1,
			minmovement2:0,
			name:null,
			//pricescale:null,
			session:"24x7",
			supported_resolutions:["1"],// (15) ['1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '3D', '1W', '1M']
			symbol:null,
			ticker:null,
			timezone:"UTC",
			type:"crypto",
		};
		_itemtemp.currency_code = "";
		_itemtemp.description = pair0.ID;
		_itemtemp.full_name = pair0.symbol;
		_itemtemp.name = _itemtemp.full_name;
		_itemtemp.symbol = _itemtemp.full_name;
		_itemtemp.ticker = _itemtemp.full_name;
		_itemtemp.pricescale = 10**(Math.floor(Math.log(1000/pair0.valueOf())*Math.LOG10E));
		Resources.send(JSON.stringify(_itemtemp, null, "\t"));
		
	});
	CreateHttpService("SEARCH", (Request, Resources, Next)=>{
		const list = GetPairList();
		const opts = Url.parse(Request.url, true);
		var query = (opts.query.query + "").split(":");
		query = (query.length>1?query[1]:query[0]).toUpperCase();
		const pairs = list.filter((item)=>{
			return item.indexOf(query)>-1;
		}).sort((item1,item2)=>{
			var splitted1 = item1.split(query);
			var splitted2 = item2.split(query);
			if(item1==query)return -1; // same
			if(item2==query)return 1;
			
			if(splitted1[0]=="" && splitted2[0]==""){ // start with text
				return splitted1[1].length > splitted2[1].length ? 1 : -1;
			} else if(splitted1[0]==""){
				return -1;
			} else if(splitted2[0]==""){
				return 1;
			}
			if(item1.length != item2.length){
				return item1.length > item2.length ? 1 : -1;
			}
			return 0;
		}).map((item)=>{
			const pair0 = GetPair(item);
			return {
				symbol:pair0.ID,
				full_name:pair0.ID,
				description:pair0.ID,
				exchange:"ATAEX",
				ticker:pair0.ID,
				type:"crypto"
			};
		});
		Resources.set("Content-Type","application/json");
		Resources.send(JSON.stringify(pairs, null, "\t"));
	});
	CreateHttpService("HISTORY", (Request, Resources, Next)=>{
		const list = GetPairList();
		const opts = Url.parse(Request.url, true);
		const symbol = (opts.query.symbol+"").toUpperCase();
		const fromtime = (1000*Number(opts.query.from));
		const totime = (1000*Number(opts.query.to));
		const o=[],h=[],l=[],c=[],v=[],t=[];
		const pair0 = GetPair(symbol);
		if(pair0)pair0.Candle.data.map(function(item){
			if(item.time<fromtime)return;
			if(item.time>totime)return;
			o.push(item.open);
			h.push(item.high);
			l.push(item.low);
			c.push(item.close);
			v.push(item.volume);
			t.push(Math.round(item.time/1000));
		});
		Resources.set("Content-Type","application/json");
		Resources.send(JSON.stringify({
			s:"ok",
			o:o,
			h:h,
			l:l,
			c:c,
			t:t,
			v:v
		}, null, "\t"));
	});
	CreateHttpService("MARKS", (Request, Resources, Next)=>{
		const list = GetPairList();
		const opts = Url.parse(Request.url, true);
		const symbol = (opts.query.symbol+"").toUpperCase();
		const fromtime = (1000*Number(opts.query.from));
		const totime = (1000*Number(opts.query.to));
		const pair0 = GetPair(symbol);
		const arr = [];
		if(pair0)pair0.Candle.data.map(function(item){
			if(item.time<fromtime)return;
			if(item.time>totime)return;
			if(Math.random() < 0.1)arr.push({
				id: item.time,
				time: item.time,
				color: {
					color: "#808080",
					background: "#FF00FF",
				},
				label: "B",
				text: "sembol = " + symbol,
				labelFontColor: "#00FF00",
			});
		});
		Resources.set("Content-Type","application/json");
		Resources.send(JSON.stringify(arr, null, "\t"));
	});
	CreateHttpService("ORDER", async(Request, Resources, Next)=>{
		const resp = {};
		const opts = Url.parse(Request.url, true);
		const symbol = (opts.query.symbol+"").toUpperCase();
		const quantity = Number(opts.query.quantity);
		const pair0 = GetPair(symbol);
		var price = Number(opts.query.price);
		var leverage = Number(opts.query.leverage);
		if(!(price > 0)) price = false;
		if(!(leverage > 0)) leverage = false;
		try{
			resp.Answer = await Order(pair0.symbol, quantity, price, leverage);
		}catch(e){
			resp.Error = e.toString();
		}
		Resources.set("Content-Type","application/json");
		Resources.send(JSON.stringify(resp, null, "\t"));
	});
	setInterval(console.clear, 1000 * 60 * 5);
})(require("./src/ATA")());