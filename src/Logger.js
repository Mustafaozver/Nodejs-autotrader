module.exports = ((ATA)=>{
	const FS = ATA.Require("fs");
	const sdate = new Date(ATA.StartTime);
	const sdatenum = Math.floor(sdate.getTime() / (1000 * 60 * 60 * 24));
	
	const GenerateTextFileName = ()=>{
		const ndate = new Date();
		const dayfolder = "./src/UI/reports/alls/" + sdatenum + "";
		FS.existsSync(dayfolder) || FS.mkdirSync(dayfolder);
		const textfilepath = dayfolder + "/" + ndate.toLocaleDateString() + "-" +  ndate.getHours() + ".txt";
		return textfilepath;
	};
	
	const AddLog = (type, message)=>{
		const ndate = new Date();
		var content = "\n" + ndate + " " + type + " => ";
		try{
			content += JSON.stringify(message, null, "\t");
		}catch(e){
			content += "" + message;
		}
		
		FS.writeFile(GenerateTextFileName(), content, { flag: 'a+' }, err => {
			
		});
	};
	
	
	const temp_log = console.log;
	console.log = function(){
		const message = [...arguments];
		AddLog("LOG", message);
		temp_log.apply(console, message);
	};
	
	return true;
})(ATA());