module.exports = ((ATA)=>{
	const TradeInterface = ATA.Require("./TradeInterface");
	const MainInstruments = ["USDT", "BUSD", "BTC", "ETH", "BNB", "XRP", "TRX", "XRP", "DOGE", "DOT", "TRY", "AUD", "BIDR", "IDRT", "BRL", "EUR", "GBP", "RUB", "UAH", "NGN", "TUSD", "USDC", "DAI", "VAI", "USDP"];
	const period = 1*60*1000;
	const limit = 600;
	var PivotTime = 0;
	const FixNumber = (num)=>{
		return (num - 0).toPrecision(12) - 0;
	};
	const GetPricePUSDT = (code, n=-1)=>{
		if(code == "USDT")return 1;
		if(code == "TUSDB")return 1;
		if(code == "TUSD")return 1;
		if(code == "BUSD")return 1;
		var pair0;
		if(pair0 = GetPair(code + "USDT")){
			return pair0.Candle.data.slice(n)[0].close;
		} else if(pair0 = GetPair("USDT" + code)){
			return 1.0000 / pair0.Candle.data.slice(n)[0].close;
		} else if(pair0 = GetPair(code + "BUSD")){
			return pair0.Candle.data.slice(n)[0].close;
		} else if(pair0 = GetPair("BUSD" + code)){
			return 1.0000 / pair0.Candle.data.slice(n)[0].close;
		} else if(pair0 = GetPair(code + "BTC")){
			return GetPair("BTCUSDT").Candle.data.slice(n)[0].close * pair0.Candle.data.slice(n)[0].close;
		} else if(pair0 = GetPair("BTC" + code)){
			return GetPair("BTCUSDT").Candle.data.slice(n)[0].close / pair0.Candle.data.slice(n)[0].close;
		} else if(pair0 = GetPair(code + "ETH")){
			return GetPair("ETHUSDT").Candle.data.slice(n)[0].close * pair0.Candle.data.slice(n)[0].close;
		} else if(pair0 = GetPair("ETH" + code)){
			return GetPair("ETHUSDT").Candle.data.slice(n)[0].close / pair0.Candle.data.slice(n)[0].close;
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
			return false;
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
		StepSize = 00000001;//PInfinity;
		TickSize = 0.00000001;//PInfinity;
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
		CandlePUSDT = null;// new Candle();
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
			const usdtprice = GetPricePUSDT(this.Instrument0.Symbol);
			this.Instrument0.Candle.Update(usdtprice, vol);
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
	const stack_fpos = {};
	//var counter_fpos = 0;
	const Calculate = (price, leverage)=>{
		const MUsd = 100 * 0.75;
		return Number((MUsd / price * leverage).toPrecision(1)) + "";
	};
	const FinancialPosition = class{
		Pair = null;
		ID = "";
		isLong = true;
		Time = 0;
		Balance = 0;
		Entry = 0;
		Target = 0;
		High = 0;
		Low = 0;
		Quantity = 0;
		__leverage = 1;
		constructor(pair0, balance, isLong=true, leverage=false){
			this.Pair = pair0;
			this.ID = pair0.ID;
			this.isLong = isLong ? true : false;
			this.Time = (new Date()).getTime();
			this.Balance = Number(balance);
			this.Entry = this.Pair[this.isLong?"Buy":"Sell"];
			this.Target = this.isLong?Infinity:0;
			this.High = -Infinity;
			this.Low = Infinity;
			this.__leverage = leverage > 0 ? leverage : 1;
			this.Quantity = Calculate(this.Entry, this.__leverage);
			stack_fpos[this.ID] = this;
		};
		GetInstrument0(){
			return this.Pair.Instrument0;
		};
		GetInstrument1(){
			return this.Pair.Instrument1;
		};
		Buy(quantity, price=false){
			ATA.MakeOrder(this.Pair.symbol, this.Quantity, price, this.__leverage);
		};
		Sell(quantity, price=false){
			ATA.MakeOrder(this.Pair.symbol, -this.Quantity, price, this.__leverage);
		};
		Update(){
			const lastPrice = this.Pair.valueOf();
			const high = this.isLong ? this.Target : lastPrice;
			const low = this.isLong ? lastPrice : this.Target;
			const EntryTime = this.Time;
			
			this.Pair.Candle.data.filter(function(item){
				return item.time >= EntryTime;
			}).map(function(item){
				if (item.high > high) high = item.high;
				if (item.low < low) low  = item.low;
			});
			
			if(this.isLong){
				if(this.High < high)this.High = high;
				if(this.Low > low)this.Low = low;
			}else if(!this.isLong){
				if(this.High < high)this.High = high;
				if(this.Low > low)this.Low = low;
			}
			const Fibos = [
				0.23606797749979, // 0
				// Alış aralığı
				0.38196601125011, // 1
				0.5,			  // 2
				0.61803398874990, // 3
				// Satış aralığı
				0.76393202250021, // 4
			];
			const priceRange = high - low;
			
			const locationonRangeBuy = (this.Pair.Buy - low) / priceRange;
			const locationonRangeSell = (this.Pair.Sell - low) / priceRange;
			
			if(this.Time < ((new Date()).getTime() - 1000*60*60*24*2)){
				if(this.isLong){
					this.Target = priceRange * Fibos[4] + low;
				}else{
					this.Target = priceRange * Fibos[0] + low;
				}
				this.Time += 1000*60*60*4;
			}
			
			if(this.isLong){
				//if (this.Entry > lastPrice) return "+L";		  // pozisyon artır kontrol
				if (Fibos[0] > locationonRangeSell) return "++L"; // pozisyon artır kontrol
				else if (Fibos[1] > locationonRangeSell) return "+L"; // pozisyon artır kontrol
				else if (Fibos[2] > locationonRangeSell) return "L"; // bekle
				else if (Fibos[3]/1.05 > locationonRangeBuy) return "L"; // bekle
				else if (Fibos[4] > locationonRangeBuy) return "EL"; // pozisyon kapat ve bitir
				else return "EL";								  // pozisyon kapat ve bitir
				return "EL";
			}else{
				//if (this.Entry < lastPrice) return "+S";		  // pozisyon artır kontrol
				if (Fibos[4] < locationonRangeBuy) return "++S"; // pozisyon artır kontrol
				else if (Fibos[3] < locationonRangeBuy) return "+S"; // pozisyon artır kontrol
				else if (Fibos[2] < locationonRangeBuy) return "S"; // bekle
				else if (Fibos[1]*1.05 < locationonRangeSell) return "S"; // bekle
				else if (Fibos[0] < locationonRangeSell) return "ES"; // pozisyon kapat ve bitir
				else return "ES";								  // pozisyon kapat ve bitir
				return "ES";
			}
			
		};
		AddBalance(balance){
			const comM = 1.0002;
			balance = Number(balance);
			const oltCost = this.Balance * this.Entry;
			const newCost = balance * this.Pair[this.isLong?"Buy":"Sell"] * (this.isLong?comM:(1/comM));
			const totalCost = newCost + oltCost;
			this.Balance += balance;
			this.Entry = totalCost / this.Balance;
			this.Balance = Number(Number(this.Balance).toPrecision(15));
		};
		Close(){
			const lastPrice = this.Pair.valueOf();
			const THAT = this;
			const lot = this.LOT;
			if(this.isLong){
				if(lot > Balance0){
					lot = Balance0;
					this.Balance = lot;
				}
				this.Sell(lot);
				this.AddBalance(-lot);
			}else{
				if(lot > Balance1/lastPrice){
					lot = Balance1/lastPrice;
					this.Balance = lot;
				}
				this.Buy(lot);
				this.AddBalance(lot);
			}
			if(this.Balance == 0) delete FinancialPosition.FinancialPositions[this.ID];
			else setTimeout(function(){
				THAT.F();
			},200);
		};
		F(){
			const st = this.Update();
			const lot = this.LOT;
			const entry = this.Entry;
			const lastPrice = this.Pair.valueOf();
			const high = this.isLong ? this.Target : this.High;
			const low = this.isLong ? this.Low : this.Target;
			
			const priceRange = high - low;
			const locationonRange = (entry - low) / priceRange;
			
			if(this.isLong){
			}else{
			}
			
			switch(st){
				case "EL":this.Close();break; // Long side
				case "+L"://break;
				case "++L":
					if(locationonRange < 0.38196601125011)return;
					this.AddBalance(lot);
					this.Buy(lot);
				case "L":break; // hold
				//--------------------------------------------------------------------
				case "ES":this.Close();break; // Short side
				case "+S"://break;
				case "++S":
					if(locationonRange > 0.61803398874990)return;
					this.AddBalance(-lot);
					this.Sell(lot);
				case "S":break; // hold
				default:break;
			}
			
		};
	};
	
	ATA.Loops.push(function(){
		for(var key in stack_fpos){
			stack_fpos[key].F();
		}
	});
	
	MainInstruments.map(GetInstrument);
	
	return{
		GetPair,
		GetInstrument,
		GetPairList,
		SetListenerCheck,
		FixNumber,
		GetPricePUSDT,
		CandleStick,
		Candle,
		Instrument,
		Pair,
		FinancialPosition
	};
})(ATA());