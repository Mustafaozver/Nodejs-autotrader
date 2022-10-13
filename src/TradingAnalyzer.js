module.exports = ((ATA)=>{
	const TradeInterface = ATA.Require("./TradeInterface");
	const Thread = ATA.Require("./Thread");
	const {FixNumber, GetPair, GetPairList, SetListenerCheck, Pair, Instrument} = ATA.Require("./FinancialClasses");
	var wor = null;
	var pairlist = [];
	var trustedList = [];
	var counter = 0;
	const ListenerCheck = (pair)=>{
		const console = {
			log:()=>{},
		};
		try{
			console.log("|14");
			if(pair.Type != "+")return false;
			switch (pair.Instrument1.Symbol){
				default:
					console.log("|17");
					return false;
				case "USDT":
				case "BUSD":
				//case "DAI":
				case "TRY":
				case "BTC":
				case "BNB":
				case "ETH":
				//case "TRX":
				//case "RUB":
				//case "EUR":
				//case "GBP":
				//case "AUD":
				break;
			}
			const buyrate1 = pair.Buy/1;
			const sellrate1 = pair.Sell/1;
			console.log("|34");
			if(sellrate1 / buyrate1 > 1.005)return false;
			
			var buyrate2 = ""+FixNumber(buyrate1,pair.TickSize);
			var sellrate2 = ""+FixNumber(sellrate1,pair.TickSize);
			console.log("|38");
			if (buyrate2.indexOf("e") > 0)return false;
			if (sellrate2.indexOf("e") > 0)return false;
			
			buyrate2 = buyrate2/1;
			sellrate2 = sellrate2/1;
			console.log("|43");
			if (buyrate2 == sellrate2)return false;
			if (buyrate1 != buyrate2)return false;
			if (sellrate1 != sellrate2)return false;
			
			const tokenext1 = "UPUSDT";
			const tokenext2 = "DOWNUSDT";
			var tokenize = "" + pair.Instrument0.Symbol + "" + pair.Instrument1.Symbol;
			console.log("|50");
			if (tokenize.substring(tokenize.length - tokenext1.length) == tokenext1)return false;
			if (tokenize.substring(tokenize.length - tokenext2.length) == tokenext2)return false;
			
			var data = [];
			pair.Candle.data.map(function(item){
				//data.push(Number(item.close));
				data.push(Number(item.high));
				data.push(Number(item.low));
			});
			const temp = {};
			var d = 0;
			for (var i=0;i<data.length;i++){
				var key = "_" + data[i].toPrecision(7);
				if (temp[key]) d++;
				else temp[key] = true;
			}
			console.log("|66");
			if ((d / data.length) > 0.5) return false;
			return true;
		}catch(e){console.log("|75", e)}
		
		console.log("|71");
		return false;
	};
	const MakeReadyTradeList = async()=>{
		await ATA.waitUntil("(()=>{console.log(\"Preparing...\");return !!(ATA.Require(\"./FinancialClasses\").GetPair(\"BTCUSDT\"))})()","",500);
		const FutureExchangeInfo = await TradeInterface.GetFutureExchangeInfo();
		FutureExchangeInfo.symbols.map((item)=>{
			const pair = GetPair(item.symbol);
			pair.tradable = true;
			trustedList[item.symbol] = !!pair;
		});
		ATA.Loops.push(()=>{
			pairlist = GetPairList().filter((item)=>{
				const pair = GetPair(item);
				return trustedList[item] && ListenerCheck(pair);
			});
		});
		setInterval(()=>{
			if(counter < pairlist.length){
				const pairkey = pairlist[counter];
				wor.Run(function(){
					const pairkeys = arguments[0];
					const ohlcvts = arguments[1];
					ATA().SetVariable("pairkeys", pairkeys);
					ATA().SetVariable("ohlcvts", ohlcvts);
					//console.log("PARITE => ", ATA().GetVariable("pairkeys"));
					//console.log("OHLCVTS => ", ATA().GetVariable("ohlcvts"));
					ATA().PAIRPOOL[pairkeys] = ohlcvts;
				}, [pairkey ,GetPair(pairkey).Candle.data]);
				counter++;
				return;
			}
			counter = 0;
		},50);
		console.log("Setup is DONE.");
	};
	ATA.Setups.push(async()=>{
		const OpenThread = (codes)=>{
			wor = new(Thread);
			wor.OnExit = (e)=>{
				console.clear();
				wor.Create();
				wor.Run(codes);
			};
			wor.Run(codes);
			wor.OnMessage = (data)=>{
				switch(data.ID){
					case "DU":
						console.log(data.Answer);
					break;
				}
			};
		};
		OpenThread(()=>{
			ATA().Setups.push(()=>{
				ATA().SetVariable("scan", ()=>{});
				ATA().PAIRPOOL = {};
				ATA().Require("./Setter")();
				ATA().Loops.push(()=>{
					ATA().GetVariable("scan")();
				});
			});
			return true;
		});
		
		
		ATA.Setups.push(async()=>{
			const SpotExchangeInfo = await TradeInterface.GetSpotExchangeInfo();
			SpotExchangeInfo.symbols.map((item)=>{
				const pair = GetPair(item.symbol);
				pair.permissions = item.permissions;
			});
			console.log("OKKK");
			SetListenerCheck(ListenerCheck);
			MakeReadyTradeList();
		});
		
		

		
		
		
    });
})(ATA());