
var baseCanvas = document.getElementById('baseCanvas');
var bc = baseCanvas.getContext('2d');
bc.fillStyle = 'rgb(255,0,0)';
bc.strokeStyle = 'black';
bc.lineWidth = 2;

var travelCanvas = document.getElementById('travelCanvas');
var tc = travelCanvas.getContext('2d');
tc.fillStyle = 'rgba(0,0,0,1)';
tc.strokeStyle = 'rgba(0,0,0,0.5)';
tc.lineWidth = 1;

var finalCanvas = document.getElementById('finalCanvas');
var fc = finalCanvas.getContext('2d');
fc.fillStyle = 'rgba(132,29,29,0.7)';
fc.strokeStyle = 'black';
fc.lineWidth = 1;

var reductionFactor = 0.08;
var negAnchFactor = 0.2;

$('.canvas').click(function(e){
	
});

function relPos(s,run,spc){//gives position of the head of spc relative to s.run
	var e1 = s.nodes[run[0]];
	var e2 = s.nodes[run[1]];
	var p = spc.headPos;
	
	var E1 = [],E2 = [];
	E1[0] = e1[0] + 0.5*spc.span*vDiff(e1,e2)[0]/mod(vDiff(e1,e2));
	E1[1] = e1[1] + 0.5*spc.span*vDiff(e1,e2)[1]/mod(vDiff(e1,e2));
	E2[0] = e2[0] + 0.5*spc.span*vDiff(e2,e1)[0]/mod(vDiff(e2,e1));
	E2[1] = e2[1] + 0.5*spc.span*vDiff(e2,e1)[1]/mod(vDiff(e2,e1));//extending arms
	
	var zone,intr;
	
	d = lineDist(e1,e2,p);//console.log(mod(d),0.5*(run[2]+spc.span));
	if(mod(d) >= 0.5*(run[2]+spc.span)){
		intr = false;
		if(dot(vDiff(p,e1),vDiff(e2,e1)) > 0 && dot(vDiff(p,e2),vDiff(e1,e2)) > 0){
			zone = 3;
		}else if(dot(vDiff(p,e1),vDiff(e2,e1)) <= 0){
			zone = 2;
		}else if(dot(vDiff(p,e2),vDiff(e1,e2)) <= 0){
			zone = 4;
		}
	}else if(mod(d) < 0.5*(run[2]+spc.span) && mod(d) >= 0.5*run[2]){
		if(dot(vDiff(p,e1),vDiff(e2,e1)) > 0 && dot(vDiff(p,e2),vDiff(e1,e2)) > 0){
			intr = true;
			zone = 3;
		}else if(dot(vDiff(p,e1),vDiff(e2,e1)) <= 0){
			zone = 2;
			if(dot(vDiff(p,E1),vDiff(E2,E1)) > 0){
				intr = true;
			}else{
				intr = false;
			}
		}else if(dot(vDiff(p,e2),vDiff(e1,e2)) <= 0){
			zone = 4;
			if(dot(vDiff(p,E2),vDiff(E1,E2)) > 0){
				intr = true;
			}else{
				intr = false;
			}
		}
	}else if(mod(d) == 0){//console.log('boom0');
		if(dot(vDiff(p,e1),vDiff(e2,e1)) >= 0 && dot(vDiff(p,e2),vDiff(e1,e2)) >= 0){
			intr = true;
			zone = 7;
		}else if(dot(vDiff(p,e1),vDiff(e2,e1)) < 0){
			zone = 1;
			if(dot(vDiff(p,E1),vDiff(E2,E1)) > 0){
				intr = true;
			}else{
				intr = false;
			}
		}else if(dot(vDiff(p,e2),vDiff(e1,e2)) < 0){
			zone = 5;
			if(dot(vDiff(p,E2),vDiff(E1,E2)) > 0){
				intr = true;
			}else{
				intr = false;
			}
		}
	}else{//console.log('boom1');
		if(dot(vDiff(p,e1),vDiff(e2,e1)) > 0 && dot(vDiff(p,e2),vDiff(e1,e2)) > 0){
			intr = true;
			zone = 6;
		}else if(dot(vDiff(p,e1),vDiff(e2,e1)) <= 0){
			zone = 1;
			if(dot(vDiff(p,E1),vDiff(E2,E1)) > 0){
				intr = true;
			}else{
				intr = false;
			}
		}else if(dot(vDiff(p,e2),vDiff(e1,e2)) <= 0){
			zone = 5;
			if(dot(vDiff(p,E2),vDiff(E1,E2)) > 0){
				intr = true;
			}else{
				intr = false;
			}
		}
	}
	
	return [zone,intr];
}

function renderCanvas(){//renders all the spaces by looping through the sapces array
	bc.clearRect(0,0,baseCanvas.width,baseCanvas.height);
	tc.clearRect(0,0,travelCanvas.width,travelCanvas.height);
	for(var spn = 0; spn < spaces.length; spn++){
		spaces[spn].draw();
	}
}

