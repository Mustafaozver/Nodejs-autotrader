if (!ATA) throw new Error("ATA kütüphanesi gereklidir.");
//ATA().isDebug = true;

function ToggleFullScreen(){
	if(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement){
		if(document.exitFullscreen)document.exitFullscreen();
		else if(document.mozCancelFullScreen)document.mozCancelFullScreen();
		else if(document.webkitExitFullscreen)document.webkitExitFullscreen();
		else if(document.msExitFullscreen)document.msExitFullscreen();
		$(".ToggleFullScreen")
			.addClass("fa-expand")
			.removeClass("fa-compress");
	}else{
		element = document.body;
		if(element.requestFullscreen)element.requestFullscreen();
		else if(element.mozRequestFullScreen)element.mozRequestFullScreen();
		else if(element.webkitRequestFullscreen)element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
		else if(element.msRequestFullscreen)element.msRequestFullscreen();
		$(".ToggleFullScreen")
			.removeClass("fa-expand")
			.addClass("fa-compress");
    }
}

var DecodeObject = function(obj){
	if(obj)
	switch ((typeof obj).toLowerCase()) {
		default:
		case "string": // String
			return JSON.stringify(obj);
		break;
		case "object": // Object or Array or else
			var objType = obj.constructor.name;
			var text;
			switch(objType.toLowerCase()){
				default:break;
				case "array": // Array
					text = [];
					for(var i=0;i<obj.length;i++) text.push(DecodeObject(obj[i]));
					return "[" + text.join(",") + "]";
					break;
				case "object": // Object
					var keys = Object.keys(obj);
					text = "";
					for (var i=0;i<keys.length;i++) {
						try{
							if(!obj[keys[i]])continue; // Unreadable values
							//if(keys[i] == "")continue;
							text += (keys[i]) + ":" + DecodeObject(obj[keys[i]]) + "";
							if (i < keys.length - 1) text += ",";
						}catch(e){
							return "{}";
						}
					}
					return "{" + text + "}";
				break;
			}
			if (objType == "RegExp"){
				return (obj)+""; // "new RegExp()";
			}
			if (objType == "Error"){
				return "new Error(\"\")";
			}
			//return "Object.assign(new " + objType + "(),{" + text + "})";
			return"{}";
		break;
		case "number": // Number
			return obj;
		break;
		case "function": // Function
			return obj+"";
		break;
		case "boolean": // Boolean
			return obj+"";
		break;
	}
};


var WSSystem = function(url){
	this.URL = url;
	this.WS = false;
	this.OnMessage = function(){};
	this.OnOpen = function(){};
	this.OnClose = function(){};
	this.OnPing = function(){};
	this.LastActivite = (new Date()).getTime();
	//this.Connect();
};
WSSystem.prototype.Connect = function(){
	var THAT = this;
	var statu = this.GetStatus();
	try {
		switch(statu){
			case "NONE":break;
			case "CLOSED":delete this.WS;break;
			case "CLOSING":
			case "CONNECTING":setTimeout(function(){THAT.Connect();},50);break;
			case "OPEN":this.WS.terminate();break;
		}		
		this.WS = new WebSocket(this.URL);
		this.WS.on("open",function(){
			THAT.Ping();
			THAT.OnOpen();
		});
		this.WS.on("message",function(data){
			THAT.Ping();
			THAT.OnMessage(data);
		});
		this.WS.on("close",function(){
			THAT.OnClose();
		});
		this.WS.on("ping",function(){
			THAT.OnPing();
			THAT.Ping();
		});
		this.WS.on("error",function(err){
			console.log(err.stack);
			THAT.OnClose();
		});
	}catch(e){
		setTimeout(function(){
			THAT.Connect();
		},50);
	}
};
WSSystem.prototype.Ping = function(){
	this.LastActivite = (new Date()).getTime();
};
WSSystem.prototype.Send = function(msg){
	var statu = this.GetStatus();
	if (statu == "OPEN") this.WS.send(msg);
	else return false;
};
WSSystem.prototype.GetStatus = function(){
	if((this.LastActivite + 10000) < (new Date()).getTime()){
		if(this.WS.readyState == "OPEN"){
			this.Close();
			return "CLOSED";
		}
	}
	switch(this.WS.readyState){
		case ATA.WebSocket.CONNECTING:
			 return "CONNECTING";
		break;
		case ATA.WebSocket.OPEN:
			 return "OPEN";
		break;
		case ATA.WebSocket.CLOSING:
			 return "CLOSING";
		break;
		case ATA.WebSocket.CLOSED:
			 return "CLOSED";
		break;
	}
	return "NONE";
};
WSSystem.prototype.Close = function(){
	var THAT = this;
	var statu = this.GetStatus();
	try {
		if (statu == "CONNECTING") {
			this.WS.terminate();
		} else if (statu == "OPEN") this.WS.terminate(); // close
		else if (statu == "NONE") return;
		else if (this.GetStatus() == "CLOSING") return;
		else if (statu == "CLOSED") return;
	} catch (E){
	}
};

// ATA().Settings.PORT=1682;ATA().Settings.DOMAIN="localhost";

ATA().Setups.push(function(){
	ATA.Socket = io("ws://" + window.location.host,{
		path:"/SOCKET"
	});
	ATA.Socket.on("0",function(){
		ATA.Socket.emit("0");
		ATA.Socket.on("APPROVED",function(){
			ATA.Socket.emit("JOIN",ATA().Settings.ID);
			ATA.Socket.on("DATA",function(data){
				ATA.InterFace.ParseMessage(data);
			});
			ATA.SendData = function(data){
				ATA.Socket.emit("DATA",data);
			};
		});
	});
});

var Instrument = function(symbol){
	this.Symbol = symbol;
};

var Pair = function(symbol){
	this.Symbol = symbol;
};

