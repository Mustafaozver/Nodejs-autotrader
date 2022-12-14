if (!ATA) throw new Error("ATA kütüphanesi gereklidir.");

function ToEngUp(str){
	str = str.replace("ç", "c");
	str = str.replace("Ç", "C");
	str = str.replace("ı", "i");
	str = str.replace("İ", "I");
	str = str.replace("ğ", "g");
	str = str.replace("Ğ", "G");
	str = str.replace("ö", "o");
	str = str.replace("Ö", "O");
	str = str.replace("ş", "s");
	str = str.replace("Ş", "S");
	str = str.replace("ü", "u");
	str = str.replace("Ü", "U");
	return str.toUpperCase();
}
window.WSSEND = function(msg){
	IdealInterFace.WS.Send(msg);
};

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
ATA.CycleFunctions = {
	Functions:{},
	Cycle:function(){
		for(var key in this.Functions){
			if(!this.Functions[key])return;
			var F_ = this.Functions[key];
			setTimeout(F_,1);
		}
	},
};
ATA.Loops.push(function(){
	ATA.CycleFunctions.Cycle();
});

var WSSystem = function(url){
	this.URL = url;
	this.WS = false;
	this.OnMessage = function(){};
	this.OnOpen = function(){};
	this.OnClose = function(){};
	this._setTimeout = 0;
	this.Timeout = 10000;
	this._queue =  [];
	//this.Connect();
};
WSSystem.prototype.Connect = function(){
	var THAT = this;
	var statu = this.GetStatus();
	try {
		if (statu == "NONE");
		else if (this.GetStatus() == "CLOSING"){
			setTimeout(function(){
				THAT.Connect();
			},50);
			return;
		} else if (statu == "OPEN"){
			this.WS.close();
		}
		this.WS = new WebSocket(this.URL);
		this.WS.onopen = function(){
			THAT.OnOpen();
		};
		this.WS.onmessage = function(e){
			/*clearTimeout(THAT._setTimeout);
			setTimeout(function(){
				console.log("dsgfjhghkjhklghhfgh");
				THAT.Connect();
			},this.Timeout);*/
			THAT.OnMessage(e.data);
		};
		this.WS.onclose = function(){
			THAT.OnClose();
		};
	} catch (E){
		setTimeout(function(){
			THAT.Connect();
		},50);
	}
};
WSSystem.prototype.Send = function(msg){
	//this._queue.push(msg+"");
	var statu = this.GetStatus();
	if (statu == "OPEN") this.WS.send(msg);
	else return false;
};
WSSystem.prototype.GetStatus = function(){
	switch(this.WS.readyState){
		case WebSocket.CONNECTING:
			 return "CONNECTING";
		break;
		case WebSocket.OPEN:
			 return "OPEN";
		break;
		case WebSocket.CLOSING:
			 return "CLOSING";
		break;
		case WebSocket.CLOSED:
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
			this.WS.close();
		} else if (statu == "OPEN") this.WS.close();
		else if (statu == "NONE") return;
		else if (this.GetStatus() == "CLOSING") return;
		else if (statu == "CLOSED") return;
	} catch (E){
	}
};

var IdealInterFace = {
	isReady:false,
	Pages:["PAGE1"],
	ActivePage:0,
	Settings:{
		SEP1		: String.fromCharCode(2),
		SEP2		: String.fromCharCode(3),
		SEPEOL		: String.fromCharCode(4),
		ProductType	: "WEB",
		DeviceType	: "ANY",
	},
	UserParameters:{
		UserName	: "",
		SessionId	: (Math.random() * 1000000000).toFixed(0),
		
		TradeKey	: 0,
		HesapKurum	: "INFO YATIRIM", // deneme hesabı
		HesapParola	: "159753",
		HesapSifre	: "852456",
		HesapNo		: "43166",
		//Password:"",
		//Parola:"",
	},
	lastActivite:(new Date()).getTime(),
	lastActiviteConnect:0,
	Period:10*1000, // 20 secs
	InstrumentsList:{},
	Licences:{},
	WS:null,
	Connect:function(PassWord){
		this.WS = new WSSystem(this.IdealDataWSRandomServer());
		this.WS.Connect();
		this.WS.OnOpen = function(){
			IdealInterFace.RequestLogin();
		};
		this.WS.OnClose = function(){
			return;
			setTimeout(function(){
				IdealInterFace.Connect();
			},1);
		};
		this.WS.OnMessage = function(data){
			var SEPEOL = IdealInterFace.Settings.SEPEOL;
			data.split(SEPEOL).map(function(item){
				IdealInterFace.IdealDataWSParseMessage(item);
			});
		};
	},
	RequestLogin:function(){
		var SEP1 = this.Settings.SEP1;
		var ProductType = this.Settings.ProductType;
		var DeviceType = this.Settings.DeviceType;
		var SessionId = this.UserParameters.SessionId;

		var UserName = this.UserParameters.UserName = document.all.UserName.value;
		var PassWord = document.all.PassWord.value;

		this.WS.Send("X" + SEP1 + "REQ_CONNECT" + SEP1 + UserName + SEP1 + PassWord + SEP1 + SessionId + SEP1 + ProductType + SEP1 + DeviceType);
		setTimeout(function(){
			IdealInterFace.Setup_Step2();
		},100);
	},
	Setup_Step2:function(){
		var SEP1 = this.Settings.SEP1;
		var ProductType = this.Settings.ProductType;
		var DeviceType = this.Settings.DeviceType;
		var SessionId = this.UserParameters.SessionId;

		var UserName = this.UserParameters.UserName;
		var PassWord = document.all.PassWord.value;
		
		var _Delay = 200;
		var _Queue = [];
		
		_Queue.push(function(){
			
		});
		
		_Queue.push(function(){
			IdealInterFace.WS.Send("X" + SEP1 + "REQ_YUZEYSEL3" + SEP1 + UserName + SEP1 + SessionId + SEP1 + "IMKBX'XU100");
		});
		
		_Queue.push(function(){
			IdealInterFace.WS.Send("X" + SEP1 + "REQ_TAKVIM" + SEP1 + UserName + SEP1 + SessionId);
		});
		
		_Queue.push(function(){
			IdealInterFace.WS.Send("X" + SEP1 + "REQ_NEWS_HEADER" + SEP1 + UserName + SEP1 + SessionId + SEP1 + "0" + SEP1 + "MANSET");
		});
		
		for(var i=0;i<_Queue.length;i++){
			setTimeout(_Queue[i],_Delay*i);
		}
	},
	RequestTradeLogin:function(){
		var SEP1 = this.Settings.SEP1;
		var UserName = this.UserParameters.UserName = document.all.UserName.value;
		var SessionId = this.UserParameters.SessionId;
		this.WS.Send("X" + SEP1 + "B" + SEP1 + UserName + SEP1 + SessionId);
	},
	Logout:function(){
		document.all.loginPanel.style.display = "";
		// news table temizle
	},
	ResponseFunctions:{},
	IdealDataWSParseMessage:function(data){
		var SEP1 = this.Settings.SEP1;
		var SEP2 = this.Settings.SEP2;
		
		var UserName = this.UserParameters.UserName = document.all.UserName.value;
		var SessionId = this.UserParameters.SessionId;
		
		var HesapKurum = this.UserParameters.HesapKurum;
		var HesapParola = this.UserParameters.HesapParola;
		var HesapSifre = this.UserParameters.HesapSifre;
		var HesapNo = this.UserParameters.HesapNo;
		
		var ParserFieldArray = data.split(SEP1);
		if (ParserFieldArray[0] != "Y") return;
		document.all.loginPanel.style.display = "none";
		var SUB = ParserFieldArray[1];
		if(this.ResponseFunctions[SUB]) this.ResponseFunctions[SUB](ParserFieldArray);
		else this.ResponseFunctions["DEFAULT"](ParserFieldArray);
	},
	InstrumentsUpdate:function(symbol,sub,val){
		if (!this.InstrumentsList[""+symbol]) this.InstrumentsList[""+symbol] = new Instrument(""+symbol);
		if (val) this.InstrumentsList[""+symbol]["SUB_" + sub] = val
	},
	InstrumentGet:function(symbol){
		var instrument0 = this.InstrumentsList[""+symbol];
		var step = instrument0["SUB_PriceStep"];
		var decpoint = instrument0["SUB_DecPoint"];
		var priceformatter = function(num){
			num = Number(num);
			try{
				num = Number(num.toFixed(decpoint));
			}catch(e){console.log("parse eror",e);}
			try{
				if(!step) step = 0.01;
				num = Math.floor(num / step) * step;
			}catch(e){console.log("parse eror",e);}
			try{
				num = Number(Number(num).toPrecision(15));
			}catch(e){console.log("parse eror",e);}
			try{
				num = num.toFixed(decpoint);
			}catch(e){console.log("parse eror",e);}
			
			return num;
		};
		if(!instrument0);
		return {
			"Symbol"				: symbol,
			"LastPrice"				: priceformatter(instrument0["SUB_LastPrice"]),
			"BidPrice"				: priceformatter(instrument0["SUB_BidPrice"]),
			"AskPrice"				: priceformatter(instrument0["SUB_AskPrice"]),
			"LimitUp"				: priceformatter(instrument0["SUB_LimitUp"]),
			"LimitDown"				: priceformatter(instrument0["SUB_LimitDown"]),
			"LastSize"				: instrument0["SUB_LastSize"],
			"BidSize"				: instrument0["SUB_BidSize"],
			"AskSize"				: instrument0["SUB_AskSize"],
			"PriceStep"				: instrument0["SUB_PriceStep"],
			"WavrSession"			: instrument0["SUB_WavrSession"],
			"VolSession"			: instrument0["SUB_VolSession"],
			"SizeSession"			: instrument0["SUB_SizeSession"],
			"HighSession"			: instrument0["SUB_HighSession"],
			"LowSession"			: instrument0["SUB_LowSession"],
			"DengeFiyat"			: priceformatter(instrument0["SUB_DengeFiyat"]),
			"DengeMiktar"			: instrument0["SUB_DengeMiktar"],
			"PrevCloseSession"		: priceformatter(instrument0["SUB_PrevCloseSession"]),
			"WebSymbolCatagory"		: instrument0["SUB_WebSymbolCatagory"],
			"PriceEarningValue"		: instrument0["SUB_PriceEarningValue"],
			"PiyDegDefDeg"			: instrument0["SUB_PiyDegDefDeg"],
			"DengeBidKalan"			: instrument0["SUB_DengeBidKalan"],
			"DengeAskKalan"			: instrument0["SUB_DengeAskKalan"],
			"Durum"					: instrument0["SUB_Durum"],
			"Time"					: instrument0["SUB_Time"],
			"DecPoint"				: instrument0["SUB_DecPoint"],
			"SeriNo"				: instrument0["SUB_SeriNo"],
			"IndexType"				: instrument0["SUB_IndexType"],
			"SubMarket"				: instrument0["SUB_SubMarket"],
			"Group"					: instrument0["SUB_Group"],
			"DayClose"				: priceformatter(instrument0["SUB_DayClose"]),
			"Prefix"				: instrument0["SUB_Prefix"],
		};
	},
	DBManager:{
		Pool:{},
		Save:function(){
			var data = JSON.stringify(Object.assign({
				TIME:(new Date()).getTime(),
			},this.Pool));
			localStorage.setItem("DBManager",data);
		},
		Restore:function(){
			var data = localStorage.getItem("DBManager");
			delete this.Pool;
			if(data){
				try{
					var xdata = JSON.parse(data);
					if(!xdata)throw new Error("DBManager data is corrupted or none.");
					if(typeof(xdata) != "object")throw new Error("DBManager data is corrupted.");
					if(Number(xdata.TIME) + 1000*60*60*24*7 < (new Date()).getTime())throw new Error("DBManager data is expired.");
					this.Pool = xdata;
				}catch(e){
					this.Pool = {};
				}
			}else{
				this.Pool = {};
			}
		},
		Get:function(key){
			this.Restore();
			return this.Pool["_key_" + key];
		},
		Set:function(key,val){
			try{
				switch(typeof(val)){
					case "function":val = (val) + "";break;
				}
				this.Pool["_key_" + key] = JSON.parse(JSON.stringify(val)); // copy object
				this.Save();
				this.Restore();
				return true;
			}catch(e){
				console.log("DBManager Error : ", e);
				return false;
			}
		},
		Update:function(){
			var xcode = "";
			
			
			xcode += TVChartWindow.Serialize();
			xcode += PriceTableWindow.Serialize();
			
			xcode += DepthWindow.Serialize();
			xcode += SwapWindow.Serialize();
			xcode += ProfitageWindow.Serialize();
			xcode += SwapChartWindow.Serialize();
			xcode += StepAnalysisWindow.Serialize();
			xcode += NewsCompanyWindow.Serialize();
			xcode += BasicAnalysisWindow.Serialize();
			xcode += CapitalCampanyWindow.Serialize();
			xcode += SplitageChartWindow.Serialize();
			xcode += SplitageListWindow.Serialize();
			
			xcode += ATA.Windows.Serialize();
			
			this.Set(IdealInterFace.Pages[IdealInterFace.ActivePage], xcode);
			this.Save();
			this.Restore();
		},
	},
	
	/*
	
	
	Pages:["PAGE1"],
	ActivePage:0,
	
	*/
	Setup:async function() {
		//this.Connect();
		this.Pages = this.DBManager.Get("Pages");
		if(typeof(this.Pages) == "undefined"){
			this.DBManager.Set("Pages", ["MYPAGE"]);
			this.Pages = this.DBManager.Get("Pages");
		}
		var _pages = this.Pages;
		//this.DBManager.Restore();
		//this.DBManager.Save();
		this.LoadPage();
		setTimeout(function(){
			var pagelist = document.all.pages;
			for(var i=0;i<_pages.length;i++){
				var li = document.createElement("li");pagelist.append(li);
				var button = document.createElement("button");li.append(button);
				button.innerText = _pages[i];
				button.className = "dropdown-item";
				button.href = "#";
				button.parametre = i;
				button.onclick = function(){
					IdealInterFace.DBManager.Save();
					IdealInterFace.DBManager.Restore();
					IdealInterFace.DBManager.Set("ActivePage", this.parametre);
					IdealInterFace.DBManager.Save();
					IdealInterFace.DBManager.Restore();
					IdealInterFace.DBManager.Get("ActivePage");
					IdealInterFace.LoadPage();
				};
			}
			
		},500);
		this.Loop();
		ATA.Loops.push(function() {
			var time = (new Date()).getTime();
			if (IdealInterFace.lastActivite+IdealInterFace.Period*10 < time) IdealInterFace.Loop();
		});
	},
	Loop:async function() {
		this.lastActivite = (new Date()).getTime();
		this.isReady = true;
		this.DBManager.Update();
		setTimeout(function(){IdealInterFace.Loop();},this.Period);
	},
	ResetPage:function(){
		DepthWindow.Reset();
		SwapWindow.Reset();
		ProfitageWindow.Reset();
		SwapChartWindow.Reset();
		TVChartWindow.Reset();
		PriceTableWindow.Reset();
		StepAnalysisWindow.Reset();
		NewsCompanyWindow.Reset();
		BasicAnalysisWindow.Reset();
		CapitalCampanyWindow.Reset();
		SplitageChartWindow.Reset();
		SplitageListWindow.Reset();
	},
	LoadPage:function(){
		this.ResetPage();
		try{
			this.Pages = this.DBManager.Get("Pages") || ["MYPAGE"];
			this.ActivePage = this.DBManager.Get("ActivePage") || 0;
			var xcode = this.DBManager.Get(this.Pages[this.ActivePage]);
			if(xcode){console.log(xcode);
				setTimeout(xcode, 2000);
			}else throw new Error("saved page is not existed.");
		}catch(e){
			var __buildNewPage = function(){
				DepthWindow.Config.MaxStep = 10;
				var conPos = JSON.parse(JSON.stringify($(IdealWindow.Container).position()));
				var conW = Number($(IdealWindow.Container).width());
				var conH = Number($(IdealWindow.Container).height());
				if(conW > 1000 && conH > 700){
					ATA.Windows.NewsList.SetPosition(conPos.left, 0.75*conH + conPos.top);
					ATA.Windows.NewsList.SetSize(conW*0.6,conH*0.25);
					
					ATA.Windows.SuperficialAnalysis.SetPosition(conPos.left + conW*0.75, conPos.top);
					ATA.Windows.SuperficialAnalysis.SetSize(conW*0.25, conH*0.75);
					
					ATA.Windows.EconomicCalendar.SetPosition(conPos.left + conW*0.6, 0.75*conH + conPos.top);
					ATA.Windows.EconomicCalendar.SetSize(conW*0.4, conH*0.25);
					
					var pricetable = new PriceTableWindow("Listem");
					pricetable.WIN.SetPosition(conPos.left, conPos.top);
					pricetable.WIN.SetSize(conW*0.25, conH*0.75);
					pricetable.List = [...IdealInterFace.WatchLists.DefaultList];
					
					var tvchart = new TVChartWindow("ASELS");
					tvchart.WIN.SetPosition(conPos.left + conW*0.25, conPos.top);
					tvchart.WIN.SetSize(conW*0.5, conH*0.75);
				}
			};
			setTimeout(__buildNewPage, 2000);
		}
	},
	LoadList:function(WatchlistName){
		var SEP1 = this.Settings.SEP1;
		var SessionId = this.UserParameters.SessionId;
		var UserName = this.UserParameters.UserName;
		/*
		var lists = [
			//"REQ_BIST_SEKTOR",
			//"REQ_SENETLER",
			"REQ_BIST_VARANT",
			"REQ_VIOP_OPSIYON",
			"REQ_BIST_SERTIFIKA"
		];
		*/
		var REQ_BIST_SEKTOR = [
			"Bankalar",
			"Sigortalar",
			"Holdingler",
			"Taş, Toprak",
			"Metal",
			"Teknoloji",
			"Kimya"
		];
		if (REQ_BIST_SEKTOR.indexOf(WatchlistName) > -1) IdealInterFace.WS.Send("X" + SEP1 + "REQ_BIST_SEKTOR" + SEP1 + UserName + SEP1 + SessionId + SEP1 + ToEngUp(WatchlistName));
		else if (WatchlistName == "REQ_SENETLER") IdealInterFace.WS.Send("X" + SEP1 + "REQ_SENETLER" + SEP1 + UserName + SEP1 + SessionId + SEP1 + "2" + SEP1);
		else IdealInterFace.WS.Send("X" + SEP1 + WatchlistName + SEP1 + UserName + SEP1 + SessionId);
	},
	GetGridData:function(symbol){
		if(!IdealInterFace.InstrumentsList[symbol]) return {
			Symbol:"",
			Last:"",
			Prefix:"",
			"Last Lot":"",
			Buy:"",
			Sell:"",
			"PDaily":"",
			LimitUp:"",
			LimitDown:"",
			Step:"",
			Avarage:"",
			Volume:"",
			DailyLot:"",
			BidSize:"",
			AskSize:"",
			PreviusClose:"",
		};
		var instrument0 = IdealInterFace.InstrumentGet(symbol);
		var LastPrice = parseFloat(instrument0.LastPrice);
		var PreviusClose = parseFloat(instrument0.DayClose);// | LastPrice; // P,1
		var PDaily = 100 * (LastPrice - PreviusClose) / PreviusClose;
		return {
			//Symbol:"",
			Last:LastPrice,
			Prefix:instrument0.Prefix,
			"LastLot":instrument0.LastSize,
			Buy:instrument0.BidPrice,
			Sell:instrument0.AskPrice,
			"PDaily":PDaily,
			LimitUp:instrument0.LimitUp,
			LimitDown:instrument0.LimitDown,
			Step:instrument0.PriceStep,
			//Avarage:instrument0.SUB_E,
			//Volume:instrument0.SUB_G,
			DailyLot:instrument0.SizeSession,
			BidSize:instrument0.BidSize,
			AskSize:instrument0.AskSize,
			PreviusClose:PreviusClose,
		};
	},
	WatchLists:{
		Lists:[],
		DefaultList:[
			"XU100",
			"SPI500",
			"",
			"INFO",
			"HEDEF",
			"ADESE",
			"ARZUM",
			"ASELS",
			"BIMAS",
			"AYGAZ",
			"CCOLA",
			"GEDIK",
			"HALKB",
			"GARAN",
			"QNBFB",
			"SKBNK",
			"YKBNK",
			"KAREL",
			"KONTR",
			"METRO",
			"NETAS",
			"OYAK",
			"PGSUS",
			"TCELL",
			"THYAO",
			"ULKER",
			"VESTL",
			"",
			"USDTRY",
			"RUBTRY",
			"TRYGBP",
			"",
			"BRENT",
			"",
			"BTCUSD",
			"BTCTRY",
			"ETHUSD",
			"LTCUSD",
		],
		GetList:function(){
			return this.DefaultList.map(function(item,index){
				return Object.assign({
					Symbol:item,
					ID:index,
				},IdealInterFace.GetGridData(item));
			});
		},
	},
	IdealDataWSRandomServer:function(){
		var ServerListesi = [];
		
		var macosPlatforms = ["macintosh", "macintel", "macprc", "mac68k"];
		var windowsPlatforms = ["win32", "win64", "windows", "wince"];
		var iosPlatforms = ["iphone", "ipad", "ipod"];
		
		var userAgent = navigator.userAgent.toLowerCase();
		var platform = navigator.platform.toLowerCase();
		var protocol = location.protocol.toLowerCase().split(":")[0];
		
		var Android = /android/.test(userAgent);
		var Macos = macosPlatforms.indexOf(platform) !== -1;
		var iOS = iosPlatforms.indexOf(platform) !== -1;
		var Windows = windowsPlatforms.indexOf(platform) !== -1;
		var Linux = /linux/.test(platform);
		var Https = protocol == "https";
		var Http = protocol == "http";
		var Test = !(Https || Http);
		
		if((Android || Windows || Linux) && Https){
			ServerListesi.push("wss://mobilserver1.idealdata.com.tr:8080");
			ServerListesi.push("wss://mobilserver1.idealdata.com.tr:7650");
			ServerListesi.push("wss://mobilserver1.idealdata.com.tr:7651");
			ServerListesi.push("wss://mobilserver1.idealdata.com.tr:7652");
			ServerListesi.push("wss://mobilserver1.idealdata.com.tr:7653");
			ServerListesi.push("wss://mobilserver1.idealdata.com.tr:7654");
			ServerListesi.push("wss://mobilserver3.idealdata.com.tr:7650");
			ServerListesi.push("wss://mobilserver3.idealdata.com.tr:7651");
			ServerListesi.push("wss://mobilserver4.idealdata.com.tr:443");
			ServerListesi.push("wss://mobilserver4.idealdata.com.tr:8080");
		}
		
		if((iOS || Macos) && Http){
			ServerListesi.push("ws://mobilserver3.idealdata.com.tr:8000");
		}
		
		if(Test){
			ServerListesi.push("WSS://MOBILSERVER1.IDEALDATA.COM.TR:8080");
		}
		
		return ServerListesi[Math.floor(ServerListesi.length*Math.random())];
	},
};

var CleanText = function(text){
    while(true){
        text = text.split("");
        if(text[0] == " ")text[0] = "";
        else if(text[0] == "\t")text[0] = "";
        else if(text[0] == "\r")text[0] = "";
        else if(text[0] == "\n")text[0] = "";
        else if(text[text.length-1] == " ")text[text.length-1] = "";
        else if(text[text.length-1] == "\t")text[text.length-1] = "";
        else if(text[text.length-1] == "\r")text[text.length-1] = "";
        else if(text[text.length-1] == "\n")text[text.length-1] = "";
        else break;
        text = text.join("");
    }
    return text.join("");
};