function space(name, nodes, runs, color){//constructor for "space" object
	spaces.push(this);
	this.name = name;//this is just a string with the name of the space
	this.nodes = nodes;
	this.runs = runs;//[4,5,50]
	this.color = color;//color to render the room in the viewport
	this.relations = [];
	this.negAnchor = [];//point anchors of this space if any
	
	this.meanSpan = 90;//this is the preferred mean span
	this.span = this.meanSpan;//this is the default or current span
	this.spanFlex = 0.0;//this is the flexibility of span
	
	this.headPos = [];//position of the drawing head
	this.hPos = [];//array of various head Positions while planning and mving around
	this.perm = 0;//this is the permeability of the space
	this.flex = 0;//this is the flexibility of the space
	this.totArea;//this is the area of this space
	
	this.runArea = function(rN){
		var e1 = [],e2 = [];
		e1 = this.nodes[this.runs[rN][0]];
		e2 = this.nodes[this.runs[rN][1]];
		var ln = vDiff(e2,e1);
		var area = mod(ln)*this.runs[rN][2];
		
		return area;
	}
	
	this.area = function(){
		var area = 0;
		for(var l = 0; l < this.runs.length; l++){
			area += this.runArea(l);
		}
		
		return area;
	}
	
	this.areaCheck = function(){
		areaError = 1;//flexibility in area
		if(this.totArea > this.area() && this.totArea-this.area() > areaError){
			return true;
		}else{
			return false;
		}
	}
	
	this.netRel = function(){//returns the sum of all the relation factors of this space with all the runs other spaces
		var netRel = 0;
		for(var s = 0; s < spaces.length; s++){
			if(spaces[s] == this){continue;}
			netRel += spaces[s].runs.length*rel(this,spaces[s]);
		}
		return netRel;
	}
	
	this.draw = function(){
		bc.fillStyle = this.color;
		bc.strokeStyle = this.color;
		var p1,p2 = [];
		for(n = 0; n < this.runs.length; n++){
			p1 = [this.nodes[this.runs[n][0]][0], this.nodes[this.runs[n][0]][1]];
			p2 = [this.nodes[this.runs[n][1]][0], this.nodes[this.runs[n][1]][1]];//console.log(p1,p2);
			
			bc.lineWidth = this.runs[n][2];
			tc.beginPath(); bc.beginPath();
			tc.moveTo(p1[0],p1[1]); bc.moveTo(p1[0],p1[1]);
			tc.lineTo(p2[0],p2[1]); bc.lineTo(p2[0],p2[1]);
			tc.stroke(); bc.stroke();
			tc.closePath(); bc.closePath();
		}
		//console.log(this.name+' drawn');
	}
	
	this.eraseRun = function(rN){//erases the run of index rN from the canvas but still is in the memory
		var e1 = [],e2 = [];
		e1 = this.nodes[this.runs[rN][0]];
		e2 = this.nodes[this.runs[rN][1]];
		var ln = vDiff(e2,e1);
		var d = unitV([ln[1],-ln[0]]);
		
		var E1 = vSum(e1,vPrd(d,0.5*this.runs[rN][2]));
		var E2 = vDiff(e1,vPrd(d,0.5*this.runs[rN][2]));
		var E3 = vSum(E1,ln);
		var E4 = vSum(E2,ln);
		
		bc.translate(E1[0],E1[1]);
		bc.rotate(lineAngle(0,0,ln[0],ln[1]));//console.log(lineAngle(0,0,ln[0],ln[1]));
		bc.clearRect(0,0,mod(ln),this.runs[rN][2]);
		bc.rotate(-lineAngle(0,0,ln[0],ln[1]));
		bc.translate(-E1[0],-E1[1]);
		
		tc.translate(E1[0],E1[1]);
		tc.rotate(lineAngle(0,0,ln[0],ln[1]));//console.log(lineAngle(0,0,ln[0],ln[1]));
		tc.clearRect(0,0,mod(ln),this.runs[rN][2]);
		tc.rotate(-lineAngle(0,0,ln[0],ln[1]));
		tc.translate(-E1[0],-E1[1]);
	}
	
	this.erase = function(){
		for(rN = 0; rN < this.runs.length; rN++){
			this.eraseRun(rN);
		}
	}
	//the next func returns an array of all neighbours sorted closest to farthest
	this.getNbrs = function(){if(this.headPos.length){
		var p = this.headPos;
		var dt = 0;
		var dp = 0;
		var ins;//this is true if the point faces the line
		
		var dn = [];//2d array of all the runs with their distances - kind of
		for(s = 0; s < spaces.length; s++){
			//if(spaces[s] == this){continue;}
			for(l = 0; l < spaces[s].runs.length; l++){
				var e1 = spaces[s].nodes[spaces[s].runs[l][0]];
				var e2 = spaces[s].nodes[spaces[s].runs[l][1]];
				if(dot(vDiff(p,e1),vDiff(e2,e1)) > 0 && dot(vDiff(p,e2),vDiff(e1,e2)) > 0){
					ins = true;
					dt = mod(lineDist(e1,e2,p));
					dn.push([s,l,dt,ins]);
				}else{
					ins = false;
					dt = Math.min(mod(vDiff(p,e1)),mod(vDiff(p,e2)));
					dp = mod(lineDist(e1,e2,p));
					dn.push([s,l,dt,ins,dp]);
				}
			}
			//now we are sorting the dn array
		}
		var temp;
		for(var a = 0; a < dn.length-1; a++){
			for(var b = 0; b < dn.length-1-a; b++){
				if(dn[b][2] > dn[b+1][2]){
					temp = dn[b];
					dn[b] = dn[b+1];
					dn[b+1] = temp;
				}else if(dn[b][2] == dn[b+1][2]){
					if(dn[b][3] == false && dn[b+1][3] == false){
						if(dn[b][4] > dn[b+1][4]){
							temp = dn[b];
							dn[b] = dn[b+1];
							dn[b+1] = temp;
						}
					}else if(dn[b][3] == false && dn[b+1][3] == true){
							temp = dn[b];
							dn[b] = dn[b+1];
							dn[b+1] = temp;
					}
				}
			}
		}
		return dn;
	}else{
		console.log('getNbr failed because headPos unknown');
	}}
	
	this.align = function(){
		var p = this.headPos;
		var nb = this.getNbrs();
		var stp = 2;
		var uSumPrev = [];
		var clearPrev = [];
		gradLoop: for(var itr=0; true; itr++){//console.log(p, uSum);
			var uSum = uSum2(p,this,nb);//console.log(p, uSum);
			/*fc.beginPath();
			fc.moveTo(p[0],p[1]);
			fc.lineTo(p[0]+stp*uSum[0],p[1]+stp*uSum[1]);
			fc.closePath();
			fc.stroke();*/
		
			if(itr > 5000){console.log('Aligning '+this.name+' head failed. More than '+itr+' Iterations required');break;}
			
			if(mod(uSum) == 0){
				//console.log('Smart Break after '+(itr+1)+' at '+p, uSum);
				break gradLoop;
			}
			
			p[0] += stp*uSum[0];
			p[1] += stp*uSum[1];
			//console.log(itr,uSum);
			if(uSumPrev.length >= 12){uSumPrev.shift();}
			uSumPrev.push(uSum);
			
			var clear = headIsClear(p,this.span);
			if(clearPrev.length >= 12){clearPrev.shift();}
			clearPrev.push(clear);
			var uSumSum = [0,0];//sum of all previous 10 uSum vectors
			for(sn=0; sn < uSumPrev.length; sn++){
				uSumSum = vSum(uSumSum,uSumPrev[sn]);
				if(mod(uSumSum) < 0.002 && sn > 0 && clear){//console.log('breaking at '+sn+' of '+itr+' for '+mod(uSumSum));
					break gradLoop;
				}
				if(mod(uSumSum) < 0.002 && clearPrev.every(function(element,index){return (element == false);})){
					break gradLoop;
				}
			}
		}
		
		this.headPos = p;
		//console.log(p);
		//fc.fillStyle = this.color;
		//fc.fillRect(this.headPos[0]-(0.5*this.span), this.headPos[1]-(0.5*this.span),this.span,this.span);
	}
	
	this.addNegAnchor = function(pos){
		var rep = -(negAnchFactor*this.netRel())/(this.negAnchor.length+1);
		this.negAnchor.push([pos,rep]);
		
		for(var a = 0; a < this.negAnchor.length; a++){
			if(this.negAnchor[a][2] != rep){this.negAnchor[a][2] = rep;}
		}
		//markPt(pos,fc);
	}
	
	//this is the local awareness function, similar to getNbrs function but more awesome
	this.locAwr = function(){if(this.headPos.length){//tiny spaces can miss through this...so correct this problem asap
		var p = this.headPos;
		var cr = [];//four corners of the span square around the above p
		var sur = [];//surrounding elements
		
		cr[0] = [p[0]-this.span*0.5,p[1]-this.span*0.5];
		cr[1] = [p[0]+this.span*0.5,p[1]-this.span*0.5];
		cr[2] = [p[0]+this.span*0.5,p[1]+this.span*0.5];
		//cr[3] = [p[0]-this.span*0.5,p[1]+this.span*0.5];
		
		var i = 0;//loop variable - this loop populates the cr array. 
		while(i < cr.length-1){
			if(mod(vDiff(cr[i],cr[i+1])) > minGridSize){
				var a = [(cr[i][0]+cr[i+1][0])/2, (cr[i][1]+cr[i+1][1])/2];//console.log(a);
				cr.splice(i+1,0,a);
			}else{
				i++;
			}
		}
		//console.log('cr array populated to '+cr.length+' elements');
		
		function surExists(newSur){//checks the s and l values of the surrounding runs to see if it is already there in the sur array
			var exists = false;
			for(s = 0; s < sur.length; s++){
				if(sur[s][0] == newSur[0] && sur[s][1] == newSur[1]){
					exists = true;
					break;
				}
			}
			return exists;
		}
		
		for(var c = 0; c < cr.length; c++){
			var top = false, right = false, bottom = false, left = false;
			this.headPos = cr[c];
			var nb = this.getNbrs();
			
			for(var n = 0; n < nb.length; n++){
				var rP = relPos(spaces[nb[n][0]],spaces[nb[n][0]].runs[nb[n][1]],this);//console.log('rP = '+rP);
				if(rP[0]%2 && rP[0] != 7){
					var e1 = spaces[nb[n][0]].nodes[spaces[nb[n][0]].runs[nb[n][1]][0]];
					var e2 = spaces[nb[n][0]].nodes[spaces[nb[n][0]].runs[nb[n][1]][1]];
					if(rP[0] == 3){
						var d = roundOff(unitV(lineDist(e1,e2,cr[c])),3);
					}else if(rP[0] == 1){
						var d = roundOff(unitV(vDiff(vDiff(e1,cr[c]),lineDist(e1,e2,cr[c]))),3);
					}else if(rP[0] ==5){
						var d = roundOff(unitV(vDiff(vDiff(e2,cr[c]),lineDist(e1,e2,cr[c]))),3);
					}
					
					var newSur = [nb[n][0],nb[n][1],d,rP[0]];
					if(d[0] == 0 && d[1] == -1 && !top){
						if(!surExists(newSur)){sur.push(newSur);}
						top = true;
					}else if(d[0] == 1 && d[1] == 0 && !right){
						if(!surExists(newSur)){sur.push(newSur);}
						right = true;
					}else if(d[0] == 0 && d[1] == 1 && !bottom){
						if(!surExists(newSur)){sur.push(newSur);}
						bottom = true;
					}else if(d[0] == -1 && d[1] == 0 && !left){
						if(!surExists(newSur)){sur.push(newSur);}
						left = true;
					}
					
					if(top && right && bottom && left){break;}
				}
			}
		}
		this.headPos = p;//markPt(p,tc)
		//sort the sur array from closest to farthest
		for(s = 0; s < sur.length; s++){
			var e1 = spaces[sur[s][0]].nodes[spaces[sur[s][0]].runs[sur[s][1]][0]];
			var e2 = spaces[sur[s][0]].nodes[spaces[sur[s][0]].runs[sur[s][1]][1]];
			var sp = spaces[sur[s][0]].runs[sur[s][1]][2];
			
			if(sur[s][3] == 3){
				var dst = mod(lineDist(e1,e2,p)) - 0.5*(this.span + sp);
			}else if(sur[s][3] == 1){
				var dst = mod(vDiff(vDiff(e1,p),lineDist(e1,e2,p))) - 0.5*this.span;
			}else if(sur[s][3] == 5){
				var dst = mod(vDiff(vDiff(e2,p),lineDist(e1,e2,p))) - 0.5*this.span;
			}
			
			sur[s].push(dst);
		}
		
		sort2D(sur,4);//because the 4th element is the dst
		return sur;//each element of the sur is of the format [nb[n][0],nb[n][1],rP[0],d,dst]
	}else{
		console.log('locAwr failed because headPos unknown');
	}}
	
	this.updateRel = function(e1,e2,n0,n1,n2){//Call this when a new run is created (b/n e1 and e2) to update the relations
		var ln = vDiff(e2,e1);
		var runAr = mod(ln)*this.span;
		var nR = this.netRel();
		
		for(var s = 0; s < spaces.length; s++){
			if(spaces[s] == this){continue;}
			if(spaces[s] == spaces[n0[0]]||spaces[s] == spaces[n1[0]]||spaces[s] == spaces[n2[0]]){
				var rl = rel(spaces[s],this);
				rl -= reductionFactor*nR*(runAr/this.totArea);//console.log(spaces[s],rl);
				addRel(spaces[s],this,rl);
			}
		}
		
	}
	
	this.travel = function(){
		locA = this.locAwr();//console.log(locA);
		//traversing begins
		var hdPos = this.headPos;
		//each element of the locA array is of the form [s,l,d,zone,dst]
		var n0 = 'none';
		for(var lc = 0; lc < locA.length; lc++){
			if(spaces[locA[lc][0]] != this){
				n0 = locA[lc];
				break;
			}else if(locA[lc+1]){
				if(locA[lc+1][2] <= minGridSize){
					n0 = locA[lc+1];
					break;
				}else{
					n0 = locA[lc];
					break;
				}
			}else{
				n0 = locA[lc];
				break;
			}
		}
		//console.log(n0);
		var d = n0[2];
		var v1 = unitV([-d[1],d[0]]);
		var v2 = unitV([d[1],-d[0]]);
		var n1 = 'none', n2 = 'none';//neighbours in the direction of v1 and v2
		//get the local neighbour on the v1 side
		for(var lc = 0; lc < locA.length; lc++){//loop starts form 1 because the nearest not needed to be checked
			if(cosAng(v1,locA[lc][2]) == 1){
				n1 = locA[lc];
				break;
			}
		}
		//get the local neighbour on the v2 side
		for(var lc = 0; lc < locA.length; lc++){//loop starts form 1 because the nearest not needed to be checked
			if(cosAng(v2,locA[lc][2]) == 1){
				n2 = locA[lc];
				break;
			}
		}
		//console.log(n0,n1,n2);
		if(n1 == 'none'){//there is no neighbour in v1 direction
			var p1 = spaces[n0[0]].nodes[spaces[n0[0]].runs[n0[1]][0]];
			var p2 = spaces[n0[0]].nodes[spaces[n0[0]].runs[n0[1]][1]];
			//markPt(p1,tc);markPt(p2,tc);
			var Dt = lineDist(p1,p2,hdPos);
			if(n0[3] == 1||n0[3] == 5){
				var neibSpan = spaces[n0[0]].runs[n0[1]][2];
				var e1 = vSum(hdPos,vSum(Dt,vPrd(v1,0.5*(neibSpan+this.span))));
			}else{
				if(dot(vDiff(p1,hdPos),v1) >= dot(vDiff(p2,hdPos),v1)){
					var e1 = vSum(vDiff(p1,Dt),vPrd(v1,0.5*this.span));
				}else{
					var e1 = vSum(vDiff(p2,Dt),vPrd(v1,0.5*this.span));
				}
			}
		}else{
			var e1 = vSum(hdPos,vPrd(v1,n1[4]));
		}
		
		if(n2 == 'none'){//there is no neighbour in v2 direction
			var p1 = spaces[n0[0]].nodes[spaces[n0[0]].runs[n0[1]][0]];
			var p2 = spaces[n0[0]].nodes[spaces[n0[0]].runs[n0[1]][1]];
			//markPt(p1,tc);markPt(p2,tc);
			var Dt = lineDist(p1,p2,hdPos);
			if(n0[3] == 1||n0[3] == 5){
				var neibSpan = spaces[n0[0]].runs[n0[1]][2];
				var e2 = vSum(hdPos,vSum(Dt,vPrd(v2,0.5*(neibSpan+this.span))));
			}else{
				if(dot(vDiff(p1,hdPos),v2) >= dot(vDiff(p2,hdPos),v2)){
					var e2 = vSum(vDiff(p1,Dt),vPrd(v2,0.5*this.span));
				}else{
					var e2 = vSum(vDiff(p2,Dt),vPrd(v2,0.5*this.span));
				}
			}
		}else{
			var e2 = vSum(hdPos,vPrd(v2,n2[4]));
		}
		
		var hPos1 = e1;
		var hPos2 = e2;
		
		var e1 = vSum(e1,vPrd(v1,0.5*this.span));//console.log(n2,e2,v2);
		var e2 = vSum(e2,vPrd(v2,0.5*this.span));
		//markPt(e1,fc);markPt(e2,fc);
		//markPt(this.headPos,fc);
		
		//check if the area is exceeding the required and proportionately reducing the e1 and e2
		var ln = vDiff(e1,e2);
		var currentArea = this.area() + (mod(ln)*this.span);
		if(currentArea > this.totArea){
			var exsArea = currentArea - this.totArea;
			var exsRun = exsArea/this.span;console.log
			var run1 = mod(vDiff(e1,hdPos));
			var run2 = mod(vDiff(e2,hdPos));
			//console.log(run1,run2,exsRun);
			if(n1 == 'none' && n2 == 'none'){
				run1 -= exsRun*(run1/mod(ln));
				run2 -= exsRun*(run2/mod(ln));
			}else if(n1 == 'none'){//console.log('- from run1');
				run1 -= exsRun;
			}else if(n2 == 'none' ){//console.log('- from run2');
				run2 -= exsRun;
			}else{
				if(run1 > run2){
					run1 -= exsRun;
				}else{
					run2 -= exsRun;
				}
			}
			e1 = vSum(hdPos,vPrd(unitV(ln),run1));
			e2 = vDiff(hdPos,vPrd(unitV(ln),run2));;
		}else{
			if(this.totArea-currentArea < Math.pow(this.span,2)){
				var remArea = this.totArea - currentArea;
				var remRun = remArea/this.span;
				var run1 = mod(vDiff(e1,hdPos));
				var run2 = mod(vDiff(e2,hdPos));
				if(n1 == 'none' && n2 == 'none'){
					run1 += remRun*(run1/mod(ln));
					run2 += remRun*(run2/mod(ln));
				}else if(n1 == 'none'){
					run1 += remRun;
				}else if(n2 == 'none'){
					run2 += remRun;
				}
				e1 = vSum(hdPos,vPrd(unitV(ln),run1));
				e2 = vDiff(hdPos,vPrd(unitV(ln),run2));;
			}
		}
		//done checking the area
		this.updateRel(e1,e2,n0,n1,n2);
		
		if(!arr2dContains(this.nodes,e1)){
			var num1 = this.nodes.length;
			this.nodes.push(e1);
		}
		if(!arr2dContains(this.nodes,e2)){
			var num2 = this.nodes.length;
			this.nodes.push(e2);
		}
		this.runs.push([num1,num2,this.span]);
		//console.log(mod(vDiff(hPos1,hdPos)),hPos1, mod(vDiff(hPos2,hdPos)),hPos2);
		if(mod(vDiff(hPos1,hdPos)) > 0){this.hPos.unshift(hPos1);}
		if(mod(vDiff(hPos2,hdPos)) > 0){this.hPos.unshift(hPos2);}
		//markPt(hPos1,fc);markPt(hPos2,fc);
		//drawing a square at the final position
		/*markPt(hPos1,fc);markPt(hPos2,fc);
		fc.fillStyle = this.color;
		fc.fillRect(hPos1[0]-(0.5*this.span), hPos1[1]-(0.5*this.span),this.span,this.span);
		fc.fillRect(hPos2[0]-(0.5*this.span), hPos2[1]-(0.5*this.span),this.span,this.span);
		fc.strokeRect(hPos1[0]-(0.5*this.span), hPos1[1]-(0.5*this.span),this.span,this.span);
		fc.strokeRect(hPos2[0]-(0.5*this.span), hPos2[1]-(0.5*this.span),this.span,this.span);*/
		
	}
	
	this.reAlign = function(){
		var p = this.headPos;
		var nb = this.getNbrs();
		var locA = this.locAwr();
		var stp = 2;
		var uSumPrev = [];
		var clearPrev = [];
		gradLoop: for(var itr=0; true; itr++){//console.log(p, uSum);
			var uSum = uSum2(p,this,nb);//console.log(p, uSum);
			/*fc.beginPath();
			fc.moveTo(p[0],p[1]);
			fc.lineTo(p[0]+stp*uSum[0],p[1]+stp*uSum[1]);
			fc.closePath();
			fc.stroke();*/
		
			if(itr > 5000){console.log('Aligning '+this.name+' head failed. More than '+itr+' Iterations required');break;}
			
			if(mod(uSum) == 0){
				//console.log('Smart Break after '+(itr+1)+' at '+p, uSum);
				break gradLoop;
			}
			
			p[0] += stp*uSum[0];
			p[1] += stp*uSum[1];
			//console.log(itr,uSum);
			if(uSumPrev.length >= 12){uSumPrev.shift();}
			uSumPrev.push(uSum);
			
			var clear = headIsClear(p,this.span);
			if(clearPrev.length >= 12){clearPrev.shift();}
			clearPrev.push(clear);
			var uSumSum = [0,0];//sum of all previous 10 uSum vectors
			for(sn=0; sn < uSumPrev.length; sn++){
				uSumSum = vSum(uSumSum,uSumPrev[sn]);
				if(mod(uSumSum) < 0.002 && sn > 0 && clear){//console.log('breaking at '+sn+' of '+itr+' for '+mod(uSumSum));
					break gradLoop;
				}
				if(mod(uSumSum) < 0.002 && clearPrev.every(function(element,index){return (element == false);})){
					break gradLoop;
				}
			}
		}
		
		this.headPos = p;
		//console.log(p);
		//fc.fillStyle = this.color;
		//fc.fillRect(this.headPos[0]-(0.5*this.span), this.headPos[1]-(0.5*this.span),this.span,this.span);
	}
	
	this.critPt = function(){return critPt(this);}
	this.lastCritPt = this.critPt();
	this.posCritPt = function(){return posCritPt(this);}
	this.lastPosCritPt = this.posCritPt();
	this.rel = function(spc){return rel(spc,this);}
	this.addRel = function(spc,rF){addRel(spc,this,rF);}
	this.isClear = function(){return headIsClear(this.headPos,this.span);}
	this.placeHead = function(pos){placeHead(this,pos);}
}

