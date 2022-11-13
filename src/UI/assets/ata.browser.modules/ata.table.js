if (!ATA) throw new Error("ATA Library is needed for this module.");
((ATA)=>{
	const Table = class{
		_table = null;
		constructor(area){
			this._table = document.createElement("DIV");
			area.append(this._table);
			this._table.className = "";
			
			const THAT = this;
			setTimeout(()=>{
				THAT.BuildTable();
			},10);
		};
		BuildTable(){
			
		};
	};
	const Cell = class{
		constructor(){
			
		};
	};
	const CellTypes = {
		"Number":0,
	};
})(ATA());