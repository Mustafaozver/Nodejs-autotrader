if (!ATA) throw new Error("ATA Library is needed for this module.");
((ATA)=>{
	const Table = class{
		_table = null;
		_thead = null;
		_tbody = null;
		Columns = [];
		constructor(area){
			this._table = document.createElement("TABLE");
			area.append(this._table);
			this._table.className = "table table-borderless";
			this._thead = document.createElement("THEAD");
			this._tbody = document.createElement("TBODY");
			this._table.append(this._thead);
			this._table.append(this._tbody);
			const THAT = this;
			setTimeout(()=>{
				THAT.LoadContent();
			},10);
		};
		LoadContent(data){
			this._thead.innerHTML = "";
			this._tbody.innerHTML = "";
			const headtrrow = document.createElement("TR");
			this._thead.append(headtrrow);
			this.Columns.map((item, index)=>{
				const td = document.createElement("TD");
				td.innerText = item.Name;
				headtrrow.append(td);
			});
			const THAT = this;
			data.map((item, index)=>{
				const bodytrrow = document.createElement("TR");
				THAT._tbody.append(bodytrrow);
				THAT.Columns.map((item2, index2)=>{
					const td = document.createElement("TD");
					td.innerHTML = item2.Renderer(item);
					bodytrrow.append(td);
				});
			});
		};
	};
	ATA.Table = Table;
})(ATA());