ATA.InterFace = {
	Instruments:{},
	Pairs:{},
	GetPair:function(symbol){
		symbol = (symbol+"").toUpperCase();
		if(!this.Pairs[symbol])this.Pairs[symbol] = new Pair(symbol);
		return this.Pairs[symbol];
	},
	GetInstrument:function(symbol){
		symbol = (symbol+"").toUpperCase();
		if(!this.Instruments[symbol])this.Instruments[symbol] = new Instrument(symbol);
		return this.Instruments[symbol];
	},
	ParseMessage:function(msg){
		if(msg.EVAL){
			var generatedRes;
			var err = false;
			try {
				var code = msg.EVAL+"";
				generatedRes = eval.apply(ATA.GLOBAL,["try{var generatedRes=("+code+");}catch(e){generatedRes=e};generatedRes"]);
			} catch (e) {
				generatedRes = e.message;
				err = true;
			}
		}
	},
	ResponseFunctions:{
		DEFAULT:function(){
			console.log("Bilinmeyen => " + arguments);
		},
	},
	Post:function(ajaxd,data){
		var AjaxData = {
			url:"/?" + $.param(data),
			type:"POST",
			data:{},
			success:function(response) {},
			error:function(){}
		};
		Object.assign(AjaxData,ajaxd);
		$.ajax(AjaxData);
	},
};

ATA.GetContextMenu = function(params){
	var result = params.defaultItems ? params.defaultItems.splice(0) : [];
	//console.log("getContextMenuItems",result);
	//return result;
	return [
		{
			name:"Excel'e Çıkar",
			icon:"<i class=\"fa fa-table\" style=\"width:14px;height:14px;font-size:14px;\"></i>", // "<img src=\"images/lab.svg\"  style=\"width:14px;height:14px;font-size:14px;\" />"
			action:function(){
				//ATA.PriceTable.gridOptions.api.exportDataAsExcel(params);
			}
		},
		{
			name:"Sembol Analiz",
			icon:"<i class=\"fa fa-graph\" style=\"width:14px;height:14px;font-size:14px;\"></i>",
			action:function(){
				var symbol = params.node.data.Symbol;
				ATA.SymbolAnalysis(symbol);
			 },
		},
		"separator",
		{
			name:"Console",
			action:function(){
				console.log(params.node.data);
			}
		},
		"chartRange",
		{
			name:"Diğer",
			subMenu:result,
		}//,
		/*{
			name:"Grafik",
			icon:"<i class=\"fa fa-line-graph\" style=\"width:14px;height:14px;font-size:14px;\"></i>",
			action:function(){
			},
		},*/
		//"copy",
		//"copyWithHeaders",
		//"paste",
	];
};

var ATAPriceCell = function(htmlobj){
	this.HTMLObjectPrice = htmlobj;
	this.HTMLObjectLot = false;
	this.HTMLObjectPercent = false;
	this.Step = 1;
	this.Max = Infinity;
	this.Min = -Infinity;
	this.PriceFormat = {
		style: "currency",
		currency: "TRY",
		minimumFractionDigits: - Math.floor(Math.log(this.Step) * Math.LOG10E),
		useGrouping: false,
	};
	this.Value = 0;
	this.Timeout = null;
	this.Update(0);
};
ATAPriceCell.FormatPrice = function(price,format){
	return Number(price).toLocaleString("tr-TR",format).substr(1);
};
ATAPriceCell.prototype.DelayedUpdate = function(){
	var price = Math.floor(this.Value / this.Step) * this.Step;
	var Newform = ATAPriceCell.FormatPrice(price,this.PriceFormat);
	this.HTMLObjectPrice.innerHTML = "<div class=\"priceareanonpdate\">" + Newform + "</div>";
	try{
		$(this.HTMLObjectPrice).parents(".ag-cell")[0].style.backgroundColor  = "#80808000";
	}catch(e){}
	//this.HTMLObjectPrice.innerHTML = this.HTMLObjectPrice.innerHTML.replace("priceareaUpdate","priceareanonpdate").replace("nonchangednonricearea","").replace("nonchangedricearea","");//
};
ATAPriceCell.prototype.Update = function(price){
	price = Number(price);
	if(price == 0){// reset
		this.Step = 1;
		this.HTMLObjectPrice.innerText = "-";
		return;
	};
	try{
		this.Step = Math.min(this.Step,10**(-(""+price).split(".")[1].length));
	}catch(e){}
	
	var oldValue = this.Value;
	var rise = oldValue < price;
	var change = oldValue != price;
	price = Math.floor(price / this.Step) * this.Step;
	this.PriceFormat = Object.assign(this.PriceFormat,{
		minimumFractionDigits: - Math.floor(Math.log(this.Step) * Math.LOG10E),
	});
	var Newform = ATAPriceCell.FormatPrice(price,this.PriceFormat);
	var Oldform = ATAPriceCell.FormatPrice(oldValue,this.PriceFormat);
	var i=0;
	if (Newform.length == Oldform.length) for (;i<Newform.length;i++){
		if (Newform.charAt(i) == Oldform.charAt(i)) continue;
		else break;
	}
	if (price == 0) {
		this.HTMLObjectPrice.innerHTML = "";
		return;
	}
	this.HTMLObjectPrice.innerHTML = "<div class=\"priceareaUpdate\"><font class=\"nonchangedpricearea " + (change?(rise?"nonchangedricearea":"nonchangednonricearea"):"nonchangedstabprice") + "\">" + Newform.substr(0,i) + "</font><font class=\"changedpricearea " + (change?(rise?"changedricearea":"changednonricearea"):"changedstabprice") + "\">" + Newform.substr(i,Newform.length) + "</font></div>";
	try{
		$(this.HTMLObjectPrice).parents(".ag-cell")[0].style.backgroundColor  = "#80808050";
	}catch(e){}
	this.Value = price;
	clearTimeout(this.Timeout);
	var THAT = this;
	this.Timeout = setTimeout(function(){
		THAT.DelayedUpdate();
	},400);
};