function uSum(xx, yy, spc){
	var vecSum = [0,0];
	var p = [xx, yy];
	var rF;
	for(var s = 0; s < spaces.length; s++){
		if(spc == spaces[s]){
			continue;
		}
		rF = rel(spaces[s],spc);
		for(var l = 0; l < spaces[s].runs.length; l++){
			var e1 = spaces[s].nodes[spaces[s].runs[l][0]];
			var e2 = spaces[s].nodes[spaces[s].runs[l][1]];//two ends of the spaces[s].runs
			var Ln = vDiff(e2,e1);//line Anchor itself
			var d = lineDist(e1,e2,p);//console.log(d);
			var ln1 = vDiff(vDiff(e1,p),d);
			var ln2 = vDiff(vDiff(e2,p),d);
			var r1,r2;//weights of the two portions of the line
			var vC=[0,0];
			
			if(mod(d) != 0){
				r1 = (dot(vDiff(p,e1),vDiff(e2,e1))/mod(Ln))/mod(Ln);
				r2 = (dot(vDiff(p,e2),vDiff(e1,e2))/mod(Ln))/mod(Ln);
				A1 = Math.atan(mod(vDiff(vDiff(e1,p),d))/mod(d));
				A2 = Math.atan(mod(vDiff(vDiff(e2,p),d))/mod(d));
				
				if(mod(ln1) != 0){
					vC[0] += (r1*(1/Math.tan(A1))*Math.log(Math.abs(Math.tan(A1)+(1/Math.cos(A1)))))*(d[0]/mod(d));
					vC[1] += (r1*(1/Math.tan(A1))*Math.log(Math.abs(Math.tan(A1)+(1/Math.cos(A1)))))*(d[1]/mod(d));
					vC[0] += (r1*(1/Math.tan(A1))*((1/Math.cos(A1))-1))*(ln1[0]/mod(ln1));
					vC[1] += (r1*(1/Math.tan(A1))*((1/Math.cos(A1))-1))*(ln1[1]/mod(ln1));
				}
				if(mod(ln2) != 0){
					vC[0] += (r2*(1/Math.tan(A2))*Math.log(Math.abs(Math.tan(A2)+(1/Math.cos(A2)))))*(d[0]/mod(d));
					vC[1] += (r2*(1/Math.tan(A2))*Math.log(Math.abs(Math.tan(A2)+(1/Math.cos(A2)))))*(d[1]/mod(d));
					vC[0] += (r2*(1/Math.tan(A2))*((1/Math.cos(A2))-1))*(ln2[0]/mod(ln2));
					vC[1] += (r2*(1/Math.tan(A2))*((1/Math.cos(A2))-1))*(ln2[1]/mod(ln2));
				}
			}else if(mod(d) == 0){
				vC[0] = ((e1[0]+e2[0])/2)-p[0];
				vC[1] = ((e1[1]+e2[1])/2)-p[1];
			}
			
			if(mod(d) >= 0.5*(spc.span+spaces[s].runs[l][2])){
				vecSum[0] += (rF*vC[0])/mod(vC);
				vecSum[1] += (rF*vC[1])/mod(vC);
			}else{
				var E1=[],E2 = [];
				E1[0] = e1[0]+0.5*spc.span*(vDiff(e1,e2)[0]/mod(vDiff(e1,e2)));
				E1[1] = e1[1]+0.5*spc.span*(vDiff(e1,e2)[1]/mod(vDiff(e1,e2)));
				E2[0] = e2[0]+0.5*spc.span*(vDiff(e2,e1)[0]/mod(vDiff(e2,e1)));
				E2[1] = e2[1]+0.5*spc.span*(vDiff(e2,e1)[1]/mod(vDiff(e2,e1)));
				
				if(dot(vDiff(p,E1),vDiff(E2,E1)) >= 0 && dot(vDiff(p,E2),vDiff(E1,E2)) >= 0){
					if(mod(d) != 0){
						vecSum[0] -= d[0]/mod(d);
						vecSum[1] -= d[1]/mod(d);
					}else{
						//dont change the vecSum at all
					}
				}
			}
		}
	}
	
	for(var a = 0; a < spc.negAnchor.length; a++){
		var vp = unitV(vDiff(spc.negAnchor[a][0],p));
		vecSum[0] += vp[0]*spc.negAnchor[a][1];
		vecSum[1] += vp[1]*spc.negAnchor[a][1];
		//console.log('anchor added');
	}
	return vecSum;
}

