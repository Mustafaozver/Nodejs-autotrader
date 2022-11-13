((ATA)=>{
	const subscribes = {};
	const stack = {};
	var count = 0;
	const configurationData = {
		supports_marks: true,
		supports_timescale_marks: true,
		supports_time: true,
		supports_search: true,
		supported_resolutions:["1"],
		symbols_types: [
			{name:"TUM", value:"TUM"}
		],
	};
	const SetOnChangeSymbol = (func)=>{
		_OnChangeSymbol = func;
	};
	const TVDatafeeds = class{
		ID = "";
		Bars = [];
		Symbol = "BTCUSDT";
		Last = 0;
		constructor(){
			this.ID = "TVUDF_" + (count++);
			stack[this.ID] = this;
		};
		getServerTime(callback){
			$.ajax({
				type:"GET",
				url:"/time",
				success: callback,
			});
			//callback(Math.floor((new Date()).getTime()));
		};
		_onReady_callback = null;
		onReady(callback){
			const THAT = this;
			this._onReady_callback = callback;
			setTimeout(()=>{
				THAT._onReady_callback(configurationData);
			},10)
		};
		_searchSymbols_onResultReadyCallback = null;
		searchSymbols(userInput, exchange, symbolType, onResultReadyCallback){
			const THAT = this;
			this._searchSymbols_onResultReadyCallback = onResultReadyCallback;
			$.ajax({
				type:"GET",
				url:"/SEARCH?query="+userInput,
				success:(result)=>{
					THAT._searchSymbols_onResultReadyCallback(result);
				},
			});
		};
		_getBars_onResult = null;
		getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate, onResult, onError){
			const THAT = this;
			this._getBars_onResult = onResult;
			$.ajax({
				type:"GET",
				url:"/history?symbol="+symbolInfo.ticker + "&from=" + rangeStartDate + "&to=" + rangeEndDate,
				success:(result)=>{
					THAT._getBars_onResult(result.t.map((item,index)=>{
						return {
							time: parseInt(item) * 1000,
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
		_resolveSymbol_onSymbolResolvedCallback = null;
		resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback){
			const THAT = this;
			this._resolveSymbol_onSymbolResolvedCallback = onSymbolResolvedCallback;
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
				name: symbol,
				description: symbol,
				"exchange-listed": symbol,
				"exchange-traded": symbol,
				has_intraday: true,
				has_no_volume: false,
				minmov: 1,
				minmov2: 0,
				name: symbol,
				pointvalue: 1,
				pricescale: 1000000,
				session: "24x7",
				supported_resolutions: ['1'],//, '5', '10', '15', '20', '30', '60', '120', '240', 'D', '2D', '3D', 'W', '3W', 'M', '6M'],
				ticker: symbol,
				timezone: "Europe/Istanbul",
				type: "Crypto",
				volume_precision: 5,
			};
			setTimeout(()=>{
				THAT._resolveSymbol_onSymbolResolvedCallback(data);
			},10)
		};
		_subscribeBars_onRealtimeCallback = null;
		subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback){
			const THAT = this;
			this._subscribeBars_onRealtimeCallback = onRealtimeCallback;
			this.Symbol = symbolInfo.ticker;
			subscribes[subscribeUID] = onRealtimeCallback;
		};
		unsubscribeBars(subscribeUID){
			
		};
		
		
		
		calculateHistoryDepth(resolution, resolutionBack, intervalBack){
			//optional
			console.warn('=====calculateHistoryDepth running')
			// while optional, this makes sure we request 24 hours of minute data at a time
			// CryptoCompare's minute data endpoint will throw an error if we request data beyond 7 days in the past, and return no data
			return resolution < 60 ? {resolutionBack: 'D', intervalBack: '1'} : undefined
		}
		_getMarks_onResult = null;
		getMarks(symbolInfo, rangeStartDate, rangeEndDate, onResult, resolution){
			const THAT = this;
			this._getMarks_onResult = onResult;
			$.ajax({
				type:"GET",
				url:"/marks?symbol="+symbolInfo.ticker + "&from=" + rangeStartDate + "&to=" + rangeEndDate,
				success:(result)=>{
					THAT._getMarks_onResult(result.map((item,index)=>{
						return {
							time: item.time / 1000,
							id: item.id,
							color: item.color,
							text: item.text,
							label: item.label,
							labelFontColor: item.labelFontColor,
							minSize: 5,
						}
					}));
				},
			});
		}
		getTimeScaleMarks(symbolInfo, rangeStartDate, rangeEndDate, onResult, resolution){
			//optional
			console.warn('=====getTimeScaleMarks running')
		}
		
		
		
		
		
		Loop(data){
			this._subscribeBars_onRealtimeCallback(data);
		};
		Update(){
			const THAT = this;
			const nowtime = Math.floor((new Date()).getTime() / 1000);
			$.ajax({
				type:"GET",
				url:"/history?symbol=" + this.Symbol + "&from=" + (nowtime - 60*3) + "&to=" + 2101010101010,
				success:(result)=>{
					const lastIndex = result.t.length - 1;
					THAT.Last = result.c[lastIndex];
					try{
						THAT._subscribeBars_onRealtimeCallback({
							time: parseInt(result.t[lastIndex - 1]) * 1000,
							close: parseFloat(result.c[lastIndex - 1]),
							open: parseFloat(result.o[lastIndex - 1]),
							high: parseFloat(result.h[lastIndex - 1]),
							low: parseFloat(result.l[lastIndex - 1]),
							volume: parseFloat(result.v[lastIndex - 1]),
						});
					}catch(e){}
					THAT._subscribeBars_onRealtimeCallback({
						time: parseInt(result.t[lastIndex]) * 1000,
						close: parseFloat(result.c[lastIndex]),
						open: parseFloat(result.o[lastIndex]),
						high: parseFloat(result.h[lastIndex]),
						low: parseFloat(result.l[lastIndex]),
						volume: parseFloat(result.v[lastIndex]),
					});
				}
			});
		};
	};
	ATA.Loops.push(()=>{
		for(var key in stack){
			stack[key].Update();
		}
	});
	window.TVDatafeeds = TVDatafeeds;
})(ATA());