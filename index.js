((ATA)=>{
	ATA.isReady = true;
	ATA.isDebug = false;
	ATA.isMaster = true;
	
	const FS = ATA.Require("fs");
	ATA.Require("./TradingAnalyzer");
	ATA.Require("./Server");
	
	process.on("unhandledRejection", function(err){
		console.log("Unhandled rejection:", err);
		process.exit();
	});
	
	const TradeInterface = ATA.Require("./TradeInterface");
	const {CandleStick, Candle, Instrument, Pair, FinancialPosition, GetPair} = ATA.Require("./FinancialClasses");
	
	TradeInterface.SetListenerUpdate((x)=>{
		const pair0 = GetPair(x.symbol);
		const vol = Math.abs(x.dailyVolume - pair0.dailyVolume);
		pair0.Update(x.Price, vol);
		pair0.UpdateBidAsk(x.Buy, x.Sell);
		pair0.dailyVolume = x.dailyVolume;
	});
	
	ATA.Loops.push(()=>{
		const pair0 = GetPair("BTCUSDT");
		((text)=>{
			//console.clear();
			console.log(text);
		})(pair0.DetailedText);
	});
	setInterval(console.clear, 1000 * 60 * 5);
})(require("./src/ATA")());