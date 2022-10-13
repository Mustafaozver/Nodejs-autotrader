(async(ATA)=>{
ATA.isReady = true;
ATA.isDebug = false;
ATA.isMaster = false;
process.on("unhandledRejection", function(err){
	console.log("Unhandled rejection:", err);
	process.exit();
});
})(require("./ATA")());