if (!ATA) throw new Error("ATA Library is needed for this module.");
((ATA)=>{
	const headHeight = "1.8em";
	var LastZIndex = 15000;
	var ActiveWindow = null;
	var Action = false;
	var Container = null;
	var Lock = null;
	var stack_index = 0;
	const stack = {};
	const documentmouseup = (event)=>{
		Action = false;
		ActiveWindow = false;
		ContentAccess(true);
	};
	const documentmove = (event)=>{
		if(ActiveWindow)switch((""+Action).toUpperCase()){
			default:
			break;
			case "MOVE":
				var win = ActiveWindow;
				const PinnablePoints = GetPinnablePoints();
				var newX = event.pageX - win.__R.__X;
				var newY = event.pageY - win.__R.__Y;
				const edgeX = newX + win.__R.__W;
				const edgeY = newY + win.__R.__H;
				var mnewX = newX;
				var mnewY = newY;
				win.SetPosition(mnewX, mnewY);return;
				const pixelblank = 5;
				const diffpixel = 15;
				
				for(var i=0;i<PinnablePoints.length;i++){
					const point = PinnablePoints[i]; // x1, y1, x2, y2, winid
					if(point[4] === win.ID)continue;
					
					const x1x1 = Math.abs(point[0] - newX) < diffpixel;
					const x1x2 = Math.abs(point[0] - edgeX) < diffpixel;
					const x2x1 = Math.abs(point[2] - newX) < diffpixel;
					const x2x2 = Math.abs(point[2] - edgeX) < diffpixel;
					
					const y1y1 = Math.abs(point[1] - newY) < diffpixel;
					const y1y2 = Math.abs(point[1] - edgeY) < diffpixel;
					const y2y1 = Math.abs(point[3] - newY) < diffpixel;
					const y2y2 = Math.abs(point[3] - edgeY) < diffpixel;
					
					if(x2x1){ // x2 - x1
						mnewX = point[2] + pixelblank;
						if(y1y1)mnewY = point[1];
						else if(y2y2)mnewY = point[3] - win.__R.__H;
						//break;
					}else if(x1x2){
						mnewX = point[0] - win.__R.__W - pixelblank;
						if(y1y1)mnewY = point[1];
						else if(y2y2)mnewY = point[3] - win.__R.__H;
						//break;
					}
					
					if(y2y1){
						mnewY = point[3] + pixelblank;
						if(x1x1)mnewX = point[0];
						else if(x2x2)mnewX = point[2] - win.__R.__W;
						//break;
					}else if(y1y2){
						mnewY = point[1] - win.__R.__H - pixelblank;
						if(x1x1)mnewX = point[0];
						else if(x2x2)mnewX = point[2] - win.__R.__W;
						//break;
					}
				}
				win.SetPosition(mnewX, mnewY);
				//win.Focus();
			break;
			case "RESIZE":
				var win = ActiveWindow;
				const elePos = win.GetPosition();
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
	const GenerateHTML = (content)=>{
		const divcontent = document.createElement("div");content.__Div.append(divcontent);
		const divedgeright = document.createElement("div");content.__Div.append(divedgeright);
		const divedgeleft = document.createElement("div");content.__Div.append(divedgeleft);
		const divedgebottom = document.createElement("div");content.__Div.append(divedgebottom);
		const divhead = document.createElement("div");content.__Div.append(divhead);
		const divlock = document.createElement("div");content.__Div.append(divlock);
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
		const divactions = document.createElement("div");content.__Div.append(divactions); // content
		divactions.style.height = "" + headHeight + "";
		divactions.className = "Actions";
		const buttonminimize = document.createElement("I"); // minimize
		divactions.append(buttonminimize);
		buttonminimize.className = "Minimize btn btn-outline-light fa fa-window-minimize"; // btn-outline-primary
		const buttonmaximize = document.createElement("I"); // maximize
		divactions.append(buttonmaximize);
		buttonmaximize.className = "Maximize btn btn-outline-light fa fa-window-maximize"; // btn-outline-warning
		const buttonrestore = document.createElement("I"); // restore
		divactions.append(buttonrestore);
		buttonrestore.className = "Restore btn btn-outline-light fa fa-window-restore"; // btn-outline-warning
		buttonrestore.style.display = "none";
		const buttonclose = document.createElement("I"); // close
		divactions.append(buttonclose);
		buttonclose.className = "Close btn btn-outline-danger fa fa-times"; // btn-outline-danger
		$(divactions).children().css({
			width:headHeight,
			height:headHeight,
		});
	};
	const SetListeners = (winobj)=>{
		$(winobj.__Div).find(".Title").mousedown(function(event){
			var elePos = winobj.GetPosition();
			var eleSize = winobj.GetSize();
			winobj.__R = {};
			winobj.__R.__X = Number(event.pageX) - Number(elePos.x);
			winobj.__R.__Y = Number(event.pageY) - Number(elePos.y);
			winobj.__R.__W = eleSize.w;
			winobj.__R.__H = eleSize.h;
			ActiveWindow = winobj;
			Action = "MOVE";
			ContentAccess(false);
			winobj.Focus();
			//event.preventDefault();
		}).mouseup(function(event){
			Action = false;
		});
		$(winobj.__Div).click(function(){
			winobj.Focus();
		}).mousedown(function(event){
			var elePos = winobj.GetPosition();
			var eleSize = winobj.GetSize();
			var edgeX = elePos.x + eleSize.w;
			var edgeY = elePos.y + eleSize.h;
			var wid = 7;
			var moveble = edgeX >= Number(event.pageX) && edgeX < (Number(event.pageX)+20);
			var resizeEX = edgeX >= Number(event.pageX) && edgeX < (Number(event.pageX)+wid);
			var resizeEY = edgeY >= Number(event.pageY) && edgeY < (Number(event.pageY)+wid);
			var resizeFX = elePos.x < Number(event.pageX) && elePos.x > (Number(event.pageX)-wid);
			var resizeFY = elePos.y < Number(event.pageY) && elePos.y > (Number(event.pageY)-wid);
			if (resizeEX || resizeEY || resizeFX || resizeFY){
				ActiveWindow = winobj;
				Action = "RESIZE";
				ContentAccess(false);
				winobj.__R = {};
				if(resizeEX)winobj.__R["REX"] = true; // right edge resize
				if(resizeEY)winobj.__R["REY"] = true; // bottom edge resize
				if(resizeFX)winobj.__R["RFX"] = true; // left edge resize
				if(resizeFY)winobj.__R["RFY"] = true; // top edge resize
				winobj.__R.__EHY = eleSize.h + elePos.y;
				winobj.__R.__EWX = eleSize.w + elePos.x;
			}else if(moveble){
				$(document.body).mousemove();
			}
		});
		if(!winobj.Options.Closable)$(winobj.__Div).find(".Close").hide();
		if(!winobj.Options.Maximizable){
			$(winobj.__Div).find(".Maximize").hide();
			$(winobj.__Div).find(".Restore").hide();
		}
		if(!winobj.Options.Minimizable)$(winobj.__Div).find(".Minimize").hide();
		$(winobj.__Div).find(".Close").on("click", function(){
			//winobj.Hide();return;
			winobj.Close();
			winobj.OnClose();
		});
		$(winobj.__Div).find(".Restore").on("click", function(){
			winobj.Restore();
		});
		$(winobj.__Div).find(".Maximize").on("click", function(){
			winobj.Maximize();
		});
		$(winobj.__Div).find(".Minimize").on("click", function(){
			winobj.Minimize();
		});
	};
	const ContentAccess = (statu)=>{
		// for(var key in stack)stack[key].ContentAccess(statu);
		Lock.style.display = statu ? "none" : "";
	};
	const GetPinnablePoints = ()=>{
		var arr = [];
		var conPos = $(Container).position();
		var conW = $(Container).width();
		var conH = $(Container).height();
		var conX = conPos.left;
		var conY = conPos.top;
		var pixelblank = 0;
		arr.push([conX + conW, conY + conH, conX, conY, ""]); // pinned to container
		for(var key in stack){
			var win = stack[key];
			if(win.__Div.style.display != "")continue;
			var elePos = win.GetPosition();
			var eleSize = win.GetSize();
			var X1 = elePos.x - pixelblank;
			var Y1 = elePos.y - pixelblank;
			var X2 = elePos.x + eleSize.w + pixelblank;
			var Y2 = elePos.y + eleSize.h + pixelblank;
			arr.push([X1, Y1, X2, Y2, win.ID]);
		}
		return arr;
	};
	const Window = class{
		ID = "";
		Title = "";
		__Div = null;
		isMaximized = false;
		OnClose = function(){};
		OnResize = function(){};
		OnMove = function(){};
		OnFocus = function(){};
		Options = {
			Closable	: true,
			Resizable	: true,
			Movable		: true,
			Maximizable	: true,
			Minimizable	: true,
		};
		constructor(title, opts){
			this.ID = "WIN_" + (stack_index++);
			this.__Div = document.createElement("DIV");
			document.getElementById("ata_windows").append(this.__Div);
			this.__Div.style.width = "400px";
			this.__Div.style.height = "250px";
			this.__Div.style.left = "150px";
			this.__Div.style.top = "150px";
			this.__Div.style.display = "none";
			this.__Div.className = "atawindow";
			GenerateHTML(this);
			this.SetTitle(title);
			SetListeners(this);
			this.Options = Object.assign(this.Options, opts);
			stack[this.ID] = this;
		};
		Focus(_zindex){
			const zindex = (_zindex ? _zindex : (LastZIndex)) + 1;
			this.__Div.style.zIndex = zindex;
			LastZIndex = zindex;
			this.OnFocus();
		};
		Open(){
			this.__Div.style.display = "";
			this.Focus();
		};
		Close(){
			this.__Div.style.display = "none";
			delete stack[this.ID];
			this.OnClose();
			return;
			this.__Div.remove();
		};
		Show(){
			this.Open();
		};
		Hide(){
			this.__Div.style.display = "none";
		};
		Toggle(){
			if(this.__Div.style.display == "none"){
				this.Show();
			}else{
				this.Hide();
			}
		};
		Restore(){
			this.isMaximized = false;
			const newW = this.ResoreData.W;
			const newH = this.ResoreData.H;
			const newX = this.ResoreData.X;
			const newY = this.ResoreData.Y;
			this.SetSize(newW, newH);
			this.SetPosition(newX, newY);
			$(this.__Div).find(".Maximize").show();
			$(this.__Div).find(".Restore").hide();
		};
		Maximize(){
			const eleSize = this.GetSize();
			const elePos = this.GetPosition();
			this.ResoreData = {};
			this.ResoreData.X = elePos.x;
			this.ResoreData.Y = elePos.y;
			this.ResoreData.W = eleSize.w;
			this.ResoreData.H = eleSize.h;
			const conPos = $(Container).position();
			const newW = $(Container).width();
			const newH = $(Container).height();
			const newX = conPos.left;
			const newY = conPos.top;
			this.SetSize(newW, newH);
			this.SetPosition(newX, newY);
			this.isMaximized = true;
			$(this.__Div).find(".Maximize").hide();
			$(this.__Div).find(".Restore").show();
		};
		Minimize(){
			const visible = this.GetContent().is(":visible");
		};
		SetTitle(title){
			$(this.__Div).find(".Title").html(title);
		};
		ContentAccess(statu=true){
			if(statu)$(this.__Div).find(".Lock").hide();
			else $(this.__Div).find(".Lock").show();
		};
		GetContent(){
			return $(this.__Div).find(".Content");
		};
		GetSize(){
			return {
				w:Number($(this.__Div).width().toFixed(0)),
				h:Number($(this.__Div).height().toFixed(0)),
			};
		};
		SetSize(w, h){
			if(this.isMaximized)return;
			if(!this.Options.Resizable)return;
			if(typeof(w)=="number"){
				if(w < 100)w = 100;
				$(this.__Div).width(w);
			}
			if(typeof(h)=="number"){
				if(h < 100)h = 100;
				$(this.__Div).height(h);
			}
			this.OnResize();
		};
		GetPosition(){
			var pos = $(this.__Div).position();
			return {
				x:Number(pos.left.toFixed(0)),
				y:Number(pos.top.toFixed(0)),
			};
		};
		SetPosition(x, y){
			if(this.isMaximized)return;
			if(!this.Options.Movable)return;
			const __s = {};
			if(typeof(x)=="number")__s.left = x;
			if(typeof(y)=="number")__s.top = y;
			var eleSize = this.GetSize();
			var conPos = $(Container).position();
			var conW = $(Container).width();
			var conH = $(Container).height();
			var conX = conPos.left;
			var conY = conPos.top;
			if((conW + conX) < (eleSize.w + __s.left)) __s.left = conW + conX - eleSize.w;
			if((conH + conY) < (eleSize.h + __s.top)) __s.top = conH + conY - eleSize.h;
			if(__s.left < conX)__s.left = conX;
			if(__s.top < conY)__s.top = conY;
			$(this.__Div).css(__s);
			this.OnMove();
		};
	};
	ATA.Setups.push(()=>{
		Container = document.getElementById("pageLayout");
		Lock = document.createElement("DIV");
		Lock.className = "bodyLock";
		Lock.style.display = "none";
		Container.append(Lock);
		
		$(document.body).on("mousemove", documentmove)
		$(document.body).on("mouseup", documentmouseup);
		$(document.body).on("focusout", documentmouseup);
		
		$(window).resize(function(){
			for(var key in stack){
				const win = stack[key];
				const elePos = win.GetPosition();
				const eleSize = win.GetSize();
				win.SetPosition(elePos.x, elePos.y);
				win.SetSize(eleSize.w, eleSize.h);
			}
		});
		window.Window = Window;
	});
	ATA.Loops.push(()=>{
		
	});
})(ATA());