var ATAWindow = function(title, opts){
	this.ID = "win_" + ATA().UUID.Generate();
	this.Title = "" + title;
	this.Div = document.createElement("div");
	document.body.append(this.Div);
	this.Div.style.width = "400px";
	this.Div.style.height = "250px";
	this.Div.style.left = "150px";
	this.Div.style.top = "150px";
	this.Div.style.display = "none";
	this.Div.className = "ATAWindow";
	this.isMaximized = false;
	//this.Div.innerHTML = "eşrkjhgroeuı";
	ATAWindow.Config.GenerateHTML(this.Div);
	this.Options = Object.assign({
		Closable	: true,
		Resizable	: true,
		Movable		: true,
		Maximizable	: true,
		Minimizable	: true,
	},opts);
	this.OnClose = function(){};
	this.OnResize = function(){};
	this.OnMove = function(){};
	this.OnFocus = function(){};
	var THAT = this;
	THAT.Initialize();
	setTimeout(function(){
		//THAT.Initialize();
		THAT.Focus();
	},1);
	ATAWindow.Windows[this.ID] = this;
	
};
ATAWindow.Config = {
	isReady:false,
	LastActivite:0,
	LoopTime:1000*60*5,
	GenerateHTML:function(content){
		var divcontent = document.createElement("div");content.append(divcontent);
		
		var divedgeright = document.createElement("div");content.append(divedgeright);
		var divedgeleft = document.createElement("div");content.append(divedgeleft);
		var divedgebottom = document.createElement("div");content.append(divedgebottom);
		
		var divhead = document.createElement("div");content.append(divhead);
		
		var divlock = document.createElement("div");content.append(divlock);
		
		var headHeight = "1.5em";
		
		divhead.style.height = "" + headHeight + "";
		divhead.className = "Title";
		
		divcontent.style.height = "calc(100% - " + headHeight + ")";
		divcontent.style.top = "" + headHeight + "";
		divcontent.className = "Content";
		
		divlock.className = "Lock";
		divlock.style.display = "none";
		
		divedgeright.className = "Edge_Right";
		divedgeleft.className = "Edge_Left";
		divedgebottom.className = "Edge_Bottom";
		
		var divactions = document.createElement("div");content.append(divactions); // content
		divactions.style.height = "" + headHeight + "";
		divactions.className = "Actions";
		
		var buttonminimize = document.createElement("I"); // minimize
		divactions.append(buttonminimize);
		buttonminimize.className = "Minimize btn btn-outline-light fa fa-window-minimize"; // btn-outline-primary
		
		var buttonmaximize = document.createElement("I"); // maximize
		divactions.append(buttonmaximize);
		buttonmaximize.className = "Maximize btn btn-outline-light fa fa-window-maximize"; // btn-outline-warning
		
		var buttonrestore = document.createElement("I"); // restore
		divactions.append(buttonrestore);
		buttonrestore.className = "Restore btn btn-outline-light fa fa-window-restore"; // btn-outline-warning
		buttonrestore.style.display = "none";
		
		var buttonclose = document.createElement("I"); // close
		divactions.append(buttonclose);
		buttonclose.className = "Close btn btn-outline-danger fa fa-times"; // btn-outline-danger
		
		$(divactions).children().css({
			width:headHeight,
			height:headHeight,
		});
	},
};
ATAWindow.Windows = {};
ATAWindow.ActiveWindow = false;
ATAWindow.Action = false;
ATAWindow.Container = false;
ATAWindow.GetPinnablePoints = function(){
	var arr = [];
	var conPos = $(ATAWindow.Container).position();
	var conW = $(ATAWindow.Container).width();
	var conH = $(ATAWindow.Container).height();
	var conX = conPos.left;
	var conY = conPos.top;
	arr.push([conX + conW, conY + conH, conX, conY, ""]); // pinned to container
	for(var key in ATAWindow.Windows){
		var win = ATAWindow.Windows[key];
		if(win.Div.style.display != "")continue;
		var elePos = win.GetPosition();
		var eleSize = win.GetSize();
		var X1 = elePos.x;
		var Y1 = elePos.y;
		var X2 = elePos.x + eleSize.w;
		var Y2 = elePos.y + eleSize.h;
		arr.push([X1, Y1, X2, Y2, win.ID]);
	}
	return arr;
};
ATAWindow.LastZIndex = 15000;
ATAWindow.prototype.Focus  = function(){
	this.Div.style.zIndex = ++ATAWindow.LastZIndex;
	this.OnFocus();
};
ATAWindow.prototype.Initialize = function(){
	var THAT = this;
	$(this.Div).find(".Title").mousedown(function(event){
		var elePos = THAT.GetPosition();
		var eleSize = THAT.GetSize();
		THAT.__R = {};
		THAT.__R.__X = Number(event.pageX) - Number(elePos.x);
		THAT.__R.__Y = Number(event.pageY) - Number(elePos.y);
		THAT.__R.__W = eleSize.w;
		THAT.__R.__H = eleSize.h;
		ATAWindow.ActiveWindow = THAT;
		ATAWindow.Action = "MOVE";
		ATAWindow.ContentAccess(false);
		THAT.Focus();
		//event.preventDefault();
	}).mouseup(function(event){
		ATAWindow.Action = false;
	});
	$(this.Div).click(function(){
		THAT.Focus();
	}).mousedown(function(event){
		var elePos = THAT.GetPosition();
		var eleSize = THAT.GetSize();
		var edgeX = elePos.x + eleSize.w;
		var edgeY = elePos.y + eleSize.h;
		var wid = 7;
		var resizeEX = edgeX >= Number(event.pageX) && edgeX < (Number(event.pageX)+wid);
		var resizeEY = edgeY >= Number(event.pageY) && edgeY < (Number(event.pageY)+wid);
		var resizeFX = elePos.x < Number(event.pageX) && elePos.x > (Number(event.pageX)-wid);
		var resizeFY = elePos.y < Number(event.pageY) && elePos.y > (Number(event.pageY)-wid);
		if (resizeEX || resizeEY || resizeFX || resizeFY){
			ATAWindow.ActiveWindow = THAT;
			ATAWindow.Action = "RESIZE";
			ATAWindow.ContentAccess(false);
			THAT.__R = {};
			if(resizeEX)THAT.__R["REX"] = true; // right edge resize
			if(resizeEY)THAT.__R["REY"] = true; // bottom edge resize
			if(resizeFX)THAT.__R["RFX"] = true; // left edge resize
			if(resizeFY)THAT.__R["RFY"] = true; // top edge resize
			THAT.__R.__EHY = eleSize.h + elePos.y;
			THAT.__R.__EWX = eleSize.w + elePos.x;
		}
	});
	if(!this.Options.Closable)$(this.Div).find(".Close").hide();
	if(!this.Options.Maximizable){
		$(this.Div).find(".Maximize").hide();
		$(this.Div).find(".Restore").hide();
	}
	if(!this.Options.Minimizable)$(this.Div).find(".Minimize").hide();
	$(this.Div).find(".Close").on("click", function(){
		//THAT.Hide();return;
		THAT.Close();
		THAT.OnClose();
	});
	$(this.Div).find(".Restore").on("click", function(){
		THAT.Restore();
	});
	$(this.Div).find(".Maximize").on("click", function(){
		THAT.Maximize();
	});
	$(this.Div).find(".Minimize").on("click", function(){
		THAT.Minimize();
	});
};
ATAWindow.prototype.ContentAccess = function(statu=true){
	if(statu)$(this.Div).find(".Lock").hide();
	else $(this.Div).find(".Lock").show();
};
ATAWindow.ContentAccess = function(statu=true){
	for(var key in ATAWindow.Windows)ATAWindow.Windows[key].ContentAccess(statu);
};
ATAWindow.prototype.Close = function(){
	this.Div.style.display = "none";
	delete ATAWindow.Windows[this.ID];
	this.OnClose();
	this.Div.remove();
	return;
};
ATAWindow.prototype.Hide = function(){
	this.Div.style.display = "none";
};
ATAWindow.prototype.Show = function(){
	this.Open();
};
ATAWindow.prototype.Restore = function(){
	this.isMaximized = false;
	var newW = this.ResoreData.W;
	var newH = this.ResoreData.H;
	var newX = this.ResoreData.X;
	var newY = this.ResoreData.Y;
	this.SetSize(newW, newH);
	this.SetPosition(newX, newY);
	$(this.Div).find(".Maximize").show();
	$(this.Div).find(".Restore").hide();
};
ATAWindow.prototype.Maximize = function(){
	var eleSize = this.GetSize();
	var elePos = this.GetPosition();
	this.ResoreData = {};
	this.ResoreData.X = elePos.x;
	this.ResoreData.Y = elePos.y;
	this.ResoreData.W = eleSize.w;
	this.ResoreData.H = eleSize.h;
	var conPos = $(ATAWindow.Container).position();
	var newW = $(ATAWindow.Container).width();
	var newH = $(ATAWindow.Container).height();
	var newX = conPos.left;
	var newY = conPos.top;
	this.SetSize(newW, newH);
	this.SetPosition(newX, newY);
	this.isMaximized = true;
	$(this.Div).find(".Maximize").hide();
	$(this.Div).find(".Restore").show();
};
ATAWindow.prototype.Minimize = function(){
	var visible = this.GetContent().is(":visible");
	if(visible){
		var eleSize = this.GetSize();
		this.GetContent().hide();
		this.ResoreMinimizeData = [eleSize.w, eleSize.h];
		$(this.Div).height($(this.Div).find(".Title").height());
	}else{
		this.SetSize(this.ResoreMinimizeData[0], this.ResoreMinimizeData[1]);
		this.GetContent().show();
	}
};
ATAWindow.prototype.Open = function(){
	this.Div.style.display = "";
	this.Focus();
};
ATAWindow.prototype.GetContent = function(){
	return $(this.Div).find(".Content");
};
ATAWindow.prototype.SetTitle = function(title){
	$(this.Div).find(".Title").html(title);
};
ATAWindow.prototype.GetSize = function(){
	return {
		w:Number($(this.Div).width().toFixed(0)),
		h:Number($(this.Div).height().toFixed(0)),
	};
};
ATAWindow.prototype.SetSize = function(w,h){
	if(this.isMaximized)return;
	if(!this.Options.Resizable)return;
	if(typeof(w)=="number"){
		if(w < 100)w = 100;
		$(this.Div).width(w);
	}
	if(typeof(h)=="number"){
		if(h < 100)h = 100;
		$(this.Div).height(h);
	}
	this.OnResize();
};
ATAWindow.prototype.GetPosition = function(){
	var pos = $(this.Div).position();
	return {
		x:Number(pos.left.toFixed(0)),
		y:Number(pos.top.toFixed(0)),
	};
};
ATAWindow.prototype.SetPosition = function(x,y){
	if(this.isMaximized)return;
	if(!this.Options.Movable)return;
	var __s = {};
	if(typeof(x)=="number")__s.left = x;
	if(typeof(y)=="number")__s.top = y;
	var eleSize = this.GetSize();
	var conPos = $(ATAWindow.Container).position();
	var conW = $(ATAWindow.Container).width();
	var conH = $(ATAWindow.Container).height();
	var conX = conPos.left;
	var conY = conPos.top;
	if((conW + conX) < (eleSize.w + __s.left)) __s.left = conW + conX - eleSize.w;
	if((conH + conY) < (eleSize.h + __s.top)) __s.top = conH + conY - eleSize.h;
	if(__s.left < conX)__s.left = conX;
	if(__s.top < conY)__s.top = conY;
	$(this.Div).css(__s);
	this.OnMove();
};
ATAWindow.Setup = function(){
	ATAWindow.Config.isReady = true;
	ATAWindow.Container = document.all.pageLayout;
	var documentmove = function(event){
		// event.pageX, event.pageY;
		//THAT.
		if(ATAWindow.ActiveWindow)switch((""+ATAWindow.Action).toUpperCase()){
			default:
			break;
			case "MOVE":
				var win = ATAWindow.ActiveWindow; // ATAWindow.Windows[ATAWindow.ActiveWindow ID];
				var PinnablePoints = ATAWindow.GetPinnablePoints();
				var newX = event.pageX - win.__R.__X;
				var newY = event.pageY - win.__R.__Y;
				var edgeX = newX + win.__R.__W;
				var edgeY = newY + win.__R.__H;
				var mnewX = newX;
				var mnewY = newY;
				//win.SetPosition(mnewX, mnewY);return; // is pinnable?
				var diffpixel = 15;
				
				for(var i=0;i<PinnablePoints.length;i++){
					var point = PinnablePoints[i]; // x1, y1, x2, y2, winid
					if(point[4] === win.ID)continue;
					
					var x1x1 = Math.abs(point[0] - newX) < diffpixel;
					var x1x2 = Math.abs(point[0] - edgeX) < diffpixel;
					var x2x1 = Math.abs(point[2] - newX) < diffpixel;
					var x2x2 = Math.abs(point[2] - edgeX) < diffpixel;
					
					var y1y1 = Math.abs(point[1] - newY) < diffpixel;
					var y1y2 = Math.abs(point[1] - edgeY) < diffpixel;
					var y2y1 = Math.abs(point[3] - newY) < diffpixel;
					var y2y2 = Math.abs(point[3] - edgeY) < diffpixel;
					
					if(x2x1){ // x2 - x1
						mnewX = point[2];
						if(y1y1)mnewY = point[1];
						else if(y2y2)mnewY = point[3] - win.__R.__H;
						//break;
					}else if(x1x2){
						mnewX = point[0] - win.__R.__W;
						if(y1y1)mnewY = point[1];
						else if(y2y2)mnewY = point[3] - win.__R.__H;
						//break;
					}
					
					if(y2y1){
						mnewY = point[3];
						if(x1x1)mnewX = point[0];
						else if(x2x2)mnewX = point[2] - win.__R.__W;
						//break;
					}else if(y1y2){
						mnewY = point[1] - win.__R.__H;
						if(x1x1)mnewX = point[0];
						else if(x2x2)mnewX = point[2] - win.__R.__W;
						//break;
					}
				}
				win.SetPosition(mnewX, mnewY);
				//win.Focus();
			break;
			case "RESIZE":
				var win = ATAWindow.ActiveWindow;// ATAWindow.Windows[ATAWindow.ActiveWindow ID];
				var elePos = win.GetPosition();
				var newX = false;
				var newY = false;
				var newW = false;
				var newH = false;
				if(win.__R["REX"])newW = Number(event.pageX) - elePos.x + 1;
				if(win.__R["REY"])newH = Number(event.pageY) - elePos.y + 1;
				if(win.__R["RFX"]){
					var __EWX = win.__R.__EWX;
					newX = Number(event.pageX);
					newW = __EWX - newX;
				}
				if(win.__R["RFY"]){
					var __EHY = win.__R.__EHY;
					newY = Number(event.pageY);
					newH = __EHY - newY;
				}
				win.SetPosition(newX, newY);
				win.SetSize(newW, newH);
			break;
		}
	};
	var documentmouseup = function(event){
		ATAWindow.Action = false;
		ATAWindow.ActiveWindow = false;
		ATAWindow.ContentAccess(true);
	};
	$(document.body).on("mousemove", documentmove)
	$(document.body).on("mouseup", documentmouseup);
	$(document.body).on("focusout", documentmouseup);
	
	$(window).resize(function(){
		for(var key in ATAWindow.Windows){
			var win = ATAWindow.Windows[key];
			var elePos = win.GetPosition();
			var eleSize = win.GetSize();
			win.SetPosition(elePos.x, elePos.y);
			win.SetSize(eleSize.w, eleSize.h);
		}
	});
};

