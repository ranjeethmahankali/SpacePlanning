var relCanvas = document.getElementById('relCanvas');
var rc = relCanvas.getContext('2d');

var nameInput = $('#spaceName');
var spanInput = $('#spaceSize');
var areaInput = $('#spaceArea');
var colorInput = $('#spaceColor');

//mouse event handlers - begin
var clickPos = new Array();

var curSpace = -1;//the index of the currently selectedSpace
var rowHeight = 50;
var canvasOffset = 5;
var relBubbles = new Array();
var mousePos = new Array();//mouse click position

function loadMouseEventHandlers(){
	$('.spaceSizeData').click(function(){
		var index = Number(this.id);
		var oldVal = $(this).text();
		var newVal = prompt('Enter a new value', oldVal);
		if(newVal != null){
			spaces[index].meanSpan = Number(newVal);
			loadTable();
		}
	});
	$('.spaceAreaData').click(function(){
		var index = Number(this.id);
		var oldVal = $(this).text();
		var newVal = prompt('Enter a new value', oldVal);
		if(newVal != null){
			spaces[index].totArea = Number(newVal);
			loadTable();
		}
	});
	// $('.spaceNameData').click(function(){//cannot change name of space because all relations are stored in terms of the names
		// var index = Number(this.id);
		// var oldVal = $(this).text();
		// var newVal = prompt('Enter a new value', oldVal);
		// if(newVal != null){
			// spaces[index].name = newVal;
			// loadTable();
		// }
	// });
	$('.spaceColorData').change(function(){
		var index = Number(this.id);
		spaces[index].color = $(this).val();
	});
	
	$('.relMapBubble').click(function(){
		var r = Number(this.id);
		
		var s1 = relBubbles[r].s1;
		var s2 = relBubbles[r].s2;
		
		var newVal = prompt('Enter new relationship factor',relBubbles[r].val);
		
		if(newVal != null){
			addRelOriginal(spaces[s1],spaces[s2],Number(newVal));
			relBubbles[r].val = Number(newVal);
			relBubbles[r].draw();
		}
	});
}

function relBubble(bubblePos, value, index1, index2){//constructor for buuble object
	//parameters are position value, and the indices of the two spaces associated with it
	this.pos = bubblePos;
	this.val = roundNum(value,2);
	this.s1 = index1;
	this.s2 = index2;
	
	this.draw = function(){
		var radius = rowHeight/(2*Math.sqrt(2));
		
		rc.fillStyle = 'white';
		rc.beginPath();
		rc.arc(this.pos[0], this.pos[1], radius, 0, 2*Math.PI);
		rc.fill();
		
		rc.textAlign = 'center';
		rc.textBaseline = 'middle';
		rc.font = "12px Arial"
		rc.fillStyle = 'black';
		rc.fillText(this.val,this.pos[0],this.pos[1]);
	}
}

function resetSpaces(){//resets all spaces to their original state
	for(var s = 0; s < spaces.length; s++){
		spaces[s].nodes = [];
		spaces[s].runs = [];
		//spaces[s].relations = new Array();
		
		for(var s2 = 0; s2 < spaces.length; s2++){
			if(s2 == s){continue;}
			var r = relOriginal(spaces[s],spaces[s2]);
			addRelOriginal(spaces[s],spaces[s2],r);
		}
		
		spaces[s].negAnchor = [];//point anchors of this space if any
		spaces[s].maxNegAnchors = 2000;
		spaces[s].prefIndex = null;
		
		spaces[s].span = spaces[s].meanSpan;//this is the default or current span
		spaces[s].spanFlex = 0.3;//this is the flexibility of span
		
		spaces[s].headPos = [];//position of the drawing head
		spaces[s].hPos = [];//array of various head Positions while planning and mving around
		spaces[s].lastCritPt = null;
		spaces[s].lastPosCritPt = null;
	}
	
	unSortSpaces();
}

