(()=>{
	const { fork, spawn } = require("node:child_process");
	const BuildPR = ()=>{
		process._x = fork("index.js");
		process._x.on("message", (data)=>{
			console.log("data", data);
		});
		spawn(__dirname + "\\tools\\GoogleChromePortable\\GoogleChromePortable.exe", ["--app=http://localhost:8010/"]);
	};
	setTimeout(()=>{
		console.log("Starting...");
		BuildPR();
		setInterval(()=>{
			const memdata = process.memoryUsage();
			if((memdata.heapUsed / memdata.heapTotal) > 0.98){
				
			}
		},10000);
	}, 1000);
})();