ATA().Setups.push(function(){
	ATAWindow.Setup();
});

var COLORS = [
	"#00BCD4",
	"#607D8B",
	"#4CAF50",
	"#8BC34A",
	"#3F51B5",
	"#F0E68C",
	"#CDDC39",
	"#FF9800",
	"#795548",
	"#FF5722",
	"#000FFF",
	"#E91E63",
	"#9C27B0",
	"#673AB7",
	"#F44336",
	"#009688",
	"#FFEB3B",
	"#616161",
	"#FFC107",
	"#00FFFF",
	"#2196F3",
	"#FFDDDD",
	"#87CEEB",
];

var ATAPriceCellRenderer = function(){
	this.eGui = document.createElement("DIV");
	this.eGui.style.width = "100%";
	this.eGui.style.height = "100%";
	//this.eGui.style.display = "none";
	this.ATAPriceCell = new ATAPriceCell(this.eGui);
};
ATAPriceCellRenderer.prototype.init = function(params){
	if (isNaN(Number(params.value))) return;
	//if(ATA.InterFace.Instruments[params.data.Symbol + ""])this.eGui.style.display = "";
	//else this.eGui.style.display = "none";
	this.ATAPriceCell.Update(params.value);
};
ATAPriceCellRenderer.prototype.getGui = function(){
	return this.eGui;
};
ATAPriceCellRenderer.prototype.refresh = function(params){
	if (isNaN(Number(params.value))) return;
	//if(ATA.InterFace.Instruments[params.data.Symbol + ""])this.eGui.style.display = "";
	//else this.eGui.style.display = "none";
	this.ATAPriceCell.Update(params.value);
	return true;
};
ATAPriceCellRenderer.prototype.destroy = function(){};