function uSumPos(xx, yy, spc){//returns the unit vector Sum but of only the positive relations
	var vecSum = [0,0];
	var p = [xx, yy];
	var rF;
	for(var s = 0; s < spaces.length; s++){
		rF = rel(spaces[s],spc);
		if(spc == spaces[s] || rF < 0){
			continue;
		}
		for(var l = 0; l < spaces[s].runs.length; l++){
			var e1 = spaces[s].nodes[spaces[s].runs[l][0]];
			var e2 = spaces[s].nodes[spaces[s].runs[l][1]];//two ends of the spaces[s].runs
			var Ln = vDiff(e2,e1);//line Anchor itself
			var d = lineDist(e1,e2,p);//console.log(d);
			var ln1 = vDiff(vDiff(e1,p),d);
			var ln2 = vDiff(vDiff(e2,p),d);
			var r1,r2;//weights of the two portions of the line
			var vC=[0,0];
			
			if(mod(d) != 0){
				r1 = (dot(vDiff(p,e1),vDiff(e2,e1))/mod(Ln))/mod(Ln);
				r2 = (dot(vDiff(p,e2),vDiff(e1,e2))/mod(Ln))/mod(Ln);
				A1 = Math.atan(mod(vDiff(vDiff(e1,p),d))/mod(d));
				A2 = Math.atan(mod(vDiff(vDiff(e2,p),d))/mod(d));
				
				if(mod(ln1) != 0){
					vC[0] += (r1*(1/Math.tan(A1))*Math.log(Math.abs(Math.tan(A1)+(1/Math.cos(A1)))))*(d[0]/mod(d));
					vC[1] += (r1*(1/Math.tan(A1))*Math.log(Math.abs(Math.tan(A1)+(1/Math.cos(A1)))))*(d[1]/mod(d));
					vC[0] += (r1*(1/Math.tan(A1))*((1/Math.cos(A1))-1))*(ln1[0]/mod(ln1));
					vC[1] += (r1*(1/Math.tan(A1))*((1/Math.cos(A1))-1))*(ln1[1]/mod(ln1));
				}
				if(mod(ln2) != 0){
					vC[0] += (r2*(1/Math.tan(A2))*Math.log(Math.abs(Math.tan(A2)+(1/Math.cos(A2)))))*(d[0]/mod(d));
					vC[1] += (r2*(1/Math.tan(A2))*Math.log(Math.abs(Math.tan(A2)+(1/Math.cos(A2)))))*(d[1]/mod(d));
					vC[0] += (r2*(1/Math.tan(A2))*((1/Math.cos(A2))-1))*(ln2[0]/mod(ln2));
					vC[1] += (r2*(1/Math.tan(A2))*((1/Math.cos(A2))-1))*(ln2[1]/mod(ln2));
				}
			}else if(mod(d) == 0){
				vC[0] = ((e1[0]+e2[0])/2)-p[0];
				vC[1] = ((e1[1]+e2[1])/2)-p[1];
			}
			
			if(mod(d) >= 0.5*(spc.span+spaces[s].runs[l][2])){
				vecSum[0] += (rF*vC[0])/mod(vC);
				vecSum[1] += (rF*vC[1])/mod(vC);
			}else{
				var E1=[],E2 = [];
				E1[0] = e1[0]+0.5*spc.span*(vDiff(e1,e2)[0]/mod(vDiff(e1,e2)));
				E1[1] = e1[1]+0.5*spc.span*(vDiff(e1,e2)[1]/mod(vDiff(e1,e2)));
				E2[0] = e2[0]+0.5*spc.span*(vDiff(e2,e1)[0]/mod(vDiff(e2,e1)));
				E2[1] = e2[1]+0.5*spc.span*(vDiff(e2,e1)[1]/mod(vDiff(e2,e1)));
				
				if(dot(vDiff(p,E1),vDiff(E2,E1)) >= 0 && dot(vDiff(p,E2),vDiff(E1,E2)) >= 0){
					if(mod(d) != 0){
						vecSum[0] -= d[0]/mod(d);
						vecSum[1] -= d[1]/mod(d);
					}else{
						//dont change the vecSum at all
					}
				}
			}
		}
	}
	
	for(var a = 0; a < spc.negAnchor.length; a++){
		var vp = unitV(vDiff(spc.negAnchor[a][0],p));
		vecSum[0] += vp[0]*spc.negAnchor[a][1];
		vecSum[1] += vp[1]*spc.negAnchor[a][1];
		//console.log('anchor added');
	}
	return vecSum;
}

