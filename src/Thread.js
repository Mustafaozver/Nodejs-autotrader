module.exports = ((ATA)=>{
	const wt = ATA.Require("worker_threads");
	const datapool = {};
	ATA.SetVariable = (key, value)=>{
		datapool["" + key] = value;
	};
	ATA.GetVariable = (key)=>{
		return datapool["" + key];
	};
	ATA.SetVariable("lo", "Mustafa ÖZVER");
	const Thread = class{
		OnMessage = function(msg){};
		OnExit = function(){};
		OnError = function(){};
		constructor(){
			this.Create();
		};
		Create(){
			var THAT = this;
			this._WW = new wt.Worker("./src/ata.wt.js");
			var addlistener = this._WW.addListener || this._WW.addEventListener;
			addlistener.apply(this._WW, ["message", async function(){
				THAT.OnMessage.apply(THAT,[...arguments]);
			}]);
			addlistener.apply(this._WW, ["error", function(){
				THAT.OnError.apply(THAT,[...arguments]);
			}]);
			addlistener.apply(this._WW, ["exit", function(){
				THAT.OnExit.apply(THAT,[...arguments]);
			}]);
		};
		Terminate(){
			this._WW.terminate();
		};
		InjectData(key, value){
			this.Run("(function(ATA,key,value){ATA.SetVariable(key,value);})(ATA()," + JSON.stringify(key) + "," + JSON.stringify(value) + ");");
		};
		Run(code, args=[]){
			code = "(" + code + ")(" + args.map(JSON.stringify).join(",") + ")";
			var ID = "1";
			this._WW.postMessage({
				ID:ID,
				EVAL:code,
			});
		};
	};
	return Thread;
})(ATA());