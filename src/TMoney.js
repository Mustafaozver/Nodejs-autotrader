module.exports = ((ATA)=>{
	const {GetPricePUSDT, GetPair, GetPairList, SetListenerCheck, Pair, Instrument} = ATA.Require("./FinancialClasses");
	const FollowList = [
		"BTC", "ETH", "SOL", "XRP", "BNB", "ETC", // Crypto currencies
		"TRY", "USDT", "BUSD", "EUR", "GBP", // Fiat Currencies
		"PAXG", // Metal-Baked Currencies
	];
	new Instrument("TMONEY");
	const TMoney = new Pair("TMONEY","USDT");
	TMoney.Type = "V";
	TMoney.Update(0, 0);
	var Series = {};
	var Weights = {};
	const GetOHLCPUSDT = (code)=>{
		const len = GetPair("BTCUSDT").Candle.data.length;
		var arr = [];
		for(var i=1;i<=len;i++){
			const price = GetPricePUSDT(code, -i) - 0;
			if(typeof(price) != "number")return false;
			if(price <= 0)return false;
			if(!isFinite(price))return false;
			arr.unshift(price);
		}
		return arr;
	};
	const ObjectMap = (obj, func)=>{
		const obj2 = {};
		Object.keys(obj).map((item, index)=>{
			obj2[item] = func(obj[item], index, obj);
		});
		return obj2;
	};
	const Avg = (arr)=>{
		return arr.reduce((a,b)=>{return(a+b)}, 0) / arr.length;
	};
	const Stdev = (arr)=>{
		const _avg = Avg(arr);
		return arr.reduce((a,b)=>{return(a+Math.abs(b - _avg))}, 0) / arr.length;
	};
	const ScaleTo1 = (arr)=>{
		const _avg = Avg(arr);
		return arr.map((item)=>{
			return item / _avg;
		});
	};
	const CalculateTRatio = (series, weights)=>{

		const _stdev_series = series.map(stdev);
		const total_stdev = _stdev_series.reduce((a,b)=>{return(a+b)}, 0);
		const rational_stdev_series = _stdev_series.map((item)=>{return(item / total_stdev)});
		const weight_series = rational_stdev_series.map((item)=>{return(1)});
		
		
		var totalSerie = series[0].map(function(item1,index1){
			var tot = 0;
			series.map(function(item2,index2){
				tot += item2[index1] * weights[index1] / _avg_series[1];
			});
			return tot;
		});
		var ratioSerie = series.map(function(item1){
			return item1.map(function(item2,index2){
				return item2 / totalSerie[index2];
			});
		});
		var SSs = ratioSerie.map(function(item){
			return Avg(item);
		});
		var totalWeight = 0;
		SSs.map(function(item1){
			totalWeight += 1 / item1;
		});
		weights = SSs.map(function(item1){
			return (1/item1) / totalWeight;
		});
		var t = 0;
		weights.map(function(item1,index1){
			var serie__ = series[index1];
			t += /*last*/serie__[serie__.length - 1] * item1;
		});
		return t.toPrecision(12)-0;
	};
	setTimeout(()=>{
		ATA.Loops.push(()=>{
			const _series = [];
			var _weight = [];
			const _instru = [];
			for(var i=0;i<FollowList.length;i++){
				const instrumentkey = FollowList[i];
				const ohlcs = GetOHLCPUSDT(instrumentkey);
				if(ohlcs && ohlcs[0] > 0 ){
					Series[instrumentkey] = ohlcs;
					//Weights[instrumentkey] = Weights[i] > 0 ? Weights[i] : 1;
					_series.push(ohlcs.slice(-50));
				}else{
					_series.push(Series[instrumentkey]);
				}
				_instru.push(instrumentkey);
				_weight.push(Weights[instrumentkey] > 0 ? Weights[instrumentkey] : 1);
			}
			
			const seriesofNum = _series.length;
			const lastindex = _series[0].length;
			const scaled_series = _series.map((item)=>{
				return ScaleTo1(item);
			});
			
			const _tmoneytempIndex = Array.from({length:scaled_series[0].length}).fill(0).map((_z, index)=>{
				return scaled_series.reduce((acc,item)=>{
					return acc + item[index];
				},0) / seriesofNum;
			});
			
			const rational_series = scaled_series.map((item)=>{
				return item.map((item2, index2)=>{
					return item2 / _tmoneytempIndex[index2];
				});
			});
			
			const rational_stdev = rational_series.map(Stdev);
			const total_rational_stdev = rational_stdev.reduce((a,b)=>{return(a+1/b)}, 0);
			const calculatedWeights = rational_stdev.map((item)=>{
				return 1 / item / total_rational_stdev;
			});
			
			const _TMoney = calculatedWeights.map((item, index)=>{
				Weights[_instru[index]] = item - 0;
				return item * _series[index][lastindex - 1];
			}).reduce((a,b)=>{return(a+b)}, 0);
			
			if(typeof(t) == "number" && t > 0) GetPair("TMONEYUSDT").Update(_TMoney, 0);
			console.log("TMONEY/USD => ", _TMoney, " => ", TMoney.valueOf());
		});
		ATA.Loops.push(()=>{
			
		});
	},3 * 60 / 1000);
	
	
	
})(ATA());