function uSum2(p,spc,nb){//this is for aligning
	var vecSum = [0,0];
	
	for(var n = 0; n < nb.length; n++){
		var e1 = spaces[nb[n][0]].nodes[spaces[nb[n][0]].runs[nb[n][1]][0]];
		var e2 = spaces[nb[n][0]].nodes[spaces[nb[n][0]].runs[nb[n][1]][1]];
		var ln = vDiff(e1,e2);
		d = lineDist(e1,e2,p);
		
		var rP = relPos(spaces[nb[n][0]],spaces[nb[n][0]].runs[nb[n][1]],spc);
		var zone = rP[0];
		var intr = rP[1];
		var vC = [0,0];

		if(n == 0){
			if(intr){
				if(zone == 1||zone == 2){vC = unitV(vDiff(e1,e2));}
				else if(zone == 3||zone == 6){vC = unitV([-d[0],-d[1]]);}
				else if(zone == 5||zone == 4){vC = unitV(vDiff(e2,e1));}
				else if(zone == 7){
					if(dot([-ln[1],ln[0]],vDiff(spc.lastCritPt,p)) == 0){
						if(dot([-ln[1],ln[0]],vDiff(spc.lastPosCritPt,p)) == 0){
							vC = unitV([-ln[1],ln[0]]);
						}else{
							vC = unitV(vPrd([-ln[1],ln[0]],dot([-ln[1],ln[0]],vDiff(spc.lastPosCritPt,p))));
						}
					}else{
						vC = unitV(vPrd([-ln[1],ln[0]],dot([-ln[1],ln[0]],vDiff(spc.lastCritPt,p))));
					}
				}
			}else{
				if(headIsClear(p,spc.span)){
					if(zone == 1||zone == 2){vC = unitV(vDiff(e2,e1));}
					else if(zone == 3){vC = unitV(d);}
					else if(zone == 4||zone == 5){vC = unitV(vDiff(e1,e2));}
				}
			}
			//console.log(nb[n][1],vC);
		}else{
			if(intr){
				if(zone == 2||zone == 1){vC = unitV(vDiff(e1,e2));}
				else if(zone == 3||zone == 6){vC = unitV([-d[0],-d[1]]);}
				else if(zone == 5||zone == 4){vC = unitV(vDiff(e2,e1));}
				else if(zone == 7){
					if(dot([-ln[1],ln[0]],vDiff(spc.lastCritPt,p)) == 0){
						if(dot([-ln[1],ln[0]],vDiff(spc.lastPosCritPt,p)) == 0){
							vC = unitV([-ln[1],ln[0]]);
						}else{
							vC = unitV(vPrd([-ln[1],ln[0]],dot([-ln[1],ln[0]],vDiff(spc.lastPosCritPt,p))));
						}
					}else{
						vC = unitV(vPrd([-ln[1],ln[0]],dot([-ln[1],ln[0]],vDiff(spc.lastCritPt,p))));
					}
				}
			}
		}
		vecSum = vSum(vecSum,vC);
	}
	//console.log(vecSum);
	return vecSum;
}