IdealInterFace.GetContextMenu = function(params){
	var result = params.defaultItems ? params.defaultItems.splice(0) : [];
	//console.log("getContextMenuItems",result);
	//return result;
	return [
		{
			name:"Excel'e Çıkar",
			icon:"<i class=\"fa fa-table\" style=\"width:14px;height:14px;font-size:14px;\"></i>", // "<img src=\"images/lab.svg\"  style=\"width:14px;height:14px;font-size:14px;\" />"
			action:function(){
				ATA.PriceTable.gridOptions.api.exportDataAsExcel(params);
			}
		},
		{
			name:"Grafik",
			icon:"<i class=\"fa fa-graph\" style=\"width:14px;height:14px;font-size:14px;\"></i>",
			action:function(){
				var SEP1 = IdealInterFace.Settings.SEP1;
				var SessionId = IdealInterFace.UserParameters.SessionId;
				var UserName = IdealInterFace.UserParameters.UserName = document.all.UserName.value;
				var symbol = params.node.data.Symbol;
				
				if(!IdealInterFace.InstrumentsList[symbol])return;
				var instrument = IdealInterFace.InstrumentsList[symbol];
				IdealInterFace.Chart(symbol);
			},
		},
		{
			name:"Derinlik",
			icon:"<i class=\"fa fa-graph\" style=\"width:14px;height:14px;font-size:14px;\"></i>",
			action:function(){
				var symbol = params.node.data.Symbol;
				IdealInterFace.DepthAnalysis(symbol);
			 },
		},
		{
			name:"Getiri",
			icon:"<i class=\"fa fa-graph\" style=\"width:14px;height:14px;font-size:14px;\"></i>",
			action:function(){
				var symbol = params.node.data.Symbol;
				IdealInterFace.Profitage(symbol);
			},
		},
		{
			name:"Takas Oran Listesi",
			icon:"<i class=\"fa fa-graph\" style=\"width:14px;height:14px;font-size:14px;\"></i>",
			action:function(){
				var symbol = params.node.data.Symbol;
				IdealInterFace.SwapRates(symbol);
			},
		},
		{
			name:"Takas Grafik",
			icon:"<i class=\"fa fa-graph\" style=\"width:14px;height:14px;font-size:14px;\"></i>",
			action:function(){
				var symbol = params.node.data.Symbol;
				IdealInterFace.SwapAnalysis(symbol);
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
			name:"Takas Listesi",
			icon:"<i class=\"fa fa-graph\" style=\"width:14px;height:14px;font-size:14px;\"></i>",
			action:function(){
				var SEP1 = IdealInterFace.Settings.SEP1;
				var SessionId = IdealInterFace.UserParameters.SessionId;
				var UserName = IdealInterFace.UserParameters.UserName = document.all.UserName.value;
				var symbol = params.node.data.Symbol;
				var PITEPeriot = 1;
				
				var instrument = IdealInterFace.InstrumentGet(symbol);
				var yon = "ALANLAR";
				IdealInterFace.WS.Send("X" + SEP1 + "REQ_PITE" + SEP1 + instrument.Symbol + SEP1 + PITEPeriot + SEP1 + ToEngUp(yon) + SEP1 + UserName + SEP1 + SessionId);
				IdealInterFace.WS.Send("X" + SEP1 + "REQ_TKS2" + SEP1 + Username + SEP1 + basicitem.Composite + SEP1 + GetEl("TableTakasToolbar").rows[0].cells[ActiveTakasPeriodNo].innerHTML);
			},
		},*/
		//"copy",
		//"copyWithHeaders",
		//"paste",
	];
};

window.alert = function(msg){
	$('#modalwindow').find(".modal-title").html("Uyarı");
	$('#modalwindow').find(".modal-footer").html(msg.split("\n").join("<BR/>"));
	$('#modalwindow').modal("show");
};
IdealInterFace.GetNewsDetail = function(newsno, datestr, header){ // get a news
	var SEP1 = IdealInterFace.Settings.SEP1;
	
	var win = new IdealWindow("Haber Detay");
	var title = header.length > 30 ? (header.substr(0,27) + "...") : header;
	win.SetTitle("Haber Detay - " + title + " (" + datestr + ")");
	win.SetSize(650,500);
	win.GetContent().css({"overflow-x":"scroll"});
	win.GetContent().html("İçerik : " + header);
	
	IdealInterFace.WS.Send("X" + SEP1 + "REQ_NEWS_CONTENT" + SEP1 + newsno);
	IdealInterFace.ResponseFunctions["SRV_NEWS_CONTENT"] = function(ParserFieldArray){
		var NewsID = ParserFieldArray[2];
		var NewsContent = CleanText(ParserFieldArray[3]);
		var datestr = ParserFieldArray[4];
		var header = CleanText(ParserFieldArray[5]);
		//win.GetContent().html("İçerik : " + header);
		win.GetContent().html((NewsContent?NewsContent:header).split("\n").join("<br/>"));
		win.Open();
	};
	return win;
};
IdealInterFace.DepthAnalysis = function(symbol){
	var SEP1 = IdealInterFace.Settings.SEP1;
	var SEP2 = IdealInterFace.Settings.SEP2;
	var UserName = IdealInterFace.UserParameters.UserName;
	var SessionId = IdealInterFace.UserParameters.SessionId;
	
	var instrument0 = IdealInterFace.InstrumentsList[""+symbol];
	if(!instrument0)return;
	var prefix = instrument0.SUB_Prefix;
	var composite = prefix + "'" + symbol;
	
	var win;
	var id = "win0";
	if(DepthWindow.Multi)id = "win_" + symbol;
	if(DepthWindow.Windows[id])win = DepthWindow.Windows[id];
	else win = new DepthWindow(symbol);
	win.WIN.Open();
	IdealInterFace.WS.Send("X" + SEP1 + "REQ_DERINLIK" + SEP1 + UserName + SEP1 + SessionId + SEP1 + composite + SEP1 + "0" + SEP1 + "0" + SEP1 + "0" + SEP1 + composite);
	return win;
};
IdealInterFace.Profitage = function(symbol){
	var SEP1 = IdealInterFace.Settings.SEP1;
	var SEP2 = IdealInterFace.Settings.SEP2;
	var UserName = IdealInterFace.UserParameters.UserName;
	var SessionId = IdealInterFace.UserParameters.SessionId;
	
	var instrument0 = IdealInterFace.InstrumentsList[""+symbol];
	if(!instrument0)return;
	var prefix = instrument0.SUB_Prefix;
	var composite = prefix + "'" + symbol;//ProfitageWindow
	
	IdealInterFace.WS.Send("X" + SEP1 + "REQ_SYMBOL_GETIRI" + SEP1 + composite + SEP1 + UserName + SEP1 + SessionId + SEP1 + "0");
	
	var id = "win_" + symbol;
	if(ProfitageWindow.Windows[id])win = ProfitageWindow.Windows[id];
	else win = new ProfitageWindow(symbol);
	win.WIN.Open();
	
	IdealInterFace.ResponseFunctions["45"] = function(ParserFieldArray){
		var symbol = ParserFieldArray[4];
		var id = "win_" + symbol;
		if(!ProfitageWindow.Windows[id])return;
		var win = ProfitageWindow.Windows[id];
		var periots = ["Gün", "Bu Hafta", "1 Hafta", "Bu Ay", "1 Ay", "3 Ay", "6 Ay", "Bu Yıl", "1 Yıl"];
		var percents = ParserFieldArray[5].split(SEP2);
		var avarages = ParserFieldArray[6].split(SEP2);
		var highs = ParserFieldArray[7].split(SEP2);
		var lows = ParserFieldArray[8].split(SEP2);
		var arr = [];
		for(var i=0;i<periots.length;i++){
			var title = periots[i];
			var percent = Number(percents[i]);
			var avarage = Number(avarages[i]);
			var high = Number(highs[i]);
			var low = Number(lows[i]);
			arr.push({
				ID		: i,
				Title	: title,
				Percent	: percent ? percent : 0,
				Avarage	: avarage ? avarage : "-",
				High	: high ? high : "-",
				Low		: low ? low : "-",
			});
		}
		//win.WIN.Open();
		win.ProfitageTable.gridOptions.api.setRowData(arr);
		/*(function(gridOptions){
			var allColumnIds = [];
			gridOptions.columnApi.getAllColumns().forEach(function(column) {
				allColumnIds.push(column.colId);
			});
			gridOptions.columnApi.autoSizeColumns(allColumnIds);
		})(win.ProfitageTable.gridOptions);*/
	};
	return win;
};
IdealInterFace.NewsCompany = function(symbol){
	var SEP1 = IdealInterFace.Settings.SEP1;
	var SEP2 = IdealInterFace.Settings.SEP2;
	var UserName = IdealInterFace.UserParameters.UserName;
	var SessionId = IdealInterFace.UserParameters.SessionId;
	
	var instrument0 = IdealInterFace.InstrumentsList[""+symbol];
	if(!instrument0)return;
	var prefix = instrument0.SUB_Prefix;
	var composite = prefix + "'" + symbol;//NewsCompanyWindow
	var NewsUpdateTime = "0";
	
	IdealInterFace.WS.Send("X" + SEP1 + "REQ_NEWS_HEADER" + SEP1 + UserName + SEP1 + SessionId + SEP1 + NewsUpdateTime + SEP1 + "SEMBOL" + SEP1 + composite);
	
	var id = "win_" + symbol;
	if(NewsCompanyWindow.Windows[id])win = NewsCompanyWindow.Windows[id];
	else win = new NewsCompanyWindow(symbol);
	win.WIN.Open();
	
	IdealInterFace.ResponseFunctions["4"] = function(ParserFieldArray){
		var symbol = ParserFieldArray[5];
		var id = "win_" + symbol;
		if(!NewsCompanyWindow.Windows[id])return;
		var win = NewsCompanyWindow.Windows[id];
		
		var arr = [];
		for (var i=6;i<ParserFieldArray.length;i++){
			var ParserSplitArray = ParserFieldArray[i].split(SEP2);
			var content = ParserSplitArray[6].replace(/[\n\r]+/g, "<br/>");
			arr.push(content);
		}
		
		$(win.ContentHTML).html(arr.join("<br/><br/>"));
		//win.WIN.Open();
	};
	return win;
};
IdealInterFace.CapitalCampany = function(symbol){
	var SEP1 = IdealInterFace.Settings.SEP1;
	var SEP2 = IdealInterFace.Settings.SEP2;
	var UserName = IdealInterFace.UserParameters.UserName;
	var SessionId = IdealInterFace.UserParameters.SessionId;
	
	IdealInterFace.WS.Send("X" + SEP1 + "REQ_SERM_FIRMA" + SEP1 + symbol + SEP1 + UserName + SEP1 + SessionId);
	
	var id = "win_" + symbol;
	if(CapitalCampanyWindow.Windows[id])win = CapitalCampanyWindow.Windows[id];
	else win = new CapitalCampanyWindow(symbol);
	win.WIN.Open();
	IdealInterFace.ResponseFunctions["12"] = function(ParserFieldArray){
		var symbol = ParserFieldArray[4];
		var id = "win_" + symbol;
		if(!CapitalCampanyWindow.Windows[id])return;
		var win = CapitalCampanyWindow.Windows[id];
		var arr = [];
		for(var i=5;i<ParserFieldArray.length;i++){
			var ParserSplitArray = ParserFieldArray[i].split(SEP2);
			var date = ParserSplitArray[0];
			var paidly = ParserSplitArray[1];
			var unpaidly = ParserSplitArray[2];
			var dividend = ParserSplitArray[3];
			var rate = ParserSplitArray[4];
			arr.push({
				ID			: i,
				Date		: date,
				Paidly		: paidly,
				Unpaidly	: unpaidly,
				Dividend	: dividend,
				Rate		: rate,
			});
		}
		win.CapitalTable.gridOptions.api.setRowData(arr);
		(function(gridOptions){
			var allColumnIds = [];
			gridOptions.columnApi.getAllColumns().forEach(function(column) {
				allColumnIds.push(column.colId);
			});
			gridOptions.columnApi.autoSizeColumns(allColumnIds);
		})(win.CapitalTable.gridOptions);
		//win.CapitalTable.gridOptions.api.sizeColumnsToFit();
	};
	return win;
};
IdealInterFace.StepAnalysis = function(symbol, periot){
	var SEP1 = IdealInterFace.Settings.SEP1;
	var SEP2 = IdealInterFace.Settings.SEP2;
	var UserName = IdealInterFace.UserParameters.UserName;
	var instrument0 = IdealInterFace.InstrumentsList[""+symbol];
	if(!instrument0)return;
	var prefix =instrument0.SUB_Prefix;
	var composite = prefix + "'" + symbol;
	if(!periot)periot = "G";
	var win;
	var id = "win_" + symbol;
	if(StepAnalysisWindow.Windows[id])win = StepAnalysisWindow.Windows[id];
	else win = new StepAnalysisWindow(symbol);
	win.WIN.Open();
	IdealInterFace.WS.Send("X" + SEP1 + "REQ_KDM2" + SEP1 + UserName + SEP1 + composite + SEP1 + periot);
	IdealInterFace.ResponseFunctions["38"] = function(ParserFieldArray){
		if(!StepAnalysisWindow.Windows[id])return;
		var win = StepAnalysisWindow.Windows[id];
		var arr = [];
		for (var i=3;i<ParserFieldArray.length;i++){
			var ParserSplitArray = ParserFieldArray[i].split(SEP2);
			var price = Number(ParserSplitArray[0]);
			var lot = Number(ParserSplitArray[1]);
			var percent = Number(ParserSplitArray[2]);
			var percentbuyer = Number(ParserSplitArray[3]);
			var percentseller = Number(ParserSplitArray[4]);
			arr.push({
				ID		: i,
				Price	: price,
				Lot		: lot,
				Percent	: percent,
				PBuyer	: percentbuyer,
				PSeller	: percentseller
			});
		}
		//win.WIN.Open();
		win.StepsTable.gridOptions.api.setRowData(arr);
		(function(gridOptions){
			var allColumnIds = [];
			gridOptions.columnApi.getAllColumns().forEach(function(column) {
				allColumnIds.push(column.colId);
			});
			gridOptions.columnApi.autoSizeColumns(allColumnIds);
		})(win.StepsTable.gridOptions);
		//win.StepsTable.gridOptions.api.sizeColumnsToFit();
	};
	return win;
};
IdealInterFace.SwapRates = function(symbol, parametre){
	var SEP1 = IdealInterFace.Settings.SEP1;
	var SEP2 = IdealInterFace.Settings.SEP2;
	var UserName = IdealInterFace.UserParameters.UserName;
	
	var instrument0 = IdealInterFace.InstrumentsList[""+symbol];
	if(!instrument0)return;
	var prefix =instrument0.SUB_Prefix;
	var composite = prefix + "'" + symbol;
	if(!parametre)parametre = "SON";
	var win;
	var id = "win_" + symbol;
	if(SwapWindow.Windows[id])win = SwapWindow.Windows[id];
	else win = new SwapWindow(symbol);
	win.WIN.Open();
	IdealInterFace.WS.Send("X" + SEP1 + "REQ_TKS2" + SEP1 + UserName + SEP1 + composite + SEP1 + parametre);
	IdealInterFace.ResponseFunctions["39"] = function(ParserFieldArray){
		if(!SwapWindow.Windows[id])return;
		var win = SwapWindow.Windows[id];
		var details = ParserFieldArray[3];
		var arr = [];
		for(var i=4;i<ParserFieldArray.length;i++){
			var ParserSplitArray = ParserFieldArray[i].split(SEP2);
			arr.push({
				ID			: arr.length + 1,
				Active		: "",
				Holder		: ParserSplitArray[0],
				Lot			: ParserSplitArray[1],
				Percent		: ParserSplitArray[2],
			});
		}
		//win.WIN.Open();
		win.SwapTable.gridOptions.api.setRowData(arr);
		(function(gridOptions){
			var allColumnIds = [];
			gridOptions.columnApi.getAllColumns().forEach(function(column) {
				allColumnIds.push(column.colId);
			});
			gridOptions.columnApi.autoSizeColumns(allColumnIds);
		})(win.SwapTable.gridOptions);
		//win.SwapTable.gridOptions.api.sizeColumnsToFit();
	};
	return win;
};
IdealInterFace.SwapAnalysis = function(symbol, yon, periot){
	var SEP1 = IdealInterFace.Settings.SEP1;
	var SEP2 = IdealInterFace.Settings.SEP2;
	var UserName = IdealInterFace.UserParameters.UserName;
	var SessionId = IdealInterFace.UserParameters.SessionId;
	
	var instrument0 = IdealInterFace.InstrumentsList[""+symbol];
	if(!instrument0)return;
	var prefix =instrument0.SUB_Prefix;
	var composite = prefix + "'" + symbol;
	
	if(!yon)yon = "ALANLAR";
	if(!periot)periot = "GUN";
	
	IdealInterFace.WS.Send("X" + SEP1 + "REQ_TAKAS_FARK" + SEP1 + symbol + SEP1 + ToEngUp(periot) + SEP1 + ToEngUp(yon) + SEP1 + UserName + SEP1 + SessionId);
	var win;
	var id = "win_" + symbol;
	if(SwapChartWindow.Windows[id])win = SwapChartWindow.Windows[id];
	else win = new SwapChartWindow(symbol);
	win.WIN.Open();
	IdealInterFace.ResponseFunctions["13"] = function(ParserFieldArray){
		if(!SwapChartWindow.Windows[id])return;
		var win = SwapChartWindow.Windows[id];
		var arr = [];
		for(var i=5;i<ParserFieldArray.length;i++){
			var ParserSplitArray = ParserFieldArray[i].split(SEP2);
			var title = ParserSplitArray[0];
			var lot = Number(ParserSplitArray[1]);
			var percent = Number(ParserSplitArray[2]);
			arr.push({
				ID		: i,
				Title	: title,
				Value	: lot ? lot : 0,
				Percent	: percent ? percent : 0,
			});
		}
		//win.WIN.Open();
		win.SwapTable.gridOptions.api.setRowData(arr);
		/*(function(gridOptions){
			var allColumnIds = [];
			gridOptions.columnApi.getAllColumns().forEach(function(column) {
				allColumnIds.push(column.colId);
			});
			gridOptions.columnApi.autoSizeColumns(allColumnIds);
		})(win.SwapTable.gridOptions);*/
		win.SwapTable.gridOptions.api.sizeColumnsToFit();
	};
	return win;
};
IdealInterFace.Splitage = function(symbol, yon, periot){
	var SEP1 = IdealInterFace.Settings.SEP1;
	var SEP2 = IdealInterFace.Settings.SEP2;
	var UserName = IdealInterFace.UserParameters.UserName;
	var SessionId = IdealInterFace.UserParameters.SessionId;
	
	if(!yon)yon = "ALANLAR";
	if(!periot)periot = "10";
	
	IdealInterFace.WS.Send("X" + SEP1 + "REQ_DAGILIM_PASTA" + SEP1 + symbol + SEP1 + periot + SEP1 + ToEngUp(yon) + SEP1 + UserName + SEP1 + SessionId);
	
	var id = "win_" + symbol;
	if(SplitageChartWindow.Windows[id])win = SplitageChartWindow.Windows[id];
	else win = new SplitageChartWindow(symbol);
	win.WIN.Open();
	
	IdealInterFace.ResponseFunctions["15"] = function(ParserFieldArray){
		var symbol = ParserFieldArray[4];
		var id = "win_" + symbol;
		if(!SplitageChartWindow.Windows[id])return;
		var win = SplitageChartWindow.Windows[id];
		var datestr = ParserFieldArray[5];
		var arr = [];
		for(var i=6;i<ParserFieldArray.length;i++){
			var ParserSplitArray = ParserFieldArray[i].split(SEP2);
			var holder = ParserSplitArray[0];
			var lot = Number(ParserSplitArray[1].split(",").join(""));
			var percent = Number(ParserSplitArray[2]);
			var cost = ParserSplitArray[3];
			
			arr.push({
				ID		: i,
				Title	: holder,
				Lot		: lot,
				Percent	: percent,
				Cost	: cost,
			});
		}
		//win.WIN.Open();
		win.SplitageTable.gridOptions.api.setRowData(arr);
		/*(function(gridOptions){
			var allColumnIds = [];
			gridOptions.columnApi.getAllColumns().forEach(function(column) {
				allColumnIds.push(column.colId);
			});
			gridOptions.columnApi.autoSizeColumns(allColumnIds);
		})(win.SplitageTable.gridOptions);*/
		win.SplitageTable.gridOptions.api.sizeColumnsToFit();
	};
	return win;
};
IdealInterFace.SplitageList = function(symbol, yon, periot){
	var SEP1 = IdealInterFace.Settings.SEP1;
	var SEP2 = IdealInterFace.Settings.SEP2;
	var UserName = IdealInterFace.UserParameters.UserName;
	var SessionId = IdealInterFace.UserParameters.SessionId;
	
	if(!yon)yon = "TOPLAM";
	if(!periot)periot = "10";

	IdealInterFace.WS.Send("X" + SEP1 + "REQ_DAGILIM_LIST" + SEP1 + symbol + SEP1 + periot + SEP1 + ToEngUp(yon) + SEP1 + UserName + SEP1 + SessionId);
	
	var id = "win_" + symbol;
	if(SplitageListWindow.Windows[id])win = SplitageListWindow.Windows[id];
	else win = new SplitageListWindow(symbol);
	win.WIN.Open();
	
	IdealInterFace.ResponseFunctions["16"] = function(ParserFieldArray){
		var symbol = ParserFieldArray[4];
		var id = "win_" + symbol;
		if(!SplitageListWindow.Windows[id])return;
		var win = SplitageListWindow.Windows[id];
		var arr = [];
		for(var i=6;i<ParserFieldArray.length;i++){
			var ParserSplitArray = ParserFieldArray[i].split(SEP2);
			var holder = ParserSplitArray[0];
			var netlot = ParserSplitArray[1];
			var percent = Number(ParserSplitArray[2]);
			var cost = Number(ParserSplitArray[3]);
			arr.push({
				ID		: i,
				Holder	: holder,
				NetLot	: netlot,
				Percent	: percent,
				Cost	: cost,
			});
		}
		//win.WIN.Open();
		win.SplitageTable.gridOptions.api.setRowData(arr);
		/*(function(gridOptions){
			var allColumnIds = [];
			gridOptions.columnApi.getAllColumns().forEach(function(column) {
				allColumnIds.push(column.colId);
			});
			gridOptions.columnApi.autoSizeColumns(allColumnIds);
		})(win.SplitageTable.gridOptions);*/
	};
	return win;
};
IdealInterFace.BasicAnalysis = function(){
	var SEP1 = IdealInterFace.Settings.SEP1;
	var SEP2 = IdealInterFace.Settings.SEP2;
	var UserName = IdealInterFace.UserParameters.UserName;
	var SessionId = IdealInterFace.UserParameters.SessionId;
	var HesapKurum = IdealInterFace.UserParameters.HesapKurum;
	
	IdealInterFace.WS.Send("X" + SEP1 + "REQ_TANALIZ" + SEP1 + UserName + SEP1 + SessionId + SEP1 + HesapKurum);
	
	var id = "win_0";
	if(BasicAnalysisWindow.Windows[id])win = BasicAnalysisWindow.Windows[id];
	else win = new BasicAnalysisWindow("Temel Analiz");
	win.WIN.Open();
	IdealInterFace.ResponseFunctions["SRV_TANALIZ"] = function(ParserFieldArray){
		var id = "win_0";
		if(!BasicAnalysisWindow.Windows[id])return;
		var win = BasicAnalysisWindow.Windows[id];
		//win.WIN.Open();
		win.ContentFrame.src = ParserFieldArray[5];
	};
	return win;
};
IdealInterFace.Chart = function(symbol){
	win = new TVChartWindow(symbol);
	win.WIN.Open();
};

IdealInterFace.ResponseFunctions["DEFAULT"] = function(ParserFieldArray){ // empty function
	// DEGUB kodları
	if(false)return;
	console.log("Bilinmeyen => " + ParserFieldArray[1], ParserFieldArray);
};
IdealInterFace.ResponseFunctions["SRV_BASKA_BAGLANTI"] = function(ParserFieldArray){ // disconnect
	alert("Başka bağlantı nedeniyle yayın kesildi!");
	IdealInterFace.Logout();
};
IdealInterFace.ResponseFunctions["SRV_CONNECTION_ERROR"] = function(ParserFieldArray){ // connection error
	alert("Bağlantı Bilgi\n" + ParserFieldArray[1]);
	IdealInterFace.Logout();
};
IdealInterFace.ResponseFunctions["SRV_BIST_SEKTOR"] = function(ParserFieldArray){
	var watchList = ParserFieldArray.slice(3);
	var tg = ParserFieldArray[2];
	watchList = watchList.map(function(item,index){
		return Object.assign({
			Symbol:item,
			ID:index,
		},IdealInterFace.GetGridData(item));
	});
	while(watchList.length < 500) watchList.push({
		Symbol:"",
		ID:watchList.length,
	});
	var prtable = new PriceTableWindow(tg);
	prtable.List = [];
	watchList.map(function(item){
		prtable.List.push(item.Symbol);
	});
	return;
	ATA.PriceTable.gridOptions.api.applyTransactionAsync({update:watchList});
	(function autoSizeAll(gridOptions){
		var allColumnIds = [];
		gridOptions.columnApi.getAllColumns().forEach(function(column) {
			allColumnIds.push(column.colId);
		});
		gridOptions.columnApi.autoSizeColumns(allColumnIds);
	})(ATA.PriceTable.gridOptions);
};
var ReceivedsFunction = function(ParserFieldArray){ // sıralamalar
	var watchList = ParserFieldArray.slice(2);
	var tg = "Liste";//ParserFieldArray[2];
	switch(ParserFieldArray[1].toUpperCase()){
		case "SRV_BIST_YUKSELEN":tg = "En Çok Yükselenler";break;
		case "SRV_BIST_DUSEN":tg = "En Çok Düşenler";break;
		case "SRV_BIST_HACIM":tg = "En Yüksek Hacim";break;
	}
	var prtable = new PriceTableWindow(tg);
	prtable.List = [];
	watchList = watchList.map(function(item,index){
		prtable.List.push(item);
		return Object.assign({
			Symbol:item,
			ID:index,
		},IdealInterFace.GetGridData(item));
	});
	
	
	return;
	ATA.PriceTable.gridOptions.api.applyTransactionAsync({update:watchList});
	(function autoSizeAll(gridOptions){
		var allColumnIds = [];
		gridOptions.columnApi.getAllColumns().forEach(function(column) {
			allColumnIds.push(column.colId);
		});
		gridOptions.columnApi.autoSizeColumns(allColumnIds);
	})(ATA.PriceTable.gridOptions);
};
IdealInterFace.ResponseFunctions["SRV_BIST_HACIM"] = ReceivedsFunction;
IdealInterFace.ResponseFunctions["SRV_BIST_DUSEN"] = ReceivedsFunction;
IdealInterFace.ResponseFunctions["SRV_BIST_YUKSELEN"] = ReceivedsFunction;
IdealInterFace.ResponseFunctions["A"] = function(ParserFieldArray){ // trade login step 1
	if (UserName != ParserFieldArray[2]) return;
	if (SessionId != ParserFieldArray[3]) return;
	if (typeof F1 != "function") {
		var script = document.createElement("SCRIPT");
		var codelogin = ParserFieldArray[4];
		codelogin = codelogin.split("SendRequest").	join("(WSSEND)");
		
		codelogin = codelogin.split("SEP1").		join(""+JSON.stringify(IdealInterFace.Settings.SEP1));
		codelogin = codelogin.split("SessionId").	join(""+JSON.stringify(IdealInterFace.UserParameters.SessionId));
		codelogin = codelogin.split("Username").	join(""+JSON.stringify(IdealInterFace.UserParameters.UserName));
		
		codelogin = codelogin.split("HesapKurum").	join(""+JSON.stringify(IdealInterFace.UserParameters.HesapKurum));
		codelogin = codelogin.split("HesapNo").		join(""+JSON.stringify(IdealInterFace.UserParameters.HesapNo));
		codelogin = codelogin.split("HesapParola").	join(""+JSON.stringify(IdealInterFace.UserParameters.HesapParola));
		codelogin = codelogin.split("V1").			join(""+JSON.stringify(IdealInterFace.UserParameters.TradeKey));
		codelogin = codelogin.split("HesapSifre").	join(""+JSON.stringify(IdealInterFace.UserParameters.HesapSifre));
		
		script.innerHTML = codelogin;
		document.head.appendChild(script);
	}
	if (HesapKurum == "HALK YATIRIM"
		|| HesapKurum == "ANADOLU YATIRIM"
		|| HesapKurum == "TURKISH YATIRIM"
		|| HesapKurum == "BURGAN YATIRIM") F3(0);
	else F2();
};
IdealInterFace.ResponseFunctions["B"] = function(ParserFieldArray){ // trade login step 2
	if (UserName != ParserFieldArray[2]) return;
	if (SessionId != ParserFieldArray[3]) return;
	IdealInterFace.UserParameters.TradeKey = parseInt(ParserFieldArray[4]);
	IdealInterFace.WS.Send("X" + SEP1 + "A" + SEP1 + UserName + SEP1 + SessionId + SEP1 + IdealInterFace.UserParameters.TradeKey);
	//return;
};
IdealInterFace.ResponseFunctions["SRV_SENETLER"] = function(ParserFieldArray){
	return;
	if (ParserFieldArray[4] == "1"){
	} else if (ParserFieldArray[4] == "2"){
		if (ParserFieldArray[5] != "" && ParserFieldArray[5] != undefined) {
			var symbolarray = ParserFieldArray[5].split("|");
			for (var i=0;i<symbolarray.length;i++){
				var fieldarray = symbolarray[i].split(";");
				if (parseInt(fieldarray[1]) >= 0 && parseInt(fieldarray[1]) <= 2000){
					//console.log(fieldarray);
				}
			}
		}
	}
};

var Decode26Messages = function(code){
	switch(code){
		case"0":return "LastPrice";
		case"2":return "BidPrice";
		case"3":return "AskPrice";
		case"N":return "LimitUp";
		case"O":return "LimitDown";
		case"A":return "LastSize";
		case"B":return "BidSize";
		case"C":return "AskSize";
		case"8":return "PriceStep";
		case"D":return "WavrSession";
		case"F":return "VolSession";
		case"H":return "SizeSession";
		case"J":return "HighSession";
		case"L":return "LowSession";
		case"K":return "DengeFiyat";
		case"M":return "DengeMiktar";
		case"P":return "PrevCloseSession";
		case"Q":return "WebSymbolCatagory";
		case"R":return "PriceEarningValue";
		case"S":return "PiyDegDefDeg";
		case"T":return "DengeBidKalan";
		case"U":return "DengeAskKalan";
		case"V":return "Durum";
		case"Y":return "Time";
		default:
		console.log("CODE => " + code);
	}
};

IdealInterFace.ResponseFunctions["26"] = function(ParserFieldArray){ // realtime update
	var SEP2 = IdealInterFace.Settings.SEP2;
	IdealInterFace.lastActiviteConnect = new Date(ParserFieldArray[2] + " 2022").getTime();
	document.all.systemTime.innerText = (new Date(IdealInterFace.lastActiviteConnect)).toLocaleTimeString();
	for (var i=3;i<ParserFieldArray.length;i++){
		var ParserSplitArray = ParserFieldArray[i].split(SEP2);
		var symbol = SymbolDecode(ParserSplitArray[0],1);
		var prefixconfID = Number(ParserSplitArray[0]);
		for (var j=1;j<ParserSplitArray.length;j++){
			var codestr = ParserSplitArray[j].substr(0, 1);
			var valnum = parseFloat(ParserSplitArray[j].substr(1));
			if (isNaN(valnum)) continue;
			IdealInterFace.InstrumentsUpdate(symbol, Decode26Messages(codestr), valnum);
		}
	}
};
IdealInterFace.ResponseFunctions["28"] = function(ParserFieldArray){ // realtime news
	var SEP2 = IdealInterFace.Settings.SEP2;
	var NewsUpdateTime = ParserFieldArray[2];
	if (ParserFieldArray.length < 3) return;
	for (var i=3;i<ParserFieldArray.length;i++){
		var ParserSplitArray = ParserFieldArray[i].split(SEP2);
		var NewsID = ParserSplitArray[0];;
		var DateStr = ParserSplitArray[1];
		var NewsNo = ParserSplitArray[2];
		var Header = ParserSplitArray[3];
		ATA.NewsTable.gridOptions.api.applyTransaction({add:[{
			NewsID:NewsID,
			DateStr:DateStr,
			NewsNo:NewsNo,
			Header:Header,
			NewsContent:"",
		}]});
		//if ((Date.now() - ATA.StartTime) > 7000) jNotify.push("Haber", Header);
	}
};
IdealInterFace.ResponseFunctions["35"] = function(ParserFieldArray){
	IdealInterFace.lastActiviteConnect = new Date(ParserFieldArray[2] + " 2022").getTime();
	var ParserSplitArray = ParserFieldArray[3].split("|");
	for (var i=0;i<ParserSplitArray.length;i++){
		IdealInterFace.Licences[ParserSplitArray[i]] = true;
	}
	var costumerkrm = ParserFieldArray[4];
	var sozlesmekabulstr = ParserFieldArray[5];
	var sozlesmetext = ParserFieldArray[6];
	var mesajkabul = ParserFieldArray[7] == "1";
	var msjuyaristr = ParserFieldArray[8];
	var newpassword = ParserFieldArray[9];
	var adresuyari = ParserFieldArray[10] == "1";
};
IdealInterFace.ResponseFunctions["43"] = function(ParserFieldArray){ // 
	var SEP2 = IdealInterFace.Settings.SEP2;
	for (var i=2;i<ParserFieldArray.length;i++){
		var ParserSplitArray = ParserFieldArray[i].split(SEP2);
		var prefix = ParserSplitArray[0];
		var symbol = ParserSplitArray[1];
		var composite = prefix + "'" + symbol;
		
		IdealInterFace.InstrumentsUpdate(symbol, "Prefix", prefix);
		
		var DecPoint = parseInt(ParserSplitArray[2]);
		var SeriNo = ParserSplitArray[3];
		var IndexType = ParserSplitArray[4];
		var SubMarket = ParserSplitArray[5];
		var Group = ParserSplitArray[6];
		var LastPrice = parseFloat(ParserSplitArray[7]);
		var DayClose = parseFloat(ParserSplitArray[8]);
		var BidPrice = parseFloat(ParserSplitArray[9]);
		var AskPrice = parseFloat(ParserSplitArray[10]);
		
		var OrginalIns = parseFloat(ParserSplitArray[11]);
		var GuaranteCost = parseFloat(ParserSplitArray[12]);
		
		if(DecPoint)	IdealInterFace.InstrumentsUpdate(symbol, "DecPoint", DecPoint);
		if(SeriNo)		IdealInterFace.InstrumentsUpdate(symbol, "SeriNo", SeriNo);
		if(IndexType)	IdealInterFace.InstrumentsUpdate(symbol, "IndexType", IndexType);
		if(SubMarket)	IdealInterFace.InstrumentsUpdate(symbol, "SubMarket", SubMarket);
		if(Group)		IdealInterFace.InstrumentsUpdate(symbol, "Group", Group);
		if(LastPrice)	IdealInterFace.InstrumentsUpdate(symbol, "LastPrice", LastPrice);
		if(DayClose)	IdealInterFace.InstrumentsUpdate(symbol, "DayClose", DayClose);
		if(BidPrice)	IdealInterFace.InstrumentsUpdate(symbol, "BidPrice", BidPrice);
		if(AskPrice)	IdealInterFace.InstrumentsUpdate(symbol, "AskPrice", AskPrice);
		
		
		if(prefix != "VIP"&& ParserSplitArray.length == 12){
			if(OrginalIns == "1")IdealInterFace.InstrumentsUpdate(symbol, "BrutTakasBool", true);
			else IdealInterFace.InstrumentsUpdate(symbol, "BrutTakasBool", false);
		}
		/*
		
		if (BasicItem.Prefix != "VIP" && ParserSplitArray.length == 12) {
			if (ParserSplitArray[11] == "1") BasicItem.BrutTakasBool = true;
			else BasicItem.BrutTakasBool = false;
		} else if (BasicItem.Prefix == "VIP" && ParserSplitArray.length == 12) {
			BasicItem.Original = ParserSplitArray[11];
		} else if (BasicItem.Prefix == "VIP" && ParserSplitArray.length == 13) {
			BasicItem.Original = ParserSplitArray[11];
		}
		*/
	}
};
IdealInterFace.ResponseFunctions["46"] = function(ParserFieldArray){ // yüzeysel veri
	var symbol = ParserFieldArray[2];
	if(!IdealInterFace.InstrumentsList[symbol])return;
	
	instrument = IdealInterFace.InstrumentGet(symbol);
	ATA.SuperficialAnalysisTable.gridOptions.api.setRowData([]);
	var index = 1;
	var addContent = function(Subject, Content=""){
		ATA.SuperficialAnalysisTable.gridOptions.api.applyTransaction({add:[{
			ID:index++,
			Subject:Subject,
			Content:Content,
		}]});
	};
	
	addContent("Sembol", instrument.Symbol);
	
	if(instrument.Prefix == "IMKBH"){ // denge
		addContent("Denge");
		var Denge_Fiyat = ParserFieldArray[16]; //Denge Fiyat
		var Denge_Miktar = ParserFieldArray[17]; //Denge Miktar
		var Denge_Alista_Kalan = ParserFieldArray[18]; //Denge Alışta Kalan
		var Denge_Satista_Kalan = ParserFieldArray[19]; //Denge Satışta Kalan
	
		addContent("Denge Fiyatı",Denge_Fiyat);
		addContent("Denge Miktarı",Denge_Miktar);
		addContent("Denge Alışta Kalan",Denge_Alista_Kalan);
		addContent("Denge Satışta Kalan",Denge_Satista_Kalan);
	}
	
	if(instrument.Prefix == "IMKBH" && instrument.SeriNo != "V"){ // Bilanço
		addContent("Bilanço");
		var Donem = ParserFieldArray[24]; // Dönem
		var Net_Kar = ParserFieldArray[25]; // Net Kar
		var Oz_Sermaye = ParserFieldArray[26]; // Öz Sermaye
		var Odenmis_Sermaye = ParserFieldArray[27]; // Ödenmiş Sermaye
		var Piyasa_Degeri = ParserFieldArray[28]; // Piyasa Değeri
		var F_K = ParserFieldArray[29]; // F/K"
		var Halka_Aciklik = ParserFieldArray[30]; // Halka Açıklık
		var Defter_Degeri = ParserFieldArray[31]; // Defter Değeri
		var PD_DD = ParserFieldArray[32]; // PD/DD
		
		addContent("Dönemi",Donem);
		addContent("Net Kar",Net_Kar);
		addContent("Öz Sermayesi",Oz_Sermaye);
		addContent("Ödenmiş Sermaye",Odenmis_Sermaye);
		addContent("Piyasa Değeri",Piyasa_Degeri);
		addContent("F_K",F_K);
		addContent("Harlka Açıklık",Halka_Aciklik);
		addContent("Defter Değeri",Defter_Degeri);
		addContent("PD_DD",PD_DD);
	}

	if(instrument.Prefix == "IMKBH" || instrument.Prefix == "VIP"){ // PÇG
		addContent("PGÇ");
		var Giris = ParserFieldArray[20]; // Giriş
		var Cikis = ParserFieldArray[21]; // Çıkış
		var Toplam = ParserFieldArray[22]; // Toplam
		var Fark = ParserFieldArray[23]; // Fark
		
		addContent("Giriş",Giris);
		addContent("Çıkış",Cikis);
		addContent("Toplam",Toplam);
		addContent("Fark",Fark);
	}
	
	if(instrument.Prefix == "VIP"){ // Vadeli
		addContent("Vadeli");
		var Acik_Poz = ParserFieldArray[33]; // Açık Poz
		var Acik_Poz_Fark = ParserFieldArray[34]; // Açık Poz Fark
		var Uzlasi = ParserFieldArray[35]; // Uzlaşı
		var Onceki_Uzlasi = ParserFieldArray[36]; // Önc.Uzlaşı
		var Teorik_Fiyat = ParserFieldArray[38]; // Teorik Fiyat
		
		addContent("Açık Pozisyon",Acik_Poz);
		addContent("Açık Pozisyon Farkı",Acik_Poz_Fark);
		addContent("Uzlaşı",Uzlasi);
		addContent("Önceki Uzlaşı",Onceki_Uzlasi);
		addContent("Teorik Fiyat",Teorik_Fiyat);
	}
	
	if(instrument.Prefix == "VIP" || instrument.SeriNo == "V"){ // Varant
		addContent("Varant");
		var Dayanak_Varlik = ParserFieldArray[39]; // Dayanak Varlık
		var Vadeye_Kalan_Gun = ParserFieldArray[40]; // Vadeye Kalan Gün
		var Vade_Sonu = ParserFieldArray[41]; // Vade Sonu
		var Tur = ParserFieldArray[42]; // Tür
		var Kullanim_Fiyati = ParserFieldArray[43]; // Kullanım Fiyatı
		var Ihracci = ParserFieldArray[44]; // İhraççı
		
		addContent("Dayanak Varlık",Dayanak_Varlik);
		addContent("Vadeye Kalan Gün",Vadeye_Kalan_Gun);
		addContent("Vade Sonu",Vade_Sonu);
		addContent("Türü",Tur);
		addContent("Kullanım Fiyatı",Kullanim_Fiyati);
		addContent("İhraçcı",Ihracci);
	}
};
IdealInterFace.ResponseFunctions["17"] = function(ParserFieldArray){ // ekonomik takvim
	var linearray = ParserFieldArray[4].split("\r\n");
	var arr = [];
	for(var i=0;i<linearray.length;i++){
		var cols = linearray[i].split(";");
		var title = cols[0];
		var date = cols[1];
		var country = cols[2];
		var expected = cols[3]
		var previous = cols[4]
		var important = cols[5].split("*").length;
		var age = cols[6];
		arr.push({
			ID			: i,
			Date		: date + "",
			Title		: title,
			Country		: country,
			Expected	: expected,
			Previous	: previous,
			Important	: important,
			Age			: age,
		});
	}
	ATA.CalendarTable.gridOptions.api.setRowData(arr);
};
IdealInterFace.ResponseFunctions["33"] = function(ParserFieldArray){ // derinlik kademeleri doldur
	var SEP2 = IdealInterFace.Settings.SEP2;
	var symbol = ParserFieldArray[2];
	DerinlikUpdateTime = ParserFieldArray[3];
	var id = "win0";
	if(DepthWindow.Multi)id = "win_" + symbol;
	var win = DepthWindow.Windows[id];
	
	win.WIN.SetTitle("Derinlik - " + symbol);
	win.TableDepth.gridOptions.api.sizeColumnsToFit();
	
	var updates = Array.from({length:25},function(item,index){
		return {
			Active:""
		};
	});
	for (var i=4;i<ParserFieldArray.length;i++){
		//var Index = i - 4;
		var ParserSplitArray = ParserFieldArray[i].split(SEP2);
		var preAf = ParserSplitArray[0];
		var index = Number(ParserSplitArray[1]);
		var step = ParserSplitArray[2];
		var lot = ParserSplitArray[3]; // 4, 5 => emir sayısı, yapıcı emirler
		// console.log("33 ", A);
		// win.GetContent().html(A);
		updates[index].ID = index;
		updates[index].Active = "E";
		//updates[index][preAf + "Side"] = "";
		updates[index][preAf + "Step"] = step;
		updates[index][preAf + "Lot"] = lot;
	}
	DepthWindow.Windows[id].TableDepth.gridOptions.api.setRowData(updates);
	/*(function autoSizeAll(gridOptions) {
		var allColumnIds = [];
		gridOptions.columnApi.getAllColumns().forEach(function(column) {
			allColumnIds.push(column.colId);
		});
		gridOptions.columnApi.autoSizeColumns(allColumnIds);
	})(DepthWindow.Windows[id].TableDepth.gridOptions);*/
};
IdealInterFace.ResponseFunctions["34"] = function(ParserFieldArray){ // derinlik tradeleri doldur
	var SEP2 = IdealInterFace.Settings.SEP2;
	var symbol = ParserFieldArray[2];
	IslemUpdateTime = ParserFieldArray[3];
	SonIslemNo = ParserFieldArray[4];
	var id = "win0";
	if(DepthWindow.Multi)id = "win_" + symbol;
	var win = DepthWindow.Windows[id]; // symbol
	
	win.WIN.SetTitle("Derinlik - " + symbol);
	var updates = [];
	for (var i = 5; i < ParserFieldArray.length; i++) {
		var ParserSplitArray = ParserFieldArray[i].split(SEP2);
		var time = (new Date((new Date()).toDateString() + " " + ParserSplitArray[0])).getTime() + updates.length;
		var price = Number(ParserSplitArray[1]);
		var lot = Number(ParserSplitArray[2]);
		var side = ParserSplitArray[3] == "1" ? "B" : "S";
		var buyer = ParserSplitArray[4];
		var seller = ParserSplitArray[5];
		updates.push({
			Time	: time,
			Price	: price,
			Lot		: lot,
			Buyer	: buyer,
			Seller	: seller,
			Side	: side,
		});
	}
	DepthWindow.Windows[id].TableTrade.gridOptions.api.setRowData(updates);
	win.TableTrade.gridOptions.api.sizeColumnsToFit();
};
IdealInterFace.ResponseFunctions["SRV_DRN"] = function(ParserFieldArray){ // realtime derinlik
	var paketarray = ParserFieldArray[2].split("|");
	var symbol = paketarray[0];
	var id = "win0";
	if(DepthWindow.Multi)id = "win_" + symbol;
	if(!DepthWindow.Windows[id])return;
	var win = DepthWindow.Windows[id];
	win.WIN.SetTitle("Derinlik - " + symbol);
	for (var i=1;i<paketarray.length-1;i++){
		var splitarray = paketarray[i].split(";");
		if (splitarray[0] == "D"){
			var side = splitarray[1];
			var rowno = Number(splitarray[2]);
			var step = splitarray[3];
			var lot = splitarray[4];
			var updateObj = win.TableDepth.gridOptions.api.getRowNode("" + rowno).data;
			updateObj.Active = "E";
			updateObj[side + "Step"] = step;
			updateObj[side + "Lot"] = lot;
			win.TableDepth.gridOptions.api.applyTransactionAsync({update:[updateObj]});
		}else if (splitarray[0] == "I"){
			var time = (new Date((new Date()).toDateString() + " " + splitarray[1])).getTime();
			var price = Number(splitarray[2]);
			var lot = Number(splitarray[3]);
			var side = splitarray[4] == "1" ? "B" : "S";
			var buyer = splitarray[5];
			var seller = splitarray[6];
			win.TableTrade.gridOptions.api.applyTransactionAsync({add:[{
				Time	: time + (new Date()).getMilliseconds() + i, // same id error fixing
				Price	: price,
				Lot		: lot,
				Buyer	: buyer,
				Seller	: seller,
				Side	: side,
			}]});
		}
	}
	win.TableDepth.gridOptions.api.sizeColumnsToFit();
	win.TableTrade.gridOptions.api.sizeColumnsToFit();
};
IdealInterFace.ResponseFunctions["PITE"] = function(ParserFieldArray){ // tammalanmadı!
	var SEP2 = IdealInterFace.Settings.SEP2;
	var symbol = ParserFieldArray[4];
	var datestr = ParserFieldArray[5];
	for (var i = 6; i < ParserFieldArray.length; i++) {
		ParserSplitArray = ParserFieldArray[i].split(SEP2);
		parsetable.rows[i - 6].cells[1].innerHTML = ParserSplitArray[0];
		parsetable.rows[i - 6].cells[2].innerHTML = ParserSplitArray[1];
		parsetable.rows[i - 6].cells[2].style.color = color;
		parsetable.rows[i - 6].cells[3].innerHTML = ParserSplitArray[2];
		if (i < 11) parsetable.rows[i - 6].cells[4].innerHTML = ParserSplitArray[3];
		data[i - 6] = parseFloat(ParserSplitArray[2]);
	}
};

function SymbolDecode(strX, codingtype) {
	var str = "";
	switch (strX) {
		case "0": str = "FX'EURUSD"; break;
		case "1": str = "FX'EURTRY"; break;
		case "2": str = "FX'USDTRY"; break;
		case "3": str = "FX'TRYJPY"; break;
		case "4": str = "FX'EURJPY"; break;
		case "5": str = "FX'EURCAD"; break;
		case "6": str = "FX'EURGBP"; break;
		case "7": str = "FX'EURCHF"; break;
		case "8": str = "FX'GBPUSD"; break;
		case "9": str = "FX'GBPJPY"; break;
		case "10": str = "FX'GBPEUR"; break;
		case "11": str = "FX'USDJPY"; break;
		case "12": str = "EUREX'DAX-A"; break;
		case "13": str = "CBOTM'YM-A"; break;
		case "14": str = "CMEM'NQ-A"; break;
		case "15": str = "CMEM'ES-A"; break;
		case "16": str = "VIP'VIP-X030"; break;
		case "17": str = "VIP'VIP-USD"; break;
		case "18": str = "VIP'VIP-EUR"; break;
		case "19": str = "VIP'VIP-GLD"; break;
		case "20": str = "IMKBH'GARAN"; break;
		case "21": str = "IMKBH'HALKB"; break;
		case "22": str = "IMKBH'ISCTR"; break;
		case "23": str = "IMKBH'VAKBN"; break;
		case "24": str = "IMKBH'THYAO"; break;
		case "25": str = "IMKBH'EREGL"; break;
		case "26": str = "IMKBH'AKBNK"; break;
		case "27": str = "IMKBH'YKBNK"; break;
		case "28": str = "IMKBH'KRDMD"; break;
		case "29": str = "IMKBH'TCELL"; break;
		case "30": str = "IMKBH'ENKAI"; break;
		case "31": str = "IMKBH'BIMAS"; break;
		case "32": str = "IMKBH'SAHOL"; break;
		case "33": str = "IMKBH'PETKM"; break;
		case "34": str = "IMKBH'OTKAR"; break;
		case "35": str = "IMKBH'ASYAB"; break;
		case "36": str = "IMKBH'PGSUS"; break;
		case "37": str = "IMKBH'MGROS"; break;
		case "38": str = "IMKBH'ARCLK"; break;
		case "39": str = "IMKBH'KOZAA"; break;
		case "40": str = "IMKBH'TTKOM"; break;
		case "41": str = "IMKBH'EKGYO"; break;
		case "42": str = "IMKBH'ASELS"; break;
		case "43": str = "IMKBH'ULKER"; break;
		case "44": str = "IMKBH'KCHOL"; break;
		case "45": str = "IMKBH'TAVHL"; break;
		case "46": str = "IMKBH'FENER"; break;
		case "47": str = "IMKBH'NTTUR"; break;
		case "48": str = "IMKBH'NTHOL"; break;
		case "49": str = "IMKBH'TUPRS"; break;
		case "50": str = "IMKBH'BIZIM"; break;
		case "51": str = "KIYM'XGLD"; break;
		case "52": str = "DFN'GLDUSD"; break;
		case "53": str = "INTUSD'DLRBNK"; break;
		case "54": str = "BNKGS'ASYAEUR"; break;
		case "55": str = "BNKGS'ASYAUSD"; break;
		case "56": str = "BNKGS'HALKUSD"; break;
		case "57": str = "BNKGS'HALKEUR"; break;
		case "58": str = "BNKGS'ISBNKUSD"; break;
		case "59": str = "BNKGS'ISBNKEUR"; break;
		case "60": str = "BNKGS'SKBNEUR"; break;
		case "61": str = "BNKGS'SKBNUSD"; break;
		case "62": str = "BNKGS'VAKIFEUR"; break;
		case "63": str = "BNKGS'VAKIFUSD"; break;
		case "64": str = "BNKGS'DNZEUR"; break;
		case "65": str = "BNKGS'DNZUSD"; break;
		case "66": str = "BNKGS'AKBEUR"; break;
		case "67": str = "BNKGS'AKBUSD"; break;
		case "68": str = "BNKGS'GRNUSD"; break;
		case "69": str = "BNKGS'GRNEUR"; break;
		case "70": str = "BNKGS'YKBUSD"; break;
		case "71": str = "BNKGS'YKBEUR"; break;
	}
	str = "";
	if (str != "") {
		if (codingtype == 0) {
			return str;
		}
		else {
			var symbolnamearray = str.split("'");
			return symbolnamearray[1];
		}
	}
	return strX;
}

var Instrument = function(Instrument1,Instrument2="TRY"){
	this.Instrument1 = ""+Instrument1;
	this.Type = "R"; // R reel, V virtual, 
	//this.Instrument2 = ""+Instrument2;
};
Instrument.prototype.GetDifferential = function(){
	var LastPrice = parseFloat(this.SUB_0);
	if(!LastPrice) LastPrice = parseFloat(this.SUB_D);
	var PreviusClose = parseFloat(this.SUB_DayClose);
	var PDaily = 100 * (LastPrice - PreviusClose) / PreviusClose;
	return PDaily;
};

function getOffset(el){
	var _x=0;
	var _y=0;
	while(el&&!isNaN(el.offsetLeft)&&!isNaN(el.offsetTop)){
		_x += el.offsetLeft - 0*el.scrollLeft;
		_y += el.offsetTop - 0*el.scrollTop;
		el = el.offsetParent;
	}
	return [_x,_y];
}

var idealPriceCell = function(htmlobj){
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
idealPriceCell.FormatPrice = function(price,format){
	return Number(price).toLocaleString("tr-TR",format).substr(1);
};
idealPriceCell.prototype.DelayedUpdate = function(){
	var price = Math.floor(this.Value / this.Step) * this.Step;
	var Newform = idealPriceCell.FormatPrice(price,this.PriceFormat);
	this.HTMLObjectPrice.innerHTML = "<div class=\"priceareanonpdate\">" + Newform + "</div>";
	try{
		$(this.HTMLObjectPrice).parents(".ag-cell")[0].style.backgroundColor  = "#80808000";
	}catch(e){}
	//this.HTMLObjectPrice.innerHTML = this.HTMLObjectPrice.innerHTML.replace("priceareaUpdate","priceareanonpdate").replace("nonchangednonricearea","").replace("nonchangedricearea","");//
};
idealPriceCell.prototype.Update = function(price){
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
	var Newform = idealPriceCell.FormatPrice(price,this.PriceFormat);
	var Oldform = idealPriceCell.FormatPrice(oldValue,this.PriceFormat);
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

var idealdataPriceCellRenderer = function(){
	this.eGui = document.createElement("DIV");
	this.eGui.style.width = "100%";
	this.eGui.style.height = "100%";
	this.eGui.style.display = "none";
	this.idealPriceCell = new idealPriceCell(this.eGui);
};
idealdataPriceCellRenderer.prototype.init = function(params){
	if (isNaN(Number(params.value))) return;
	if(IdealInterFace.InstrumentsList[params.data.Symbol + ""])this.eGui.style.display = "";
	else this.eGui.style.display = "none";
	this.idealPriceCell.Update(params.value);
};
idealdataPriceCellRenderer.prototype.getGui = function(){
	return this.eGui;
};
idealdataPriceCellRenderer.prototype.refresh = function(params){
	if (isNaN(Number(params.value))) return;
	if(IdealInterFace.InstrumentsList[params.data.Symbol + ""])this.eGui.style.display = "";
	else this.eGui.style.display = "none";
	this.idealPriceCell.Update(params.value);
	return true;
};
idealdataPriceCellRenderer.prototype.destroy = function(){};

var idealdataPercentCellRenderer = function(){
	this.eGui = document.createElement("DIV");
	this.eGui.innerHTML = "";
	this.eGui.style.display = "none";
	this.PValue = 0;
};
idealdataPercentCellRenderer.prototype.init = function(params){
	//this.eGui.innerHTML = "-";
	if(IdealInterFace.InstrumentsList[params.data.Symbol + ""])this.eGui.style.display = "";
	else this.eGui.style.display = "none";
	if(params.value)this.refresh(params);
	else this.refresh({params:0});
};
idealdataPercentCellRenderer.prototype.refresh = function(params){
	var deger = Number(params.value);
	if (isNaN(deger)) return true;
	if (!isFinite(deger)) return true;
	if(IdealInterFace.InstrumentsList[params.data.Symbol + ""])this.eGui.style.display = "";
	else this.eGui.style.display = "none";
	this.PValue = deger;
	var rise = this.PValue >= 0;
	var change = !(this.PValue == 0);
	this.eGui.innerHTML = "<div class=\"priceareanonpdate " + (change?(rise?"nonchangedricearea":"nonchangednonricearea"):"changedstabprice") + "\"> " + (rise?"<!-- + -->":"<!-- - -->") + " % " + Math.abs(this.PValue).toFixed(2) + "</div>";
	return true;
};
idealdataPercentCellRenderer.prototype.getGui = function(){
	return this.eGui;
};
idealdataPercentCellRenderer.prototype.destroy = function(){};

var idealdataPriceGrahpCellRenderer = function(){
	this.eGui = document.createElement("CANVAS");
	this.eGui.style.width = "100px";
	this.eGui.style.height = "20px";
	this.eGui.style.display = "none";
	this.eGui.width = 100;
	this.eGui.height = 20;
	this.Data = [];
	this.refresh({});
};
idealdataPriceGrahpCellRenderer.prototype.init = function(params){
	if (isNaN(Number(params.value))) return;
	this.Data = [Number(params.value)];
	this.refresh(params);
};
idealdataPriceGrahpCellRenderer.prototype.getGui = function(){
	return this.eGui;
};
idealdataPriceGrahpCellRenderer.prototype.refresh = function(params){
	var newdata = Number(params.value);
	var Ctx = this.eGui.getContext("2d");
	Ctx.clearRect(0,0,this.eGui.width,this.eGui.height);
	if (isNaN(newdata)){
		this.Data = [];
		this.eGui.style.display = "none";
	}else{
		this.Data.push(newdata);
		this.eGui.style.display = "";
	}
	while(this.Data.length > 50)this.Data.shift();
	var max = Math.max.apply(Math,this.Data);
	var min = Math.min.apply(Math,this.Data);
	var datas = [...this.Data];
	if(max == min)max = min + 1;
	if(datas.length < 3){
		datas = [0,0,0,0];
		max = 2;
		min = 0;
	}
	Ctx.setLineDash([]);
	Ctx.lineWidth = 2;
	Ctx.strokeStyle = "#5095FF";
	Ctx.beginPath();
	for(var i=0;i<datas.length;i++){
		var xPos = i / (datas.length - 1) * 90 + 5;
		var yPos = (datas[i] - min) / (max - min); // scale
		yPos = (1-yPos) * 18 + 1;
		if(i==0)Ctx.moveTo(xPos,yPos);
		else Ctx.lineTo(xPos,yPos);
	}
	Ctx.stroke();
	return true;
};
idealdataPriceGrahpCellRenderer.prototype.destroy = function(){};

var lotFormatter = function(val){
	
};

var COLORS = [
	"#C16068",
	"#A2BF8A",
	"#EBCC87",
	"#80A0C3",
	"#B58DAE",
	"#85C0D1",
];/*[
	"#5C2983",
	"#0076C5",
	"#21B372",
	"#FDDE02",
	"#F76700",
	"#D30018",
];*//*[
	"#007bff",
	"#28a745",
	"#dc3545",
	"#ffc107",
	"#17a2b8",
	"#343a40",
	];*//*[
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
];*/

var GenerateColor = function(n){
	var arr = [];
	while(n-->0){
		//arr.push("#" + Math.random().toString(16).substr(2,6));
		//arr.push(COLORS[n%COLORS.length]);
		arr.push(getColor());
	}
	return arr;
};

function getColor(){
	var h = 360 * Math.random();
	var s = 70;
	var l = 80;
	return hslToHex(h, s, l);
}

function hslToHex(h, s, l) {
	h /= 360;
	s /= 100;
	l /= 100;
	let r, g, b;
	if (s === 0)r = g = b = l;
	else {
		const hue2rgb = (p, q, t) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}
	const toHex = x => {
		const hex = Math.round(x * 255).toString(16);
		return hex.length === 1 ? '0' + hex : hex;
	};
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

var idealdataSymbolCellRenderer = function(){
	this.eGui = document.createElement("DIV");
	//this.eGui.style.border = "1px solid red";
	this.eGui.style.position = "absolute";
	this.eGui.style.top = "0";
	this.eGui.style.width = "100%";
	this.eGui.style.height = "100%";
	this.eGui.innerHTML = "&nbsp;";
	//this.eGui.style.fontFamily = "Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif";
	this.eGui.style.fontFamily = "font-family:Trebuchet MS, roboto, ubuntu,sans-serif";
	this.Symbol = "";
	this.ID = "";
	this.Table = "";
};
idealdataSymbolCellRenderer.prototype.UpdateSymbol = function(name){
	this.Symbol = name;
	this.eGui.innerText = this.Symbol;
};
idealdataSymbolCellRenderer.prototype.init = function(params){
	this.ID =  params.data.ID;
	this.TableApi = params.api;
	this.UpdateSymbol(params.data.Symbol);
};
idealdataSymbolCellRenderer.prototype.getGui = function(){
	return this.eGui;
};
idealdataSymbolCellRenderer.prototype.refresh = function(params){
	this.ID =  params.data.ID;
	this.TableApi = params.api;
	this.UpdateSymbol(params.data.Symbol);
	return true;
};
idealdataSymbolCellRenderer.prototype.destroy = function(){};

var idealdataSymbolCellEditor = function(){
	this.Div = document.createElement("DIV");
	this.Div.style.backgroundColor = "#FFFFFF00";
	this.Div.style.padding = "0.3em";
	this.Div.style.display = "inline-block";
	//this.Div.style.position = "absolute";
};
idealdataSymbolCellEditor.prototype.init = function(params){
	this.WINDOW = params.api.WINDOW;
	this.ListID = params.data.ID;
	this.Value = params.value;
};
idealdataSymbolCellEditor.prototype.getGui = function(){
	return this.Div;
};
idealdataSymbolCellEditor.prototype.getValue = function(){
	return this.Value;
};
idealdataSymbolCellEditor.prototype.isCancelBeforeStart = function(){
	return false;
};
idealdataSymbolCellEditor.prototype.isCancelAfterEnd = function(){
	return false;
};
idealdataSymbolCellEditor.prototype.ChangeSymbol = function(){
	var symbol = "";
	if (this.Input.value == "") symbol = "";
	else if (this.Select.selectedIndex >= 0) symbol = this.Select.options[this.Select.selectedIndex].text;
	else if (this.Input.value.length > 0) symbol = this.Input.value;
	//if (!IdealInterFace.InstrumentsList[symbol])this.Value = "";
	this.WINDOW.SetSymbol(this.ListID, symbol);
};
idealdataSymbolCellEditor.prototype.afterGuiAttached = function(){
	this.Input = document.createElement("INPUT");
	this.Select = document.createElement("SELECT");
	this.Div.append(this.Input);
	this.Div.append(this.Select);
	this.Input.value = this.Value;
	this.Input.autocomplete = "off";
	this.Input.placeholder = "Symbol";
	this.Input.style.border = "none";
	this.Input.style.backgroundColor = "#FFFFFF00";
	this.Input.style.width = "100%";
	var THAT = this;
	this.Input.addEventListener("keydown", function(event){
		if(window.event.keyCode==13)THAT.ChangeSymbol();
		else if(window.event.keyCode==40)THAT.Select.selectedIndex++;
		else if(window.event.keyCode==38)THAT.Select.selectedIndex--;
	});
	this.Input.addEventListener("input", function(event){
		idealdataSymbolCellEditor.SearchSymbol(THAT);
	});
	this.Select.size = "5";
	this.Select.style.border = "none";
	this.Select.style.backgroundColor = "#FFFFFF00";
	this.Select.style.width = "100%";
	this.Select.addEventListener("click", function(event){
		THAT.ChangeSymbol();
		event.stopPropagation();
		return false;
	});
	idealdataSymbolCellEditor.SearchSymbol(this);
	this.Input.focus();
};
idealdataSymbolCellEditor.SearchSymbol = function(THAT){
	var symkey = THAT.Input.value.toUpperCase();
	THAT.Input.value = symkey;
	THAT.Select.innerHTML = "";
	if(symkey.length < 2) return;
	var instrumentsList = Object.keys(IdealInterFace.InstrumentsList);
	instrumentsList.filter(function(item){
		return item.indexOf(symkey) > -1;
	}).sort(function(item1,item2){
		var splitted1 = item1.split(symkey);
		var splitted2 = item2.split(symkey);
		if(item1==symkey)return -1; // same
		if(item2==symkey)return 1;
		
		if(splitted1[0]=="" && splitted2[0]==""){ // start with text
			return splitted1[1].length > splitted2[1].length ? 1 : -1;
		} else if(splitted1[0]==""){
			return -1;
		} else if(splitted2[0]==""){
			return 1;
		}
		if(item1.length != item2.length){
			return item1.length > item2.length ? 1 : -1;
		}
		return 0;
	}).map(function(item){
		var option = document.createElement("OPTION");
		option.innerText = item;
		option.value = item;
		option.onclick = function(){
			THAT.ChangeSymbol();
			event.stopPropagation();
			return false;
		};
		THAT.Select.add(option);
	});
	THAT.Select.selectedIndex = 0;
};
idealdataSymbolCellEditor.prototype.destroy = function(){};
idealdataSymbolCellEditor.prototype.isPopup = function(){return true};
idealdataSymbolCellEditor.prototype.OnEnd = function(event){
	
	event.stopPropagation();
};

var DepthWindow = function(symbol){
	var id = "win0";
	if(DepthWindow.Multi)id = "win_" + symbol;
	this.ID = id;//generate_ID();
	
	this.WIN = new IdealWindow("Derinlik" /*+ " - " + symbol*/);
	DepthWindow.Config.GenerateHTML(this.WIN.GetContent()[0]);
	this.WIN.SetTitle("Derinlik - " + symbol);
	DepthWindow.Windows[this.ID] = this;
	this.Symbol = symbol;
	var THAT = this;
	this.WIN.OnClose = function(){
		THAT.Close();
	};
	setTimeout(function(){
		THAT.Initialize();
	},1);
};
DepthWindow.Config = {
	LastActivite:0,
	LoopTime:1000*60*5,
	MaxStep:10,
	DepthGrid:{ // depth table
		isExternalFilterPresent:function(){
			return true; 
		},
		doesExternalFilterPass:function(rowNode){
			return rowNode.data.ID < DepthWindow.Config.MaxStep; // new Date()
		},
		enableCellChangeFlash: true,
		animateRows: true,
		popupParent: document.body,
		columnDefs:[
			{field:"ID", headerName:"Kademe",hide:true},
			{field:"Active",hide:true},
			{
				headerName:"Satanlar",
				headerClass:"seller_side",
				children:[
					//{field:"ASide"},
					{field:"AStep", headerName:"Fiyat", width:100,lockPosition:true,type:"PriceTypeFormat",},
					{field:"ALot", headerName:"Lot", width:100,lockPosition:true,},
				]
			},
			{
				headerName:"Alanlar",
				headerClass:"buyer_side",
				children:[
					{field:"BLot", headerName:"Lot", width:100,lockPosition:true,},
					{field:"BStep",  headerName:"Fiyat", width:100,lockPosition:true,type:"PriceTypeFormat",},
					//{field:"BSide"},
				]
			}
		],
		defaultColDef:{
			minWidth: 50,
			editable:false,
			sortable:false,
			lockPinned:true,
			//flex:1,
			filter:false,
			resizable:false,
		},
		columnTypes:{
			PriceTypeFormat:{
				valueFormatter:function(params){
					var s = "" +  Number(Number(params.value).toPrecision(7)).toFixed(2) + "";
					if(Number(s))return s.replace(".",",");
					return "";
				},
			},
		},
		//animateRows:true,
		//suppressAggFuncInHeader:true,
		getRowNodeId:function(data){return data.ID;},
		/*onGridReady:function(params){
			params.api.sizeColumnsToFit();
		},*/
	},
	TradeGrid:{ // trade table
		enableCellChangeFlash: true,
		animateRows: true,
		columnDefs:[
			{
				field:"Time",
				headerName:"Saat",
				comparator:function(valueA, valueB, nodeA, nodeB, isInverted){
					return ((new Date(valueA)).getTime() > (new Date(valueB)).getTime()) ? 1 : -1;
				},
				valueFormatter:function(params){
					return (new Date(params.value)).toTimeString().substr(0,8);
				},
				cellStyle:function(params){
					var side = params.data.Side;
					return {
						backgroundColor: side == "B" ? "#198754" : "#DC3545",
					};
				},
				sort:"desc"
			},
			{field:"Price", headerName:"Fiyat"},
			{field:"Lot", headerName:"Lot"},
			{field:"Seller", headerName:"Satan", headerClass:"seller_side"},
			{field:"Buyer", headerName:"Alan", headerClass:"buyer_side"},
			{field:"Side", hide:true},
		],
		defaultColDef:{
			minWidth: 50,
			editable:false,
			sortable:false,
			//flex:1,
			filter:false,
			resizable:true,
		},
		//animateRows:true,
		//suppressAggFuncInHeader:true,
		getRowNodeId:function(data){return data.Time;},
		/*onGridReady:function(params){
			params.api.sizeColumnsToFit();
		},*/
	},
	GenerateHTML:function(content){
		var divcontent = document.createElement("div");content.append(divcontent);
		var divhead = document.createElement("div");content.append(divhead);
		
		var headHeight = "3em";
		
		divhead.style.width = "100%";
		divhead.style.height = "" + headHeight + "";
		divhead.style.left = "0px";
		divhead.style.top = "0px";
		divhead.style.position = "absolute";
		divhead.className = "header";
		var __buildMenuBar = function(){
			var div0 = document.createElement("div");divhead.append(div0);
			div0.className = "btn-group d-flex";
			div0.style.margin = "5px";
			var span0 = document.createElement("span");div0.append(span0);
			span0.className = "btn";
			span0.innerHTML = "&nbsp;";
			var div1 = document.createElement("div");div0.append(div1);
			div1.className = "btn-group";
			div1.setAttribute("role","group");
			var button0 = document.createElement("button");div1.append(button0);
			button0.className = "btn btn-outline-secondary dropdown-toggle";
			button0.id = "btnGroupDrop1";
			button0.style.border = "none";
			button0.setAttribute("data-bs-toggle","dropdown");
			button0.setAttribute("aria-expanded","false");
			button0.innerHTML = DepthWindow.Config.MaxStep + "";
			var ul0 = document.createElement("ul");div1.append(ul0);
			ul0.className = "dropdown-menu";
			ul0.setAttribute("aria-labelledby","btnGroupDrop1");
			var list = ["1","5","10","25"];
			list.map(function(item){
				var li0 = document.createElement("li");ul0.append(li0);
				var button1 = document.createElement("button");li0.append(button1);
				button1.className = "dropdown-item";
				button1.href = "#";
				button1.innerText = item;
				button1.periot = item;
				button1.onclick = function(){
					button0.innerHTML = this.periot;
					DepthWindow.Config.MaxStep = Number(this.periot);
				};
			});
			
		};
		__buildMenuBar();
		
		divcontent.style.width = "100%";
		divcontent.style.height = "calc(100% - " + headHeight + ")";
		divcontent.style.left = "0px";
		divcontent.style.top = "" + headHeight + "";
		divcontent.style.position = "absolute";
		
		divcontent.className = "rootsystem";
	},
};
DepthWindow.Windows = {};
DepthWindow.prototype.Serialize = function(){
	var elePos = this.WIN.GetPosition();
	var eleSize = this.WIN.GetSize();
	var xcode = "(function(){";
	xcode += "var _=IdealInterFace.DepthAnalysis(\"" + this.Symbol + "\");";
	xcode += "setTimeout(function(){"
	xcode += 	"_.WIN.SetPosition(" + elePos.x + "," + elePos.y + ");";
	xcode += 	"_.WIN.SetSize(" + eleSize.w + "," + eleSize.h + ");";
	xcode += "},1);";
	xcode += "})();";
	return xcode;
};
DepthWindow.Serialize = function(){
	var xcode = "(function(){";
	xcode += "DepthWindow.Config.MaxStep=" + DepthWindow.Config.MaxStep + ";";
	for(var key in DepthWindow.Windows){
		xcode += DepthWindow.Windows[key].Serialize();
	}
	xcode += "})();";
	return xcode;
};
DepthWindow.Update = function(){
	
};
DepthWindow.Deserialize = function(xcode){
	if(typeof(xcode)=="string")setTimeout(function(){eval(xcode)},1);
	else if(typeof(xcode)=="function")setTimeout(xcode,1);
};
DepthWindow.prototype.Initialize = function(){
	/*this.TableDerinlik.gridOptions.api.setRowData(Array.from({length:25},function(item,index){
		return {
			ID:index,
			Active:"",
		}
	}));*/
	this.WIN.Open();
	this.WIN.SetSize(370,830);
	var div = this.WIN.GetContent().children(".rootsystem")[0];
	this.panelayout = new GoldenLayout({
		resizeWithContainerAutomatically :true,
		settings:{
			hasHeaders: false,
			constrainDragToContainer: false,
			reorderEnabled: false,
			selectionEnabled: false,
			popoutWholeStack: false,
			blockedPopoutsThrowError: false,
			closePopoutsOnUnload: false,
			showPopoutIcon: false,
			showMaximiseIcon: false,
			showCloseIcon: false,
			selectionEnabled: true,
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
				type:"column",
				content:[{
					type:"component",
					isClosable:false,
					id:"column0",
					//cssClass:"",
					componentName:"RComponent",
				},{
					type:"component",
					isClosable:false,
					id:"column1",
					//cssClass:"",
					componentName:"RComponent",
				}],
			}],
		}]
	},div);
	this.panelayout.registerComponent("RComponent",function(container,state){
		//container.getElement().append($(document.getElementById(state.text)));
	});
	this.panelayout.init();
	var div_depth = $(this.panelayout.root.contentItems[0].contentItems[0].contentItems[0].element[0]).find(".lm_content")[0];
	var div_trades = $(this.panelayout.root.contentItems[0].contentItems[0].contentItems[1].element[0]).find(".lm_content")[0];
	
	div_depth.className = "ag-theme-balham-dark";
	div_trades.className = "ag-theme-balham-dark";
	
	var THAT = this;
	this.panelayout.on("stateChanged",function(){
		THAT.panelayout.updateSize("100%","100%");
	});
	
	this.TableDepth = new agGrid.Grid(div_depth,Object.assign({ // depth table
		//
	},DepthWindow.Config.DepthGrid));
	
	this.TableTrade = new agGrid.Grid(div_depth,Object.assign({ // trade table
		//
	},DepthWindow.Config.TradeGrid));
	
	this.TableDepth.gridOptions.api.setRowData(Array.from({length:25},function(item,index){
		return {
			ID:index,
			Active:"",
		}
	}));
	
	this.TableDepth.gridOptions.api.sizeColumnsToFit();
};
DepthWindow.prototype.Close = function(){
	//DepthWindow.Windows[this.ID].WIN.Close();
	delete DepthWindow.Windows[this.ID];
};
DepthWindow.Reset = function(){
	for(var key in DepthWindow.Windows){
		DepthWindow.Windows[key].Close();
	}
};
DepthWindow.Multi = false;
ATA.Loops.push(function(){
	for(var key in DepthWindow.Windows){
		var arr = [];
		DepthWindow.Windows[key].TableDepth.gridOptions.api.forEachNode(function(item){
			arr.push(item.data);
		});
		DepthWindow.Windows[key].TableDepth.gridOptions.api.applyTransactionAsync({update:arr});
		DepthWindow.Windows[key].TableDepth.gridOptions.api.refreshCells();
		DepthWindow.Windows[key].TableDepth.gridOptions.api.refreshHeader();
	}
	
	if(!DepthWindow.Multi)return;
	var SEP1 = IdealInterFace.Settings.SEP1;
	var SEP2 = IdealInterFace.Settings.SEP2;
	var UserName = IdealInterFace.UserParameters.UserName;
	var SessionId = IdealInterFace.UserParameters.SessionId;
	
	follows = follows.map(function(item){
		var instrument0 = IdealInterFace.InstrumentsList[""+item];
		var prefix = instrument0.SUB_Prefix;
		var composite = prefix + "'" + item;
		return composite;
	});

	IdealInterFace.WS.Send("X" + SEP1 + "REQ_DERINLIK" + SEP1 + UserName + SEP1 + SessionId + SEP1 + follows.join("|") + SEP1 + "0" + SEP1 + "0" + SEP1 + "0" + SEP1 + follows.join("|"));
});

var SwapWindow = function(symbol){
	this.ID = "win_" + symbol;//generate_ID();
	
	this.WIN = new IdealWindow("Takas Oranları" /*+ " - " + symbol*/);
	this.Symbol = symbol;
	SwapWindow.Config.GenerateHTML(this.WIN.GetContent()[0]);
	this.WIN.SetTitle("Takas Oranları - " + symbol);
	SwapWindow.Windows[this.ID] = this;
	var THAT = this;
	this.WIN.OnClose = function(){
		THAT.Close();
	};
	
	THAT.Initialize();
	setTimeout(function(){
		//THAT.Initialize();
	},1);
};
SwapWindow.Config = {
	LastActivite:0,
	LoopTime:1000*60*5,
	GenerateHTML:function(content){
		var divcontent = document.createElement("div");content.append(divcontent);
		var divhead = document.createElement("div");content.append(divhead);
		
		var headHeight = "3em";
		
		divhead.style.width = "100%";
		divhead.style.height = "" + headHeight + "";
		divhead.style.left = "0px";
		divhead.style.top = "0px";
		divhead.style.position = "absolute";
		divhead.className = "header";
		divhead.innerHTML = "";
		
		var __buildMenuBar = function(){
			var div0 = document.createElement("div");divhead.append(div0);
			div0.className = "btn-group d-flex";
			div0.style.margin = "5px";
			var span0 = document.createElement("span");div0.append(span0);
			span0.className = "btn";
			span0.innerHTML = "&nbsp;";
			var div1 = document.createElement("div");div0.append(div1);
			div1.className = "btn-group";
			div1.setAttribute("role","group");
			var button0 = document.createElement("button");div1.append(button0);
			button0.className = "btn btn-outline-secondary dropdown-toggle";
			button0.id = "btnGroupDrop1";
			button0.style.border = "none";
			button0.setAttribute("data-bs-toggle","dropdown");
			button0.setAttribute("aria-expanded","false");
			button0.innerHTML = "SON";
			var ul0 = document.createElement("ul");div1.append(ul0);
			ul0.className = "dropdown-menu";
			ul0.setAttribute("aria-labelledby","btnGroupDrop1");
			var list = ["SON","1","2","3","4","5","10"];
			list.map(function(item){
				var li0 = document.createElement("li");ul0.append(li0);
				var button1 = document.createElement("button");li0.append(button1);
				button1.className = "dropdown-item";
				button1.href = "#";
				button1.innerText = item;
				button1.parametre = item;
				button1.onclick = function(){
					var parametre = this.parametre;
					var symbol = divcontent.SYMBOL;
					button0.innerHTML = parametre;
					IdealInterFace.SwapRates(symbol, parametre);
				};
			});
			
		};
		__buildMenuBar();
		
		divcontent.style.width = "100%";
		divcontent.style.height = "calc(100% - " + headHeight + ")";
		divcontent.style.left = "0px";
		divcontent.style.top = "" + headHeight + "";
		divcontent.style.position = "absolute";
		
		divcontent.className = "rootsystem";
	},
	SwapGrid:{
		animateRows: true,
		popupParent: document.body,
		columnDefs:[
			{
				field:"ID",
				sort:"asc"
			},
			{field:"Holder", headerName:"Kurum"},
			{field:"Lot", headerName:"Lot"},
			{
				field:"Percent",
				headerName:"%",
				valueFormatter:function(params){
					return "% " + Number(params.value).toFixed(2);
				}
			},
		],
		defaultColDef:{
			minWidth: 50,
			editable:false,
			sortable:false,
			//flex:1,
			filter:false,
			resizable:true,
		},
		//animateRows:true,
		//suppressAggFuncInHeader:true,
		getRowNodeId:function(data){return data.ID;},
		/*onGridReady:function(params){
			params.api.sizeColumnsToFit();
		},*/
	}
};
SwapWindow.Windows = {};
SwapWindow.prototype.Serialize = function(){
	var elePos = this.WIN.GetPosition();
	var eleSize = this.WIN.GetSize();
	var xcode = "(function(){";
	xcode += "var _=IdealInterFace.SwapRates(\"" + this.Symbol + "\");";
	xcode += "setTimeout(function(){"
	xcode += 	"_.WIN.SetPosition(" + elePos.x + "," + elePos.y + ");";
	xcode += 	"_.WIN.SetSize(" + eleSize.w + "," + eleSize.h + ");";
	xcode += "},1);";
	xcode += "})();";
	return xcode;
};
SwapWindow.Serialize = function(){
	var xcode = "(function(){";
	for(var key in SwapWindow.Windows){
		xcode += SwapWindow.Windows[key].Serialize();
	}
	xcode += "})();";
	return xcode;
};
SwapWindow.Deserialize = function(xcode){
	if(typeof(xcode)=="string")setTimeout(function(){eval(xcode)},1);
	else if(typeof(xcode)=="function")setTimeout(xcode,1);
};
SwapWindow.prototype.Initialize = function(){
	/*this.TableDerinlik.gridOptions.api.setRowData(Array.from({length:25},function(item,index){
		return {
			ID:index,
			Active:"",
		}
	}));*/
	this.WIN.Open();
	this.WIN.SetSize(440,470);
	var div = this.WIN.GetContent().children(".rootsystem")[0];
	div.SYMBOL = this.Symbol;
	this.panelayout = new GoldenLayout({
		resizeWithContainerAutomatically :true,
		settings:{
			hasHeaders: false,
			constrainDragToContainer: false,
			reorderEnabled: false,
			selectionEnabled: false,
			popoutWholeStack: false,
			blockedPopoutsThrowError: false,
			closePopoutsOnUnload: false,
			showPopoutIcon: false,
			showMaximiseIcon: false,
			showCloseIcon: false,
			selectionEnabled: true,
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
				type:"column",
				content:[{
					type:"component",
					isClosable:false,
					id:"column0",
					//cssClass:"",
					componentName:"RComponent",
				}],
			}],
		}]
	},div);
	this.panelayout.registerComponent("RComponent",function(container,state){
		//container.getElement().append($(document.getElementById(state.text)));
	});
	this.panelayout.init();
	var div_swaplist = $(this.panelayout.root.contentItems[0].contentItems[0].contentItems[0].element[0]).find(".lm_content")[0];
	
	div_swaplist.className = "ag-theme-balham-dark";
	
	var THAT = this;
	this.panelayout.on("stateChanged",function(){
		THAT.panelayout.updateSize("100%","100%");
	});
	
	this.SwapTable = new agGrid.Grid(div_swaplist,Object.assign({
		//
	},SwapWindow.Config.SwapGrid));
	this.SwapTable.gridOptions.api.setRowData([]);
	this.SwapTable.gridOptions.api.sizeColumnsToFit();
};
SwapWindow.prototype.Close = function(){
	//SwapWindow.Windows[this.ID].WIN.Close();
	delete SwapWindow.Windows[this.ID];
};
SwapWindow.Reset = function(){
	for(var key in SwapWindow.Windows){
		SwapWindow.Windows[key].Close();
	}
};
ATA.Loops.push(function(){
	var thisTime = (new Date()).getTime();
	var PivotTime = thisTime % SwapWindow.Config.LoopTime;
	var lastPivotTime = SwapWindow.Config.LastActivite % SwapWindow.Config.LoopTime;
	if(PivotTime < lastPivotTime){
		for(var key in SwapWindow.Windows){
			IdealInterFace.SwapRates(SwapWindow.Windows[key].Symbol);
		}
	}
	SwapWindow.Config.LastActivite = thisTime;
});

