(()=>{
	const wt = require("worker_threads");
	var WW;
	const HeartBeat = ()=>{
		
	};
	const OnMessage = (args)=>{
		
	};
	const OnError = (args)=>{
		BuildWW();
	};
	const OnExit = (args)=>{
		BuildWW();
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
	setTimeout(()=>{
		console.log("Starting...");
		BuildWW();
		setInterval(()=>{
			const memdata = process.memoryUsage();
			if((memdata.heapUsed / memdata.heapTotal) > 0.98){
				
			}
		},10000);
	}, 1000);
})();