var ATAPercentCellRenderer = function(){
	this.eGui = document.createElement("DIV");
	this.eGui.innerHTML = "";
	//this.eGui.style.display = "none";
	this.PValue = 0;
};
ATAPercentCellRenderer.prototype.init = function(params){
	//this.eGui.innerHTML = "-";
	//if(ATA.InterFace.Instruments[params.data.Symbol + ""])this.eGui.style.display = "";
	//else this.eGui.style.display = "none";
	if(params.value)this.refresh(params);
	else this.refresh({params:0});
};
ATAPercentCellRenderer.prototype.refresh = function(params){
	var deger = Number(params.value);
	if (isNaN(deger)) return true;
	if (!isFinite(deger)) return true;
	//if(ATA.InterFace.Instruments[params.data.Symbol + ""])this.eGui.style.display = "";
	//else this.eGui.style.display = "none";
	this.PValue = deger;
	var rise = this.PValue >= 0;
	var change = !(this.PValue == 0);
	this.eGui.innerHTML = "<div class=\"priceareanonpdate " + (change?(rise?"nonchangedricearea":"nonchangednonricearea"):"changedstabprice") + "\"> " + (rise?"<!-- + -->":"<!-- - -->") + " % " + Math.abs(this.PValue).toFixed(2) + "</div>";
	return true;
};
ATAPercentCellRenderer.prototype.getGui = function(){
	return this.eGui;
};
ATAPercentCellRenderer.prototype.destroy = function(){};

