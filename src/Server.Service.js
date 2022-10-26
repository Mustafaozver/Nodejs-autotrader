module.exports = ((ATA)=>{
	var count = 0;
	const stact = {};
	const GetServicesList = ()=>{
		return Object.keys(stact);
	};
	const GetService = (name)=>{
		return stact[name];
	};
	const Service = class{
		ID = "";
		Name = "";
		Level = 0;
		Licence = false;
		__socket = null;
		OnData = (data)=>{};
		constructor(name, socket){
			this.ID = "SRV_" + (count++);
			this.Name = "" + name;
			this.__socket = socket;
			stact[this.ID] = this;
		};
		Send(msgtype, data){
			this.__socket.emit(msgtype, data);
		};
		Start(){
			this.__socket.join("STR2");
			var THAT = this;
			this.__socket.on("DATA",(data)=>{
				THAT.OnData(data);
			});
			this.Send("NAME",this.ID);
		};
		Execute(_f, args){
			this.Send("DATA",{
				EVAL:"("+_f+")("+JSON.stringify(args, null, "\t")+")"
			});
		};
			
	};
	return {
		Service,
		GetService,
		GetServicesList,
	};
})(ATA());