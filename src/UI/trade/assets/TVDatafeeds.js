(()=>{
	const subscribes = {};
	const configurationData = {
		supports_marks: true,
		supports_timescale_marks: true,
		supports_time: true,
		supports_search: true,
		supported_resolutions:["3"],
		symbols_types: [
			{name:"TUM", value:"TUM"}
		],
	};
	const TVDatafeeds = class{
		URL = "";
		WS = "";
		HTTP = false;
		HTTPS = false;
		Bars = [];
		constructor(){
			console.warn("ÇÖZ =>", "constructor", [...arguments]);
			
		};
		getServerTime(callback){
			console.warn("ÇÖZ =>", "getServerTime", [...arguments]);
			$.ajax({
				type:"GET",
				url:"/time",
				success: callback,
			});
			//callback(Math.floor((new Date()).getTime()));
		};
		onReady(callback){
			console.warn("ÇÖZ =>", "onReady", [...arguments]);
			setTimeout(()=>{
				callback(configurationData);
			},10)
		};
		searchSymbols(userInput, exchange, symbolType, onResultReadyCallback){
			console.warn("ÇÖZ =>", "searchSymbols", [...arguments]);
			$.ajax({
				type:"GET",
				url:"/SEARCH?query="+userInput,
				success: onResultReadyCallback,
			});
		};
		getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate, onResult, onError){
			console.warn("ÇÖZ =>", "getBars", [...arguments]);
			$.ajax({
				type:"GET",
				url:"/history?symbol="+symbolInfo.ticker + "&from=" + rangeStartDate + "&to=" + rangeEndDate,
				success:(result)=>{
					console.log(result, typeof result);
					onResult(result.t.map((item,index)=>{
						return {
							time: item,
							close: parseFloat(result.c[index]),
							open: parseFloat(result.o[index]),
							high: parseFloat(result.h[index]),
							low: parseFloat(result.l[index]),
							volume: parseFloat(result.v[index])
						}
					}),{noData: false})
				},
			});
			
		};
		resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback){
			console.warn("ÇÖZ =>", "resolveSymbol", [...arguments]);
			var splitted = symbolName.split(":");
			const prefix = splitted[0];
			var symbol = "BTCUSDT";
			if(splitted.length == 2){
				symbol = splitted[1];
			}else if(splitted.length == 1){
				var splitted = symbolName.split("_");
				if(splitted.length == 3){
					symbol = splitted[1] + splitted[2];
				}
			}
			const data = {
				data_status: "streaming",
				description: symbol,
				"exchange-listed": symbol,
				"exchange-traded": symbol,
				has_intraday: true,
				has_no_volume: false,
				minmov: 1,
				minmov2: 0,
				name: symbol,
				pointvalue: 1,
				pricescale: 100,
				session: "0955-1815",
				supported_resolutions: ['1'],//, '5', '10', '15', '20', '30', '60', '120', '240', 'D', '2D', '3D', 'W', '3W', 'M', '6M'],
				ticker: symbol,
				timezone: "Europe/Istanbul",
				type: "Crypto",
				volume_precision: 2,
			};
			setTimeout(()=>{
				onSymbolResolvedCallback(data);
			},10)
		};
		subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback){
			console.warn("ÇÖZ =>", "subscribeBars", [...arguments]);
			subscribes[subscribeUID] = onRealtimeCallback;
		};
		unsubscribeBars(subscribeUID){
			console.warn("ÇÖZ =>", "unsubscribeBars", [...arguments]);
			
		};
	};
	
	window.TVDatafeeds = TVDatafeeds;
})(ATA());