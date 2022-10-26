(()=>{
	var count = 0;
	window.module = class{
		get exports(){
			return window;
		};
		set exports(obj){
			Object.assign(window,{},obj);
		};
	};
	window.require = (url)=>{
		const id = count++;
		const head = document.getElementsByTagName('head').item(0);
		const script = document.createElement('script');
		script.setAttribute("type", "text/javascript");
		script.setAttribute("id", "window_" + id);
		script.setAttribute("src", "./assets/js/" + url + ".js");
		head.appendChild(script);
	};
})();