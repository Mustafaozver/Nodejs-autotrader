module.exports = ((ATA)=>{
	const FS = ATA.Require("fs");
	const DBManager = ATA.Require("./DBManager");
	const sdate = new Date(ATA.StartTime);
	const sdatenum = Math.floor(sdate.getTime() / (1000 * 60 * 60 * 24));
	const colours = {
		reset: "\x1b[0m",
		bright: "\x1b[1m",
		dim: "\x1b[2m",
		underscore: "\x1b[4m",
		blink: "\x1b[5m",
		reverse: "\x1b[7m",
		hidden: "\x1b[8m",
		
		fg: {
			black: "\x1b[30m",
			red: "\x1b[31m",
			green: "\x1b[32m",
			yellow: "\x1b[33m",
			blue: "\x1b[34m",
			magenta: "\x1b[35m",
			cyan: "\x1b[36m",
			white: "\x1b[37m",
			crimson: "\x1b[38m" // Scarlet
		},
		bg: {
			black: "\x1b[40m",
			red: "\x1b[41m",
			green: "\x1b[42m",
			yellow: "\x1b[43m",
			blue: "\x1b[44m",
			magenta: "\x1b[45m",
			cyan: "\x1b[46m",
			white: "\x1b[47m",
			crimson: "\x1b[48m"
		}
	};
	
	const styleCodes = {
		// Reset all styles.
		reset: [0, 0],
		
		// Text styles.
		bold: [1, 22],
		dim: [2, 22],
		italic: [3, 23],
		underline: [4, 24],
		inverse: [7, 27],
		hidden: [8, 28],
		strikethrough: [9, 29],
		
		// Foregound classic colours.
		fgBlack: [30, 39],
		fgRed: [31, 39],
		fgGreen: [32, 39],
		fgYellow: [33, 39],
		fgBlue: [34, 39],
		fgMagenta: [35, 39],
		fgCyan: [36, 39],
		fgWhite: [37, 39],
		fgGray: [90, 39],
		
		// Foreground bright colours.
		fgBrightRed: [91, 39],
		fgBrightGreen: [92, 39],
		fgBrightYellow: [93, 39],
		fgBrightBlue: [94, 39],
		fgBrightMagenta: [95, 39],
		fgBrightCyan: [96, 39],
		fgBrightWhite: [97, 39],
	
		// Background basic colours.
		bgBlack: [40, 49],
		bgRed: [41, 49],
		bgGreen: [42, 49],
		bgYellow: [43, 49],
		bgBlue: [44, 49],
		bgMagenta: [45, 49],
		bgCyan: [46, 49],
		bgWhite: [47, 49],
		bgGray: [100, 49],
		bgGrey: [100, 49],
		
		// Background bright colours.
		bgBrightRed: [101, 49],
		bgBrightGreen: [102, 49],
		bgBrightYellow: [103, 49],
		bgBrightBlue: [104, 49],
		bgBrightMagenta: [105, 49],
		bgBrightCyan: [106, 49],
		bgBrightWhite: [107, 49],
	};
	
	// This object will contain the string representation for all style codes.
	const styles = {};
	
	// Loop over all the style codes and assign them to the `styles` object.
	// 
	// The a `styleCode` in the `styleCodes` object consists of two numbers:
	// Index 0: The opening style code (In HTML this can be the opening <b> tag).
	// Index 1: The closing style code (In HTML this can be the closing </b> tag).
	for (let styleCode of Object.keys(styleCodes)) {
		styles[styleCode] = {
			open: `\x1B[${styleCodes[styleCode][0]}m`,
			close: `\x1B[${styleCodes[styleCode][1]}m`,
		};
	}
	
	
	
	
	
	
	
	
	
	
	
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

	ATA.Console = {
		"V": "1.0.0.0-1",
		"log":function(){},
		"warn":function(){},
		"info":function(){},
		"error":function(){},
	};
	const isDebug = false;
	const SetLogFunction = (name)=>{
		const tempF = console[name];
		console[name] = function(){
			const message = [...arguments];
			AddLog(name, message);
			if(isDebug)tempF.apply(console, message);
			else ATA.Console[name].apply(ATA.Console, message);
		};
	};
	for(var key in ATA.Console)SetLogFunction(key);
	return ATA.Console;
})(ATA());