function uSumSelf(p,spc){
	
}

function critPt(spc){//calculates the critical point and moves the drawing head to that point
	//this is for measuring the runtime of the function
	//var date = new Date();
	//var t1 = (1000*date.getSeconds())+date.getMilliseconds();
	//the actual operations of the function
	var stp=5;//this is the length of each step
	var rF;
	var x,y,xSum=0,ySum=0;
	var n=0;
		
	for(var s = 0; s < spaces.length; s++){
		if(spaces[s] == spc){
			continue;
		}
		rF = rel(spaces[s],spc);
		for(var r=0; r < spaces[s].runs.length; r++){
			xSum += rF*(spaces[s].nodes[spaces[s].runs[r][0]][0]+spaces[s].nodes[spaces[s].runs[r][1]][0])/2;
			ySum += rF*(spaces[s].nodes[spaces[s].runs[r][0]][1]+spaces[s].nodes[spaces[s].runs[r][1]][1])/2;
				n += rF;
		}
	}
		
	for(var a = 0; a < spc.negAnchor.length; a++){
		xSum += spc.negAnchor[a][1]*spc.negAnchor[a][0][0]/spc.negAnchor.length;
		ySum += spc.negAnchor[a][1]*spc.negAnchor[a][0][1]/spc.negAnchor.length;
		n += spc.negAnchor[a][1]/spc.negAnchor.length;
	}
	
	x = xSum/n;
	y = ySum/n;
	//console.log([x,y]);
	var uSumPrev = [];
	for(var itr=0; itr < 500; itr++ ){
		/*fc.beginPath();
		fc.moveTo(x,y);
		fc.lineTo(x+stp*uSum(x,y,spc)[0],y+stp*uSum(x,y,spc)[1]);
		fc.closePath();
		fc.stroke();*/
		var uS = uSum(x,y,spc);
		x += stp*uS[0];
		y += stp*uS[1];
		//Now updating the uSumPrev Array
		if(uSumPrev.length > 9){
			uSumPrev.shift();
		}
		uSumPrev.push(uS);
		var uSumSum = [0,0];//sum of all previous 10 uSum vectors
		for(sn=0; sn < uSumPrev.length; sn++){
			uSumSum = vSum(uSumSum,uSumPrev[sn]);
		}
		if(mod(uSumSum) < 0.002){
			//console.log('No. of Itertions = '+itr);
			//console.log('Final Error = '+mod(uSumSum));
			break;
		}
	}
	//this is for calculating the runtime of the function
	//date = new Date();
	//var t2 = (1000*date.getSeconds())+date.getMilliseconds();
	//console.log('Runtime = '+(t2-t1)+'ms');//this line displays the runtime of this function
	//updating the headPos of the space object
	spc.headPos = [x,y];
	spc.lastCritPt = [x,y];
	//returning the final position after gradient descent
	return [x,y];
}

