module.exports = ((ATA)=>{
	const GetSerie = (data, name)=>{
		return data.map((item)=>{
			return item[name];
		});
	};
	const DyDt = (data)=>{
		if(data.length > 1){
			var last = data[0];
			return data.map((item)=>{
				const _old = item;
				last = item;
				return item - _old;
			});
		}
		return[0];
	};
	const Max = (args)=>{
		return Math.max.apply(Math, args);
	};
	const Min = (args)=>{
		return Math.min.apply(Math, args);
	};
	const ProjectorArray = (func, data, len=1)=>{
		const arr = [];
		for(let i=0;i<=data.length - len;i++){
			arr.push(func(data.slice(i, i + len), i, i + len));
		}
		return arr;
	};
	const ScaleSerie = (data)=>{
		const avg = CalculateMean(data);
		return data.map((item)=>{
			return item - avg;
		});
	};
	const CalculateMean = (data)=>{
		return(data.reduce((a, b)=> a + b, 0) / data.length) || 0;
	};
	const CalculateVariance = (data)=>{
		const squareScaled = ScaleSerie(data).map(x=>x*x);
		return CalculateMean(squareScaled);
	};
	const CalculateStandartDeviation = (data)=>{
		return Math.sqrt(CalculateVariance(data));
	};
	const CalculateMedian = (data)=>{
		if(data.length < 1)return 0;
		const half = Math.floor(data.length / 2);
		data = data.sort();
		if(data.length % 2 === 1)return data[half];
		return(data[half] + data[half - 1])/2;
	};
	const CalculateCovariance = (data1, data2)=>{
		const scaleddata1 = ScaleSerie(data1);
		const scaleddata2 = ScaleSerie(data2);
		return scaleddata1.reduce((total, item, index)=>{
			return total + item * scaleddata2[index];
		}, 0) / (scaleddata1.length - 1);
		
	};
	const CalculateCorrelation = (data1, data2)=>{
		let covar12 = CalculateCovariance(data1, data2);
		let stdev1 = CalculateStandartDeviation(data1);
		let stdev2 = CalculateStandartDeviation(data2);
		return covar12 / (stdev1 * stdev2);
	};
	const CalculateLinearRegression = (data)=>{
		let sum_1 = 0;
		let sum_2 = 0;
		let sum_12 = 0;
		let sum_11 = 0;
		data.map((item, index)=>{
			sum_1 += item;
			sum_2 += index;
			sum_12 += item * index;
			sum_11 += item * item;
		});
		let slope = (data.length * sum_12 - sum_1 * sum_2) / (data.length * sum_11 - sum_1 * sum_1);
		let intercept = (sum_2 / data.length) - (slope * sum_1) / data.length;
		return[slope, intercept];
	};
	
	const ZigZag_ = (data)=>{
		const len = 5;
		const HSign = "H";
		const LSign = "L";
		const ESign = "E";
		const arr_ = Array.from({length:len-1}).fill(ESign);
		ProjectorArray((part, indexf, indexl)=>{
			const highest = Max(GetSerie(part, "high"));
			const lowest = Min(GetSerie(part, "low"));
			const highestverify = part.slice(-1)[0].high === highest;
			const lowestverify = part.slice(-1)[0].low === lowest;
			const oldval = arr_[arr_.length - 1];
			if(highestverify && !lowestverify){
				if(oldval == HSign)arr_[arr_.length - 1] = ESign;
				arr_.push(HSign);
			}else if(!highestverify && lowestverify){
				if(oldval == LSign)arr_[arr_.length - 1] = ESign;
				arr_.push(LSign);
			}else{
				arr_.push(ESign);
			}
		}, data, len);
		return arr_;
	};
	const ZigZag = (data)=>{
		const ll_ = ZigZag_(data);
		const rl_ = ZigZag_(data.reverse()).reverse();
		console.log(ll_, rl_);
		return ll_.map((item, index)=>{
			if(item === rl_[index])return item;
			else return "";
		});
	};
	const FormationW = (data)=>{
		const edges = ZigZag_(data);
		let wedge = 0;
		let verifyIndex = -1;
		let edges_ = [-Infinity, Infinity, -Infinity, Infinity, -Infinity]; // H, L, H, L, H
		for(let i=0;i<data.length;i++){
			if((wedge == 1 || wedge == 2) && edges[i] == "L"){ //     /
				if(edges_[1] > data[i].low)edges_[1] = data[i].low;
				wedge = 2;
			}else if((wedge == 2 || wedge == 3) && edges[i] == "H"){ //     \
				if(edges_[2] < data[i].high)edges_[2] = data[i].high;
				wedge = 3;
			}else if((wedge == 3 || wedge == 4) && edges[i] == "L"){ //     /
				if(edges_[3] > data[i].low)edges_[3] = data[i].low;
				wedge = 4;
			}else if((wedge == 4 || wedge == 5) && edges[i] == "H"){ //     \
				if(edges_[4] < data[i].high)edges_[4] = data[i].high;
				wedge = 5;
				verifyIndex = i;
			}else if(wedge == 5 && edges[i] == "L"){
				wedge = 4;
				edges_[0] = edges_[2];
				edges_[1] = edges_[3];
			}else if((wedge == 0 || wedge == 1)/* && edges[i] == "H"*/){
				if(edges_[0] < data[i].high)edges_[0] = data[i].high;
				wedge = 1;
			}
		}
		let verify = edges_[4] >= edges_[2]
			&& edges_[0] >= edges_[2];
		if(verifyIndex > 0 && verify)return verifyIndex;
		return false;
	};
	const FormationM = (data)=>{
		return FormationW(data.map((item)=>{
			return{
				high: -item.low,
				low: -item.high,
			};
		}));
	};
	const TweezerTop = (data)=>{
		return ProjectorArray((part,i,j)=>{
			return(
				part[0].close > part[0].open // g
				&& part[1].close > part[1].open // g
				&& part[2].close > part[2].open // g
				&& part[3].close > part[3].open // g
				&& part[4].close < part[4].open // r
				
				&& part[1].close > part[0].close
				&& part[2].close > part[1].close
				&& part[3].close > part[2].close
				
				&& part[4].close < part[1].close
			);
		}, data, 5);
	};
	const TweezerBottom = (data)=>{
		return ProjectorArray((part,i,j)=>{
			return(
				part[0].close < part[0].open // g
				&& part[1].close < part[1].open // g
				&& part[2].close < part[2].open // g
				&& part[3].close < part[3].open // g
				&& part[4].close > part[4].open // r
				
				&& part[1].close < part[0].close
				&& part[2].close < part[1].close
				&& part[3].close < part[2].close
				
				&& part[4].close > part[1].close
			);
		}, data, 5);
	};
	
	
	ATA.Setups.push(()=>{
	});
	ATA.Loops.push(()=>{
	});
	return{
		CalculateMean,
		CalculateVariance,
		CalculateStandartDeviation,
		CalculateMedian,
		CalculateCovariance,
		CalculateCorrelation,
		CalculateLinearRegression,
		ZigZag,
		FormationW,
		FormationM,
		TweezerTop,
		TweezerBottom,
		
	};
})(ATA());