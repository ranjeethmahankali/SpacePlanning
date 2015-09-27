function sortSpaces(){//sorts all spaces according to their preference Indices
	for(var s in spaces){spaces[s].calculatePI();}
	var tempSpace;
	for(var a=0; a<spaces.length-1; a++){
		for(var s=0; s<spaces.length-1-a; s++){
			if(spaces[s].prefIndex < spaces[s+1].prefIndex){
				tempSpace = spaces[s];
				spaces[s] = spaces[s+1];
				spaces[s+1] = tempSpace;
			}
		}
	}
}

spaces.push(new space('A',50,6000,'rgba(255,0,0,0.6)'));//red one
spaces.push(new space('B',100,10000,'rgba(0,255,0,0.6)'));//green one
spaces.push(new space('C',85,9000,'rgba(0,0,255,0.6)'));//blue one
spaces.push(new space('D',50,24000,'rgba(0,255,255,0.6)'));//cyan one

//B.nodes = [[400,250],[500,250]];
//B.runs = [[0,1,100]];

addRel(spaces[0],spaces[1],1);
addRel(spaces[1],spaces[2],1);
addRel(spaces[2],spaces[0],-0.8);
addRel(spaces[2],spaces[3],1);
addRel(spaces[3],spaces[0],0.8);
addRel(spaces[3],spaces[1],0.7);

/*addRel(A,B,1);
addRel(B,C,0.7);
addRel(C,A,1);
addRel(C,D,-0.8);
addRel(D,A,1);
addRel(D,B,0.7);*/

var date = new Date();
var t1 = 1000*date.getSeconds() + date.getMilliseconds();
//Planning Starts
//for(var s in spaces){console.log(spaces[s].name);}
function runPlanner(){
	sortSpaces();
	//for(var s in spaces){console.log(spaces[s].name, spaces[s].prefIndex);}
	var runLength = spaces[0].totArea/spaces[0].meanSpan;//console.log(runLength);
	var planCenter = [450,250];
	var e1 = vDiff(planCenter, [runLength/2,0]);
	var e2 = vSum(planCenter, [runLength/2,0]);

	//console.log(e1,e2);

	spaces[0].nodes = [e1,e2];
	spaces[0].runs = [[0,1,spaces[0].meanSpan]];

	for(var spcNum = 1; spcNum < spaces.length; spcNum++){
		planSpace(spaces[spcNum],10, false, false);
	}
	renderCanvas();
}
date = new Date();
var t2 = 1000*date.getSeconds() + date.getMilliseconds();
console.log('Runtime : '+(t2-t1)+' ms');
//planning ends here so measuring runtime till here
renderCanvas();
