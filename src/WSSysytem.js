module.exports = (()=>{
	const WebSocket = require("ws");
	var _id = 0;
	var _wss = {};
	const IDGenerate = ()=>{
		return _id++;
	};
	const _status = {
		[WebSocket.CLOSED]:0,
		[WebSocket.OPEN]:1,
		[WebSocket.CONNECTING]:2,
		[WebSocket.CLOSING]:3,
	};
	const WSSystem = class{
		static _period = 30000;
		static _PivotTime = 0;
		static Setup(){
			
		};
		static Loop(){
			const thisTime = (new Date()).getTime();
			const PivotTime = thisTime % _period;
			const lastPivotTime = _PivotTime % _period;
			if (PivotTime < lastPivotTime){
				for(var key in _wss){
					_wss[key].Check();
				}
			}
			_PivotTime = thisTime;
		};
		isAlive = false;
		OnMessage = function(data){};
		OnOpen = function(){};
		OnClose = function(){};
		OnPing = function(){};
		OnError = function(){};
		LastActivite = (new Date()).getTime();
		URL = "";
		WS = false;
		ID = "";
		constructor(url){
			this.URL = url;
			this.ID = "WS_" + IDGenerate();
			
			_wss[this.ID] = this;
			this.Connect();
		};
		Check(){
			
		};
		GetStatus(){
			if(!this.WS)return "C";
			if((this.LastActivite + 60000) < (new Date()).getTime()){
				if(this.WS.readyState == WebSocket.OPEN){
					this.WS.terminate();
				}
				return "C";
			}
			switch(_status[this.WS.readyState]){
				default:
				case 0:
					return "C";
					break;
				case 1:
					return "O";
					break;
				case 2:
					return "o";
					break;
				case 3:
					return "c";
					break;
			}
		};
		Connect(){
			var checkid = this.ID + "_" + IDGenerate();
			var THAT = this;
			this.WS = new WebSocket(this.URL);
			this.WS.CheckID = checkid;
			this.WS.on("open",()=>{
				THAT.OnOpen();
			});
			this.WS.on("message",(data)=>{
				THAT.OnMessage(data);
			});
			this.WS.on("close",()=>{
				THAT.OnClose();
			});
			this.WS.on("ping",()=>{
				THAT.OnPing();
			});
			this.WS.on("error",(err)=>{
				THAT.OnError();
			});
		};
	};
	return WSSystem;
})();