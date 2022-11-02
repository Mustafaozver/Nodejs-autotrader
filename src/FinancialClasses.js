module.exports = ((ATA)=>{
	const TradeInterface = ATA.Require("./TradeInterface");
	const MainInstruments = ["USDT", "BUSD", "BTC", "ETH", "BNB", "XRP", "TRX", "XRP", "DOGE", "DOT", "TRY", "AUD", "BIDR", "IDRT", "BRL", "EUR", "GBP", "RUB", "UAH", "NGN", "TUSD", "USDC", "DAI", "VAI", "USDP"];
	const period = 20*1000;
	const Fibos = [
		0.23606797749979, // 0
		// Alış aralığı
		0.38196601125011, // 1
		0.5,			  // 2
		0.61803398874990, // 3
		// Satış aralığı
		0.76393202250021, // 4
	];
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
			if(!(price > 0))return;
			price = FixNumber(Math.round(price / this.TickSize) * this.TickSize);
			vol = vol > 0 ? FixNumber(Math.round(price / this.StepSize) * this.StepSize) : 0;
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
	
	/* Financial Position Entries */
	
	const FinancialPosition = class{
		Pair = null;
		ID = "";
		isLong = true;
		Time = 0;
		TotalBalance = 0;
		MorselBalance = 0;
		EntryPrice = 0;
		TargetPrice = 0;
		High = 0;
		Low = 0;
		constructor(pair0, targetPrice, morselBalance){
			this.Pair = pair0;
			this.ID = this.Pair.ID;
			this.Time = (new Date()).getTime();
			this.MorselBalance = Number(morselBalance);
			this.isLong = this.MorselBalance > 0; // isLong ? true : false;
			this.TargetPrice = Number(targetPrice);
			this.EntryPrice = this.Pair[this.isLong?"Buy":"Sell"];
			this.High = -Infinity;
			this.Low = +Infinity;
			stack_fpos[this.ID] = this;
		};
		Close(){
			_MakeOrder(this.Pair.symbol, -this.TotalBalance);
			delete stack_fpos[this.ID];
		};
		Update(){
			var lastCandle = this.Pair.Candle.data.slice(-1)[0];
			if(this.isLong){
				if(this.Low > lastCandle.low)this.Low = lastCandle.low;
				//if(this.TargetPrice < this.Pair.Sell)this.Close();
			}else if(!this.isLong){
				if(this.High < lastCandle.high)this.High = lastCandle.high;
				//if(this.TargetPrice > this.Pair.Buy)this.Close();
			}
		};
		AddMorselBalance(){
			_MakeOrder(this.Pair.symbol, this.MorselBalance);
			const comM = 1.0002;
			const activePrice = this.isLong ? (this.Pair.Buy * comM) : (this.Pair.Sell / comM);
			const oltCost = this.TotalBalance * this.EntryPrice;
			this.TotalBalance += this.MorselBalance;
			const newCost = this.MorselBalance * activePrice;
			const totalCost = newCost + oltCost;
			this.EntryPrice = totalCost / this.TotalBalance;
			this.TotalBalance = Number(this.TotalBalance.toPrecision(10));
		};
		CheckPriceLocation(){
			const priceRange = this.High - this.Low;
			const locationonRangeBuy = (this.Pair.Buy - this.Low) / priceRange;
			const locationonRangeSell = (this.Pair.Sell - this.Low) / priceRange;
			if(this.isLong){
				     if(Fibos[0]      > locationonRangeSell) return "+L"; // pozisyon artır kontrol
				else if(Fibos[1]      > locationonRangeSell) return "L"; // pozisyon artır kontrol
				else if(Fibos[2]      > locationonRangeSell) return "HL"; // bekle
				else if(Fibos[3]/1.05 > locationonRangeBuy) return "HL"; // bekle
				else if(Fibos[4]      > locationonRangeBuy) return "XL"; // pozisyon kapat ve bitir
				else return "XL";								  // pozisyon kapat ve bitir
			}else if(!this.isLong){
				     if(Fibos[4]      < locationonRangeBuy) return "+S"; // pozisyon artır kontrol
				else if(Fibos[3]      < locationonRangeBuy) return "S"; // pozisyon artır kontrol
				else if(Fibos[2]      < locationonRangeBuy) return "HS"; // bekle
				else if(Fibos[1]*1.05 < locationonRangeSell) return "HS"; // bekle
				else if(Fibos[0]      < locationonRangeSell) return "XS"; // pozisyon kapat ve bitir
				else return "XS";								  // pozisyon kapat ve bitir
			}
		};
		CheckEntryLocation(){
			const priceRange = this.High - this.Low;
			const locationonEntry = (this.EntryPrice - this.Low) / priceRange;
			if(this.isLong){
				     if(Fibos[0]      > locationonEntry) return "+L"; // pozisyon iyi
				else if(Fibos[1]      > locationonEntry) return "L"; // pozisyon iyi
				else if(Fibos[2]      > locationonEntry) return "HL"; // pozisyon büyütülebilir
				else if(Fibos[3]/1.05 > locationonEntry) return "HL"; // pozisyon büyütülebilir
				else if(Fibos[4]      > locationonEntry) return "XL"; // pozisyon büyütülebilir
				else return "XL";								  // pozisyon büyütülebilir
			}else if(!this.isLong){
				     if(Fibos[4]      < locationonEntry) return "+S"; // pozisyon iyi
				else if(Fibos[3]      < locationonEntry) return "S"; // pozisyon iyi
				else if(Fibos[2]      < locationonEntry) return "HS"; // pozisyon büyütülebilir
				else if(Fibos[1]*1.05 < locationonEntry) return "HS"; // pozisyon büyütülebilir
				else if(Fibos[0]      < locationonEntry) return "XS"; // pozisyon büyütülebilir
				else return "XS";								  // pozisyon büyütülebilir
			}
		};
	};
	var _MakeOrder = async(symbol, Quantity, price, leverage)=>{};
	var _MyBalancePUSDT = 0;
	const stack_fpos = {};
	const SetMakeOrder = (func)=>{
		_MakeOrder = func;
	};
	const CalculateMorselBalance = (price, leverage)=>{
		if(_MyBalancePUSDT < 15)return 0;
		const MUsd = _MyBalancePUSDT * 0.5;
		return Number((MUsd / price * leverage).toPrecision(1)) + "";
	};
	const GenerateFinancialPosition = async(symbol, targetPrice, leverage, isLong)=>{
		const pair0 = GetPair(symbol);
		if(!pair0)return false;
		var fpos;
		const morselBalance = CalculateMorselBalance(pair0.valueOf(), leverage);
		if(morselBalance == 0)return false;
		if(!stack_fpos[pair0.ID]){
			await TradeInterface.SetLeverage(pair0.symbol, leverage);
			await TradeInterface.SetMarginType(pair0.symbol, "ISOLATED");
			fpos = new FinancialPosition(pair0, targetPrice, isLong ? morselBalance : -morselBalance, isLong);
		}else{
			fpos = stack_fpos[pair0.ID];
			//fpos.
		}
		return fpos;
	};
	const FinancialPositionCheck = async()=>{
		const existedFPos = {};
		Object.keys(stack_fpos).map((item)=>{
			existedFPos[item] = true;
		});
		const FAccount = await TradeInterface.GetFutureAccount();
		const balance = Number(FAccount.totalWalletBalance);
		_MyBalancePUSDT = balance;
		FAccount.positions.map(async(item)=>{
			if(!item.isolated)return false;
			const quantity = Number(item.positionAmt);
			if(quantity == 0)return false;
			const pair0 = GetPair(item.symbol);
			if(!pair0)return false;
			const profit = Number(item.unrealizedProfit);
			const PUSDTBalance = Number(item.initialMargin); // kaş dolar bağlı x
			if(existedFPos[item.symbol])delete existedFPos[item.symbol];
			if(!stack_fpos[pair0.ID]){
				if((profit / PUSDTBalance) > 0.0085){
					_MakeOrder(pair0.symbol, -quantity);
					return false;
				}
			}
			const fpos = stack_fpos[pair0.ID];
			const entry = Number(item.entryPrice);
			fpos.EntryPrice = entry;
			fpos.TotalBalance = quantity;
			const PUSDTBalanceLeverage = Number(item.notional); // kaç dolar bağlı kaldıraçlı +/-
			const leverage = Number(item.leverage);
			const updatetime = new Date(item.updateTime);
			
		});
		Object.keys(existedFPos).map((item)=>{
			
		});
		/*FAccount.assets.map((item)=>{
			
		});*/
	};
	const ExecutePosition = async(fpos)=>{
		const entryLocation = fpos.CheckEntryLocation();
		const priceLocation = fpos.CheckPriceLocation();
		if(priceLocation == "+L" || priceLocation == "L" || priceLocation == "+S" || priceLocation == "S"){
			if(entryLocation == "+L" || entryLocation == "L" || entryLocation == "+S" || entryLocation == "S"){
				// fiyat ve giriş güzel değerde
				
			}else{
				// fiyat iyi yerde ancak giriş iyi değil, pozisyon büyült
				await _MakeOrder(fpos.Pair.symbol, fpos.MorselBalance);
				await FinancialPositionCheck();
			}
		}else{
			if(fpos.MorselBalance != 0)switch(priceLocation){
				case "XL":
				case "XS":
					await _MakeOrder(fpos.Pair.symbol, -fpos.TotalBalance);
					await FinancialPositionCheck();
				break;
			};
		}
	};
	FinancialPositionCheck();
	const period_fposcheck = 5*60*1000;
	var pivottime_fposcheck = 0;
	ATA.Loops.push(()=>{
		const thisTime = (new Date()).getTime();
		const _PivotTime = thisTime % period_fposcheck;
		const lastPivotTime = pivottime_fposcheck % period_req;
		if (_PivotTime < lastPivotTime){
			FinancialPositionCheck();
		}
		pivottime_fposcheck = thisTime;
		for(var key in stack_fpos){
			const fpos = stack_fpos[key];
			fpos.Update();
			ExecutePosition(fpos);
		}
	});
	
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
		FinancialPosition,
		SetMakeOrder,
		GenerateFinancialPosition,
		//
		stack_fpos,
	};
})(ATA());