function posCritPt(spc){//calculates the critical point and moves the drawing head to that point but only considers positive relations
	//this is for measuring the runtime of the function
	//var date = new Date();
	//var t1 = (1000*date.getSeconds())+date.getMilliseconds();
	//the actual operations of the function
	var stp=5;//this is the length of each step
	var rF;
	var x,y,xSum=0,ySum=0;
	var n=0;
		
	for(var s = 0; s < spaces.length; s++){
		rF = rel(spaces[s],spc);
		if(spc == spaces[s] || rF < 0){
			continue;
		}
		for(var r=0; r < spaces[s].runs.length; r++){
			xSum += rF*(spaces[s].nodes[spaces[s].runs[r][0]][0]+spaces[s].nodes[spaces[s].runs[r][1]][0])/2;
			ySum += rF*(spaces[s].nodes[spaces[s].runs[r][0]][1]+spaces[s].nodes[spaces[s].runs[r][1]][1])/2;
				n += rF;
		}
	}
		
	for(var a = 0; a < spc.negAnchor.length; a++){
		xSum += spc.negAnchor[a][1]*spc.negAnchor[a][0][0]/spc.negAnchor.length;
		ySum += spc.negAnchor[a][1]*spc.negAnchor[a][0][1]/spc.negAnchor.length;
		n += spc.negAnchor[a][1]/spc.negAnchor.length;
	}
	
	x = xSum/n;
	y = ySum/n;
	//console.log([x,y]);
	var uSumPrev = [];
	for(var itr=0; itr < 500; itr++ ){
		/*tc.beginPath();
		tc.moveTo(x,y);
		tc.lineTo(x+stp*uSum(x,y,spc)[0],y+stp*uSum(x,y,spc)[1]);
		tc.closePath();
		tc.stroke();*/
		var uS = uSumPos(x,y,spc);
		x += stp*uS[0];
		y += stp*uS[1];
		//Now updating the uSumPrev Array
		if(uSumPrev.length > 9){
			uSumPrev.shift();
		}
		uSumPrev.push(uS);
		var uSumSum = [0,0];//sum of all previous 10 uSum vectors
		for(sn=0; sn < uSumPrev.length; sn++){
			uSumSum = vSum(uSumSum,uSumPrev[sn]);
		}
		if(mod(uSumSum) < 0.002){
			//console.log('No. of Itertions = '+itr);
			//console.log('Final Error = '+mod(uSumSum));
			break;
		}
	}
	//this is for calculating the runtime of the function
	//date = new Date();
	//var t2 = (1000*date.getSeconds())+date.getMilliseconds();
	//console.log('Runtime = '+(t2-t1)+'ms');//this line displays the runtime of this function
	//updating the headPos of the space object
	spc.headPos = [x,y];
	spc.lastPosCritPt = [x,y];
	//returning the final position after gradient descent
	return [x,y];
}

function addRel(a,b,rF){//adds relation ship factor rF between spaces a and b
	if(rF <= 1 && rF >= -1){
		if(spaces.indexOf(a) > spaces.indexOf(b)){
			b.relations[a.name] = rF;
		}else if(spaces.indexOf(a) < spaces.indexOf(b)){
			a.relations[b.name] = rF;
		}else{
			console.log('addRel('+a+','+b+') failed !');
		}
	}else{
		alert('Add Relation Failed due to out of domain rF value - error 1');
	}
}

function rel(a,b){//returns the relation ship factor between spaces a and b
	if(spaces.indexOf(a) > spaces.indexOf(b)){
		if(b.relations[a.name]){
			return b.relations[a.name];
		}else{
			return 0;
		}
	}else if(spaces.indexOf(a) < spaces.indexOf(b)){
		if(a.relations[b.name]){
			return a.relations[b.name];
		}else{
			return 0;
		}
	}else if(spaces.indexOf(a) == spaces.indexOf(b)){
		return 1;//change lter for the self relation value
	}
}