var ProfitageWindow = function(symbol){
	
	this.ID = "win_" + symbol;//generate_ID();
	
	this.WIN = new IdealWindow("Getiri" /*+ " - " + symbol*/);
	this.Symbol = symbol;
	ProfitageWindow.Config.GenerateHTML(this.WIN.GetContent()[0]);
	this.WIN.SetTitle("Getiri - " + symbol);
	ProfitageWindow.Windows[this.ID] = this;
	var THAT = this;
	this.WIN.OnClose = function(){
		THAT.Close();
	};
	
	THAT.Initialize();
	setTimeout(function(){
		//THAT.Initialize();
	},1);
};
ProfitageWindow.Config = {
	LastActivite:0,
	LoopTime:1000*60*5,
	GenerateHTML:function(content){
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
	},
	ProfitageGrid:{
		animateRows: true,
		columnDefs:[
			{
				field:"ID",
				sort:"asc",
				hide:true,
			},
			{field:"Title", headerName:"Periot"},
			{
				field:"Percent",
				headerName:"%",
				valueFormatter:function(params){
					return "% " + params.value.toFixed(2);
				},
				cellStyle:function(params){
					return {
						backgroundColor:params.value >= 0 ? "#198754" : "#DC3545",
					};
				},
			},
			{field:"Avarage", headerName:"Ortalama"},
			{field:"High", headerName:"Yüksek", headerClass:"seller_side",type:"PriceTypeFormat"},
			{field:"Low", headerName:"Düşük", headerClass:"buyer_side",type:"PriceTypeFormat"},
		],
		columnTypes:{
			PriceTypeFormat:{
				valueFormatter:function(params){
					var s = "" +  Number(Number(params.value).toPrecision(7)).toFixed(2) + "";
					if(Number(s))return s.replace(".",",");
					return "";
				},
			},
		},
		defaultColDef:{
			minWidth: 50,
			editable:false,
			sortable:false,
			//flex:1,
			filter:false,
			resizable:true,
		},
		//animateRows:true,
		//suppressAggFuncInHeader:true,
		getRowNodeId:function(data){return data.ID;},
		/*onGridReady:function(params){
			params.api.sizeColumnsToFit();
		},*/
	}
};
ProfitageWindow.Windows = {};
ProfitageWindow.prototype.Serialize = function(){
	var elePos = this.WIN.GetPosition();
	var eleSize = this.WIN.GetSize();
	var xcode = "(function(){";
	xcode += "var _=IdealInterFace.Profitage(\"" + this.Symbol + "\");";
	xcode += "setTimeout(function(){"
	xcode += 	"_.WIN.SetPosition(" + elePos.x + "," + elePos.y + ");";
	xcode += 	"_.WIN.SetSize(" + eleSize.w + "," + eleSize.h + ");";
	xcode += "},1);";
	xcode += "})();";
	return xcode;
};
ProfitageWindow.Serialize = function(){
	var xcode = "(function(){";
	//xcode += "ProfitageWindow.Config.=" + ProfitageWindow.Config. + ";";
	for(var key in ProfitageWindow.Windows){
		xcode += ProfitageWindow.Windows[key].Serialize();
	}
	xcode += "})();";
	return xcode;
};
ProfitageWindow.Deserialize = function(xcode){
	if(typeof(xcode)=="string")setTimeout(function(){eval(xcode)},1);
	else if(typeof(xcode)=="function")setTimeout(xcode,1);
};
ProfitageWindow.prototype.Initialize = function(){
	/*this.TableDerinlik.gridOptions.api.setRowData(Array.from({length:25},function(item,index){
		return {
			ID:index,
			Active:"",
		}
	}));*/
	this.WIN.Open();
	this.WIN.SetSize(410,310);
	var div = this.WIN.GetContent().children(".rootsystem")[0];
	this.panelayout = new GoldenLayout({
		resizeWithContainerAutomatically:true,
		settings:{
			hasHeaders:false,
			constrainDragToContainer:false,
			reorderEnabled:false,
			selectionEnabled:false,
			popoutWholeStack:false,
			blockedPopoutsThrowError:false,
			closePopoutsOnUnload:false,
			showPopoutIcon:false,
			showMaximiseIcon:false,
			showCloseIcon:false,
			selectionEnabled:true,
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
				type:"column",
				content:[{
					type:"component",
					isClosable:false,
					id:"column0",
					//cssClass:"",
					componentName:"RComponent",
				}],
			}],
		}]
	},div);
	this.panelayout.registerComponent("RComponent",function(container,state){
		//container.getElement().append($(document.getElementById(state.text)));
	});
	this.panelayout.init();
	var div_profitagelist = $(this.panelayout.root.contentItems[0].contentItems[0].contentItems[0].element[0]).find(".lm_content")[0];
	
	div_profitagelist.className = "ag-theme-balham-dark";
	
	var THAT = this;
	this.panelayout.on("stateChanged",function(){
		THAT.panelayout.updateSize("100%","100%");
	});
	
	this.ProfitageTable = new agGrid.Grid(div_profitagelist,Object.assign({
		//
	},ProfitageWindow.Config.ProfitageGrid));
	this.ProfitageTable.gridOptions.api.setRowData([]);
	this.ProfitageTable.gridOptions.api.sizeColumnsToFit();
};
ProfitageWindow.prototype.Close = function(){
	//ProfitageWindow.Windows[this.ID].WIN.Close();
	delete ProfitageWindow.Windows[this.ID];
};
ProfitageWindow.Reset = function(){
	for(var key in ProfitageWindow.Windows){
		ProfitageWindow.Windows[key].Close();
	}
};
ATA.Loops.push(function(){
	var thisTime = (new Date()).getTime();
	var PivotTime = thisTime % ProfitageWindow.Config.LoopTime;
	var lastPivotTime = ProfitageWindow.Config.LastActivite % ProfitageWindow.Config.LoopTime;
	if(PivotTime < lastPivotTime){
		for(var key in ProfitageWindow.Windows){
			IdealInterFace.Profitage(ProfitageWindow.Windows[key].Symbol);
		}
	}
	ProfitageWindow.Config.LastActivite = thisTime;
});