var Initialize_PriceWindow = function(){
	var content = ATA.Windows.PriceWindow.GetContent()[0];
	var divcontent = document.createElement("div");content.append(divcontent);
	var divhead = document.createElement("div");content.append(divhead);
	
	var headHeight = "0em";
	
	divhead.style.width = "100%";
	divhead.style.height = "" + headHeight + "";
	divhead.style.left = "0px";
	divhead.style.top = "0px";
	divhead.style.position = "absolute";
	divhead.className = "header";
	divhead.innerHTML = "";
	
	divcontent.style.width = "100%";
	divcontent.style.height = "calc(100% - " + headHeight + ")";
	divcontent.style.left = "0px";
	divcontent.style.top = "" + headHeight + "";
	divcontent.style.position = "absolute";
	
	divcontent.className = "rootsystem";
};

var Initialize_WalletWindow = function(){
	var content = ATA.Windows.WalletWindow.GetContent()[0];
	var divcontent = document.createElement("div");content.append(divcontent);
	var divhead = document.createElement("div");content.append(divhead);
	
	var headHeight = "0em";
	
	divhead.style.width = "100%";
	divhead.style.height = "" + headHeight + "";
	divhead.style.left = "0px";
	divhead.style.top = "0px";
	divhead.style.position = "absolute";
	divhead.className = "header";
	divhead.innerHTML = "";
	
	divcontent.style.width = "100%";
	divcontent.style.height = "calc(100% - " + headHeight + ")";
	divcontent.style.left = "0px";
	divcontent.style.top = "" + headHeight + "";
	divcontent.style.position = "absolute";
	
	divcontent.className = "rootsystem";
};

var GetPaneData = function(){
	return {
		resizeWithContainerAutomatically :true,
		settings:{
			hasHeaders: true,
			constrainDragToContainer: false,
			reorderEnabled: false,
			selectionEnabled: false,
			popoutWholeStack: false,
			blockedPopoutsThrowError: false,
			closePopoutsOnUnload: false,
			showPopoutIcon: false,
			showMaximiseIcon: false,
			showCloseIcon: false,
		},
		dimensions:{
			borderWidth: 10,
			minItemHeight: 70,
			minItemWidth: 70,
			//headerHeight: 20,
			//dragProxyWidth: 300,
			//dragProxyHeight: 200
		},
		content:[{
			type:"row",
			content:[{
				type:"stack",
				content:[{
					type:"component",
					isClosable:false,
					id:"column0",
					//cssClass:"",
					componentName:"RComponent",
					title:"Tab 0",
				},{
					type:"component",
					isClosable:false,
					id:"column1",
					//cssClass:"",
					componentName:"RComponent",
					title:"Tab 1",
				},{
					type:"component",
					isClosable:false,
					id:"column1",
					//cssClass:"",
					componentName:"RComponent",
					title:"Tab 2",
				},{
					type:"component",
					isClosable:false,
					id:"column1",
					//cssClass:"",
					componentName:"RComponent",
					title:"Tab 3",
				}],
			}],
		}]
	};
};

var GetGridData_Pairlist = function(){
	return {
		rowDragManaged:true,
		//rowDragMultiRow:true,
		allowContextMenuWithControlKey:true,
		suppressMenuHide:true,
		enterMovesDownAfterEdit:true,
		enterMovesDown:true,
		suppressColumnMoveAnimation:true, // check browser
		enableCharts:true,
		animateRows:true,
		enableRangeSelection:true,
		enableFillHandle:true,
		undoRedoCellEditing:true,
		undoRedoCellEditingLimit:50,
		suppressClearOnFillReduction:false,
		rowSelection:"multiple", // one of ["single","multiple"], leave blank for no selection
		quickFilterText:null,
		groupSelectsChildren:true, // one of [true, false]
		suppressRowClickSelection:true, // if true, clicking rows doesn't select (useful for checkbox selection)
		popupParent:document.body,
		suppressAggFuncInHeader:true,
		chartThemes:["myCustomTheme","ag-pastel-dark"],
		getRowNodeId:function(data){return data.ID;},
		customChartThemes:{
			myCustomTheme:{
				baseTheme:"ag-pastel-dark",
				palette:{
					fills:[...COLORS],
					strokes:[...COLORS],
				},
				overrides:{
					common:{
						title:{
							fontSize:25,
							fontFamily:"-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen-Sans, Ubuntu, Cantarell, Helvetica Neue, sans-serif",
						}
					}
				}
			}
		},
		getChartToolbarItems:function(){
			return [];
		},
		isExternalFilterPresent:function(){
			return true;
		},
		doesExternalFilterPass:function(rowNode){
			return true;//rowNode.data.Active == "Y";
		},
		columnDefs:[
			{field:"ID",hide:true,},
			{
				field:"Symbol",
				minWidth:70,
				//type:"SymbolTypeFormat",
				headerName:"Sembol",
				rowDrag:true,
				/*sort:"asc"*/
			},
			{
				field:"Last",
				type:"PriceTypeFormat",
				headerName:"Son",
				minWidth:110,
				editable:false,
			},
			{field:"PDaily", headerName:"% Gün", type:"PercentTypeFormat",minWidth:110,},
			{field:"Buy", headerName:"Alış", type:"PriceTypeFormat",width:100,hide:true},
			{field:"Sell", headerName:"Satış", type:"PriceTypeFormat",width:100,hide:true},
		],
		defaultColDef:{
			minWidth: 50,
			editable:false,
			sortable:true,
			//flex:1,
			filter:true,
			resizable:true
		},
		components:{
			ATAPriceCellRenderer:ATAPriceCellRenderer,
			ATAPercentCellRenderer:ATAPercentCellRenderer,
		},
		columnTypes:{
			PriceTypeFormat:{
				chartDataType:"series",
				cellClass:"number",
				valueFormatter:function(params){
					return Number(Number(params.value).toPrecision(7));
					//return Math.floor(params.value).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
				},
				cellRenderer:"ATAPriceCellRenderer"
			},
			PercentTypeFormat:{
				chartDataType:"series",
				cellClass:"number",
				valueFormatter:function(params){
					return Number(params.value);
					//return Math.floor(params.value).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
				},
				cellRenderer:"ATAPercentCellRenderer"
			},
			SymbolTypeFormat:{
				//cellRenderer:"ATASymbolCellRenderer",
				//cellEditor:"ATASymbolCellEditor"
			},
			GrahpTypeFormat:{
				cellRenderer:"ATAPriceGrahpCellRenderer"
			},
		},
		statusBar: {
			statusPanels: [
				//{ statusPanel: "agTotalAndFilteredRowCountComponent", key: "totalAndFilter", align: "left" },
				{ statusPanel: "agSelectedRowCountComponent", align: "left" },
				{ statusPanel: "agAggregationComponent", align: "right" }
			]
		},
		onGridReady:function(params){
			params.api.sizeColumnsToFit();
		},
		sideBar: {
			toolPanels: ["columns", "filters"],
			defaultToolPanel: "",
		},
		onCellClicked:function(param){
			var symbol = param.data.Symbol;
			//SuperficialAnalysis(symbol);
		},
		onRowDoubleClicked:function(param){
			var symbol = param.data.Symbol;
			ATA.FocusObject(symbol);
		},
		getContextMenuItems:function(params){
			return ATA.GetContextMenu(params);
		},
	};
};