function headIsClear(pos,sp){//returns true if a drawingHead of span sp is clear when placed at pos
	var isClear = true;
	var e1,e2;
	var E1=[],E2 = [];
	for(s = 0; s < spaces.length; s++){
		for(l = 0; l < spaces[s].runs.length; l++){
			e1 = spaces[s].nodes[spaces[s].runs[l][0]];
			e2 = spaces[s].nodes[spaces[s].runs[l][1]];
			var d =lineDist(e1,e2,pos);
			//console.log(mod(d) - 0.5*(sp+spaces[s].runs[l][2]));
			if(mod(d) < 0.5*(sp+spaces[s].runs[l][2])){
				E1[0] = e1[0]+0.5*sp*(vDiff(e1,e2)[0]/mod(vDiff(e1,e2)));
				E1[1] = e1[1]+0.5*sp*(vDiff(e1,e2)[1]/mod(vDiff(e1,e2)));
				E2[0] = e2[0]+0.5*sp*(vDiff(e2,e1)[0]/mod(vDiff(e2,e1)));
				E2[1] = e2[1]+0.5*sp*(vDiff(e2,e1)[1]/mod(vDiff(e2,e1)));//extending the effective length of the run
				
				if(dot(vDiff(pos,E1),vDiff(E2,E1)) > 0 && dot(vDiff(pos,E2),vDiff(E1,E2)) > 0){
					isClear = false;//console.log(pos,dot(vDiff(pos,E1),vDiff(E2,E1)),dot(vDiff(pos,E2),vDiff(E1,E2)));
					break;
					break;
				}
			}
		}
	}
	return isClear;
}

function placeHead(spc){//places the head of spc at the nearest possible point from pos
	var maxIter = 200;
	var i = 0;//while loop variable
	while(i < maxIter){
		//markPt(spc.critPt(),fc);
		//console.log(spc.critPt());
		spc.critPt();
		spc.align();
		//console.log(spc.headPos,headIsClear(spc.headPos,spc.span));
		if(headIsClear(spc.headPos,spc.span)){
			//console.log('Aligned after '+(i+1)+' attempts !');
			break;
		}else{
			var spDiff = spc.meanSpan*spc.spanFlex;
			if(spDiff < 1){
				spc.span = spc.meanSpan;
				//spc.anchors.push([spc.headPos,-aR*Math.pow(aF,i)]);
				spc.addNegAnchor(spc.headPos);
			}else{//console.log('No at '+spc.span);
				//console.log(spc.span+' - '+spDiff);
				spc.span -= spDiff;
				spc.align();
	
				while(spDiff >= 1){
					if(headIsClear(spc.headPos,spc.span)){//console.log('Yes at '+spc.span);
						spDiff /= 2;
						if(spDiff < 1){break;}
						//console.log(spc.span+' + '+spDiff);
						spc.span += spDiff;
					}else{//console.log('No at '+spc.span);
						if(spc.span <= spc.meanSpan*(1-spc.spanFlex)){
							spc.span = spc.meanSpan;
							//spc.anchors.push([spc.headPos,-aR*Math.pow(aF,i)]);
							spc.addNegAnchor(spc.headPos);
							break;
						}else{
							spDiff /= 2;
							if(spDiff < 1){break;}
							//console.log(spc.span+' - '+spDiff);
							spc.span -= spDiff;
						}	
					}
					spc.align();
				}
			}
		}
		i++;
		if(i == maxIter){console.log('I cannot place the Head. I fucking give up !!');}
	}
	
	if(i < maxIter){
		var locA = spc.locAwr();//each element of the locA array is of the form [s,l,d,zone,dst]
		//now increasing the span slightly to fill the small gaps with the neighbours after the alignment
		var growF = 0.5;//rate at which the size of teh head is increased to close down the gaps
		for(var lc = 0; lc < locA.length; lc++){
			if(locA[lc][4] >= 0){
				var spDiff = spc.meanSpan*spc.spanFlex;
				//console.log(locA[lc][1],locA[lc][4],0.5*spDiff);
				if(locA[lc][4] <= spDiff){
					spc.span += growF*locA[lc][4];//console.log(spc.span);
					spc.align();//console.log(spc.span);
					if(!headIsClear(spc.headPos,spc.span)){
						spc.span -= locA[lc][4]; 
						spc.align();
						break;
					};
				}
			}
		}
	}
}

function moveHead(spc){
	
}

function planSpace(spc){
	spc.totArea = 49000;
	spc.posCritPt();
	spc.hPos.push(spc.critPt());
	//spc.hPos.push([150,0]);
	var lv = 0;//loop variable
	//travelling loop begins
	while(spc.hPos.length && spc.areaCheck()&& lv < 1){
		spc.placeHead();
		//console.log(spc.headPos)
		//fc.fillRect(spc.headPos[0]-0.5*spc.span, spc.headPos[1]-0.5*spc.span, spc.span, spc.span);
		/*
		The above line is marked because, this placeHead function should be changed to a more optimized moveHead Function
		*/
		//spc.travel();
		lv++;
		//console.log(lv);
		renderCanvas();
	}
	fc.fillRect(spc.headPos[0]-0.5*spc.span, spc.headPos[1]-0.5*spc.span, spc.span, spc.span);
}

spaces = [];//array in which each element is an array with first element being the space and the rest rest being its relations with the next spaces

var minGridSize = 5;
var nodes = [[100,100],[210,100],[205,125],[205,170],[200,200],[315,200],[300,230],
			[300,312.5],[315,300],[370,300],[400,312.5],[400,192.5],[430,200],[480,200],[500,207.5],[500,82.5],[480,100],[300,100]];
			
var runs = [[0,1,50],[2,3,10],[4,5,60],[6,7,30],[8,9,25]];//,[10,11,60],[12,13,15],[14,15,40],[16,17,35]];
//var runs = [[8,9,25],[10,11,60],[12,13,15],[14,15,40],[16,17,35]];
//var runs = [[10,11,60],[12,13,15],[14,15,40],[16,17,35]];
var runs2 = [[10,11,60],[12,13,15],[14,15,40],[16,17,35]];

var terrace = new space('Terrace',nodes,runs, 'rgba(255,0,0,0.5)');
var terrace2 = new space('Terrace2',nodes,runs2, 'rgba(0,255,0,0.9)');
var room = new space('Room',[],[],'rgba(0,0,255,0.5)');

addRel(terrace,room,1);
addRel(terrace2,room,1);
//addRel(terrace2,terrace,1);
//planning starts here so measuring runtime from here
var date = new Date();
var t1 = 1000*date.getSeconds() + date.getMilliseconds();

bc.translate(100,100);
tc.translate(100,100);
fc.translate(100,100);

planSpace(room);

date = new Date();
var t2 = 1000*date.getSeconds() + date.getMilliseconds();
console.log('Runtime : '+(t2-t1)+'ms');
//planning ends here so measuring runtime till here
renderCanvas();
tc.clearRect(-100,-100,baseCanvas.width+100,baseCanvas.height+100);