var SwapChartWindow = function(symbol){
	this.ID = "win_" + symbol;//generate_ID();
	this.Symbol = symbol;
	this.WIN = new IdealWindow("Takas Oranları" /*+ " - " + symbol*/);
	SwapChartWindow.Config.GenerateHTML(this.WIN.GetContent()[0]);
	this.WIN.SetTitle("Takas Oranları - " + symbol);
	SwapChartWindow.Windows[this.ID] = this;
	var THAT = this;
	this.WIN.OnClose = function(){
		THAT.Close();
	};
	
	THAT.Initialize();
	setTimeout(function(){
		//THAT.Initialize();
	},1);
};
SwapChartWindow.Config = {
	LastActivite:0,
	LoopTime:1000*60*5,
	GenerateHTML:function(content){
		var divcontent = document.createElement("div");content.append(divcontent);
		var divhead = document.createElement("div");content.append(divhead);
		
		var headHeight = "3em";
		
		divhead.style.width = "100%";
		divhead.style.height = "" + headHeight + "";
		divhead.style.left = "0px";
		divhead.style.top = "0px";
		divhead.style.position = "absolute";
		divhead.className = "header";
		divhead.innerHTML = "";
		
		var __buildMenuBar = function(){
			var div0 = document.createElement("div");divhead.append(div0);
			div0.className = "btn-group d-flex";
			div0.style.margin = "5px";
			var span0 = document.createElement("span");div0.append(span0);
			span0.className = "btn";
			span0.innerHTML = "&nbsp;";
			var div1 = document.createElement("div");div0.append(div1);
			div1.className = "btn-group";
			div1.setAttribute("role","group");
			
			var button0 = document.createElement("button");div1.append(button0);
			button0.className = "btn btn-outline-secondary dropdown-toggle";
			button0.id = "btnGroupDrop1";
			button0.style.border = "none";
			button0.setAttribute("data-bs-toggle","dropdown");
			button0.setAttribute("aria-expanded","false");
			button0.innerHTML = "ALANLAR";
			var ul0 = document.createElement("ul");div1.append(ul0);
			ul0.className = "dropdown-menu";
			ul0.setAttribute("aria-labelledby","btnGroupDrop1");
			var list1 = ["ALANLAR", "SATANLAR"]; // yönler
			var _yon = "ALANLAR";
			list1.map(function(item){
				var li0 = document.createElement("li");ul0.append(li0);
				var button2 = document.createElement("button");li0.append(button2);
				button2.className = "dropdown-item";
				button2.href = "#";
				button2.innerText = item;
				button2.parametre = item;
				button2.onclick = function(){
					var parametre = this.parametre;
					var symbol = divcontent.SYMBOL;
					button0.innerHTML = parametre;
					_yon = parametre;
					IdealInterFace.SwapAnalysis(symbol, parametre, _periot);
				};
			});
			
			var button1 = document.createElement("button");div1.append(button1);
			button1.className = "btn btn-outline-secondary dropdown-toggle";
			button1.id = "btnGroupDrop1";
			button1.style.border = "none";
			button1.setAttribute("data-bs-toggle","dropdown");
			button1.setAttribute("aria-expanded","false");
			button1.innerHTML = "GUN";
			var ul1 = document.createElement("ul");div1.append(ul1);
			ul1.className = "dropdown-menu";
			ul1.setAttribute("aria-labelledby","btnGroupDrop1");
			var list2 = ["GUN","HAFTA","AY","YIL"]; // periot
			var _periot = "GUN";
			list2.map(function(item){
				var li0 = document.createElement("li");ul1.append(li0);
				var button2 = document.createElement("button");li0.append(button2);
				button2.className = "dropdown-item";
				button2.href = "#";
				button2.innerText = item;
				button2.parametre = item;
				button2.onclick = function(){
					var parametre = this.parametre;
					var symbol = divcontent.SYMBOL;
					button1.innerHTML = parametre;
					_periot = parametre;
					IdealInterFace.SwapAnalysis(symbol, _yon, parametre);
				};
			});
		};
		__buildMenuBar();
		
		divcontent.style.width = "100%";
		divcontent.style.height = "calc(100% - " + headHeight + ")";
		divcontent.style.left = "0px";
		divcontent.style.top = "" + headHeight + "";
		divcontent.style.position = "absolute";
		
		divcontent.className = "rootsystem";
	},
	SwapChart:{
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
							return "<div class=\"tooltipforpiechart\" style=\"background-color:" + params.color + ";\">" + params.datum.Title + " (" + params.datum.Value + ")</div>";
						}
					},
				},
			},
		},
		getChartToolbarItems:function(){
			return [];
		},
	},
	SwapTable:{
		animateRows:true,
		columnDefs:[
			{
				field:"ID",
				sort:"asc",
				hide:true,
			},
			{field:"Title", headerName:"Kurum", chartDataType:"category"},
			{field:"Value", headerName:"Adet", chartDataType:"series"},
			{
				field:"Percent",
				headerName:"%",
				valueFormatter:function(params){
					return "% " + params.value.toFixed(2);
				}
			},
		],
		defaultColDef:{
			minWidth: 50,
			editable:false,
			sortable:false,
			//flex:1,
			filter:false,
			resizable:true,
		},
		//animateRows:true,
		//suppressAggFuncInHeader:true,
		getRowNodeId:function(data){return data.ID;},
		/*onGridReady:function(params){
			params.api.sizeColumnsToFit();
		},*/
	}
};
SwapChartWindow.Windows = {};
SwapChartWindow.prototype.Serialize = function(){
	var elePos = this.WIN.GetPosition();
	var eleSize = this.WIN.GetSize();
	var xcode = "(function(){";
	xcode += "var _=IdealInterFace.SwapAnalysis(\"" + this.Symbol + "\");";
	xcode += "setTimeout(function(){"
	xcode += 	"_.WIN.SetPosition(" + elePos.x + "," + elePos.y + ");";
	xcode += 	"_.WIN.SetSize(" + eleSize.w + "," + eleSize.h + ");";
	xcode += "},1);";
	xcode += "})();";
	return xcode;
};
SwapChartWindow.Serialize = function(){
	var xcode = "(function(){";
	//xcode += "SwapChartWindow.Config.=" + SwapChartWindow.Config. + ";";
	for(var key in SwapChartWindow.Windows){
		xcode += SwapChartWindow.Windows[key].Serialize();
	}
	xcode += "})();";
	return xcode;
};
SwapChartWindow.Deserialize = function(xcode){
	if(typeof(xcode)=="string")setTimeout(function(){eval(xcode)},1);
	else if(typeof(xcode)=="function")setTimeout(xcode,1);
};
SwapChartWindow.prototype.Initialize = function(){
	/*this.TableDerinlik.gridOptions.api.setRowData(Array.from({length:25},function(item,index){
		return {
			ID:index,
			Active:"",
		}
	}));*/
	this.WIN.Open();
	this.WIN.SetSize(460,800);
	var div = this.WIN.GetContent().children(".rootsystem")[0];
	div.SYMBOL = this.Symbol;
	this.panelayout = new GoldenLayout({
		resizeWithContainerAutomatically:true,
		settings:{
			hasHeaders:false,
			constrainDragToContainer:false,
			reorderEnabled:false,
			selectionEnabled:false,
			popoutWholeStack:false,
			blockedPopoutsThrowError:false,
			closePopoutsOnUnload:false,
			showPopoutIcon:false,
			showMaximiseIcon:false,
			showCloseIcon:false,
			selectionEnabled:true,
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
				type:"column",
				content:[{
					type:"component",
					isClosable:false,
					id:"column0",
					//cssClass:"",
					componentName:"RComponent",
					height:70,
				},{
					type:"component",
					isClosable:false,
					id:"column1",
					//cssClass:"",
					componentName:"RComponent",
				}],
			}],
		}]
	},div);
	this.panelayout.registerComponent("RComponent",function(container,state){
		//container.getElement().append($(document.getElementById(state.text)));
	});
	this.panelayout.init();
	var div_swapchart = $(this.panelayout.root.contentItems[0].contentItems[0].contentItems[0].element[0]).find(".lm_content")[0];
	var div_swaptable = $(this.panelayout.root.contentItems[0].contentItems[0].contentItems[1].element[0]).find(".lm_content")[0];
	
	div_swaptable.className = "ag-theme-balham-dark";
	
	var THAT = this;
	this.panelayout.on("stateChanged",function(){
		THAT.panelayout.updateSize("100%","100%");
	});
	
	var config = Object.assign({
		onFirstDataRendered:function(params){
			params.api.createRangeChart({
				cellRange: {
					rowStartIndex: 0,
					rowEndIndex: 79,
					columns: ["Title", "Value"],
				},
				chartType: "pie",
				chartContainer: div_swapchart,
				//aggFunc: "sum",
			});
		},
	},SwapChartWindow.Config.SwapTable);
	config = Object.assign(config,SwapChartWindow.Config.SwapChart);
	
	this.SwapTable = new agGrid.Grid(div_swaptable,config);
	this.SwapTable.gridOptions.api.setRowData([]);
	this.SwapTable.gridOptions.api.sizeColumnsToFit();
};
SwapChartWindow.prototype.Close = function(){
	//SwapChartWindow.Windows[this.ID].WIN.Close();
	delete SwapChartWindow.Windows[this.ID];
};
SwapChartWindow.Reset = function(){
	for(var key in SwapChartWindow.Windows){
		SwapChartWindow.Windows[key].Close();
	}
};
ATA.Loops.push(function(){
	var thisTime = (new Date()).getTime();
	var PivotTime = thisTime % SwapChartWindow.Config.LoopTime;
	var lastPivotTime = SwapChartWindow.Config.LastActivite % SwapChartWindow.Config.LoopTime;
	if(PivotTime < lastPivotTime){
		for(var key in SwapChartWindow.Windows){
			//IdealInterFace.SwapAnalysis(SwapChartWindow.Windows[key].Symbol);
		}
	}
	SwapChartWindow.Config.LastActivite = thisTime;
});

