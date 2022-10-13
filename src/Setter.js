module.exports = ((ATA)=>{
	const TDSequential = ATA.Require("./TDSQ");
	const FS = ATA.Require("fs");
	const Indicators = ATA.Require("technicalindicators");
	const thisFile = __filename;
	const mtime = Number(FS.statSync(thisFile).mtime);
	//if(this.Settings.__time == mtime)return;
	const JSONTryParse = (msg)=>{
		try{
			return JSON.parse(msg);
		}catch(e){}
		return {error:true,data:msg};
	};
	var PivotTime = 0;
	const period = 10000;
	ATA.SetVariable("scan", ()=>{
		const thisTime = (new Date()).getTime();
		const _PivotTime = thisTime % period;
		const lastPivotTime = PivotTime % period;
		if(_PivotTime < lastPivotTime){
			const newmtime = Number(FS.statSync(thisFile).mtime);
			if(newmtime != mtime) process.exit();
			ScanAllPairs();
		}
		PivotTime = thisTime;
	});
	
	const ScanAllPairs = ()=>{
	try{
		var arr = [];
		for(var pairkey in ATA.PAIRPOOL){
			SignalCheckresult = SignalCheck(ATA.PAIRPOOL[pairkey]);
			if(SignalCheckresult.Point !== 0)arr.push(Object.assign({
				P:pairkey,
			}, SignalCheckresult));
		}
		if(arr.length > 0) console.log("Örnek pair stan = ", arr[0]);
		ATA.SendMessage({
			ID		: "DU",
			Answer	: "X => " + Object.keys(ATA.PAIRPOOL).length + " / " + arr.length
		});
	}catch(e){console.log(e)}
	};
	const SignalCheck = (data, check=false)=>{
	try{
		const LTtime = (new Date()).getTime() - 1000 * 60 * 3;
		const LastIndex = data.length - 1;
		if(data[LastIndex].time < LTtime)return {Point:0};
		const RSI_LIMIT = 22.3;
		const eorfa_LIMIT = 2.67;
		const tolerans = 1.003;
		const timeout = 1000*60*60*2; // 2 saat
		var buy_setups = [];
		var sell_setups = [];
		
		const FPrice_ = Indicators.WMA.calculate({period:3,values:data.map(function(item){return item.close*0.30+item.open*0.20+item.high*0.25+item.low*0.25})});
		//const SD_ = Indicators.SD.calculate({period:LastIndex,values:data.map(function(item){return item.high*0.5+item.low*0.5})});
		const RSI_ = Indicators.RSI.calculate({period:13,values:data.map(function(item){return item.close})});
		const MFI_ = Indicators.MFI.calculate({period:13,high:data.map(function(item){return item.high}),low:data.map(function(item){return item.low}),close:data.map(function(item){return item.close}),volume:data.map(function(item){return item.volume})});
		const RSIF_ = Indicators.RSI.calculate({period:13,values:FPrice_});
		const tdsq_ = TDSequential(data);
		const eorfa_ = EoRfA(FPrice_,11);
		
		//var IchimokuCloud_ = Indicators.IchimokuCloud.calculate({conversionPeriod:9, basePeriod:26, spanPeriod:52, displacement:26, high:data.map(function(item){return item.high}), low:data.map(function(item){return item.low})});
		//var CCI_ = Indicators.CCI.calculate({, high:data.map(function(item){return item.high}), low:data.map(function(item){return item.low}), close:data.map(function(item){return item.close}), open:data.map(function(item){return item.open})});
	
		const diff_RSI_ = data.length - RSI_.length;
		const diff_MFI_ = data.length - MFI_.length;
		const diff_RSIF_ = data.length - RSIF_.length;
		const diff_tdsq_ = data.length - tdsq_.length;
		const diff_eorfa_ = data.length - eorfa_.length;
		//const diff_SD_ = data.length - SD_.length;
			
		const ATR_ = Indicators.ATR.calculate({period:11, high:data.map(function(item){return item.high}), low:data.map(function(item){return item.low}), close:data.map(function(item){return item.close})});
		const ATR__ = 0*ATR_[ATR_.length-1];
		
		const StartIndex = Math.max(diff_RSI_, diff_MFI_, diff_RSIF_, diff_eorfa_/*diff_tdsq_*//*, diff_SD_*/);
		
		if (LastIndex < StartIndex)return {Point:0};
		//if(check)console.log(eorfa_);
		
		for(var i=StartIndex;i<=LastIndex;i++){
			const candle = data[i];
			const RSI__ = RSI_[i - diff_RSI_];
			const MFI__ = MFI_[i - diff_MFI_];
			const RSIF__ = RSIF_[i - diff_RSIF_];
			const tdsq__ = tdsq_[i - diff_tdsq_];
			const eorfa__ = eorfa_[i - diff_eorfa_];
			//const SD__ = SD_[i - diff_SD_];
			
			var buy_ =	false;
			var sell_ =	false;
			
			//buy_  ||= eorfa__ < -eorfa_LIMIT; // eorfa check
			//sell_ ||= eorfa__ > +eorfa_LIMIT;
			
			buy_  ||= RSI__ < RSI_LIMIT; // rsi check
			sell_ ||= RSI__ > (100 - RSI_LIMIT);
			
			buy_  ||= MFI__ < RSI_LIMIT && candle.volume > 0; // mfi check
			sell_ ||= MFI__ > (100 - RSI_LIMIT) && candle.volume > 0;
			
			buy_  ||= RSIF__ < RSI_LIMIT; // rsif check
			sell_ ||= RSIF__ > (100 - RSI_LIMIT);
			
			buy_  ||= !!tdsq__.buySetupPerfection; // tom demark seq check
			sell_ ||= !!tdsq__.sellSetupPerfection;
			
			if(buy_ && sell_){
				buy_ = false;
				sell_ = false;
			}
			
			if(buy_) buy_setups.push(i);
			if(sell_) sell_setups.push(i);
		}
		var range = [0,0];
		var fiborange;
		for(var index=0;index<buy_setups.length;index++){ // check buy
			const Index = buy_setups[index];
			const Max = data[Index].high;
			var Min = data[Index].low;
			const Time = data[Index].time;
			const target = Max;
			for(var i=Index;i<=LastIndex;i++){
				if(Min > data[i].low)Min = data[i].low;
				if(data[i].high > Max) buy_setups[index]=-1;
				fiborange = (data[i].close - Min) / (Max - Min);
				if(fiborange > 0.61803398874990) buy_setups[index]=-1; // geçersiz
				if(fiborange > 0.38196601125011) buy_setups[index]=-1; // gecikmiş alım
				if((data[i].time - Time) > timeout) buy_setups[index]=-1; // gecikmiş sinyal
			}
			if(Max/Min < tolerans) buy_setups[index]=-1;
			range = [Max, Min];
		}
		buy_setups = buy_setups.filter(function(item){
			return item > 0;
		});
		
		for(var index=0;index<sell_setups.length;index++){ // check sell
			const Index = sell_setups[index];
			var Max =  data[Index].high;
			const Min =  data[Index].low;
			const Time =  data[Index].time;
			const target = Min;
			for(var i=Index;i<=LastIndex;i++){
				if(Max < data[i].high)Max = data[i].high;
				if(data[i].low < Min) sell_setups[index]=-1;
				fiborange = (data[i].close - Min) / (Max - Min);
				if(fiborange < 0.38196601125011) sell_setups[index]=-1; // geçersiz
				if(fiborange < 0.61803398874990) sell_setups[index]=-1; // gecikmiş
				if((data[i].time - Time) > timeout) sell_setups[index]=-1; // gecikmiş sinyal
			}
			if(Max/Min < tolerans) sell_setups[index]=-1;
			range = [Max, Min];
		}
		sell_setups = sell_setups.filter(function(item){
			return item > 0;
		});
		
		if(buy_setups.length > 0 && sell_setups.length > 0 || range[0] == [1])return {Point:0};
		else if (buy_setups.length > 0){
			const firstSignal = Math.min.apply(Math,buy_setups);
			const latestSignal = Math.max.apply(Math,buy_setups);
			const target = ((data[firstSignal].close + data[latestSignal].close) / 2 - ATR__).toPrecision(12)-0;
			const lastprice = data[data.length - 1].close;
			const leverage = Math.floor(lastprice / (range[0] - range[1]) / 2 / 50);
			
			if (!isFinite(leverage)) console.log(range);
			return {
				Point       : target / data[LastIndex].close - 1,
				Start       : data[latestSignal].time,
				Target      : target,
				Side        : "LONG",
				Last        : lastprice,
				leverage    : leverage,
			};
		}else if (sell_setups.length > 0){
			const firstSignal = Math.min.apply(Math,sell_setups);
			const latestSignal = Math.max.apply(Math,sell_setups);
			const target = ((data[firstSignal].close + data[latestSignal].close) / 2 + ATR__).toPrecision(12)-0;
			const lastprice = data[data.length - 1].close;
			const leverage = Math.floor(lastprice / (range[0] - range[1]) / 2 / 50);
			return {
				Point       : target / data[LastIndex].close - 1,
				Start       : data[latestSignal].time,
				Target      : target,
				Side        : "SHORT",
				Last        : lastprice,
				leverage    : leverage,
			};
		}
	}catch(e){console.log(e)}
		return {Point:0};
	};
	const EoRfA = (data,period)=>{
		//var sd_ = Indicator.SD.calculate({period:period,values:[...data]});
		var diffs = 0;
		data.map((item, index)=>{
			if(index < 1)return;
			diffs += Math.abs(item - data[index - 1]);
		});
		diffs /= data.length - 1;
		const ema_ = Indicators.EMA.calculate({period:period,values:[...data]});
		var arr = [];
		for(var i=period - 1;i<data.length;i++){
			arr.push((data[i] - ema_[i - period +1]) / diffs);
		}
		return arr;
	};
	return ()=>{
		console.clear();
		console.log("Yeni aktif modül kuruldu V=" + new Date(mtime));
	};
})(ATA());