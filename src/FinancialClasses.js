module.exports = ((ATA)=>{
	const TradeInterface = ATA.Require("./TradeInterface");
	const DBManager = ATA.Require("./DBManager");
	const MainInstruments = ["USDT", "BUSD", "BTC", "ETH", "BNB", "XRP", "TRX", "XRP", "DOGE", "DOT", "TRY", "AUD", "BIDR", "IDRT", "BRL", "EUR", "GBP", "RUB", "UAH", "NGN", "TUSD", "USDC", "DAI", "VAI", "USDP"];
	const period = 10*1000;
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
		const SpotExchangeInfo = await TradeInterface.GetFutureExchangeInfo();
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
		}
		PivotTime = thisTime;
	});
	const period_req = 60*1000;
	var pivottime_req = 0;
	ATA.Loops.push(()=>{
		const thisTime = (new Date()).getTime();
		const _PivotTime = thisTime % periperiod_reqod;
		const lastPivotTime = pivottime_req % period_req;
		if (_PivotTime < lastPivotTime){
			PeriodicalUpdate();
		}
		pivottime_req = thisTime;
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
		StepSize = 0.00000001;//PInfinity;
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
			if(!(price > 0))return;
			price = FixNumber(Math.round(price / this.TickSize) * this.TickSize);
			vol = vol > 0 ? FixNumber(Math.round(price / this.StepSize) * this.StepSize) : 0;
			this.Candle.Update(price, vol);
			const usdtprice = GetPricePUSDT(this.Instrument0.Symbol);
			this.Instrument0.Candle.Update(usdtprice, vol);
		};
		UpdateBidAsk(buy, sell){
			if(!(buy > 0))buy = this.valueOf();
			if(!(sell > 0))sell = this.valueOf();
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
	
	/* Financial Position Entries */
	const FinancialPositionManager = {
		Symbol:"",
		MorselBalance:0,
		TotalBalance:0,
		EntryPrice:0,
		TargetPrice:0,
		High:-Infinity,
		Low:+Infinity,
		isAvailable:true,
		ReSet:function(){
			this.isAvailable = false;
			this.Symbol = "";
			this.MorselBalance = 0;
			this.TotalBalance = 0;
			this.EntryPrice = 0;
			this.TargetPrice = 0;
			this.High = -Infinity;
			this.Low = +Infinity;
		},
		SetPosition:async function(symbol, targetPrice, leverage=1, isLong=true){
			const pair0 = GetPair(symbol);
			const leverageresp = await TradeInterface.SetLeverage(pair0.symbol, leverage);
			const margintyperesp = await TradeInterface.SetMarginType(pair0.symbol, "ISOLATED");
			//if(false)return;
			this.Symbol = pair0.symbol;
			this.MorselBalance = CalculateMorselBalance(pair0.valueOf(), (isLong ? 1 : -1) * leverage);
			this.TotalBalance = 0;
			this.EntryPrice = Number(isLong ? pair0.Sell : pair0.Buy);
			this.TargetPrice = Number(targetPrice);
			this.High = isLong ? targetPrice : this.EntryPrice;
			this.Low = isLong ? this.EntryPrice : targetPrice;
			this.isAvailable = true;
			this.Update();
		},
		isActive:function(){
			if(!this.isAvailable)return false;
			if(this.MorselBalance == 0)return false;
			const pair0 = GetPair(this.Symbol);
			if(!pair0)return false;
			if(pair0.Candle.data.length < 5)return false;
			if((this.High/1.0001) <= this.Low)return false;
			if((this.TargetPrice/1.0001*this.MorselBalance) <= (this.EntryPrice*this.MorselBalance))return false;
			return true;
		},
		Update:function(){
			if(!this.isActive())return;
			const pair0 = GetPair(this.Symbol);
			const lastCandle = pair0.Candle.data.slice(-1)[0];
			const isLong = this.MorselBalance > 0;
			if(isLong){
				if(this.Low > lastCandle.low)this.Low = lastCandle.low;
				if(this.TargetPrice < pair0.Sell)this.Close();
			}else{
				if(this.High < lastCandle.high)this.High = lastCandle.high;
				if(this.TargetPrice > pair0.Buy)this.Close();
			}
			const mulX = isLong ? 1 : -1;
			const PriceBuyLocation = FindRange(CalculateRatio((isLong ? pair0.Buy : pair0.Sell), isLong ? this.High : this.Low, isLong ? this. Low : this.High));
			const PriceSellLocation = FindRange(CalculateRatio((isLong ? pair0.Sell : pair0.Buy), isLong ? this.High : this.Low, isLong ? this. Low : this.High));
			const EntryLocation = FindRange((this.TotalBalance*mulX) > 0 ? CalculateRatio(this.EntryPrice, isLong ? this.High : this.Low, isLong ? this. Low : this.High) : 0.501);
			const isEntrytoExit = (this.EntryPrice * mulX) < (pair0.valueOf() * mulX);
			if(1 <= PriceSellLocation && PriceSellLocation < 3){ // Alım noktası :)
				if(EntryLocation < 3){ // almışız zaten :D
					
				}else{
					this.AddBalance();
				}
			}else if(isEntrytoExit && PriceBuyLocation > 3){
				if(this.TotalBalance !== 0){
					this.Close();
				}
			}
		},
		AddBalance:async function(){
			const pair0 = GetPair(this.Symbol);
			const resp = await _MakeOrder(pair0.symbol, this.MorselBalance);
			FinancialPositionCheck();
			switch(resp){
				case 1:
					const comM = 1.001;
					const isLong = this.MorselBalance > 0;
					const oltCost = this.TotalBalance * this.EntryPrice;
					const newCost = this.MorselBalance * pair0[isLong?"Buy":"Sell"] * (isLong?comM:(1/comM));
					const totalCost = newCost + oltCost;
					this.TotalBalance += this.MorselBalance;
					this.EntryPrice = totalCost / this.TotalBalance;
				break;
				case -1:
					console.error("AddBalance Failed");
				break;
				default:
					console.error("AddBalance Unknown Message = ", resp);
				break;
			}
		},
		Close:async function(){
			const pair0 = GetPair(this.Symbol);
			const resp = await _MakeOrder(pair0.symbol, - this.TotalBalance);
			switch(resp){
				case 1:
					//DBManager.
					this.ReSet();
					FinancialPositionCheck();
				break;
				case -1:
					console.error("Close Failed");
				break;
				default:
					console.error("Close Unknown Message = ", resp);
				break;
			}
		},
	};
	const CalculateRatio = (val, max, min)=>{
		return (val - min) / (max - min);
	};
	const Fibos = [
		0,
		0.23606797749979,
		// Alış aralığı
		0.38196601125011,
		0.5,
		0.61803398874990,
		// Satış aralığı
		0.76393202250021,
		1,
	];
	const FindRange = (rate)=>{
		var lfibo = 0;
		for(var i=0;i<Fibos.length;i++){
			if(lfibo <= rate && rate <= Fibos[i])return i;
		}
		return false;
	};
	var _MakeOrder = async function(symbol, quantity, price, leverage){
		await (async(symbol, quantity, price, leverage)=>{
			await console.log("TRADER ORDER (temporal) => ", symbol, quantity, price, leverage);
		})(symbol, quantity, price, leverage);
		return 1;
	};
	var _MyBalancePUSDT = 0;
	const SetMakeOrder = (func)=>{
		_MakeOrder = func;
	};
	const GetAccountBalance = ()=>{
		return _MyBalancePUSDT;
	};
	const CalculateMorselBalance = (price, leverage)=>{
		if(_MyBalancePUSDT < 15)return 0;
		const MUsd = _MyBalancePUSDT / 5;
		return Number((MUsd / price * leverage).toPrecision(1));
	};
	const FinancialPositionCheck = async()=>{
		const FAccount = await TradeInterface.GetFutureAccount();
		const balance = Number(FAccount.totalWalletBalance);
		var isAvailable = true;
		_MyBalancePUSDT = balance;
		FAccount.positions.map((item)=>{
			if(!item.isolated)return false;
			const quantity = Number(item.positionAmt);
			if(quantity == 0)return false;
			isAvailable = false;
			const pair0 = GetPair(item.symbol);
			if(!pair0)return false;
			const profit = Number(item.unrealizedProfit);
			const PUSDTBalance = Number(item.initialMargin); // kaş dolar bağlı x
			const passIt = (profit / PUSDTBalance) > 0.009;
			if(FinancialPositionManager.Symbol == pair0.symbol){
				FinancialPositionManager.EntryPrice = Number(item.entryPrice);
				FinancialPositionManager.TotalBalance = Number(item.quantity);
				FinancialPositionManager.isAvailable = true;
				if(passIt)FinancialPositionManager.Close();
				/*
				
				
				const PUSDTBalanceLeverage = Number(item.notional); // kaç dolar bağlı kaldıraçlı +/-
				const leverage = Number(item.leverage);
				const updatetime = new Date(item.updateTime);
				
				*/
			}else{
				if(passIt)TradeInterface.MarketPosition(pair0.symbol, -quantity);
			}
		});
		FAccount.assets.map(async(item)=>{
			
		});
	};
	const period_fposcheck = 5*60*1000;
	var pivottime_fposcheck = 0;
	ATA.Setups.push(()=>{
		FinancialPositionCheck();
	});
	ATA.Loops.push(()=>{
		const thisTime = (new Date()).getTime();
		const _PivotTime = thisTime % period_fposcheck;
		const lastPivotTime = pivottime_fposcheck % period_req;
		if (_PivotTime < lastPivotTime){
			FinancialPositionCheck();
		}
		pivottime_fposcheck = thisTime;
		FinancialPositionManager.Update();
	});
	const SetPosition = (symbol, targetPrice, leverage, isLong)=>{
		FinancialPositionManager.SetPosition(symbol, targetPrice, leverage, isLong);
		FinancialPositionCheck();
	};
	const isActiveforPosition = ()=>{
		return FinancialPositionManager.isActive();
	};
	
	/* Financial Position Entries */
	
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
		SetMakeOrder,
		SetPosition,
		isActiveforPosition,
		GetAccountBalance,
		
		FinancialPositionManager,
	};
})(ATA());