var TVChartWindow = function(symbol){
	this.ID = "win_" + symbol + generate_ID();
	this.Symbol = symbol;
	this.WIN = new IdealWindow("Grafik" /*+ " - " + symbol*/);
	TVChartWindow.Config.GenerateHTML(this.WIN.GetContent()[0]);
	this.WIN.SetTitle("Grafik - " + symbol);
	TVChartWindow.Windows[this.ID] = this;
	this.Symbol = symbol;
	var THAT = this;
	this.WIN.OnClose = function(){
		THAT.Close();
	};
	this.WIN.OnMove = function(){
		var elePos = this.GetPosition();
		TVChartWindow.Config.DefaultPosition = [elePos.x, elePos.y];
	};
	
	THAT.Initialize();
	setTimeout(function(){
		//THAT.Initialize();
	},1);
};
TVChartWindow.Config = {
	DefaultPosition:[0,0],
	LastActivite:0,
	LoopTime:1000*60*5,
	GenerateHTML:function(content){
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
	},
	TVChart:{
		symbol: "XU100", // symbol
		interval: "D",
		height: "100%",
		width: "100%",
		//container_id : "", // container id
		//datafeed: null,
		library_path: "./assets/charting_library/",
		disabled_features: ["use_localstorage_for_settings"],
		enabled_features: ["study_templates"],
		timezone: "Europe/Istanbul",
		charts_storage_url: "https://saveload.idealdata.com.tr:8000",
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
	},
};
TVChartWindow.Windows = {};
TVChartWindow.prototype.Serialize = function(){
	var elePos = this.WIN.GetPosition();
	var eleSize = this.WIN.GetSize();
	var xcode = "(function(){";
	xcode += "var _=new TVChartWindow(\"" + this.Symbol + "\");";
	xcode += "setTimeout(function(){"
	xcode += 	"_.WIN.SetPosition(" + elePos.x + "," + elePos.y + ");";
	xcode += 	"_.WIN.SetSize(" + eleSize.w + "," + eleSize.h + ");";
	xcode += "},1);";
	xcode += "})();";
	return xcode;
};
TVChartWindow.Serialize = function(){
	var xcode = "(function(){";
	//xcode += "TVChartWindow.Config.=" + TVChartWindow.Config. + ";";
	for(var key in TVChartWindow.Windows){
		xcode += TVChartWindow.Windows[key].Serialize();
	}
	xcode += "})();";
	return xcode;
};
TVChartWindow.Deserialize = function(xcode){
	if(typeof(xcode)=="string")setTimeout(function(){eval(xcode)},1);
	else if(typeof(xcode)=="function")setTimeout(xcode,1);
};
TVChartWindow.prototype.Initialize = function(){
	/*this.TableDerinlik.gridOptions.api.setRowData(Array.from({length:25},function(item,index){
		return {
			ID:index,
			Active:"",
		}
	}));*/
	this.WIN.Open();
	this.WIN.SetSize(720,640);
	this.WIN.SetPosition(TVChartWindow.Config.DefaultPosition[0], TVChartWindow.Config.DefaultPosition[1]);
	var div = this.WIN.GetContent().children(".rootsystem")[0];
	this.panelayout = new GoldenLayout({
		resizeWithContainerAutomatically:true,
		settings:{
			hasHeaders:false,
			constrainDragToContainer:false,
			reorderEnabled:false,
			selectionEnabled:false,
			popoutWholeStack:false,
			blockedPopoutsThrowError:false,
			closePopoutsOnUnload:false,
			showPopoutIcon:false,
			showMaximiseIcon:false,
			showCloseIcon:false,
			selectionEnabled:true,
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
				type:"column",
				content:[{
					type:"component",
					isClosable:false,
					id:"column0",
					//cssClass:"",
					componentName:"RComponent",
				}],
			}],
		}]
	},div);
	this.panelayout.registerComponent("RComponent",function(container,state){
		//container.getElement().append($(document.getElementById(state.text)));
	});
	this.panelayout.init();
	
	var TVChartID = this.ID + "TVChart" + generate_ID();
	
	var div_tvchart = $(this.panelayout.root.contentItems[0].contentItems[0].contentItems[0].element[0]).find(".lm_content")[0];
	div_tvchart.id = TVChartID;
	//div_tvchart.className = "";
	
	this.DatafeedUDF = new Datafeeds.UDFCompatibleDatafeed("https://apitv.idealdata.com.tr:5048",5000);
	this.TVChart = new TradingView.widget(Object.assign({
		//symbol			: this.Symbol,
		interval		: "D",
		container_id	: TVChartID,
		datafeed		: this.DatafeedUDF
	}, TVChartWindow.Config.TVChart));
	//this.SetSymbol(this.Symbol);
	var THAT = this;
	this.panelayout.on("stateChanged",function(){
		THAT.panelayout.updateSize("100%","100%");
	});
	setTimeout(function(){
		THAT.SetSymbol(THAT.Symbol);
	},1000);
};
TVChartWindow.prototype.SetSymbol = function(symbol){
	this.Symbol = symbol;
	this.TVChart.chart().setSymbol(this.Symbol);
};
TVChartWindow.prototype.Close = function(){
	//TVChartWindow.Windows[this.ID].WIN.Close();
	delete TVChartWindow.Windows[this.ID];
};
TVChartWindow.Reset = function(){
	for(var key in TVChartWindow.Windows){
		TVChartWindow.Windows[key].Close();
	}
};
ATA.Loops.push(function(){
	var thisTime = (new Date()).getTime();
	var PivotTime = thisTime % TVChartWindow.Config.LoopTime;
	var lastPivotTime = TVChartWindow.Config.LastActivite % TVChartWindow.Config.LoopTime;
	if(PivotTime < lastPivotTime){
		for(var key in TVChartWindow.Windows){
			//IdealInterFace.Chart(TVChartWindow.Windows[key].Symbol);
		}
	}
	TVChartWindow.Config.LastActivite = thisTime;
});

