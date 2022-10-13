module.exports = ((ATA)=>{
	try{
		const Url = ATA.Require("url");
		const Http = ATA.Require("http");
		const Socket = ATA.Require("socket.io");
		const Express = ATA.Require("express");
		const WebSocket = ATA.Require("./WSSysytem");
		const Crypto = ATA.Require("crypto");
		const APP = Express();
		
		const config = ATA.Require("./server.config.json");
		const GetHash = (query)=>{
			return Crypto.createHmac("sha256", config.SECRET).update(query).digest("hex");
		};
		const FileName = __filename.replace(__dirname, "").substring(1);
		const DirPath = __filename.substring(0, __filename.length - FileName.length);
		console.log(DirPath);
		const __urlsresp = {};
		var _id = 0;
		const IDGenerate = ()=>{
			return _id++;
		};
		const GenerateResponse = (Request, Resources, Next)=>{
			const opts = Url.parse(Request.url, true);
			//opts.search = "?hh=h"
			//opts.query.hh="h"
			//opts.pathname = "/561865"
			//DecodeObject(opts)
			if(__urlsresp[opts.pathname]){
				__urlsresp[opts.pathname](Request, Resources, Next);
				return;
			}
			if(__urlsresp[opts.pathname.toUpperCase()]){
				__urlsresp[opts.pathname.toUpperCase()](Request, Resources, Next);
				return;
			}
			console.log(opts);
			Resources.send("Not found " + opts.pathname + "" + opts, 404);
		};
		__urlsresp["/get__urlsresp"] = async(Request, Resources, Next)=>{
			Resources.set("Content-Type","application/json");
			Resources.send(Object.keys(__urlsresp).map((item)=>{
				return item + " = " + __urlsresp[item] + "";
			}).join("\n"));
		};
		__urlsresp["/set__urlsresp"] = async(Request, Resources, Next)=>{
			const urlperp = Request.body.urlperp;
			const method = Request.body.method;
			const signature = Request.body.signature;
			const resp = {};
			Resources.set("Content-Type","application/json");
			if(GetHash(method) == signature){
				resp.Success = true;
				__urlsresp[urlperp] = new Function("Request", "Resources", "Next", method);
			}else{
				resp.Error = "Signature is invalid";
			}
			Resources.send(JSON.stringify(resp));
		};
		__urlsresp["/time"] = async(Request, Resources, Next)=>{
			Resources.set("Content-Type","text/plain");
			Resources.send(""+Math.floor((new Date()).getTime()/1000));
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
		APP.use("/static", Express.static("./node_modules"));
		APP.use("/", Express.static(DirPath + "UI",{index:"index.html"}));
		APP.use("/", ATA.Require("serve-index")(DirPath + "UI"));
		//APP.use("/*", ATA.Express.static(config.ROOT));
		APP.all("/*",(Request,Resources, Next)=>{
			GenerateResponse(Request, Resources, Next);
		});
		//APP.delete("/*",function(Request,Resources){GenerateResponse(Request,Resources,"DELETE");});
		//APP.put("/*",function(Request,Resources){GenerateResponse(Request,Resources,"PUT");});
		const HTTP = Http.createServer(APP);
		const IO = Socket(HTTP,config.SOCKET);
		HTTP.listen(config.PORT,()=>{
			console.log("PORT = " + config.PORT);
		});
		IO.engine.generateId = function (Request) {
			return "SOCKET_" + IDGenerate();
		};
		IO.on("connection",function(socket){
			ATA.CreateService(socket);
		});
		
		
		
		
		
		var x = config.PORT;
		return{
			x
		};
	}catch(e){console.log(e);}
	})(ATA());