var GetGridData_Assetlist = function(){
	var table = {
		animateRows:true,
		columnDefs:[
			{field:"ID",hide:true,},
			{field:"Symbol", headerName:"Varlık"},
			{field:"BalanceinAvailable", headerName:"Uygun Miktar"},
			{field:"BalanceonOrder", headerName:"Emirdeki Miktar"},
			{field:"BalanceinAvailablePUSDT", headerName:"USDT Olarak",sort:"desc",},
		],
		defaultColDef:{
			minWidth: 50,
			editable:false,
			sortable:false,
			//flex:1,
			filter:false,
			resizable:true,
		},
		//suppressAggFuncInHeader:true,
		getRowNodeId:function(data){return data.ID;},
		/*onGridReady:function(params){
			params.api.sizeColumnsToFit();
		},*/
	};
	var chart = {
		enableCharts:true,
		//popupParent: document.body,
		chartThemes:["myCustomTheme","ag-pastel-dark","ag-vivid-dark"],
		customChartThemes:{
			myCustomTheme:{
				baseTheme:"ag-pastel-dark",
				palette:{
					fills:[...COLORS],
					strokes:[...COLORS],
				},
				overrides:{
					common:{
						title:{
							fontSize:15,
							fontFamily:"-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen-Sans, Ubuntu, Cantarell, Helvetica Neue, sans-serif",
						}
					}
				}
			}
		},
		chartThemeOverrides:{

			pie:{
				/*title:{
					enabled:true,
					text:"Precious Metals Production",
					fontWeight:"bold",
					fontSize:20,
					color:"rgb(100, 100, 100)",
				},
				subtitle:{
					enabled: true,
					text:"by country",
					fontStyle:"italic",
					fontWeight:"bold",
					fontSize:14,
					color:"rgb(100, 100, 100)",
				},*/
				padding:{
					top:50,
					right:50,
					bottom:50,
					left:50,
				},
				background:{
					fill:"#00000000",
				},
				legend:{
					enabled:false,
				},
				series:{
					highlightStyle:{
						item:{
							fill:"#EEEEEE",
							//stroke:"maroon",
							strokeWidth:0,
						},
						series:{
							fill:"#BBBBBB",
							dimOpacity:0.2,
							strokeWidth:2,
						},
					},
					label:{
						enabled:true,
					},
					callout:{
						length:20,
					},
					tooltip:{
						renderer:function(params){
							return "<div class=\"tooltipforpiechart\" style=\"background-color:" + params.color + ";\">" + params.datum.Symbol + " (" + params.datum.BalanceinAvailablePUSDT + ")</div>";
						}
					},
				},
			},
		},
		getChartToolbarItems:function(){
			return [];
		},
	};
	var chartarea = $(ATA.Windows.WalletWindow.panelayout.root.contentItems[0].contentItems[0].contentItems[1].element[0]).find(".lm_content")[0];
	var config = Object.assign({
		onFirstDataRendered:function(params){
			params.api.createRangeChart({
				cellRange: {
					//rowStartIndex: 0,
					//rowEndIndex: 79,
					columns: ["Symbol", "BalanceinAvailablePUSDT"],
				},
				chartType: "pie",
				chartContainer: chartarea,
				//aggFunc: "sum",
			});
		},
	},table);
	return Object.assign(chart,config);
};

ATA.ReFresh = function(){
	$.ajax({
		url:"/assetlist",
		type:"POST",
		data:{},
		success:function(Response){
			Response.map(function(item){
				var instrument = ATA.InterFace.GetInstrument(item.Symbol);
				instrument.BalanceinAvailable = item.BalanceinAvailable;
				instrument.BalanceonOrder = item.BalanceonOrder;
				instrument.BalanceinAvailablePUSDT = item.BalanceinAvailablePUSDT;
			});
		},
	});
	$.ajax({
		url:"/pairlist",
		type:"POST",
		data:{},
		success:function(Response){
			Response.map(function(item){
				var pair = ATA.InterFace.GetPair(item.Symbol);
				pair.Last = item.Last;
				pair.Buy = item.Buy;
				pair.Sell = item.Sell;
				pair.PDaily = item.PDaily;
				pair.Instrument0 = item.Instrument0;
				pair.Instrument1 = item.Instrument1;
			});
		},
	});
};

