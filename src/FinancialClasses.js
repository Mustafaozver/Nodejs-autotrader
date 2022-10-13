module.exports = ((ATA)=>{
	const TradeInterface = ATA.Require("./TradeInterface");
	const MainInstruments = ["USDT", "BUSD", "BTC", "ETH", "BNB", "XRP", "TRX", "XRP", "DOGE", "DOT", "TRY", "AUD", "BIDR", "IDRT", "BRL", "EUR", "GBP", "RUB", "UAH", "NGN", "TUSD", "USDC", "DAI", "VAI", "USDP"];
	const period = 1*60*1000;
	const limit = 600;
	var PivotTime = 0;
	const FixNumber = (num)=>{
		return (num - 0).toPrecision(12) - 0;
	};
	const GetPricePUSDT = (code)=>{
		if(code == "USDT")return 1;
		if(code == "TUSDB")return 1;
		if(code == "TUSD")return 1;
		var pair0;
		if(pair0 = Pair.GetPair(code + "USDT")){
			return pair0.valueOf();
		} else if(pair0 = Pair.GetPair("USDT" + code)){
			return 1 / pair0.valueOf();
		} else if(pair0 = Pair.GetPair(code + "BUSD")){
			return pair0.valueOf();
		} else if(pair0 = Pair.GetPair("BUSD" + code)){
			return 1 / pair0.valueOf();
		} else if(pair0 = Pair.GetPair(code + "BTC")){
			return Pair.GetPair("BTCUSDT") * pair0.valueOf();
		} else if(pair0 = Pair.GetPair("BTC" + code)){
			return Pair.GetPair("BTCUSDT") / pair0.valueOf();
		} else if(pair0 = Pair.GetPair(code + "ETH")){
			return Pair.GetPair("ETHUSDT") * pair0.valueOf();
		} else if(pair0 = Pair.GetPair("ETH" + code)){
			return Pair.GetPair("ETHUSDT") / pair0.valueOf();
		}
		//console.log(code);
		return 0;
	};
	const GetInstrument1fromCode = (code)=>{
		code = ("" + code).toUpperCase();
		var symbol;
		for(var i=0;i<MainInstruments.length;i++){
			symbol = MainInstruments[i];
			if (code.slice(-symbol.length) != symbol) continue;
			if (stack_instrument["IN_" + symbol]) return symbol;
		}
		if (stack_instrument["IN_"  + code.slice(-3)]) return code.slice(-3);
		if (stack_instrument["IN_"  + code.slice(-4)]) return code.slice(-4);
		return false;
	};
	const GetInstrument0fromCode = (code)=>{
		code = ("" + code).toUpperCase();
		var symbol1 = GetInstrument1fromCode(code);
		var symbol0 = code.slice(0,code.length-symbol1.length);
		if (stack_instrument["IN_" + symbol0]) return symbol0;
		return false;
	};
	const GetPair = (code)=>{
		var sym0 = GetInstrument0fromCode(code);
		var sym1 = GetInstrument1fromCode(code);
		if(!stack_pairs["PR_" + sym0 + "_" + sym1]){
			return new Pair(sym0, sym1);
		}
		return stack_pairs["PR_" + sym0 + "_" + sym1];
	};
	const GetPairList = ()=>{
		return Object.keys(stack_pairs).map((item)=>{
			return stack_pairs[item].symbol;
		}).filter((item)=>{
			return item;
		});
	};
	const GetInstrument = (sym)=>{
		sym = ("" + sym).toUpperCase();
		if(!stack_instrument["IN_" + sym]){
			return new Instrument(sym);
		}
		return stack_instrument["IN_" + sym];
	};
	const PeriodicalUpdate = async()=>{
		const SpotPriceInfo = await TradeInterface.GetSpotPrices();
		SpotPriceInfo.map((item)=>{
			const pair = GetPair(item.symbol);
			if(pair)pair.Update(item.price);
		});
	};
	ATA.Setups.push(async()=>{
		const filterTypes = {
			PRICE_FILTER:(pair,filter)=>{
				pair.TickSize = Number(filter.tickSize).toPrecision(1);
			},
			LOT_SIZE:(pair,filter)=>{
				pair.StepSize = Number(filter.stepSize).toPrecision(1);
			},
		};
		const SpotExchangeInfo = await TradeInterface.GetSpotExchangeInfo();
		SpotExchangeInfo.symbols.map(async(item)=>{
			if(item.status =! "TRADING")return;
			const Instrument0 = GetInstrument(item.baseAsset);
			const Instrument1 = GetInstrument(item.quoteAsset);
			pair = new Pair(item.baseAsset, item.quoteAsset);
			item.filters.map((filter)=>{
				if(filterTypes[filter.filterType])filterTypes[filter.filterType](pair, filter);
			});
		});
	});
	ATA.Loops.push(()=>{
		const thisTime = (new Date()).getTime();
		const _PivotTime = thisTime % period;
		const lastPivotTime = PivotTime % period;
		if (_PivotTime < lastPivotTime){
			for(var key in stack_candles){
				stack_candles[key].Clock(thisTime - _PivotTime);
			}
			PeriodicalUpdate();
		}
		PivotTime = thisTime;
	});
	const CandleStick = class{
		time = null;
		open = null;
		high = null;
		low = null;
		close = null;
		volume = null;
		//closeTime = 0;
		//assetVolume = 0;
		//trades = 0;
		//buyBaseVolume = 0;
		//buyAssetVolume = 0;
		//ignored = 0;
		constructor(){
			this.time = (new Date()).getTime();
		};
		Update(price, vol=0) {
			price = FixNumber(price);
			if (this.open == null) this.time = (new Date()).getTime();
			if (this.open == null) this.open = price;
			this.close = price;
			this.low = (this.low == null) ? price : Math.min(price,this.low);
			this.high = (this.high == null) ? price : Math.max(price,this.high);
			this.volume = (this.volume == null) ? vol : FixNumber(vol+this.volume);
		};
		valueOf(){
			return this.close;
		};
	};
	const stack_candles = {};
	var counter_candle = 0;
	const Candle = class{
		ID = "";
		data = [];
		constructor(){
			this.ID = "CD_" + (counter_candle++);
			this.data.push(new CandleStick());
			stack_candles[this.ID] = this;
		};
		Last(){
			return this.data[this.data.length - 1];
		};
		valueOf(){
			return this.Last().close;
		};
		Update(price,vol=0){
			this.Last().Update(price,vol);
		};
		Clock(oTime){
			var close = this.valueOf();
			this.data.push(new CandleStick());
			while(this.data.length > limit)this.data.shift();
			this.Update(close,0);
			this.Last().time = (new Date(oTime)).getTime();
		};
	};
	const stack_instrument = {};
	const Instrument = class{
		Symbol = "";
		ID = "";
		Name = "";
		Pairs = [];
		BalanceinAvailable = 0;
		BalanceonOrder = 0;
		Candle = null;
		constructor(oSym){
			this.Symbol = "" + oSym;
			this.ID = "IN_" + this.Symbol;
			this.Candle = new Candle();
			stack_instrument[this.ID] = this;
		};
		get TotalBalance(){
			return this.BalanceinAvailable + this.BalanceonOrder;
		};
		get PricePUSDT(){
			return GetPricePUSDT(this.Symbol);
		};
	};
	const stack_pairs = {};
	const Pair = class{
		Type = ""; // "+"Reel, "-"Reversed, "I"ndex, "V"irtual
		ID = "";
		Instrument0 = null;
		Instrument1 = null;
		StepSize = 1;//PInfinity;
		TickSize = 1;//PInfinity;
		//MaxPrice = Infinity;
		//MinPrice = -Infinity;
		//MaxQuantity = Infinity;
		//MinQuantity = -Infinity;
		//MinNotional = -Infinity;
		Status = "";
		//BaseAssetPrecision = 1;
		//QuoteAssetPrecision = 1;
		//OrderTypes = "";
		//IcebergAllowed = false;
		Buy = 0;
		Sell = 0;
		Candle = null;// new Candle();
		dailyVolume = 0;
		tradable = false;
		constructor(sym0,sym1){
			this.Type = "+";
			if (stack_instrument["IN_" + sym0]) this.Instrument0 = stack_instrument["IN_" + sym0];
			if (stack_instrument["IN_" + sym1]) this.Instrument1 = stack_instrument["IN_" + sym1];
			if(this.Instrument0) this.Instrument0.Pairs.push(this);
			if(this.Instrument1) this.Instrument1.Pairs.push(this);
			this.ID = "PR_" + sym0 + "_" + sym1;
			this.Candle = new Candle();
			stack_pairs[this.ID] = this;
		};
		Update(price, vol=0){
			price = FixNumber(Math.round(price / this.TickSize) * this.TickSize);
			vol = FixNumber(Math.round(price / this.StepSize) * this.StepSize);
			this.Candle.Update(price, vol);
		};
		UpdateBidAsk(buy, sell){
			this.Buy = FixNumber(buy);
			this.Sell = FixNumber(sell);
		};
		valueOf(){
			return this.Candle.valueOf();
		};
		get DetailedText(){
			return "" + this.Instrument0.Symbol + "/" + this.Instrument1.Symbol + " (" + this.ID + ") = " + this.Candle + " {" + this.Buy + "<=/=>" + this.Sell + "} (Vol=" + this.Candle.Last().volume + ", T=" + (new Date(this.Candle.Last().time)) + ")";
		};
		get symbol(){
			try{
				return this.Instrument0.Symbol + "" + this.Instrument1.Symbol;
			}catch(e){}
			return "";
		};
		get isTradable(){
			return isTradableCheck(this) && this.tradable;
		};
	};
	var isTradableCheck = function(pair){return false};
	const SetListenerCheck = (func)=>{
		isTradableCheck = func;
	};
	
	const FinancialPosition = class{
		
	};
	MainInstruments.map(GetInstrument);
	
	return{
		GetPair,
		GetInstrument,
		GetPairList,
		SetListenerCheck,
		FixNumber,
		CandleStick,
		Candle,
		Instrument,
		Pair,
		FinancialPosition
	};
})(ATA());