module.exports = ((ATA)=>{
	const { spawn } = ATA.Require("child_process");
	const stack = {};
	let count = 0;
	const Prompt = class{
		_pshell = null;
		OnData = function(){};
		OnError = function(){};
		constructor(){
			const THAT = this;
			this.ID = "PRM_" + (count++);
			stack[this.ID] = this;
			this._pshell = spawn("powershell.exe", ["-Command", "-"]);
			this._pshell.stdout.on("data", function(data) {
				THAT.OnData(data.toString());
			});
			this._pshell.stderr.on("data", function(data) {
				THAT.OnError(data.toString());
			});
		};
		Command(cmd){
			this._pshell.stdin.write(cmd + "\n");
			// this._pshell.stdin.end();
		};
	};
	const GetPrompts = ()=>{
		return Object.keys(stack).map((key)=>{
			return stack[key];
		});
	};
	return{
		Prompt,
		GetPrompts,
	};
})(ATA());