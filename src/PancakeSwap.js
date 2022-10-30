module.exports = ((ATA)=>{
	return true;
	const Web3 = ATA.Require("web3");
	const Solc = ATA.Require("solc");
	const PancakeSwapABI = ATA.Require("./PancakeSwapABI.json");
	const ERC20TokensConfig = ATA.Require("./ERC20TokensConfig.json");
	const config = ATA.Require("./pancakeswap.config.json");
	
	const BSCNetWorkProvider = "https://bsc-dataseed1.ninicoin.io";
	const pancakeSwapRouterAddress = "0x10ed43c718714eb63d5aa57b78b54704e256024e";
	const web3 = new Web3(BSCNetWorkProvider);
	const contract = new web3.eth.Contract(PancakeSwapABI, pancakeSwapRouterAddress);
	
	const GetMyAddress = (n=0)=>{
		return web3.eth.accounts.wallet[n].address;
	};
	const GetETHBalance = async(address)=>{
		if(!address)address = GetMyAddress();
		const balance = await web3.eth.getBalance(address);
		return web3.utils.fromWei(balance, "ether");
	};
	
	ATA.Setups.push(()=>{
		config.Accounts.map((item)=>{
			web3.eth.accounts.wallet.add({
				privateKey: item.privateKey,
			});
		});
		console.log("Addres", GetMyAddress());
		setTimeout(async()=>{
			console.log("Balance", await GetETHBalance());
		},5000);
	});
	ATA.Loops.push(()=>{
		
	});
	
	return true;
})(ATA());