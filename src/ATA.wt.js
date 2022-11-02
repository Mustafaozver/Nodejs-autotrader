(async(ATA)=>{
ATA.isReady = true;
ATA.isDebug = false;
ATA.isMaster = false;
process.on("unhandledRejection", function(err){
	console.log("Unhandled rejection:", err);
	console.log(ATA._R + " has been stopped.");
	setTimeout(()=>{
		process.exit();
	},100);
});
})(require("./ATA")());