var PriceTableWindow = function(listname){
	this.ID = "win_" + generate_ID();
	
	this.WIN = new IdealWindow("Fiyat Penceresi" /*+ " - " + listname*/);
	PriceTableWindow.Config.GenerateHTML(this.WIN.GetContent()[0]);
	if(typeof(listname)=="string"){
		this.WIN.SetTitle("Fiyat Penceresi - " + listname);
		this.Name = listname;
		if(IdealInterFace.WatchLists[listname])this.List = [...IdealInterFace.WatchLists[listname]];
		else this.List = [...IdealInterFace.WatchLists.DefaultList];
	}else{
		this.WIN.SetTitle("Fiyat Penceresi - Yeni Liste");
		this.Name = "Yeni Liste";
		this.List = (["XU100"]).concat(Array.from({length:50}).fill(""));
	}
	PriceTableWindow.Windows[this.ID] = this;
	this.Length = 510;
	var THAT = this;
	this.WIN.OnClose = function(){
		THAT.Close();
	};
	this.WIN.OnMove = function(){
		var elePos = this.GetPosition();
		PriceTableWindow.Config.DefaultPosition = [elePos.x, elePos.y];
	};
	this.Initialize();
	setTimeout(function(){
		//THAT.Initialize();
	},1);
};
PriceTableWindow.Config = {
	DefaultPosition:[0,0],
	LastActivite:0,
	LoopTime:1000*60*5,
	GenerateHTML:function(content){
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
	},
	PriceTableGrid:{
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
			return rowNode.data.Active == "Y";
		},
		columnDefs:[
			{field:"Active",hide:true,},
			{field:"ID",hide:true,width:30,},
			{field:"Prefix",hide:true,width:100,},
			{
				field:"Symbol",
				minWidth:70,
				type:"SymbolTypeFormat",
				headerName:"Sembol",
				rowDrag:true,
				pinned:"left",
				editable:true,
				cellEditorPopup:true,
				colSpan:function(params){
					if(params.data.Symbol == "")return 6;
					return 1;
				},
				cellClassRules:{
					"Symbol_Grid_Title":function(params){
						if(IdealInterFace.InstrumentsList[params.data.Symbol + ""])return false;
						return true;
					}
				}
				/*sort:"asc"*/
			},
			{
				field:"Last",
				type:"PriceTypeFormat",
				headerName:"Son",
				minWidth:110,
				editable:false,
			},
			{
				headerName:"Değerler",
				pinned: "right",
				children:[
					{field:"PDaily", headerName:"% Gün", type:"PercentTypeFormat",minWidth:110,},
					{field:"Graph", headerName:"Grafik",minWidth:110, type:"GrahpTypeFormat",},
					{field:"Last Lot", headerName:"Son Lot",width:100,hide:true},
					{field:"Buy", headerName:"Alış", type:"PriceTypeFormat",width:100,hide:true},
					{field:"Sell", headerName:"Satış", type:"PriceTypeFormat",width:100,hide:true},
					
					{field:"DailyLot", headerName:"Günlük Adet", hide:true,width:100,},
					{field:"BidSize", headerName:"Alış Adet", hide:true,width:100,},
					{field:"AskSize", headerName:"Satış Adet", hide:true,width:100,},
					{field:"LimitUp", headerName:"Tavan", hide:true, type:"PriceTypeFormat",width:100,},
					{field:"LimitDown", headerName:"Taban", hide:true, type:"PriceTypeFormat",width:100,},
					{field:"Step", headerName:"Adım", hide:true,width:100,},
					{field:"Avarage", headerName:"Ortalama", hide:true, type:"PriceTypeFormat",width:100,},
					{field:"Volume", headerName:"Hacim", hide:true,width:100,},
					{field:"PreviusClose", headerName:"Önceki Gün Kapanış", hide:true,type:"PriceTypeFormat",width:100,},
				],
			},
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
			idealdataPriceCellRenderer:idealdataPriceCellRenderer,
			idealdataPercentCellRenderer:idealdataPercentCellRenderer,
			idealdataSymbolCellRenderer:idealdataSymbolCellRenderer,
			idealdataPriceGrahpCellRenderer:idealdataPriceGrahpCellRenderer,
			idealdataSymbolCellEditor:idealdataSymbolCellEditor,
		},
		columnTypes:{
			PriceTypeFormat:{
				chartDataType:"series",
				cellClass:"number",
				valueFormatter:function(params){
					return Number(Number(params.value).toPrecision(7));
					//return Math.floor(params.value).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
				},
				cellRenderer:"idealdataPriceCellRenderer"
			},
			PercentTypeFormat:{
				chartDataType:"series",
				cellClass:"number",
				valueFormatter:function(params){
					return Number(params.value);
					//return Math.floor(params.value).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
				},
				cellRenderer:"idealdataPercentCellRenderer"
			},
			SymbolTypeFormat:{
				cellRenderer:"idealdataSymbolCellRenderer",
				cellEditor:"idealdataSymbolCellEditor"
			},
			GrahpTypeFormat:{
				cellRenderer:"idealdataPriceGrahpCellRenderer"
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
			SuperficialAnalysis(symbol);
		},
		onRowDoubleClicked:function(param){
			var symbol = param.data.Symbol;
			//SuperficialAnalysis(symbol);
		},
		getContextMenuItems:function(params){
			return IdealInterFace.GetContextMenu(params);
		},
	},
};
PriceTableWindow.Windows = {};
PriceTableWindow.prototype.Serialize = function(){
	var elePos = this.WIN.GetPosition();
	var eleSize = this.WIN.GetSize();
	var xcode = "(function(){";
	xcode += "var _=new PriceTableWindow(\"" + this.Name + "\");";
	xcode += "_.List=[\"" + this.List.join("\",\"") + "\"];";
	xcode += "setTimeout(function(){"
	xcode += 	"_.WIN.SetPosition(" + elePos.x + "," + elePos.y + ");";
	xcode += 	"_.WIN.SetSize(" + eleSize.w + "," + eleSize.h + ");";
	xcode += "},10);";
	xcode += "})();";
	return xcode;
};
PriceTableWindow.Serialize = function(){
	var xcode = "(function(){";
	//xcode += "PriceTableWindow.Config.=" + PriceTableWindow.Config. + ";";
	for(var key in PriceTableWindow.Windows){
		xcode += PriceTableWindow.Windows[key].Serialize();
	}
	xcode += "})();";
	return xcode;
};
PriceTableWindow.Deserialize = function(xcode){
	if(typeof(xcode)=="string")setTimeout(function(){eval(xcode)},1);
	else if(typeof(xcode)=="function")setTimeout(xcode,1);
};
PriceTableWindow.prototype.Initialize = function(){
	/*this.TableDerinlik.gridOptions.api.setRowData(Array.from({length:25},function(item,index){
		return {
			ID:index,
			Active:"",
		}
	}));*/
	this.WIN.Open();
	this.WIN.SetSize(500,800);
	this.WIN.SetPosition(PriceTableWindow.Config.DefaultPosition[0], PriceTableWindow.Config.DefaultPosition[1]);
	var div = this.WIN.GetContent().children(".rootsystem")[0];
	this.panelayout = new GoldenLayout({
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
			selectionEnabled: true,
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
					title:"Prices",
				},{
					type:"component",
					isClosable:false,
					id:"column1",
					//cssClass:"",
					componentName:"RComponent",
					title:"Heat Map",
				}],
			}],
		}]
	},div);
	this.panelayout.registerComponent("RComponent",function(container,state){
		//container.getElement().append($(document.getElementById(state.text)));
	});
	
	this.panelayout.init();
	
	var div_pricelist = $(this.panelayout.root.contentItems[0].contentItems[0].contentItems[0].element[0]).find(".lm_content")[0];
	div_pricelist.className = "ag-theme-balham-dark";
	
	var div_heatmap = $(this.panelayout.root.contentItems[0].contentItems[0].contentItems[1].element[0]).find(".lm_content")[0];
	div_heatmap.style.overflow = "scroll";
	this.HeatMapArea = div_heatmap;
	
	var THAT = this;
	this.panelayout.on("stateChanged",function(){
		THAT.panelayout.updateSize("100%","100%");
	});
	
	this.PriceTable = new agGrid.Grid(div_pricelist,Object.assign({
		popupParent:document.body,
	},PriceTableWindow.Config.PriceTableGrid));
	this.PriceTable.gridOptions.api.setRowData(Array.from({length:this.Length},function(item,index){
		return {
			ID:index,
			Symbol:"",
		}
	}));
	this.PriceTable.gridOptions.api.applyTransactionAsync({update:this.List.map(function(item,index){
		return {
			ID:index,
			Symbol:item,
		};
	})});
	this.PriceTable.gridOptions.api.sizeColumnsToFit();
	this.PriceTable.gridOptions.api.WINDOW = this;
};
PriceTableWindow.prototype.UpdateList = function(){
	var arr_temp = this.List.concat(Array.from({length:this.Length-this.List.length}).fill("")).map(function(item,index){
		var xitem = {
			Symbol:item,
			ID:index,
			Active:"Y",
		};
		if(!IdealInterFace.InstrumentsList[item])return xitem;
		instrument = IdealInterFace.InstrumentGet(item);
		var LastPrice = parseFloat(instrument.LastPrice);
		var PreviusClose = parseFloat(instrument.DayClose);// | LastPrice; // P,1
		var PDaily = 100 * (LastPrice - PreviusClose) / PreviusClose;
		return Object.assign(xitem,{
			Symbol:item,
			Last:LastPrice,
			Graph:LastPrice,
			Prefix:instrument.Prefix,
			"LastLot":instrument.LastSize,
			Buy:instrument.BidPrice,
			Sell:instrument.AskPrice,
			"PDaily":PDaily,
			LimitUp:instrument.LimitUp,
			LimitDown:instrument.LimitDown,
			Step:instrument.PriceStep,
			//Avarage:instrument.SUB_E,
			//Volume:instrument.SUB_G,
			DailyLot:instrument.SizeSession,
			BidSize:instrument.BidSize,
			AskSize:instrument.AskSize,
			PreviusClose:PreviusClose,
			Active:"Y",
		});
	});
	this.PriceTable.gridOptions.api.applyTransactionAsync({update:arr_temp});
	var div = this.HeatMapArea;
	div.innerHTML = "";
	var high = -Infinity;
	var low = Infinity;
	var GetDifferential = function(instrument){
		var LastPrice = Number(instrument.LastPrice);
		var PreviusClose = Number(instrument.DayClose);// | LastPrice; // P,1
		if(isNaN(PreviusClose) || !(PreviusClose > 0)) return 0;
		if(isNaN(LastPrice)) LastPrice = PreviusClose;
		var PDaily = 100 * (LastPrice - PreviusClose) / PreviusClose;
		return PDaily;
	};
	var CalculateColor = function(num,rising){
		var Gl = 0.5;
		var Rl = 0.5;
		
		if(typeof(rising) == "boolean"){
			if(rising)num = Math.max(num,Gl);
			else num = Math.min(num,Rl);
		}
		var h = num * 110;
		var s = Math.abs(num - 0.5) / 0.5 * 25 + 40;
		var l = 40;
		return("hsl(" + h + ", " + s + "%, " + l + "%)");
	};
	var arr = this.List.filter(function(item){
		if(!IdealInterFace.InstrumentsList[item])return false;
		var deg = GetDifferential(IdealInterFace.InstrumentGet(item));
		if(deg > high) high = deg;
		if(deg < low) low = deg;
		return true;
	}).sort(function(item1,item2){
		var deg1 = GetDifferential(IdealInterFace.InstrumentGet(item1));
		var deg2 = GetDifferential(IdealInterFace.InstrumentGet(item2));
		return deg1 > deg2 ? -1 : 1;
	});
	if(high == low){
		high += 1;
		low -= 1;
	}
	arr.map(function(item){
		var deg = GetDifferential(IdealInterFace.InstrumentGet(item));
		var obj = document.createElement("SPAN");
		obj.className = "HeatMap";
		obj.Symbol = IdealInterFace.InstrumentGet(item).Symbol;
		obj.onclick = function(){
			SuperficialAnalysis(this.Symbol);
		};
		obj.style.backgroundColor = CalculateColor((deg - low) / (high - low), deg >= 0);
		obj.innerHTML = "<H6>" + item + "</H6>% " + deg.toFixed(2);
		div.append(obj);
	});
};
PriceTableWindow.prototype.SetSymbol = function(id, symbol){
	if(this.List[id]){
		this.List[id] = symbol;
	} else this.List.push(symbol);
};
PriceTableWindow.prototype.Close = function(){
	//PriceTableWindow.Windows[this.ID].WIN.Close();
	delete PriceTableWindow.Windows[this.ID];
};
PriceTableWindow.Reset = function(){
	for(var key in PriceTableWindow.Windows){
		PriceTableWindow.Windows[key].Close();
	}
};
ATA.Loops.push(function(){
	var thisTime = (new Date()).getTime();
	var PivotTime = thisTime % PriceTableWindow.Config.LoopTime;
	var lastPivotTime = PriceTableWindow.Config.LastActivite % PriceTableWindow.Config.LoopTime;
	var periodicalCycle = PivotTime < lastPivotTime;
	PriceTableWindow.Config.LastActivite = thisTime;
	for(var key in PriceTableWindow.Windows){
		PriceTableWindow.Windows[key].UpdateList();
		if(periodicalCycle);;
	}
});

var StepAnalysisWindow = function(symbol){
	this.ID = "win_" + symbol;//generate_ID();
	this.Symbol = symbol;
	this.WIN = new IdealWindow("Kademe Analizi" /*+ " - " + symbol*/);
	StepAnalysisWindow.Config.GenerateHTML(this.WIN.GetContent()[0]);
	this.WIN.SetTitle("Kademe Analizi - " + symbol);
	StepAnalysisWindow.Windows[this.ID] = this;
	var THAT = this;
	this.WIN.OnClose = function(){
		THAT.Close();
	};
	
	THAT.Initialize();
	setTimeout(function(){
		//THAT.Initialize();
	},1);
};
StepAnalysisWindow.Config = {
	LastActivite:0,
	LoopTime:1000*60*5,
	GenerateHTML:function(content){
		var divcontent = document.createElement("div");content.append(divcontent);
		var divhead = document.createElement("div");content.append(divhead);
		
		var headHeight = "3em";
		
		divhead.style.width = "100%";
		divhead.style.height = "" + headHeight + "";
		divhead.style.left = "0px";
		divhead.style.top = "0px";
		divhead.style.position = "absolute";
		divhead.className = "header";
		divhead.innerHTML = "";
		
		var __buildMenuBar = function(){
			var div0 = document.createElement("div");divhead.append(div0);
			div0.className = "btn-group d-flex";
			div0.style.margin = "5px";
			var span0 = document.createElement("span");div0.append(span0);
			span0.className = "btn";
			span0.innerHTML = "&nbsp;";
			var div1 = document.createElement("div");div0.append(div1);
			div1.className = "btn-group";
			div1.setAttribute("role","group");
			var button0 = document.createElement("button");div1.append(button0);
			button0.className = "btn btn-outline-secondary dropdown-toggle";
			button0.id = "btnGroupDrop1";
			button0.style.border = "none";
			button0.setAttribute("data-bs-toggle","dropdown");
			button0.setAttribute("aria-expanded","false");
			button0.innerHTML = "G";
			var ul0 = document.createElement("ul");div1.append(ul0);
			ul0.className = "dropdown-menu";
			ul0.setAttribute("aria-labelledby","btnGroupDrop1");
			var list = ["5","10","60","S1","S2","G"];
			list.map(function(item){
				var li0 = document.createElement("li");ul0.append(li0);
				var button1 = document.createElement("button");li0.append(button1);
				button1.className = "dropdown-item";
				button1.href = "#";
				button1.innerText = item;
				button1.parametre = item;
				button1.onclick = function(){
					var parametre = this.parametre;
					var symbol = divcontent.SYMBOL;
					button0.innerHTML = parametre;
					IdealInterFace.StepAnalysis(symbol, parametre);
				};
			});
			
		};
		__buildMenuBar();
		
		divcontent.style.width = "100%";
		divcontent.style.height = "calc(100% - " + headHeight + ")";
		divcontent.style.left = "0px";
		divcontent.style.top = "" + headHeight + "";
		divcontent.style.position = "absolute";
		
		divcontent.className = "rootsystem";
	},
	StepAnalysisGrid:{
		animateRows: true,
		columnDefs:[
			{
				field:"ID",
				sort:"asc",
				hide:true,
			},
			{field:"Price", headerName:"Fiyat",type:"PriceTypeFormat"},
			{field:"Lot", headerName:"Lot"},
			{
				field:"Percent",
				headerName:"Toplam %",
				valueFormatter:function(params){
					return "% " + params.value.toFixed(2);
				},
			},
			{
				field:"PBuyer",
				headerClass:"buyer_side",
				headerName:"Alıcı %",
				valueFormatter:function(params){
					return "% " + params.value.toFixed(0);
				},
			},
			{
				field:"PSeller",
				headerClass:"seller_side",
				headerName:"Satıcı %",
				valueFormatter:function(params){
					return "% " + params.value.toFixed(0);
				},
			}
		],
		columnTypes:{
			PriceTypeFormat:{
				valueFormatter:function(params){
					var s = "" +  Number(Number(params.value).toPrecision(7)).toFixed(2) + "";
					if(Number(s))return s.replace(".",",");
					return "";
				},
			},
		},
		defaultColDef:{
			minWidth: 50,
			editable:false,
			sortable:false,
			//flex:1,
			filter:false,
			resizable:true,
		},
		//animateRows:true,
		//suppressAggFuncInHeader:true,
		getRowNodeId:function(data){return data.ID;},
		/*onGridReady:function(params){
			params.api.sizeColumnsToFit();
		},*/
	}
};
StepAnalysisWindow.Windows = {};
StepAnalysisWindow.prototype.Serialize = function(){
	var elePos = this.WIN.GetPosition();
	var eleSize = this.WIN.GetSize();
	var xcode = "(function(){";
	xcode += "var _=IdealInterFace.StepAnalysis(\"" + this.Symbol + "\");";
	xcode += "setTimeout(function(){"
	xcode += 	"_.WIN.SetPosition(" + elePos.x + "," + elePos.y + ");";
	xcode += 	"_.WIN.SetSize(" + eleSize.w + "," + eleSize.h + ");";
	xcode += "},1);";
	xcode += "})();";
	return xcode;
};
StepAnalysisWindow.Serialize = function(){
	var xcode = "(function(){";
	//xcode += "StepAnalysisWindow.Config.=" + StepAnalysisWindow.Config. + ";";
	for(var key in StepAnalysisWindow.Windows){
		xcode += StepAnalysisWindow.Windows[key].Serialize();
	}
	xcode += "})();";
	return xcode;
};
StepAnalysisWindow.Deserialize = function(xcode){
	if(typeof(xcode)=="string")setTimeout(function(){eval(xcode)},1);
	else if(typeof(xcode)=="function")setTimeout(xcode,1);
};
StepAnalysisWindow.prototype.Close = function(){
	//StepAnalysisWindow.Windows[this.ID].WIN.Close();
	delete StepAnalysisWindow.Windows[this.ID];
};
StepAnalysisWindow.prototype.Initialize = function(){
	/*this.TableDerinlik.gridOptions.api.setRowData(Array.from({length:25},function(item,index){
		return {
			ID:index,
			Active:"",
		}
	}));*/
	this.WIN.Open();
	this.WIN.SetSize(510,650);
	var div = this.WIN.GetContent().children(".rootsystem")[0];
	div.SYMBOL = this.Symbol;
	this.panelayout = new GoldenLayout({
		resizeWithContainerAutomatically:true,
		settings:{
			hasHeaders:false,
			constrainDragToContainer:false,
			reorderEnabled:false,
			selectionEnabled:false,
			popoutWholeStack:false,
			blockedPopoutsThrowError:false,
			closePopoutsOnUnload:false,
			showPopoutIcon:false,
			showMaximiseIcon:false,
			showCloseIcon:false,
			selectionEnabled:true,
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
				type:"column",
				content:[{
					type:"component",
					isClosable:false,
					id:"column0",
					//cssClass:"",
					componentName:"RComponent",
				}],
			}],
		}]
	},div);
	this.panelayout.registerComponent("RComponent",function(container,state){
		//container.getElement().append($(document.getElementById(state.text)));
	});
	this.panelayout.init();
	var div_steps = $(this.panelayout.root.contentItems[0].contentItems[0].contentItems[0].element[0]).find(".lm_content")[0];
	
	div_steps.className = "ag-theme-balham-dark";
	
	var THAT = this;
	this.panelayout.on("stateChanged",function(){
		THAT.panelayout.updateSize("100%","100%");
	});
	
	this.StepsTable = new agGrid.Grid(div_steps,Object.assign({
		//
	},StepAnalysisWindow.Config.StepAnalysisGrid));
	this.StepsTable.gridOptions.api.setRowData([]);
	this.StepsTable.gridOptions.api.sizeColumnsToFit();
};
StepAnalysisWindow.Reset = function(){
	for(var key in StepAnalysisWindow.Windows){
		StepAnalysisWindow.Windows[key].Close();
	}
};
ATA.Loops.push(function(){
	var thisTime = (new Date()).getTime();
	var PivotTime = thisTime % StepAnalysisWindow.Config.LoopTime;
	var lastPivotTime = StepAnalysisWindow.Config.LastActivite % StepAnalysisWindow.Config.LoopTime;
	if(PivotTime < lastPivotTime){
		for(var key in StepAnalysisWindow.Windows){
			//IdealInterFace.StepAnalysis(StepAnalysisWindow.Windows[key].Symbol);
		}
	}
	StepAnalysisWindow.Config.LastActivite = thisTime;
});

