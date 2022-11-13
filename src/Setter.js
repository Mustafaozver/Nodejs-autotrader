module.exports = ((ATA)=>{
	const TDSequential = ATA.Require("./TDSQ");
	//const FAnalyzer = ATA.Require("./Financial.Analyzer");
	const Indicators = ATA.Require("technicalindicators");
	const FS = ATA.Require("fs");
	/*
	
	{
  getAvailableIndicators: [Function: getAvailableIndicators],
  AvailableIndicators: [
    'sma',
    'ema',
    'wma',
    'wema',
    'macd',
    'rsi',
    'bollingerbands',
    'adx',
    'atr',
    'truerange',
    'roc',
    'kst',
    'psar',
    'stochastic',
    'williamsr',
    'adl',
    'obv',
    'trix',
    'cci',
    'awesomeoscillator',
    'forceindex',
    'vwap',
    'volumeprofile',
    'renko',
    'heikinashi',
    'stochasticrsi',
    'mfi',
    'averagegain',
    'averageloss',
    'highest',
    'lowest',
    'sum',
    'FixedSizeLinkedList',
    'sd',
    'bullish',
    'bearish',
    'abandonedbaby',
    'doji',
    'bearishengulfingpattern',
    'bullishengulfingpattern',
    'darkcloudcover',
    'downsidetasukigap',
    'dragonflydoji',
    'gravestonedoji',
    'bullishharami',
    'bearishharami',
    'bullishharamicross',
    'bearishharamicross',
    'eveningdojistar',
    'eveningstar',
    'morningdojistar',
    'morningstar',
    'bullishmarubozu',
    'bearishmarubozu',
    'piercingline',
    'bullishspinningtop',
    'bearishspinningtop',
    'threeblackcrows',
    'threewhitesoldiers',
    'bullishhammerstick',
    'bearishhammerstick',
    'bullishinvertedhammerstick',
    'bearishinvertedhammerstick',
    'hammerpattern',
    'hammerpatternunconfirmed',
    'hangingman',
    'hangingmanunconfirmed',
    'shootingstar',
    'shootingstarunconfirmed',
    'tweezertop',
    'tweezerbottom',
    'ichimokucloud',
    'keltnerchannels',
    'chandelierexit',
    'crossup',
    'crossdown',
    'crossover'
  ],
  FixedSizeLinkedList: [class FixedSizeLinkedList extends LinkedList],
  CandleData: [class CandleData],
  CandleList: [class CandleList],
  sma: [Function: sma],
  SMA: [class SMA extends Indicator] { calculate: [Function: sma] },
  ema: [Function: ema],
  EMA: [class EMA extends Indicator] { calculate: [Function: ema] },
  wma: [Function: wma],
  WMA: [class WMA extends Indicator] { calculate: [Function: wma] },
  wema: [Function: wema],
  WEMA: [class WEMA extends Indicator] { calculate: [Function: wema] },
  macd: [Function: macd],
  MACD: [class MACD extends Indicator] { calculate: [Function: macd] },
  rsi: [Function: rsi],
  RSI: [class RSI extends Indicator] { calculate: [Function: rsi] },
  bollingerbands: [Function: bollingerbands],
  BollingerBands: [class BollingerBands extends Indicator] {
    calculate: [Function: bollingerbands]
  },
  adx: [Function: adx],
  ADX: [class ADX extends Indicator] { calculate: [Function: adx] },
  atr: [Function: atr],
  ATR: [class ATR extends Indicator] { calculate: [Function: atr] },
  truerange: [Function: truerange],
  TrueRange: [class TrueRange extends Indicator] {
    calculate: [Function: truerange]
  },
  roc: [Function: roc],
  ROC: [class ROC extends Indicator] { calculate: [Function: roc] },
  kst: [Function: kst],
  KST: [class KST extends Indicator] { calculate: [Function: kst] },
  psar: [Function: psar],
  PSAR: [class PSAR extends Indicator] { calculate: [Function: psar] },
  stochastic: [Function: stochastic],
  Stochastic: [class Stochastic extends Indicator] {
    calculate: [Function: stochastic]
  },
  williamsr: [Function: williamsr],
  WilliamsR: [class WilliamsR extends Indicator] {
    calculate: [Function: williamsr]
  },
  adl: [Function: adl],
  ADL: [class ADL extends Indicator] { calculate: [Function: adl] },
  obv: [Function: obv],
  OBV: [class OBV extends Indicator] { calculate: [Function: obv] },
  trix: [Function: trix],
  TRIX: [class TRIX extends Indicator] { calculate: [Function: trix] },
  forceindex: [Function: forceindex],
  ForceIndex: [class ForceIndex extends Indicator] {
    calculate: [Function: forceindex]
  },
  cci: [Function: cci],
  CCI: [class CCI extends Indicator] { calculate: [Function: cci] },
  awesomeoscillator: [Function: awesomeoscillator],
  AwesomeOscillator: [class AwesomeOscillator extends Indicator] {
    calculate: [Function: awesomeoscillator]
  },
  vwap: [Function: vwap],
  VWAP: [class VWAP extends Indicator] { calculate: [Function: vwap] },
  volumeprofile: [Function: volumeprofile],
  VolumeProfile: [class VolumeProfile extends Indicator] {
    calculate: [Function: volumeprofile]
  },
  mfi: [Function: mfi],
  MFI: [class MFI extends Indicator] { calculate: [Function: mfi] },
  stochasticrsi: [Function: stochasticrsi],
  StochasticRSI: [class StochasticRSI extends Indicator] {
    calculate: [Function: stochasticrsi]
  },
  averagegain: [Function: averagegain],
  AverageGain: [class AverageGain extends Indicator] {
    calculate: [Function: averagegain]
  },
  averageloss: [Function: averageloss],
  AverageLoss: [class AverageLoss extends Indicator] {
    calculate: [Function: averageloss]
  },
  sd: [Function: sd],
  SD: [class SD extends Indicator] { calculate: [Function: sd] },
  highest: [Function: highest],
  Highest: [class Highest extends Indicator] { calculate: [Function: highest] },
  lowest: [Function: lowest],
  Lowest: [class Lowest extends Indicator] { calculate: [Function: lowest] },
  sum: [Function: sum],
  Sum: [class Sum extends Indicator] { calculate: [Function: sum] },
  renko: [Function: renko],
  HeikinAshi: [class HeikinAshi extends Indicator] {
    calculate: [Function: heikinashi]
  },
  heikinashi: [Function: heikinashi],
  bullish: [Function: bullish],
  bearish: [Function: bearish],
  abandonedbaby: [Function: abandonedbaby],
  doji: [Function: doji],
  bearishengulfingpattern: [Function: bearishengulfingpattern],
  bullishengulfingpattern: [Function: bullishengulfingpattern],
  darkcloudcover: [Function: darkcloudcover],
  downsidetasukigap: [Function: downsidetasukigap],
  dragonflydoji: [Function: dragonflydoji],
  gravestonedoji: [Function: gravestonedoji],
  bullishharami: [Function: bullishharami],
  bearishharami: [Function: bearishharami],
  bullishharamicross: [Function: bullishharamicross],
  bearishharamicross: [Function: bearishharamicross],
  eveningdojistar: [Function: eveningdojistar],
  eveningstar: [Function: eveningstar],
  morningdojistar: [Function: morningdojistar],
  morningstar: [Function: morningstar],
  bullishmarubozu: [Function: bullishmarubozu],
  bearishmarubozu: [Function: bearishmarubozu],
  piercingline: [Function: piercingline],
  bullishspinningtop: [Function: bullishspinningtop],
  bearishspinningtop: [Function: bearishspinningtop],
  threeblackcrows: [Function: threeblackcrows],
  threewhitesoldiers: [Function: threewhitesoldiers],
  bullishhammerstick: [Function: bullishhammerstick],
  bearishhammerstick: [Function: bearishhammerstick],
  bullishinvertedhammerstick: [Function: bullishinvertedhammerstick],
  bearishinvertedhammerstick: [Function: bearishinvertedhammerstick],
  hammerpattern: [Function: hammerpattern],
  hammerpatternunconfirmed: [Function: hammerpatternunconfirmed],
  hangingman: [Function: hangingman],
  hangingmanunconfirmed: [Function: hangingmanunconfirmed],
  shootingstar: [Function: shootingstar],
  shootingstarunconfirmed: [Function: shootingstarunconfirmed],
  tweezertop: [Function: tweezertop],
  tweezerbottom: [Function: tweezerbottom],
  fibonacciretracement: [Function: fibonacciretracement],
  ichimokucloud: [Function: ichimokucloud],
  IchimokuCloud: [class IchimokuCloud extends Indicator] {
    calculate: [Function: ichimokucloud]
  },
  keltnerchannels: [Function: keltnerchannels],
  KeltnerChannels: [class KeltnerChannels extends Indicator] {
    calculate: [Function: keltnerchannels]
  },
  KeltnerChannelsInput: [class KeltnerChannelsInput extends IndicatorInput],
  KeltnerChannelsOutput: [class KeltnerChannelsOutput extends IndicatorInput],
  chandelierexit: [Function: chandelierexit],
  ChandelierExit: [class ChandelierExit extends Indicator] {
    calculate: [Function: chandelierexit]
  },
  ChandelierExitInput: [class ChandelierExitInput extends IndicatorInput],
  ChandelierExitOutput: [class ChandelierExitOutput extends IndicatorInput],
  crossUp: [Function: crossUp],
  CrossUp: [class CrossUp extends Indicator] { calculate: [Function: crossUp] },
  crossDown: [Function: crossDown],
  CrossDown: [class CrossDown extends Indicator] {
    calculate: [Function: crossDown]
  },
  setConfig: [Function: setConfig],
  getConfig: [Function: getConfig]
}
	
	
	
	*/
	
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
			if(newmtime != mtime){
				Exit();//process.exit();
			}
			ScanAllPairs();
		}
		PivotTime = thisTime;
	});
	const ScaleRange = (arr)=>{
		if(arr.length < 3)return 0.5;
		const max = Math.max.apply(Math, arr);
		const min = Math.min.apply(Math, arr);
		const last = arr[arr.length - 1];
		return (last - min) / (max - min);
	};
	const ScanAllPairs = ()=>{
	try{
		var arr = [];
		for(var pairkey in ATA.PAIRPOOL){
			SignalCheckresult = SignalCheck(ATA.PAIRPOOL[pairkey]);
			if(SignalCheckresult.Point !== 0)arr.push(Object.assign({
				P:pairkey,
			}, SignalCheckresult));
		}
		ATA.SendMessage({
			ID		: "DU",
			Answer	: arr
		});
	}catch(e){console.log(e)}
	};
	const SignalCheck = (data, check=false)=>{
	try{
		const LTtime = (new Date()).getTime() - 1000 * 60 * 3;
		const LastIndex = data.length - 1;
		if(data[LastIndex].time < LTtime)return {Point:0};
		const RSI_LIMIT = 19.8;
		const eorfa_LIMIT = 2.8;
		const tolerans = 1.005;
		const timeout = 200; // 4 saat
		var buy_setups = [];
		var sell_setups = [];
		
		const FPrice_ = Indicators.WMA.calculate({period:3,values:data.map(function(item){return item.close*0.40+item.high*0.30+item.low*0.30})});
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
		
		for(var i=StartIndex;i<=LastIndex-1;i++){ // analiz sınırı
			const candle = data[i];
			const RSI__ = RSI_[i - diff_RSI_];
			const MFI__ = MFI_[i - diff_MFI_];
			const RSIF__ = RSIF_[i - diff_RSIF_];
			const tdsq__ = tdsq_[i - diff_tdsq_];
			const eorfa__ = eorfa_[i - diff_eorfa_];
			//const SD__ = SD_[i - diff_SD_];
			
			var buy_ =	false;
			var sell_ =	false;
			
			buy_  ||= eorfa__ < -eorfa_LIMIT; // eorfa check
			sell_ ||= eorfa__ > +eorfa_LIMIT;
			
			buy_  ||= RSI__ < RSI_LIMIT; // rsi check
			sell_ ||= RSI__ > (100 - RSI_LIMIT);
			
			buy_  ||= MFI__ < RSI_LIMIT && candle.volume > 0; // mfi check
			sell_ ||= MFI__ > (100 - RSI_LIMIT) && candle.volume > 0;
			
			buy_  ||= RSIF__ < RSI_LIMIT; // rsif check
			sell_ ||= RSIF__ > (100 - RSI_LIMIT);
			
			buy_  ||= !!tdsq__.buySetupPerfection; // tom demark seq check
			sell_ ||= !!tdsq__.sellSetupPerfection;
			
			if(buy_ && sell_);
			else if(buy_) buy_setups.push(i);
			else if(sell_) sell_setups.push(i);
		}
		var range = [Infinity,-Infinity];
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
				if((i - index) > timeout) buy_setups[index]=-1; // gecikmiş sinyal
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
				if(fiborange < 0.61803398874990) sell_setups[index]=-1; // gecikmiş satım
				if((i - index) > timeout) sell_setups[index]=-1; // gecikmiş sinyal
			}
			if(Max/Min < tolerans) sell_setups[index]=-1;
			range = [Max, Min];
		}
		sell_setups = sell_setups.filter(function(item){
			return item > 0;
		});
		
		var turnVsign = buy_setups.length > 1
			&& ScaleRange([20].concat(RSI_.slice(-5))) > 0.38196601125011
			//&& ScaleRange(FPrice_) < 0.38196601125011
			&& Indicators.tweezerbottom({
				open: data.slice(-5).map(function(item){return item.open}),
				high: data.slice(-5).map(function(item){return item.high}),
				close: data.slice(-5).map(function(item){return item.close}),
				low: data.slice(-5).map(function(item){return item.low}),
			});
		
		var turnAsign = sell_setups.length > 1
			&& ScaleRange([80].concat(RSI_.slice(-5))) < 0.61803398874990
			//&& ScaleRange(FPrice_) > 0.61803398874990
			&& Indicators.tweezertop({
				open: data.slice(-5).map(function(item){return item.open}),
				high: data.slice(-5).map(function(item){return item.high}),
				close: data.slice(-5).map(function(item){return item.close}),
				low: data.slice(-5).map(function(item){return item.low}),
			});
		
		
		if(buy_setups.length > 0 && sell_setups.length > 0 || range[0] == [1])return {Point:0};
		else if (buy_setups.length > 0){
			const firstSignal = Math.min.apply(Math,buy_setups);
			const latestSignal = Math.max.apply(Math,buy_setups);
			const target = ((data[firstSignal].close + data[latestSignal].close) / 2 - ATR__).toPrecision(12)-0;
			const lastprice = data[LastIndex].close;
			const leverage = Math.min(Math.max(Math.floor(lastprice / (range[0] - range[1]) / 2 / 25), 2), 10);
			return {
				Point       : target / data[LastIndex].close - 1,
				Start       : data[latestSignal].time,
				Target      : target,
				Side        : "LONG",
				isLong      : true,
				Last        : lastprice,
				leverage    : leverage,
				Range       : range,
				Available   : turnVsign
								&& data[LastIndex].high < range[0]
								//&& data[LastIndex-1].high < range[0]
								,
			};
		}else if (sell_setups.length > 0){
			const firstSignal = Math.min.apply(Math,sell_setups);
			const latestSignal = Math.max.apply(Math,sell_setups);
			const target = ((data[firstSignal].close + data[latestSignal].close) / 2 + ATR__).toPrecision(12)-0;
			const lastprice = data[LastIndex].close;
			const leverage = Math.min(Math.max(Math.floor(lastprice / (range[0] - range[1]) / 2 / 25), 2), 10);
			return {
				Point       : target / data[LastIndex].close - 1,
				Start       : data[latestSignal].time,
				Target      : target,
				Side        : "SHORT",
				isLong      : false,
				Last        : lastprice,
				leverage    : leverage,
				Range       : range,
				Available   : turnAsign
								&& data[LastIndex].low > range[1]
								//&& data[LastIndex-1].low > range[1]
								,
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