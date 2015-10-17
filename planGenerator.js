var toolCanvas = document.getElementById('toolCanvas');
var ct = toolCanvas.getContext('2d');

var toolCanvas = document.getElementById('toolCanvas2');
var ct2 = toolCanvas2.getContext('2d');
ct2.strokeStyle = 'blue';

var nameInput = $('#spaceName');
var spanInput = $('#spaceSize');
var areaInput = $('#spaceArea');
var colorInput = $('#spaceColor');

//mouse event handlers - begin
var wasDragging = false;
var mouseWasDown = false;
var mouse1 = new Array();
var mouse2 = new Array();

var bubbleRadius = 20;//radius with which spaces are represented in the toolCanvas
var curSpace = -1;//the index of the currently selectedSpace

$('.canvas2').mousedown(function(e){
	mouse1[0] = e.pageX - this.offsetLeft;
	mouse1[1] = e.pageY - this.offsetTop;
	
	mouseWasDown = true;
	wasDragging = false;
});
$('.canvas2').mousemove(function(e){
	if(mouseWasDown){
		mouse2[0] = e.pageX - this.offsetLeft;
		mouse2[1] = e.pageY - this.offsetTop;
		
		wasDragging = true;
	}
});
$('.canvas2').mouseup(function(e){
	if(mouseWasDown && !wasDragging){
		//click detected at mouse1
		curSpace = -1;
		var dist;
		for(var s = 0; s < spaces.length; s++){
			dist = mod(vDiff(mouse1,spaces[s].bubblePos));
			if(dist < bubbleRadius){
				//console.log(s);
				curSpace = s;
				break;
			}
		}
		selectSpace(curSpace);
	}else if(mouseWasDown && wasDragging){
		//dragging detected from mouse 1 to mouse 2
		var dist1, dist2;
		var num1 = -1;
		var num2 = -1;
		// markPt(mouse1,ct2);
		// markPt(mouse2,ct2);
		for(var s = 0; s < spaces.length; s++){
			dist1 = mod(vDiff(mouse1,spaces[s].bubblePos));
			dist2 = mod(vDiff(mouse2,spaces[s].bubblePos));
			if(dist1 < bubbleRadius){
				num1 = s;
			}
			if(dist2 < bubbleRadius){
				num2 = s;
			}
		}
		if(num1 != -1 && num2 != -1){
			//console.log(num1,num2);
			loadRelation(num1,num2);
		}
	}
	wasDragging = false;
	mouseWasDown = false;
});
//mouse event handlers - end

function selectSpace(s){//selects the space with index savePreferences
	ct2.clearRect(0,0,toolCanvas2.width, toolCanvas2.height);
	if(s == -1){return;}//this is when no space is clicked
	
	var rad = bubbleRadius +3;
	
	ct2.beginPath();
	ct2.arc(spaces[s].bubblePos[0], spaces[s].bubblePos[1], rad, 0, 2*Math.PI);
	ct2.stroke();
}

function loadRelation(s1, s2){
	ct2.clearRect(0,0,toolCanvas2.width, toolCanvas2.height);
	var rad = bubbleRadius +3;
	
	ct2.beginPath();
	ct2.arc(spaces[s1].bubblePos[0], spaces[s1].bubblePos[1], rad, 0, 2*Math.PI);
	ct2.stroke();
	
	ct2.beginPath();
	ct2.arc(spaces[s2].bubblePos[0], spaces[s2].bubblePos[1], rad, 0, 2*Math.PI);
	ct2.stroke();
	
	ct2.beginPath();
	ct2.moveTo(spaces[s1].bubblePos[0], spaces[s1].bubblePos[1]);
	ct2.lineTo(spaces[s2].bubblePos[0], spaces[s2].bubblePos[1]);
	ct2.stroke();
	
	var relF = relOriginal(spaces[s1], spaces[s2]);//current relationship Factor of the s1 and s2 pair
	var newRelF = prompt("Enter new relationship factor", relF);
	if(newRelF != null){addRelOriginal(spaces[s1], spaces[s2], Number(newRelF));}
	ct2.clearRect(0,0,toolCanvas2.width, toolCanvas2.height);
}

function resetSpace(sp){//resets the space sp to it's original condition that it was in before planning
	sp.nodes = [];
	sp.runs = [];//[4,5,50]
	//sp.relations = new Array();
	
	for(var r in sp.relationsOriginal){
		sp.relations[sp.relationsOriginal.indexOf(r)] = r;
	}
	
	sp.negAnchor = [];//point anchors of this space if any
	sp.maxNegAnchors = 2000;
	sp.prefIndex = null;
	
	sp.span = sp.meanSpan;//this is the default or current span
	sp.spanFlex = 0.3;//this is the flexibility of span
	
	sp.headPos = [];//position of the drawing head
	sp.hPos = [];//array of various head Positions while planning and mving around
	sp.lastCritPt = null;
	sp.posCritPt = null;
}

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
		spaces[s].bubblePos = bubblePos;
		
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
spaces.push(new space('A',50,6000,'rgba(255,0,0,0.6)'));//red one
spaces.push(new space('B',100,10000,'rgba(0,255,0,0.6)'));//green one
spaces.push(new space('C',85,9000,'rgba(0,0,255,0.6)'));//blue one
spaces.push(new space('D',50,24000,'rgba(0,255,255,0.6)'));//cyan one

addRelOriginal(spaces[0],spaces[1],1);
addRelOriginal(spaces[1],spaces[2],1);
addRelOriginal(spaces[2],spaces[0],-0.8);
addRelOriginal(spaces[2],spaces[3],1);
addRelOriginal(spaces[3],spaces[0],0.8);
addRelOriginal(spaces[3],spaces[1],0.7);

// addRelOriginal(A,B,1);
// addRelOriginal(B,C,0.7);
// addRelOriginal(C,A,1);
// addRelOriginal(C,D,-0.8);
// addRelOriginal(D,A,1);
// addRelOriginal(D,B,0.7);
//demo ends

markSpaces();
var date = new Date();
var t1 = 1000*date.getSeconds() + date.getMilliseconds();
//Planning Starts
//for(var s in spaces){console.log(spaces[s].name);}
function runPlanner(){
	if(spaces.length == 0){
		alert('No spaces added !');
		return;
	}
	for(var s = 0; s < spaces.length; s++){
		resetSpace(spaces[s]);
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