var NewsCompanyWindow = function(symbol){
	this.ID = "win_" + symbol;//generate_ID();
	
	this.WIN = new IdealWindow("Firma Haber" /*+ " - " + symbol*/);
	NewsCompanyWindow.Config.GenerateHTML(this.WIN.GetContent()[0]);
	this.WIN.SetTitle("Firma Haber - " + symbol);
	NewsCompanyWindow.Windows[this.ID] = this;
	var THAT = this;
	this.WIN.OnClose = function(){
		THAT.Close();
	};
	
	THAT.Initialize();
	setTimeout(function(){
		//THAT.Initialize();
	},1);
};
NewsCompanyWindow.Config = {
	LastActivite:0,
	LoopTime:1000*60*5,
	GenerateHTML:function(content){
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
		
		//divcontent.style.width = "100%";
		divcontent.style.height = "calc(100% - " + headHeight + ")";
		divcontent.style.left = "0.5em";
		divcontent.style.right = "0.5em";
		divcontent.style.top = "" + headHeight + "";
		divcontent.style.position = "absolute";
		
		divcontent.className = "rootsystem";
	}
};
NewsCompanyWindow.Windows = {};
NewsCompanyWindow.prototype.Serialize = function(){
	var elePos = this.WIN.GetPosition();
	var eleSize = this.WIN.GetSize();
	var xcode = "(function(){";
	xcode += "var _=IdealInterFace.NewsCompany(\"" + this.Symbol + "\");";
	xcode += "setTimeout(function(){"
	xcode += 	"_.WIN.SetPosition(" + elePos.x + "," + elePos.y + ");";
	xcode += 	"_.WIN.SetSize(" + eleSize.w + "," + eleSize.h + ");";
	xcode += "},1);";
	xcode += "})();";
	return xcode;
};
NewsCompanyWindow.Serialize = function(){
	var xcode = "(function(){";
	//xcode += "NewsCompanyWindow.Config.=" + NewsCompanyWindow.Config. + ";";
	for(var key in NewsCompanyWindow.Windows){
		xcode += NewsCompanyWindow.Windows[key].Serialize();
	}
	xcode += "})();";
	return xcode;
};
NewsCompanyWindow.Deserialize = function(xcode){
	if(typeof(xcode)=="string")setTimeout(function(){eval(xcode)},1);
	else if(typeof(xcode)=="function")setTimeout(xcode,1);
};
NewsCompanyWindow.prototype.Close = function(){
	//NewsCompanyWindow.Windows[this.ID].WIN.Close();
	delete NewsCompanyWindow.Windows[this.ID];
};
NewsCompanyWindow.Reset = function(){
	for(var key in NewsCompanyWindow.Windows){
		NewsCompanyWindow.Windows[key].Close();
	}
};
NewsCompanyWindow.prototype.Initialize = function(){
	/*this.TableDerinlik.gridOptions.api.setRowData(Array.from({length:25},function(item,index){
		return {
			ID:index,
			Active:"",
		}
	}));*/
	this.WIN.Open();
	this.WIN.SetSize(560,500);
	
	this.WIN.GetContent().css({"overflow-x":"scroll"});
	var div = this.WIN.GetContent().children(".rootsystem")[0];

	var div_content = div;
	
	div_content.style.overflow = "scroll";
	div_content.style.border = "1px solid #00000000";
	//div_content.style.margin = "1em";
	
	this.ContentHTML = div_content;
};
ATA.Loops.push(function(){
	var thisTime = (new Date()).getTime();
	var PivotTime = thisTime % NewsCompanyWindow.Config.LoopTime;
	var lastPivotTime = NewsCompanyWindow.Config.LastActivite % NewsCompanyWindow.Config.LoopTime;
	if(PivotTime < lastPivotTime){
		for(var key in NewsCompanyWindow.Windows){
			IdealInterFace.NewsCompany(NewsCompanyWindow.Windows[key].Symbol);
		}
	}
	NewsCompanyWindow.Config.LastActivite = thisTime;
});

var BasicAnalysisWindow = function(){
	this.ID = "win_0";//generate_ID();
	
	this.WIN = new IdealWindow("Firma Haber" /*+ " - " + symbol*/);
	BasicAnalysisWindow.Config.GenerateHTML(this.WIN.GetContent()[0]);
	//this.WIN.SetTitle("Firma Haber - " + symbol);
	BasicAnalysisWindow.Windows[this.ID] = this;
	var THAT = this;
	this.WIN.OnClose = function(){
		THAT.Close();
	};
	
	THAT.Initialize();
	setTimeout(function(){
		//THAT.Initialize();
	},1);
};
BasicAnalysisWindow.Config = {
	LastActivite:0,
	LoopTime:1000*60*5,
	GenerateHTML:function(content){
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
	}
};
BasicAnalysisWindow.Windows = {};
BasicAnalysisWindow.prototype.Serialize = function(){
	var elePos = this.WIN.GetPosition();
	var eleSize = this.WIN.GetSize();
	var xcode = "(function(){";
	xcode += "var _=IdealInterFace.BasicAnalysis();";
	xcode += "setTimeout(function(){"
	xcode += 	"_.WIN.SetPosition(" + elePos.x + "," + elePos.y + ");";
	xcode += 	"_.WIN.SetSize(" + eleSize.w + "," + eleSize.h + ");";
	xcode += "},1);";
	xcode += "})();";
	return xcode;
};
BasicAnalysisWindow.Serialize = function(){
	var xcode = "(function(){";
	//xcode += "BasicAnalysisWindow.Config.=" + BasicAnalysisWindow.Config. + ";";
	for(var key in BasicAnalysisWindow.Windows){
		xcode += BasicAnalysisWindow.Windows[key].Serialize();
	}
	xcode += "})();";
	return xcode;
};
BasicAnalysisWindow.Deserialize = function(xcode){
	if(typeof(xcode)=="string")setTimeout(function(){eval(xcode)},1);
	else if(typeof(xcode)=="function")setTimeout(xcode,1);
};
BasicAnalysisWindow.prototype.Close = function(){
	//BasicAnalysisWindow.Windows[this.ID].WIN.Close();
	delete BasicAnalysisWindow.Windows[this.ID];
};
BasicAnalysisWindow.Reset = function(){
	for(var key in BasicAnalysisWindow.Windows){
		BasicAnalysisWindow.Windows[key].Close();
	}
};
BasicAnalysisWindow.prototype.Initialize = function(){
	/*this.TableDerinlik.gridOptions.api.setRowData(Array.from({length:25},function(item,index){
		return {
			ID:index,
			Active:"",
		}
	}));*/
	this.WIN.Open();
	this.WIN.SetSize(500,500);
	var div = this.WIN.GetContent().children(".rootsystem")[0];
	var iframe_content = document.createElement("IFRAME");div.append(iframe_content);
	iframe_content.style.width = "100%";
	iframe_content.style.height = "100%";
	iframe_content.style.left = "0px";
	iframe_content.style.top = "0px";
	//iframe_content.src = "";
	var THAT = this;
	this.ContentFrame = iframe_content;
};
ATA.Loops.push(function(){
	var thisTime = (new Date()).getTime();
	var PivotTime = thisTime % BasicAnalysisWindow.Config.LoopTime;
	var lastPivotTime = BasicAnalysisWindow.Config.LastActivite % BasicAnalysisWindow.Config.LoopTime;
	if(PivotTime < lastPivotTime){
		for(var key in BasicAnalysisWindow.Windows){
			IdealInterFace.BasicAnalysis();
		}
	}
	BasicAnalysisWindow.Config.LastActivite = thisTime;
});

var CapitalCampanyWindow = function(symbol){
	this.ID = "win_" + symbol;//generate_ID();
	this.Symbol = symbol;
	this.WIN = new IdealWindow("Sermaye" /*+ " - " + symbol*/);
	CapitalCampanyWindow.Config.GenerateHTML(this.WIN.GetContent()[0]);
	this.WIN.SetTitle("Sermaye - " + symbol);
	CapitalCampanyWindow.Windows[this.ID] = this;
	var THAT = this;
	this.WIN.OnClose = function(){
		THAT.Close();
	};
	
	THAT.Initialize();
	setTimeout(function(){
		//THAT.Initialize();
	},1);
};
CapitalCampanyWindow.Config = {
	LastActivite:0,
	LoopTime:1000*60*5,
	GenerateHTML:function(content){
		var divcontent = document.createElement("div");content.append(divcontent);
		var divhead = document.createElement("div");content.append(divhead);
		
		var headHeight = "2em";
		
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
	},
	CapitalGrid:{
		animateRows: true,
		columnDefs:[
			{
				field:"ID",
				sort:"asc",
				hide:true,
			},
			{field:"Date", headerName:"Tarih"},
			{field:"Paidly", headerName:"Bedelli"},
			{field:"Unpaidly", headerName:"Bedelsiz"},
			{field:"Dividend", headerName:"Temettü"},
			{field:"Rate", headerName:"Oran"},
		],
		defaultColDef:{
			minWidth: 50,
			editable:false,
			sortable:false,
			//flex:1,
			filter:false,
			resizable:true,
		},
		//animateRows:true,
		//suppressAggFuncInHeader:true,
		getRowNodeId:function(data){return data.ID;},
		/*onGridReady:function(params){
			params.api.sizeColumnsToFit();
		},*/
	}
};
CapitalCampanyWindow.Windows = {};
CapitalCampanyWindow.prototype.Serialize = function(){
	var elePos = this.WIN.GetPosition();
	var eleSize = this.WIN.GetSize();
	var xcode = "(function(){";
	xcode += "var _=IdealInterFace.CapitalCampany(\"" + this.Symbol + "\");";
	xcode += "setTimeout(function(){"
	xcode += 	"_.WIN.SetPosition(" + elePos.x + "," + elePos.y + ");";
	xcode += 	"_.WIN.SetSize(" + eleSize.w + "," + eleSize.h + ");";
	xcode += "},1);";
	xcode += "})();";
	return xcode;
};
CapitalCampanyWindow.Serialize = function(){
	var xcode = "(function(){";
	//xcode += "CapitalCampanyWindow.Config.=" + CapitalCampanyWindow.Config. + ";";
	for(var key in CapitalCampanyWindow.Windows){
		xcode += CapitalCampanyWindow.Windows[key].Serialize();
	}
	xcode += "})();";
	return xcode;
};
CapitalCampanyWindow.Deserialize = function(xcode){
	if(typeof(xcode)=="string")setTimeout(function(){eval(xcode)},1);
	else if(typeof(xcode)=="function")setTimeout(xcode,1);
};
CapitalCampanyWindow.prototype.Close = function(){
	//CapitalCampanyWindow.Windows[this.ID].WIN.Close();
	delete CapitalCampanyWindow.Windows[this.ID];
};
CapitalCampanyWindow.Reset = function(){
	for(var key in CapitalCampanyWindow.Windows){
		CapitalCampanyWindow.Windows[key].Close();
	}
};
CapitalCampanyWindow.prototype.Initialize = function(){
	/*this.TableDerinlik.gridOptions.api.setRowData(Array.from({length:25},function(item,index){
		return {
			ID:index,
			Active:"",
		}
	}));*/
	this.WIN.Open();
	this.WIN.SetSize(500,280);
	var div = this.WIN.GetContent().children(".rootsystem")[0];
	this.panelayout = new GoldenLayout({
		resizeWithContainerAutomatically:true,
		settings:{
			hasHeaders:false,
			constrainDragToContainer:false,
			reorderEnabled:false,
			selectionEnabled:false,
			popoutWholeStack:false,
			blockedPopoutsThrowError:false,
			closePopoutsOnUnload:false,
			showPopoutIcon:false,
			showMaximiseIcon:false,
			showCloseIcon:false,
			selectionEnabled:true,
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
				type:"column",
				content:[{
					type:"component",
					isClosable:false,
					id:"column0",
					//cssClass:"",
					componentName:"RComponent",
				}],
			}],
		}]
	},div);
	this.panelayout.registerComponent("RComponent",function(container,state){
		//container.getElement().append($(document.getElementById(state.text)));
	});
	this.panelayout.init();
	var div_steps = $(this.panelayout.root.contentItems[0].contentItems[0].contentItems[0].element[0]).find(".lm_content")[0];
	
	div_steps.className = "ag-theme-balham-dark";
	
	var THAT = this;
	this.panelayout.on("stateChanged",function(){
		THAT.panelayout.updateSize("100%","100%");
	});
	
	this.CapitalTable = new agGrid.Grid(div_steps,Object.assign({
		//
	},CapitalCampanyWindow.Config.CapitalGrid));
	this.CapitalTable.gridOptions.api.setRowData([]);
	this.CapitalTable.gridOptions.api.sizeColumnsToFit();
};
ATA.Loops.push(function(){
	var thisTime = (new Date()).getTime();
	var PivotTime = thisTime % CapitalCampanyWindow.Config.LoopTime;
	var lastPivotTime = CapitalCampanyWindow.Config.LastActivite % CapitalCampanyWindow.Config.LoopTime;
	if(PivotTime < lastPivotTime){
		for(var key in CapitalCampanyWindow.Windows){
			IdealInterFace.CapitalCampany(CapitalCampanyWindow.Windows[key].Symbol);
		}
	}
	CapitalCampanyWindow.Config.LastActivite = thisTime;
});

var SplitageChartWindow = function(symbol){
	this.ID = "win_" + symbol;//generate_ID();
	this.Symbol = symbol;
	this.WIN = new IdealWindow("Dağılım Pasta" /*+ " - " + symbol*/);
	SplitageChartWindow.Config.GenerateHTML(this.WIN.GetContent()[0]);
	this.WIN.SetTitle("Dağılım Pasta - " + symbol);
	SplitageChartWindow.Windows[this.ID] = this;
	var THAT = this;
	this.WIN.OnClose = function(){
		THAT.Close();
	};
	
	THAT.Initialize();
	setTimeout(function(){
		//THAT.Initialize();
	},1);
};
SplitageChartWindow.Config = {
	LastActivite:0,
	LoopTime:1000*60*5,
	GenerateHTML:function(content){
		var divcontent = document.createElement("div");content.append(divcontent);
		var divhead = document.createElement("div");content.append(divhead);
		
		var headHeight = "3em";
		
		divhead.style.width = "100%";
		divhead.style.height = "" + headHeight + "";
		divhead.style.left = "0px";
		divhead.style.top = "0px";
		divhead.style.position = "absolute";
		divhead.className = "header";
		divhead.innerHTML = "";
		
		var __buildMenuBar = function(){
			var div0 = document.createElement("div");divhead.append(div0);
			div0.className = "btn-group d-flex";
			div0.style.margin = "5px";
			var span0 = document.createElement("span");div0.append(span0);
			span0.className = "btn";
			span0.innerHTML = "&nbsp;";
			var div1 = document.createElement("div");div0.append(div1);
			div1.className = "btn-group";
			div1.setAttribute("role","group");
			
			var button0 = document.createElement("button");div1.append(button0);
			button0.className = "btn btn-outline-secondary dropdown-toggle";
			button0.id = "btnGroupDrop1";
			button0.style.border = "none";
			button0.setAttribute("data-bs-toggle","dropdown");
			button0.setAttribute("aria-expanded","false");
			button0.innerHTML = "ALANLAR";
			var ul0 = document.createElement("ul");div1.append(ul0);
			ul0.className = "dropdown-menu";
			ul0.setAttribute("aria-labelledby","btnGroupDrop1");
			var list1 = ["ALANLAR", "SATANLAR", "TOPLAM"]; // yönler
			var _yon = "ALANLAR";
			list1.map(function(item){
				var li0 = document.createElement("li");ul0.append(li0);
				var button2 = document.createElement("button");li0.append(button2);
				button2.className = "dropdown-item";
				button2.href = "#";
				button2.innerText = item;
				button2.parametre = item;
				button2.onclick = function(){
					var parametre = this.parametre;
					var symbol = divcontent.SYMBOL;
					button0.innerHTML = parametre;
					_yon = parametre;
					IdealInterFace.Splitage(symbol, parametre, _periot);
				};
			});
			
			var button1 = document.createElement("button");div1.append(button1);
			button1.className = "btn btn-outline-secondary dropdown-toggle";
			button1.id = "btnGroupDrop1";
			button1.style.border = "none";
			button1.setAttribute("data-bs-toggle","dropdown");
			button1.setAttribute("aria-expanded","false");
			button1.innerHTML = "10";
			var ul1 = document.createElement("ul");div1.append(ul1);
			ul1.className = "dropdown-menu";
			ul1.setAttribute("aria-labelledby","btnGroupDrop1");
			var list2 = ["1","2","3","4","5","10"]; // periot
			var _periot = "10";
			list2.map(function(item){
				var li0 = document.createElement("li");ul1.append(li0);
				var button2 = document.createElement("button");li0.append(button2);
				button2.className = "dropdown-item";
				button2.href = "#";
				button2.innerText = item;
				button2.parametre = item;
				button2.onclick = function(){
					var parametre = this.parametre;
					var symbol = divcontent.SYMBOL;
					button1.innerHTML = parametre;
					_periot = parametre;
					IdealInterFace.Splitage(symbol, _yon, parametre);
				};
			});
		};
		__buildMenuBar();
		
		divcontent.style.width = "100%";
		divcontent.style.height = "calc(100% - " + headHeight + ")";
		divcontent.style.left = "0px";
		divcontent.style.top = "" + headHeight + "";
		divcontent.style.position = "absolute";
		
		divcontent.className = "rootsystem";
	},
	SplitageChart:{
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
							return "<div class=\"tooltipforpiechart\" style=\"background-color:" + params.color + ";\">" + params.datum.Title + " (" + params.datum.Lot + ")</div>";
						}
					},
				},
			},
		},
		getChartToolbarItems:function(){
			return [];
		},
	},
	SplitageTable:{
		animateRows:true,
		columnDefs:[
			{
				field:"ID",
				sort:"asc",
				hide:true,
			},
			{field:"Title", headerName:"Kurum"},
			{field:"Lot", headerName:"Adet"},
			{
				field:"Percent",
				headerName:"%",
				valueFormatter:function(params){
					return "% " + Number(params.value).toFixed(2);
				}
			},
			{field:"Cost", headerName:"Maaliyet",type:"PriceTypeFormat"},
		],
		columnTypes:{
			PriceTypeFormat:{
				valueFormatter:function(params){
					var s = "" +  Number(Number(params.value).toPrecision(7)).toFixed(4) + "";
					if(Number(s))return s.replace(".",",");
					return "";
				},
			},
		},
		defaultColDef:{
			minWidth: 50,
			editable:false,
			sortable:false,
			//flex:1,
			filter:false,
			resizable:true,
		},
		//animateRows:true,
		//suppressAggFuncInHeader:true,
		getRowNodeId:function(data){return data.ID;},
		/*onGridReady:function(params){
			params.api.sizeColumnsToFit();
		},*/
	}
};
SplitageChartWindow.Windows = {};
SplitageChartWindow.prototype.Serialize = function(){
	var elePos = this.WIN.GetPosition();
	var eleSize = this.WIN.GetSize();
	var xcode = "(function(){";
	xcode += "var _=IdealInterFace.Splitage(\"" + this.Symbol + "\");";
	xcode += "setTimeout(function(){"
	xcode += 	"_.WIN.SetPosition(" + elePos.x + "," + elePos.y + ");";
	xcode += 	"_.WIN.SetSize(" + eleSize.w + "," + eleSize.h + ");";
	xcode += "},1);";
	xcode += "})();";
	return xcode;
};
SplitageChartWindow.Serialize = function(){
	var xcode = "(function(){";
	//xcode += "SplitageChartWindow.Config.=" + SplitageChartWindow.Config. + ";";
	for(var key in SplitageChartWindow.Windows){
		xcode += SplitageChartWindow.Windows[key].Serialize();
	}
	xcode += "})();";
	return xcode;
};
SplitageChartWindow.Deserialize = function(xcode){
	if(typeof(xcode)=="string")setTimeout(function(){eval(xcode)},1);
	else if(typeof(xcode)=="function")setTimeout(xcode,1);
};
SplitageChartWindow.Reset = function(){
	for(var key in SplitageChartWindow.Windows){
		SplitageChartWindow.Windows[key].Close();
	}
};
SplitageChartWindow.prototype.Close = function(){
	//SplitageChartWindow.Windows[this.ID].WIN.Close();
	delete SplitageChartWindow.Windows[this.ID];
};
SplitageChartWindow.prototype.Initialize = function(){
	/*this.TableDerinlik.gridOptions.api.setRowData(Array.from({length:25},function(item,index){
		return {
			ID:index,
			Active:"",
		}
	}));*/
	this.WIN.Open();
	this.WIN.SetSize(460,800);
	var div = this.WIN.GetContent().children(".rootsystem")[0];
	div.SYMBOL = this.Symbol;
	this.panelayout = new GoldenLayout({
		resizeWithContainerAutomatically:true,
		settings:{
			hasHeaders:false,
			constrainDragToContainer:false,
			reorderEnabled:false,
			selectionEnabled:false,
			popoutWholeStack:false,
			blockedPopoutsThrowError:false,
			closePopoutsOnUnload:false,
			showPopoutIcon:false,
			showMaximiseIcon:false,
			showCloseIcon:false,
			selectionEnabled:true,
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
				type:"column",
				content:[{
					type:"component",
					isClosable:false,
					id:"column0",
					//cssClass:"",
					componentName:"RComponent",
					height:70,
				},{
					type:"component",
					isClosable:false,
					id:"column1",
					//cssClass:"",
					componentName:"RComponent",
				}],
			}],
		}]
	},div);
	this.panelayout.registerComponent("RComponent",function(container,state){
		//container.getElement().append($(document.getElementById(state.text)));
	});
	this.panelayout.init();
	var div_splitagechart = $(this.panelayout.root.contentItems[0].contentItems[0].contentItems[0].element[0]).find(".lm_content")[0];
	var div_splitagetable = $(this.panelayout.root.contentItems[0].contentItems[0].contentItems[1].element[0]).find(".lm_content")[0];
	
	div_splitagetable.className = "ag-theme-balham-dark";
	
	var THAT = this;
	this.panelayout.on("stateChanged",function(){
		THAT.panelayout.updateSize("100%","100%");
	});
	
	var config = Object.assign({
		onFirstDataRendered:function(params){
			params.api.createRangeChart({
				cellRange: {
					rowStartIndex: 0,
					rowEndIndex: 79,
					columns: ["Title", "Lot"],
				},
				chartType: "pie",
				chartContainer: div_splitagechart,
				//aggFunc: "sum",
			});
		},
	},SplitageChartWindow.Config.SplitageTable);
	config = Object.assign(config,SplitageChartWindow.Config.SplitageChart);
	
	this.SplitageTable = new agGrid.Grid(div_splitagetable,config);
	this.SplitageTable.gridOptions.api.setRowData([]);
	this.SplitageTable.gridOptions.api.sizeColumnsToFit();
};
ATA.Loops.push(function(){
	var thisTime = (new Date()).getTime();
	var PivotTime = thisTime % SplitageChartWindow.Config.LoopTime;
	var lastPivotTime = SplitageChartWindow.Config.LastActivite % SplitageChartWindow.Config.LoopTime;
	if(PivotTime < lastPivotTime){
		for(var key in SplitageChartWindow.Windows){
			IdealInterFace.Splitage(SplitageChartWindow.Windows[key].Symbol);
		}
	}
	SplitageChartWindow.Config.LastActivite = thisTime;
});

