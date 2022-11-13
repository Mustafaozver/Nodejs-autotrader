module.exports = ((ATA)=>{
	const sqlite = ATA.Require("sqlite3");
	const dbfile = __dirname + "\\assets\\db0.db3";
	const database = new sqlite.Database(dbfile);
	const cachedatabase = new sqlite.Database(":memory:");
	
	const Query = async(sql, cache=false)=>{
		const promise = new Promise((Resolve, Reject)=>{
			(cache ? cachedatabase : database).all(sql, (err, rows)=>{
				if(err)Reject(err);
				Resolve(rows);
			});
		});
		return await promise;
	};
	const Execute = (sql, cache=false)=>{
		(cache ? cachedatabase : database).exec(sql);
	};
	const CreateRowSQL = (tablename, data)=>{
		const keys = [];
		const values = [];
		for(var key in data){
			keys.push("\"" + key + "\"");
			values.push("\"" + data[key] + "\"");
		}
		const sql = "INSERT INTO " + tablename + " (" + keys.join(",") + ") VALUES (" + values.join(",") + ");";
		return sql
	};
	const ReadRowsSQL = (tablename, where, cond="AND")=>{
		const sql = "SELECT * FROM " + tablename + " WHERE " + Object.keys(where).map((item)=>{
			return " " + item + "=\"" + where[item] + "\" ";
		}).join(cond);
		return sql;
	};
	const UpdateRowsSQL = (tablename, data, where, cond="AND")=>{
		const sql = "UPDATE " + tablename + " SET " + Object.keys(data).map((item)=>{
			return " " + item + "=\"" + data[item] + "\" ";
		}).join(",") + " WHERE " + Object.keys(where).map((item)=>{
			return " " + item + "=\"" + where[item] + "\" ";
		}).join(cond);
		return sql;
	};
	const DeleteRowsSQL = (tablename, where, cond="AND")=>{
		const sql = "DELETE FROM " + tablename + " WHERE " + Object.keys(where).map((item)=>{
			return " " + item + "=\"" + where[item] + "\" ";
		}).join(cond);
		return sql;
	};
	
	var QueueManager_active = false;
	const QueueManager = {
		_queue:[],
		Add:async function(func){
			this._queue.push(func);
			if(!QueueManager_active)this.Run();
		},
		Run:function(){
			const THAT = this;
			setTimeout(async()=>{
				if(THAT._queue.length > 1){
					QueueManager_active = true;
					try{
						THAT.OnSuccess(await THAT._queue.unshift()());
					}catch(e){
						THAT.OnError(e);
					}
					THAT.Run();
				}else{
					QueueManager_active = false;
				}
			},1);
		},
		OnError:(err)=>{},
		OnSuccess:(data)=>{},
	};
	const Row = class{
		ID = null;
		_table = null;
		data = {};
		constructor(data){
			
		};
	};
	const Column = class{
		Name = "";
		Type = "";
		_table = null;
		_properties = [];
		constructor(name){
			this.Name = name;
		};
		Renderer = x=>x;v // db to app
		Adapter = x=>x; // app to db
	};
	const stact_table = {};
	var index_table = 0;
	const Table = class{
		Name = "";
		_columns = {};
		_cache = false;
		_standartdbforata = false;
		constructor(name, cache=false){
			this.ID = "TBL_" + (index_table++);
			this.Name = name;
			this._cache = cache;
			stact_table[this.ID] = this;
		};
		async CreateRow(data){
			const data_ = {};
			Object.keys(this._columns).map((item)=>{
				if(data[item])data_[item] = data[item];
			});
			for(var key in this._columns){
				if(data[key])data_[key] = this._columns[key].Adapter(data[key]);
			}
			const sql = CreateRowSQL(this.Name, data_);
			return await Query(sql, this._cache);
		};
		async GetRows(where){
			const sql = ReadRowsSQL(this.Name, {...where});
			const rows_ = await Query(sql, this._cache);
			return rows_.map((data)=>{
				return new Row(data);
			});
		};
		async GetRowById(ID){
			const row_ = await this.GetRows({ID});
			if(row_.length != 1)return false;
			return row_[0];
		};
		
	};
	const Index = class{
		constructor(){
			
		};
	};
	const View = class{
		constructor(){
			
		};
	};
	const Trigger = class{
		constructor(){
			
		};
	};
	
	/*
		{ // tables
			"type": "table",
			"name": "Positions",
			"tbl_name": "Positions",
			"rootpage": 2,
			"sql": "CREATE TABLE Positions (ID INTEGER PRIMARY KEY ASC AUTOINCREMENT)"
		}
		{ // columns
			"cid": 0,
			"name": "ID",
			"type": "INTEGER",
			"notnull": 0,
			"dflt_value": null,
			"pk": 1
		}
	*/
	
	const LoadModels = async()=>{
		const AddColumn = (data, table)=>{
			if(data.name == "ID"){ // Column ID Key
				const column = new Column("ID");
				column._table = table;
				table._standartdbforata = true;
				column.Type = data.type;
				column.notnull = data.notnull;
				table._columns[column.Name] = column;
				return;
			}
			const column = new Column(data.name);
			column._table = table;
			column.Type = data.type;
			column.notnull = data.notnull;
			table._columns[column.Name] = column;
		};
		const create_table = async(name, cache=false)=>{
			const table = new Table(name, cache);
			const columns = await Query("SELECT * FROM PRAGMA_TABLE_INFO('" + name + "')");
			columns.map((data)=>{
				AddColumn(data, table);
			});
		};
		const tablesdb = await Query("SELECT distinct * FROM sqlite_master");
		tablesdb.map((item)=>{
			switch(item.type){
				case"table":
					create_table(item.name, false);
				break;
				default:console.log(item);
			}
		});
		
		const tablescache = await Query("SELECT distinct * FROM sqlite_master", true);
		tablescache.map(async(item)=>{
			console.log(item);
			
		});
	};
	
	ATA.Setups.push(()=>{
		LoadModels();
	});
	const GetTables = ()=>{
		return Object.keys(stact_table).map((item)=>{
			return stact_table[item];
		});
	};
	const GetTable = (id)=>{
		return stact_table[id];
	};
	const GetTableByName = (name)=>{
		const table = Object.keys(stact_table).filter((item)=>{
			return stact_table[item].Name == name;
		});
		if(table.length == 1)return stact_table[table[0]];
		return false;
	};
	
	return{
		Query,
		Execute,
		QueueManager,
		GetTables,
		GetTable,
		GetTableByName,
	};
})(ATA());