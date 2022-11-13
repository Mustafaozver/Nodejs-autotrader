if (!ATA) throw new Error("ATA Library is needed for this module.");
((ATA)=>{
	const CandleStickChart = class{
		_canvas = null;
		_ctx = null;
		constructor(obj){
			this._canvas = document.createElement("CANVAS");
			obj.appendChild(this._canvas);
			this._ctx = this._canvas.getContext("2d");
			this._canvas.style.border = "1px solid gray";
			this._canvas.style.backgroundColor = "#000000FF";
		};
	};
	ATA.Loops.push(()=>{
		
	});
})(ATA());