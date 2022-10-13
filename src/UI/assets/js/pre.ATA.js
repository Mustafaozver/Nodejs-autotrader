(()=>{
	window.module = class{
		get exports(){
			return window;
		};
		set exports(obj){
			Object.assign(window,{},obj);
		};
	};
	window.require = (url)=>{
		const head = document.getElementsByTagName('head').item(0);
		const script = document.createElement('script');
		script.setAttribute("type", "text/javascript");
		script.setAttribute("src", "" + url);
		head.appendChild(script);
	};
})();