function loadTable(){//marks spaces with bubbles on relCanvas
	rc.clearRect(0,0,relCanvas.width, relCanvas.height);
	$('#listTable').html('<tr id = "tableHeader">'+
							'<th class = "headerValue" id = "colorColumn">Color</td>'+
							'<th class = "headerValue" id = "sizeColumn">Size</td>'+
							'<th class = "headerValue" id = "areaColumn">Area</td>'+
							'<th class = "headerValue" id = "nameColumn">Name</td>'+
							'</tr>');
	
	for(var s = 0; s < spaces.length; s++){
		$('#listTable').append('<tr class="tableRow">'+
								'<td><input type="color" name="'+s+'" id="'+s+'" value="'+spaces[s].color+'" class="spaceColorData"/></td>'+
								'<td class="spaceSizeData" id="'+s+'">'+spaces[s].meanSpan+'</td>'+
								'<td class="spaceAreaData" id="'+s+'">'+spaces[s].totArea+'</td>'+
								'<td class="spaceNameData" id="'+s+'">'+spaces[s].name+'</td>'+
								'</tr>');
	}
	
	$('.tableRow').height(rowHeight);
	relCanvas.width = $('#spaceList').width()-$('#listTable').width();
	relCanvas.height = $('#listTable').height();
	$('.canvas2').css('top','0px');
	$('.canvas2').css('left',($('#listTable').width())+'px');
	$('.canvas2').width(relCanvas.width);
	$('.canvas2').height(relCanvas.height);
	
	var step = (relCanvas.height - $('#tableHeader').height())/spaces.length;
	var startPos = [0, $('#tableHeader').height()];
	var endPos = [0,relCanvas.height];
	var tableTip = vSum(startPos,[(step*spaces.length)/2,(step*spaces.length)/2]);
	
	rc.lineWidth = 2;
	rc.fillStyle = 'black';
	rc.strokeStyle = 'black';
	rc.beginPath();
	rc.moveTo(startPos[0], startPos[1]);
	rc.lineTo(tableTip[0], tableTip[1]);
	rc.lineTo(endPos[0], endPos[1]);
	rc.closePath();
	rc.fill();
	rc.stroke();
	
	var lineEnd = new Array();
	var drawPos = startPos.slice();//cloning the array instead of passing it by reference
	rc.strokeStyle = 'white';
	
	for(var s = 0; s <= spaces.length; s++){
		lineEnd = vSum(drawPos,lineDist(endPos,tableTip,drawPos));
		rc.beginPath();
		rc.moveTo(drawPos[0],drawPos[1]);
		rc.lineTo(lineEnd[0],lineEnd[1]);
		
		lineEnd = vSum(drawPos, lineDist(startPos,tableTip,drawPos));
		var test = lineDist(startPos, tableTip, drawPos);
		rc.moveTo(drawPos[0],drawPos[1]);
		rc.lineTo(lineEnd[0],lineEnd[1]);
		rc.stroke();
		
		drawPos[1] += step;
	}
	
	drawPos = vSum(startPos,[0,step/2]);
	lineEnd = vSum(drawPos,lineDist(endPos,tableTip,drawPos));
	var spacePos = new Array();
	var bubblePos = new Array();
	
	$('#relMap').html('');
	for(var s = 0; s < spaces.length-1; s++){
		// markPt(drawPos,rc);
		// markPt(lineEnd,rc);
		for(var s2 = s+1; s2 < spaces.length; s2++){
			spacePos = vSum(drawPos,vPrd([0,step],(s2-s)));
			bubblePos = vSum(spacePos,lineDist(drawPos,lineEnd,spacePos));
			//createnew relation Bubble here
			relBubbles.push(new relBubble(bubblePos, relOriginal(spaces[s],spaces[s2]), s, s2));
			relBubbles[relBubbles.length-1].draw();
			
			var radius = rowHeight/(2*Math.sqrt(2));
			
			$('#relMap').append('<area shape="circle" coords="'+bubblePos[0]+','+bubblePos[1]+','+radius+'" class="relMapBubble"'+
									'id="'+(relBubbles.length-1)+'"'+
									'alt="test"></area>');
		}
		drawPos[1] += step;
		lineEnd = vSum(drawPos,lineDist(endPos,tableTip,drawPos));
	}
	
	loadMouseEventHandlers();
}

function addSpace(){
	if(spaces.length >= 6){
		alert('Sorry ! A maximum of 6 spaces is allowed in this version');
		return;
	}
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
		loadTable();
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

function unSortSpaces(){//sorts spaces back accordin to their originall order
	var tempSpace;
	for(var a = 0; a < spaces.length-1; a++){
		for(var s = 0; s < spaces.length-1-a; s++){
			if(spaces[s].index > spaces[s+1].index){
				tempSpace = spaces[s];
				spaces[s] = spaces[s+1];
				spaces[s+1] = tempSpace;
			}
		}
	}
}

//Demo starts
spaces.push(new space('A',50,6000,'#ff0000'));//red one
spaces.push(new space('B',100,10000,'#00ff00'));//green one
spaces.push(new space('C',85,9000,'#0000ff'));//blue one
spaces.push(new space('D',50,24000,'#00ffff'));//cyan one
spaces.push(new space('E',50,5600,'#ff00ff'));//voilet one

addRelOriginal(spaces[0],spaces[1],1);
addRelOriginal(spaces[1],spaces[2],1);
addRelOriginal(spaces[2],spaces[0],-0.8);
addRelOriginal(spaces[2],spaces[3],1);
addRelOriginal(spaces[3],spaces[0],0.8);
addRelOriginal(spaces[3],spaces[1],0.7);
addRelOriginal(spaces[4],spaces[3],1);
addRelOriginal(spaces[4],spaces[2],-0.5);

// addRelOriginal(A,B,1);
// addRelOriginal(B,C,0.7);
// addRelOriginal(C,A,1);
// addRelOriginal(C,D,-0.8);
// addRelOriginal(D,A,1);
// addRelOriginal(D,B,0.7);
//demo ends

loadTable();
renderCanvas();

function runPlanner(){
	var date = new Date();
	var t1 = 1000*date.getSeconds() + date.getMilliseconds();
	
	if(spaces.length == 0){
		alert('No spaces added !');
		return;
	}
	
	resetSpaces();
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
	unSortSpaces();
	
	date = new Date();
	var t2 = 1000*date.getSeconds() + date.getMilliseconds();
	console.log('Runtime : '+(t2-t1)+' ms');
}