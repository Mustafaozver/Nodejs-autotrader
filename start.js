((ATA)=>{
	const wt = ATA.Require("worker_threads");
	var WW;
	const HeartBeat = ()=>{
		
	};
	const OnMessage = ()=>{
		
	};
	const OnError = ()=>{
		
	};
	const OnExit = ()=>{
		
	};
	const BuildWW = ()=>{
		WW = new wt.Worker("./index.js");
		const addlistener = WW.addListener || WW.addEventListener;
		addlistener.apply(WW, ["message", async function(){
			OnMessage([...arguments]);
			HeartBeat();
		}]);
		addlistener.apply(WW, ["error", async function(){
			OnError([...arguments]);
			HeartBeat();
		}]);
		addlistener.apply(WW, ["exit", async function(){
			OnExit([...arguments]);
			HeartBeat();
		}]);
	};
	ATA.Setups.push(()=>{
		BuildWW();
	});
	ATA.Loops.push(()=>{
		const memdata = process.memoryUsage();
		if((memdata.heapUsed / memdata.heapTotal) > 0.98){
			
		}
	});
})(require("./src/ATA")());