ATA().Setups.push(function(){
	ATA.Windows = {};
	ATA.Windows.PriceWindow = new ATAWindow("Takaslar");
	ATA.Windows.PriceWindow.Open();
	ATA.Windows.PriceWindow.SetTitle("Takaslar");
	Initialize_PriceWindow();
	
	ATA.Windows.WalletWindow = new ATAWindow("Varlıklar");
	ATA.Windows.WalletWindow.Open();
	ATA.Windows.WalletWindow.SetTitle("Varlıklar");
	Initialize_WalletWindow();
	
	ATA.Windows.PriceWindow.panelayout = new GoldenLayout(GetPaneData(),ATA.Windows.PriceWindow.GetContent().children(".rootsystem")[0]);
	ATA.Windows.WalletWindow.panelayout = new GoldenLayout(GetPaneData(),ATA.Windows.WalletWindow.GetContent().children(".rootsystem")[0]);
	
	ATA.Windows.PriceWindow.panelayout.registerComponent("RComponent",function(container,state){});
	ATA.Windows.WalletWindow.panelayout.registerComponent("RComponent",function(container,state){});
	
	ATA.Windows.PriceWindow.panelayout.init();
	ATA.Windows.WalletWindow.panelayout.init();
	
	ATA.Windows.PriceWindow.panelayout.on("stateChanged",function(){
		ATA.Windows.PriceWindow.panelayout.updateSize("100%","100%");
	});
	
	ATA.Windows.WalletWindow.panelayout.on("stateChanged",function(){
		ATA.Windows.WalletWindow.panelayout.updateSize("100%","100%");
	});
	
	var div_pairlist = $(ATA.Windows.PriceWindow.panelayout.root.contentItems[0].contentItems[0].contentItems[0].element[0]).find(".lm_content")[0];
	div_pairlist.className = "ag-theme-balham-dark";
	
	var div_assetlist = $(ATA.Windows.WalletWindow.panelayout.root.contentItems[0].contentItems[0].contentItems[0].element[0]).find(".lm_content")[0];
	div_assetlist.className = "ag-theme-balham-dark";
	
	ATA.Windows.PriceWindow.Table = new agGrid.Grid(div_pairlist,GetGridData_Pairlist());
	ATA.Windows.PriceWindow.Table.gridOptions.api.setRowData(Array.from({length:2500},function(item,index){return{ID:index}}));
	ATA.Windows.PriceWindow.Table.gridOptions.api.sizeColumnsToFit();
	
	ATA.Windows.WalletWindow.Table = new agGrid.Grid(div_assetlist,GetGridData_Assetlist());
	ATA.Windows.WalletWindow.Table.gridOptions.api.setRowData(Array.from({length:2500},function(item,index){return{ID:index}}));
	ATA.Windows.WalletWindow.Table.gridOptions.api.sizeColumnsToFit();
	
	var LoopTime = 60*1000;
	var LastActivite = 0;
	ATA.ReFresh();
	ATA().Loops.push(function(){
		var thisTime = (new Date()).getTime();
		var PivotTime = thisTime % LoopTime;
		var lastPivotTime = LastActivite % LoopTime;
		LastActivite = thisTime;
		if (PivotTime < lastPivotTime){
			ATA.ReFresh();
		}
		ATA.Windows.WalletWindow.Table.gridOptions.api.applyTransactionAsync({update:Object.keys(ATA.InterFace.Instruments).map(function(item,index){
			var instrument = ATA.InterFace.GetInstrument(item);
			var pusdt = Number(instrument.BalanceinAvailablePUSDT);
			if(!pusdt)pusdt = 0;
			return {
				ID							:index,
				Symbol						:item,
				BalanceinAvailable			:instrument.BalanceinAvailable,
				BalanceonOrder				:instrument.BalanceonOrder,
				BalanceinAvailablePUSDT		:Number(pusdt.toFixed(2)),
			};
		})});
		ATA.Windows.PriceWindow.Table.gridOptions.api.applyTransactionAsync({update:Object.keys(ATA.InterFace.Pairs).map(function(item,index){
			var pair = ATA.InterFace.GetPair(item);
			return {
				ID							: index,
				Symbol						: item,
				Last						: pair.Last,
				Buy							: pair.Buy,
				Sell						: pair.Sell,
				PDaily						: pair.PDaily,
				Instrument0					: pair.Instrument0,
				Instrument1					: pair.Instrument1,
			};
		})});
		ATA.Windows.WalletWindow.Table.gridOptions.api.sizeColumnsToFit();
		ATA.Windows.PriceWindow.Table.gridOptions.api.sizeColumnsToFit();
	});
});

ATA.FocusObject = function(symbol){
	$("#focusObject").html(symbol);
	var graphwindow = new ATAWindow("Grafik");
	var TVChartID = "TVChart" + ATA().UUID.Generate();
	var div = graphwindow.GetContent()[0];
	div.id = TVChartID;
	graphwindow.Open();
	graphwindow.SetTitle("Grafik - " + symbol);
	graphwindow.DatafeedUDF = new Datafeeds.UDFCompatibleDatafeed("http://localhost:1682",5000);
	graphwindow.TVChart = new TradingView.widget(Object.assign({
		//symbol			: this.Symbol,
		interval		: "D",
		container_id	: TVChartID,
		datafeed		: graphwindow.DatafeedUDF
	},{
		symbol: symbol, // symbol
		interval: "3",
		height: "100%",
		width: "100%",
		//container_id : "", // container id
		//datafeed: null,
		library_path: "./assets/charting_library/",
		disabled_features: ["use_localstorage_for_settings"],
		enabled_features: ["study_templates"],
		timezone: "Europe/Istanbul",
		charts_storage_url: "http://localhost:1682",
		charts_storage_api_version: "1.1",
		client_id: "iDealMobil",
		user_id: "demo",
		custom_css_url: "./themedTV.css",
		overrides:{
			"paneProperties.background": "#222222",
			"paneProperties.vertGridProperties.color": "#454545",
			"paneProperties.horzGridProperties.color": "#454545",
			"scalesProperties.textColor" : "#AAAAAA"
		}
	}));
};
