module.exports = ((ATA)=>{
	const Url = ATA.Require("url");
	const Http = ATA.Require("http");
	const Socket = ATA.Require("socket.io");
	const Express = ATA.Require("express");
	const Crypto = ATA.Require("crypto");
	const WebSocket = ATA.Require("./WSSysytem");
	const WebSocketService = ATA.Require("./Server.Service");
	
	const APP = Express();
	
	const config = ATA.Require("./server.config.json");
	const GetHash = (query)=>{
		return Crypto.createHmac("sha256", config.SECRET).update(query).digest("hex");
	};
	const FileName = __filename.replace(__dirname, "").substring(1);
	const DirPath = __filename.substring(0, __filename.length - FileName.length);
	const __urlsresp = {};
	var _id = 0;
	const IDGenerate = ()=>{
		return _id++;
	};
	const GenerateResponse = (Request, Resources, Next)=>{
		const funcs = Url.parse(Request.url, true).pathname;
		if(__urlsresp[funcs.toUpperCase()]){
			__urlsresp[funcs.toUpperCase()](Request, Resources, Next);
			return;
		}
		Next();
	};
	const CreateHttpService = (url, func)=>{
		__urlsresp["/" + url] = async(Request, Resources, Next)=>{
			func(Request, Resources, Next);
		};
	};
	const CreateSocketService = (socket)=>{
		socket.emit("0", ATA.ID);
		socket.join("STR0");
		const _socketid = socket.id;
		const verifierFunction = async()=>{
			// if () verify...
			socket.on("JOIN",nameFunction);
			socket.emit("APPROVED");
			socket.join("STR1");
		};
		const nameFunction = (name)=>{
			// name system
			const service = new WebSocketService.Service(name, socket);
			service.OnData = (data)=>{
				ATA.OnMessage(service.ID, data);
			};
			service.Start();
		};
		socket.on("0",verifierFunction);
	};
	const HeartBeat = ()=>{
		IO.to("STR2").emit("DATA",{
			EVAL:"(()=>{ATA.HeartBeat();})()"
		});
	};
	__urlsresp["/GET__URLSRESP"] = async(Request, Resources, Next)=>{
		Resources.set("Content-Type","application/json");
		Resources.send(Object.keys(__urlsresp).map((item)=>{
			return item + " = " + __urlsresp[item] + "";
		}).join("\n"));
	};
	__urlsresp["/SET__URLSRESP"] = async(Request, Resources, Next)=>{
		const urlperp = Request.body.urlperp + "";
		const method = Request.body.method + "";
		const signature = Request.body.signature + "";
		const resp = {};
		Resources.set("Content-Type","application/json");
		if(GetHash(method) == signature){
			const _url = "API/" + urlperp;
			CreateHttpService(_url, new Function("Request", "Resources", "Next", method));
			resp.Success = true;
			resp.Url = _url;
		}else{
			resp.Error = "Signature is invalid";
		}
		Resources.send(JSON.stringify(resp, null, "\t"));
	};
	__urlsresp["/CONFIG.JS"] = async(Request, Resources, Next)=>{
		Resources.set("Content-Type","application/json");
		const variables = JSON.stringify(config, null, "\t");
		const code = "(()=>{window._ATADATA_=" + variables + "})();";
		Resources.send(code);
	};
	__urlsresp["/EVAL"] = async(Request, Resources, Next)=>{
		var opts = Url.parse(Request.url, true);
		var evalue = Request.body.EVAL + "";
		var err = false;
		var resp = false;
		Resources.set("Content-Type","application/json");
		try{
			resp = eval("try{var resp=("+evalue+");}catch(e){resp=e};resp");
		}catch(e){
			resp = "E:" + e.toString();
			err = true;
		}
		try{
			Resources.send(JSON.stringify({
				Error:err,
				Answer:resp,
			}, null, "\t"));
		}catch(e){
			Resources.send(JSON.stringify({
				Error:true,
				Answer:e.toString(),
			}, null, "\t"));
		}
	};
	const bodyparser = ATA.Require("body-parser");
	APP.set("view engine", "ejs");
	APP.set("port",config.PORT);
	APP.use(bodyparser.urlencoded({extended:true}));
	APP.use(bodyparser.json());
	APP.use(ATA.Require("cors")());
	APP.use(ATA.Require("morgan")("tiny")); // logger
	APP.use(ATA.Require("multer")().array());
	APP.use(ATA.Require("cookie-parser")());
	APP.use(ATA.Require("express-session")({secret:config.SECRET}));
	APP.use((Request,Resources, Next)=>{
		Resources.setHeader("Access-Control-Allow-Origin", "http://" + config.DOMAIN + ":" + config.PORT + "/");
		Resources.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
		//Resources.setHeader("Allow", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
		Resources.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
		Resources.setHeader("Access-Control-Allow-Credentials", true);
		Next();
	});
	APP.use((Request,Resources, Next)=>{
		GenerateResponse(Request, Resources, Next);
	});
	APP.use("/static", Express.static("./node_modules"));
	//APP.use("/", Express.static(DirPath + "UI",{index:"index.ejs"}));
	/*
		res.render('./index.ejs', {
	title: 'My site',
	name: 'Kenan Atmaca',
	site: 'kenanatmaca.com',
	data: {bio:'bla bla bla...',twitter: '@uikenan', instagram: '@kenan.jpeg'}
	);
	
	*/
	APP.use("/", Express.static(DirPath + "UI",{index:"index.html"}));
	APP.use("/", ATA.Require("serve-index")(DirPath + "UI"));
	//APP.use("/*", ATA.Express.static(config.ROOT));
	//APP.delete("/*",(Request,Resources)=>{GenerateResponse(Request,Resources,"DELETE");});
	//APP.put("/*",(Request,Resources)=>{GenerateResponse(Request,Resources,"PUT");});
	const HTTP = Http.createServer(APP);
	const IO = Socket(HTTP, config.SOCKET);
	HTTP.listen(config.PORT,()=>{
		console.log("Service web on http://" + config.DOMAIN + ":" + config.PORT + "/");
	});
	IO.engine.generateId = (Request)=>{
		return "SOC_" + IDGenerate();
	};
	IO.on("connection", (socket)=>{
		CreateSocketService(socket);
	});
	ATA.SendMessage = (who, msgtype, data)=>{
		WebSocketService.GetService(who).Send(msgtype, data);
	};
	ATA.OnMessage = (who, data)=>{
		try{
			if(data.EVAL){
				const code = data.EVAL+"";
				var generatedRes = eval("try{var generatedRes=("+code+");}catch(e){generatedRes=e};generatedRes");
				ATA.SendMessage(who, "DATA", {
					ID		: data.ID,
					Answer	: generatedRes,
				});
				return;
			}
		}catch(e){
			console.log("Error => ", e);
		}
	};
	ATA.Execute = (who, func, args)=>{
		ATA.SendMessage(who, "DATA", {
			EVAL:"("+func+")("+JSON.stringify(args, null, "\t")+")",
		});
	};
	ATA.Setups.push(()=>{
		IO.to("STR2").emit("DATA",{EVAL:"(()=>{window.location.reload()})()"});
	});
	ATA.Loops.push(()=>{
		HeartBeat();
	});
	return{
		CreateHttpService,
		CreateSocketService,
	};
})(ATA());