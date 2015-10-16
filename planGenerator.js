var toolCanvas = document.getElementById('toolCanvas');
var ct = toolCanvas.getContext('2d');
var bubbleRadius = 20;//radius with which spaces are represented in the toolCanvas

var nameInput = $('#spaceName');
var spanInput = $('#spaceSize');
var areaInput = $('#spaceArea');
var colorInput = $('#spaceColor');

function markSpaces(){//marks spaces with bubbles on toolCanvas
	ct.clearRect(0,0,toolCanvas.width, toolCanvas.height);
	
	var num = spaces.length;
	var angStep = 2*Math.PI/num;
	var ang = 0;
	var centerPos = [toolCanvas.width/2,toolCanvas.height/2];
	var radVec = [0,0];//radius vector to be addded to the center to get the buble location
	var bubblePos = [];
	
	for(var s = 0; s < spaces.length; s++){
		radVec = vPrd([Math.cos(ang),Math.sin(ang)],100);
		bubblePos = vSum(centerPos, radVec);
		
		//console.log(bubblePos,radVec);
		ct.beginPath();
		ct.arc(bubblePos[0],bubblePos[1],bubbleRadius,0,2*Math.PI);
		ct.closePath();
		ct.fillStyle = spaces[s].color;
		ct.fill();
		ang += angStep;
	}
}

function addSpace(){
	var spaceName = nameInput.val();
	var spaceSize = Number(spanInput.val());
	var spaceArea = Number(areaInput.val());
	var spaceColor = colorInput.val();
	//console.log(spaceName);
	if(spaceName == ''||spaceSize == ''||spaceArea == ''){
		alert('Please provide all the detals to create new space');
	}else if(!validateName(spaceName)){
		alert('The selected name has been already used for another space\nPlease give it a different name');
	}else if(!validateColor(spaceColor)){
		alert('The selected color has been already used for another space\nPlease select a different color');
	}else{
		spaces.push(new space(spaceName,spaceSize,spaceArea,spaceColor));
		markSpaces();
	}
}

function validateName(name){//returns false if a color is already used for another space else true
	var isValid = true
	for(var s = 0; s < spaces.length; s++){
		if(name == spaces[s].name){
			isValid = false;
			break;
		}
	}
	return isValid;
}

function validateColor(color){//returns false if a color is already used for another space else true
	var isValid = true
	for(var s = 0; s < spaces.length; s++){
		if(color == spaces[s].color){
			isValid = false;
			break;
		}
	}
	return isValid;
}

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

//Demo starts
// spaces.push(new space('A',50,6000,'rgba(255,0,0,0.6)'));//red one
// spaces.push(new space('B',100,10000,'rgba(0,255,0,0.6)'));//green one
// spaces.push(new space('C',85,9000,'rgba(0,0,255,0.6)'));//blue one
// spaces.push(new space('D',50,24000,'rgba(0,255,255,0.6)'));//cyan one

// addRel(spaces[0],spaces[1],1);
// addRel(spaces[1],spaces[2],1);
// addRel(spaces[2],spaces[0],-0.8);
// addRel(spaces[2],spaces[3],1);
// addRel(spaces[3],spaces[0],0.8);
// addRel(spaces[3],spaces[1],0.7);

// addRel(A,B,1);
// addRel(B,C,0.7);
// addRel(C,A,1);
// addRel(C,D,-0.8);
// addRel(D,A,1);
// addRel(D,B,0.7);
//demo ends

var date = new Date();
var t1 = 1000*date.getSeconds() + date.getMilliseconds();
//Planning Starts
//for(var s in spaces){console.log(spaces[s].name);}
function runPlanner(){
	if(spaces.length == 0){
		alert('No spaces added !');
		return;
	}
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