var SplitageListWindow = function(symbol){
	this.ID = "win_" + symbol;//generate_ID();
	this.Symbol = symbol;
	this.WIN = new IdealWindow("Dağılım Liste" /*+ " - " + symbol*/);
	SplitageListWindow.Config.GenerateHTML(this.WIN.GetContent()[0]);
	this.WIN.SetTitle("Dağılım Liste - " + symbol);
	SplitageListWindow.Windows[this.ID] = this;
	var THAT = this;
	this.WIN.OnClose = function(){
		THAT.Close();
	};
	
	THAT.Initialize();
	setTimeout(function(){
		//THAT.Initialize();
	},1);
};
SplitageListWindow.Config = {
	LastActivite:0,
	LoopTime:1000*60*5,
	GenerateHTML:function(content){
		var divcontent = document.createElement("div");content.append(divcontent);
		var divhead = document.createElement("div");content.append(divhead);
		
		var headHeight = "3em";
		
		divhead.style.width = "100%";
		divhead.style.height = "" + headHeight + "";
		divhead.style.left = "0px";
		divhead.style.top = "0px";
		divhead.style.position = "absolute";
		divhead.className = "header";
		divhead.innerHTML = "";
		
		var __buildMenuBar = function(){
			var div0 = document.createElement("div");divhead.append(div0);
			div0.className = "btn-group d-flex";
			div0.style.margin = "5px";
			var span0 = document.createElement("span");div0.append(span0);
			span0.className = "btn";
			span0.innerHTML = "&nbsp;";
			var div1 = document.createElement("div");div0.append(div1);
			div1.className = "btn-group";
			div1.setAttribute("role","group");
			
			var button0 = document.createElement("button");div1.append(button0);
			button0.className = "btn btn-outline-secondary dropdown-toggle";
			button0.id = "btnGroupDrop1";
			button0.style.border = "none";
			button0.setAttribute("data-bs-toggle","dropdown");
			button0.setAttribute("aria-expanded","false");
			button0.innerHTML = "ALANLAR";
			var ul0 = document.createElement("ul");div1.append(ul0);
			ul0.className = "dropdown-menu";
			ul0.setAttribute("aria-labelledby","btnGroupDrop1");
			var list1 = ["ALANLAR", "SATANLAR", "TOPLAM"]; // yönler
			var _yon = "ALANLAR";
			list1.map(function(item){
				var li0 = document.createElement("li");ul0.append(li0);
				var button2 = document.createElement("button");li0.append(button2);
				button2.className = "dropdown-item";
				button2.href = "#";
				button2.innerText = item;
				button2.parametre = item;
				button2.onclick = function(){
					var parametre = this.parametre;
					var symbol = divcontent.SYMBOL;
					button0.innerHTML = parametre;
					_yon = parametre;
					IdealInterFace.SplitageList(symbol, parametre, _periot);
				};
			});
			
			var button1 = document.createElement("button");div1.append(button1);
			button1.className = "btn btn-outline-secondary dropdown-toggle";
			button1.id = "btnGroupDrop1";
			button1.style.border = "none";
			button1.setAttribute("data-bs-toggle","dropdown");
			button1.setAttribute("aria-expanded","false");
			button1.innerHTML = "10";
			var ul1 = document.createElement("ul");div1.append(ul1);
			ul1.className = "dropdown-menu";
			ul1.setAttribute("aria-labelledby","btnGroupDrop1");
			var list2 = ["1","2","3","4","5","10"]; // periot
			var _periot = "10";
			list2.map(function(item){
				var li0 = document.createElement("li");ul1.append(li0);
				var button2 = document.createElement("button");li0.append(button2);
				button2.className = "dropdown-item";
				button2.href = "#";
				button2.innerText = item;
				button2.parametre = item;
				button2.onclick = function(){
					var parametre = this.parametre;
					var symbol = divcontent.SYMBOL;
					button1.innerHTML = parametre;
					_periot = parametre;
					IdealInterFace.SplitageList(symbol, _yon, parametre);
				};
			});
		};
		__buildMenuBar();
		
		divcontent.style.width = "100%";
		divcontent.style.height = "calc(100% - " + headHeight + ")";
		divcontent.style.left = "0px";
		divcontent.style.top = "" + headHeight + "";
		divcontent.style.position = "absolute";
		
		divcontent.className = "rootsystem";
	},
	ProfitageGrid:{
		animateRows: true,
		columnDefs:[
			{
				field:"ID",
				sort:"asc",
				hide:true,
			},
			{field:"Holder", headerName:"Kurum"},
			{field:"NetLot", headerName:"Net"},
			{
				field:"Percent",
				headerName:"%",
				valueFormatter:function(params){
					return "% " + params.value.toFixed(2);
				},
			},
			{field:"Cost", headerName:"Maaliyet",type:"PriceTypeFormat"},
		],
		columnTypes:{
			PriceTypeFormat:{
				valueFormatter:function(params){
					var s = "" +  Number(Number(params.value).toPrecision(7)).toFixed(4) + "";
					if(Number(s))return s.replace(".",",");
					return "";
				},
			},
		},
		defaultColDef:{
			minWidth: 50,
			editable:false,
			sortable:false,
			//flex:1,
			filter:false,
			resizable:true,
		},
		//animateRows:true,
		//suppressAggFuncInHeader:true,
		getRowNodeId:function(data){return data.ID;},
		/*onGridReady:function(params){
			params.api.sizeColumnsToFit();
		},*/
	}
};
SplitageListWindow.Windows = {};
SplitageListWindow.prototype.Serialize = function(){
	var elePos = this.WIN.GetPosition();
	var eleSize = this.WIN.GetSize();
	var xcode = "(function(){";
	xcode += "var _=IdealInterFace.SplitageList(\"" + this.Symbol + "\");";
	xcode += "setTimeout(function(){"
	xcode += 	"_.WIN.SetPosition(" + elePos.x + "," + elePos.y + ");";
	xcode += 	"_.WIN.SetSize(" + eleSize.w + "," + eleSize.h + ");";
	xcode += "},1);";
	xcode += "})();";;
	return xcode;
};
SplitageListWindow.Serialize = function(){
	var xcode = "(function(){";
	//xcode += "SplitageListWindow.Config.=" + SplitageListWindow.Config. + ";";
	for(var key in SplitageListWindow.Windows){
		xcode += SplitageListWindow.Windows[key].Serialize();
	}
	xcode += "})();";
	return xcode;
};
SplitageListWindow.Deserialize = function(xcode){
	if(typeof(xcode)=="string")setTimeout(function(){eval(xcode)},1);
	else if(typeof(xcode)=="function")setTimeout(xcode,1);
};
SplitageListWindow.Reset = function(){
	for(var key in SplitageListWindow.Windows){
		SplitageListWindow.Windows[key].Close();
	}
};
SplitageListWindow.prototype.Close = function(){
	//SplitageListWindow.Windows[this.ID].WIN.Close();
	delete SplitageListWindow.Windows[this.ID];
};
SplitageListWindow.prototype.Initialize = function(){
	/*this.TableDerinlik.gridOptions.api.setRowData(Array.from({length:25},function(item,index){
		return {
			ID:index,
			Active:"",
		}
	}));*/
	this.WIN.Open();
	this.WIN.SetSize(400,660);
	var div = this.WIN.GetContent().children(".rootsystem")[0];
	div.SYMBOL = this.Symbol;
	this.panelayout = new GoldenLayout({
		resizeWithContainerAutomatically:true,
		settings:{
			hasHeaders:false,
			constrainDragToContainer:false,
			reorderEnabled:false,
			selectionEnabled:false,
			popoutWholeStack:false,
			blockedPopoutsThrowError:false,
			closePopoutsOnUnload:false,
			showPopoutIcon:false,
			showMaximiseIcon:false,
			showCloseIcon:false,
			selectionEnabled:true,
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
				type:"column",
				content:[{
					type:"component",
					isClosable:false,
					id:"column0",
					//cssClass:"",
					componentName:"RComponent",
				}],
			}],
		}]
	},div);
	this.panelayout.registerComponent("RComponent",function(container,state){
		//container.getElement().append($(document.getElementById(state.text)));
	});
	this.panelayout.init();
	var div_splitagelist = $(this.panelayout.root.contentItems[0].contentItems[0].contentItems[0].element[0]).find(".lm_content")[0];
	
	div_splitagelist.className = "ag-theme-balham-dark";
	
	var THAT = this;
	this.panelayout.on("stateChanged",function(){
		THAT.panelayout.updateSize("100%","100%");
	});
	
	this.SplitageTable = new agGrid.Grid(div_splitagelist,Object.assign({
		//
	},SplitageListWindow.Config.ProfitageGrid));
	this.SplitageTable.gridOptions.api.setRowData([]);
	this.SplitageTable.gridOptions.api.sizeColumnsToFit();
};
ATA.Loops.push(function(){
	var thisTime = (new Date()).getTime();
	var PivotTime = thisTime % SplitageListWindow.Config.LoopTime;
	var lastPivotTime = SplitageListWindow.Config.LastActivite % SplitageListWindow.Config.LoopTime;
	if(PivotTime < lastPivotTime){
		for(var key in SplitageListWindow.Windows){
			IdealInterFace.SplitageList(SplitageListWindow.Windows[key].Symbol);
		}
	}
	SplitageListWindow.Config.LastActivite = thisTime;
});

ATA.Setups.push(function(){ // static area and first loads
	ATA.Windows = {};
	
	ATA.Windows.News = new IdealWindow("Haber Detay");
	ATA.Windows.News.SetTitle("Haber Detay");
	ATA.Windows.News.SetSize(650,500);
	ATA.Windows.News.GetContent().css({"overflow-x":"scroll"});
	//$(ATA.Windows.News.Div).find(".Close").hide();
	
	ATA.Windows.NewsList = new IdealWindow("Haber");
	ATA.Windows.NewsList.GetContent()[0].className = "ag-theme-balham-dark Content";
	ATA.Windows.NewsList.Open();
	ATA.Windows.NewsList.SetTitle("Haberler");
	ATA.Windows.NewsList.SetSize(880,250);
	$(ATA.Windows.NewsList.Div).find(".Close").hide();
	
	ATA.NewsTable = new agGrid.Grid(ATA.Windows.NewsList.GetContent()[0],{ // news table
		//popupParent: document.body,
		columnDefs:[
			{
				field:"DateStr",
				headerName:"Tarih",
				width:50,
				comparator:function(valueA, valueB, nodeA, nodeB, isInverted){
					return ((new Date(valueA)).getTime() > (new Date(valueB)).getTime()) ? 1 : -1;
				},
				sort:'desc'
			},
			{
				field:"Header",
				headerName:"Başlık",
			},
			{field:"NewsID",hide:true},
			{field:"NewsNo",hide:true},
			{field:"NewsContent",hide:true},
		],
		defaultColDef:{
			minWidth: 50,
			editable:false,
			sortable:true,
			//flex:1,
			filter:true,
			resizable:true
		},
		animateRows:true,
		suppressAggFuncInHeader:true,
		getRowNodeId:function(data){return data.NewsID;},
		onCellClicked:function(param){
			IdealInterFace.GetNewsDetail(param.data.NewsID, param.data.DateStr, param.data.Header);
		},
		onGridReady:function(params){
			params.api.sizeColumnsToFit();
		},
	});
	ATA.NewsTable.gridOptions.api.setRowData([]);
	
	ATA.Windows.SuperficialAnalysis = new IdealWindow("Yüzeysel Analiz");
	ATA.Windows.SuperficialAnalysis.Open();
	ATA.Windows.SuperficialAnalysis.SetTitle("Yüzeysel Analiz");
	ATA.Windows.SuperficialAnalysis.SetSize(450,700);
	ATA.Windows.SuperficialAnalysis.GetContent().append($("#superficial_analysis"));
	ATA.Windows.SuperficialAnalysis.GetContent().css({"overflow-x":"scroll"});
	$(ATA.Windows.SuperficialAnalysis.Div).find(".Close").hide();
	
	ATA.Windows.Trade = new IdealWindow("Trade");
	ATA.Windows.Trade.Close();
	ATA.Windows.Trade.SetTitle("Al - Sat");
	ATA.Windows.Trade.SetSize(450,700);
	ATA.Windows.Trade.GetContent().append($("#instrumenttrade"));
	ATA.Windows.Trade.GetContent().css({"overflow-x":"scroll"});
	//$(ATA.Windows.Trade.Div).find(".Close").hide();
	
	ATA.SuperficialAnalysisTable = new agGrid.Grid(document.all.superficial_analysis_table,{ // superficial analysis table
		isExternalFilterPresent:function(){
			return true;
		},
		doesExternalFilterPass:function(rowNode){
			return rowNode.data.Content != "" && rowNode.data.ID != "";
		},
		columnDefs:[
			{
				field:"ID",
				hide:true,
			},
			{
				field:"Subject",
				headerName:"",
			},
			{
				field:"Content",
				headerName:"",
			},
		],
		defaultColDef:{
			minWidth: 50,
			editable:false,
			sortable:false,
			//flex:1,
			filter:true,
			resizable:true
		},
		animateRows:true,
		suppressAggFuncInHeader:true,
		getRowNodeId:function(data){return data.ID},
		onCellClicked:function(param){
			
		},
		onGridReady:function(params){
			params.api.sizeColumnsToFit();
		},
	});
	ATA.SuperficialAnalysisTable.gridOptions.api.setRowData([]);
	
	ATA.Windows.EconomicCalendar = new IdealWindow("Yüzeysel Analiz");
	ATA.Windows.EconomicCalendar.Open();
	ATA.Windows.EconomicCalendar.SetTitle("Ekonomik Takvim");
	ATA.Windows.EconomicCalendar.SetSize(880,250);
	ATA.Windows.EconomicCalendar.GetContent().css({"overflow-x":"scroll"});
	ATA.Windows.EconomicCalendar.GetContent()[0].className = "ag-theme-balham-dark Content";
	$(ATA.Windows.EconomicCalendar.Div).find(".Close").hide();
	
	ATA.CalendarTable = new agGrid.Grid(ATA.Windows.EconomicCalendar.GetContent()[0],{ // calendar table
		columnDefs:[
			{
				field:"Date",
				headerName:"Tarih",
			},
			{
				field:"Title",
				headerName:"Başlık",
			},
			{
				field:"Country",
				headerName:"Ülke",
			},
			{
				field:"Expected",
				headerName:"Beklenen",
			},
			{
				field:"Previous",
				headerName:"Önceki",
			},
			{
				field:"Important",
				headerName:"Önem",
			},
			{
				field:"Age",
				headerName:"Dönem",
			},
			{field:"ID",sort:'desc',hide:true}
		],
		defaultColDef:{
			//minWidth:50,
			editable:false,
			sortable:true,
			flex:1,
			filter:true,
			resizable:true
		},
		animateRows:true,
		suppressAggFuncInHeader:true,
		getRowNodeId:function(data){return data.ID;},
		onCellClicked:function(param){
			
		},
		onGridReady:function(params){
			params.api.sizeColumnsToFit();
		},
	});
	
	ATA.Windows.Portfolio = (function(){
		var xobj = {};
		xobj.Div = document.all.portfolio;
		xobj.Open = function(){
			var divpos = $(this.Div).position();
			
			var divX = Number(divpos.left.toFixed(0));
			var divY = Number(divpos.top.toFixed(0));
			var divW = Number($(this.Div).width().toFixed(0));
			var divH = Number($(this.Div).height().toFixed(0));
			
			var conpos = $(IdealWindow.Container).position();
			
			var conX = Number(conpos.left.toFixed(0));
			var conY = Number(conpos.top.toFixed(0));
			var conW = $(IdealWindow.Container).width();
			var conH = $(IdealWindow.Container).height();
			
			var newH = conH / 2;
			var newX = (conW - divW) / 2;
			var newY = $(window).height() - (conY + conH);
			
			$(this.Div).css({
				left:newX,
				bottom:newY,
				//top:newY,
				//width:,
				height:0,
				display:"block",
			});
			$(this.Div).animate({
				height:newH,
			},200);
		};
		xobj.Close = function(){
			$(this.Div).animate({
				height:0,
			}, 200, function(){
				$(xobj.Div).css({
					display:"none",
				});
			});
		};
		xobj.Toggle = function(){
			if($(this.Div).is(":visible"))this.Close();
			else this.Open();
		};
		return xobj;
	})();
	
	ATA.CalendarTable.gridOptions.api.setRowData([]);
	ATA.Windows.Serialize = function(){
		var elePos;
		var eleSize;
		
		var xcode = "";
		xcode += "setTimeout(function(){";
		
		elePos = ATA.Windows.NewsList.GetPosition(); // News Window
		eleSize = ATA.Windows.NewsList.GetSize();
		xcode += "ATA.Windows.NewsList.SetPosition(" + elePos.x + "," + elePos.y + ");";
		xcode += "ATA.Windows.NewsList.SetSize(" + eleSize.w + "," + eleSize.h + ");";
		
		elePos = ATA.Windows.SuperficialAnalysis.GetPosition(); // SuperficialAnalysis Window
		eleSize = ATA.Windows.SuperficialAnalysis.GetSize();
		xcode += "ATA.Windows.SuperficialAnalysis.SetPosition(" + elePos.x + "," + elePos.y + ");";
		xcode += "ATA.Windows.SuperficialAnalysis.SetSize(" + eleSize.w + "," + eleSize.h + ");";
		
		elePos = ATA.Windows.EconomicCalendar.GetPosition(); // EconomicCalendar Window
		eleSize = ATA.Windows.EconomicCalendar.GetSize();
		xcode += "ATA.Windows.EconomicCalendar.SetPosition(" + elePos.x + "," + elePos.y + ");";
		xcode += "ATA.Windows.EconomicCalendar.SetSize(" + eleSize.w + "," + eleSize.h + ");";
		
		xcode += "},1);";
		return xcode;
	};
	setTimeout(function(){
		IdealInterFace.Setup();
	},100);
});



























if(true){




var IdealWindow = function(title, opts){
	this.ID = "win_" + generate_ID();
	this.Title = "" + title;
	this.Div = document.createElement("div");
	document.all.idealWindows.append(this.Div);
	this.Div.style.width = "400px";
	this.Div.style.height = "250px";
	this.Div.style.left = "150px";
	this.Div.style.top = "150px";
	this.Div.style.display = "none";
	this.Div.className = "idealwindow";
	this.isMaximized = false;
	//this.Div.innerHTML = "eşrkjhgroeuı";
	IdealWindow.Config.GenerateHTML(this.Div);
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
	IdealWindow.Windows[this.ID] = this;
	
};
IdealWindow.Config = {
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
IdealWindow.Windows = {};
IdealWindow.ActiveWindow = false;
IdealWindow.Action = false;
IdealWindow.Container = false;
IdealWindow.GetPinnablePoints = function(){
	var arr = [];
	var conPos = $(IdealWindow.Container).position();
	var conW = $(IdealWindow.Container).width();
	var conH = $(IdealWindow.Container).height();
	var conX = conPos.left;
	var conY = conPos.top;
	arr.push([conX + conW, conY + conH, conX, conY, ""]); // pinned to container
	for(var key in IdealWindow.Windows){
		var win = IdealWindow.Windows[key];
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
IdealWindow.LastZIndex = 15000;
IdealWindow.prototype.Focus  = function(){
	this.Div.style.zIndex = ++IdealWindow.LastZIndex;
	this.OnFocus();
};
IdealWindow.prototype.Initialize = function(){
	var THAT = this;
	$(this.Div).find(".Title").mousedown(function(event){
		var elePos = THAT.GetPosition();
		var eleSize = THAT.GetSize();
		THAT.__R = {};
		THAT.__R.__X = Number(event.pageX) - Number(elePos.x);
		THAT.__R.__Y = Number(event.pageY) - Number(elePos.y);
		THAT.__R.__W = eleSize.w;
		THAT.__R.__H = eleSize.h;
		IdealWindow.ActiveWindow = THAT;
		IdealWindow.Action = "MOVE";
		IdealWindow.ContentAccess(false);
		THAT.Focus();
		//event.preventDefault();
	}).mouseup(function(event){
		IdealWindow.Action = false;
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
			IdealWindow.ActiveWindow = THAT;
			IdealWindow.Action = "RESIZE";
			IdealWindow.ContentAccess(false);
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
IdealWindow.prototype.ContentAccess = function(statu=true){
	if(statu)$(this.Div).find(".Lock").hide();
	else $(this.Div).find(".Lock").show();
};
IdealWindow.ContentAccess = function(statu=true){
	for(var key in IdealWindow.Windows)IdealWindow.Windows[key].ContentAccess(statu);
};
IdealWindow.prototype.Close = function(){
	this.Div.style.display = "none";
	delete IdealWindow.Windows[this.ID];
	this.OnClose();
	return;
	this.Div.remove();
};
IdealWindow.prototype.Hide = function(){
	this.Div.style.display = "none";
};
IdealWindow.prototype.Show = function(){
	this.Open();
};
IdealWindow.prototype.Restore = function(){
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
IdealWindow.prototype.Maximize = function(){
	var eleSize = this.GetSize();
	var elePos = this.GetPosition();
	this.ResoreData = {};
	this.ResoreData.X = elePos.x;
	this.ResoreData.Y = elePos.y;
	this.ResoreData.W = eleSize.w;
	this.ResoreData.H = eleSize.h;
	var conPos = $(IdealWindow.Container).position();
	var newW = $(IdealWindow.Container).width();
	var newH = $(IdealWindow.Container).height();
	var newX = conPos.left;
	var newY = conPos.top;
	this.SetSize(newW, newH);
	this.SetPosition(newX, newY);
	this.isMaximized = true;
	$(this.Div).find(".Maximize").hide();
	$(this.Div).find(".Restore").show();
};
IdealWindow.prototype.Minimize = function(){
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
IdealWindow.prototype.Open = function(){
	this.Div.style.display = "";
	this.Focus();
};
IdealWindow.prototype.GetContent = function(){
	return $(this.Div).find(".Content");
};
IdealWindow.prototype.SetTitle = function(title){
	$(this.Div).find(".Title").html(title);
};
IdealWindow.prototype.GetSize = function(){
	return {
		w:Number($(this.Div).width().toFixed(0)),
		h:Number($(this.Div).height().toFixed(0)),
	};
};
IdealWindow.prototype.SetSize = function(w,h){
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
IdealWindow.prototype.GetPosition = function(){
	var pos = $(this.Div).position();
	return {
		x:Number(pos.left.toFixed(0)),
		y:Number(pos.top.toFixed(0)),
	};
};
IdealWindow.prototype.SetPosition = function(x,y){
	if(this.isMaximized)return;
	if(!this.Options.Movable)return;
	var __s = {};
	if(typeof(x)=="number")__s.left = x;
	if(typeof(y)=="number")__s.top = y;
	var eleSize = this.GetSize();
	var conPos = $(IdealWindow.Container).position();
	var conW = $(IdealWindow.Container).width();
	var conH = $(IdealWindow.Container).height();
	var conX = conPos.left;
	var conY = conPos.top;
	if((conW + conX) < (eleSize.w + __s.left)) __s.left = conW + conX - eleSize.w;
	if((conH + conY) < (eleSize.h + __s.top)) __s.top = conH + conY - eleSize.h;
	if(__s.left < conX)__s.left = conX;
	if(__s.top < conY)__s.top = conY;
	$(this.Div).css(__s);
	this.OnMove();
};
IdealWindow.Setup = function(){
	IdealWindow.Config.isReady = true;
	IdealWindow.Container = document.all.pageLayout;
	var documentmove = function(event){
		// event.pageX, event.pageY;
		//THAT.
		if(IdealWindow.ActiveWindow)switch((""+IdealWindow.Action).toUpperCase()){
			default:
			break;
			case "MOVE":
				var win = IdealWindow.ActiveWindow; // IdealWindow.Windows[IdealWindow.ActiveWindow ID];
				var PinnablePoints = IdealWindow.GetPinnablePoints();
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
				var win = IdealWindow.ActiveWindow;// IdealWindow.Windows[IdealWindow.ActiveWindow ID];
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
		IdealWindow.Action = false;
		IdealWindow.ActiveWindow = false;
		IdealWindow.ContentAccess(true);
	};
	$(document.body).on("mousemove", documentmove)
	$(document.body).on("mouseup", documentmouseup);
	$(document.body).on("focusout", documentmouseup);
	
	$(window).resize(function(){
		for(var key in IdealWindow.Windows){
			var win = IdealWindow.Windows[key];
			var elePos = win.GetPosition();
			var eleSize = win.GetSize();
			win.SetPosition(elePos.x, elePos.y);
			win.SetSize(eleSize.w, eleSize.h);
		}
	});
};
ATA.Setups.push(function(){
	IdealWindow.Setup();
});




}