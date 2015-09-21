var A = new space('A',50,6000,'rgba(255,0,0,0.6)');//red one
var B = new space('B',100,10000,'rgba(0,255,0,0.6)');//green one
B.nodes = [[400,250],[500,250]];
B.runs = [[0,1,100]];

var C = new space('C',85,9000,'rgba(0,0,255,0.6)');//blue one
var D = new space('D',50,24000,'rgba(0,255,255,0.6)');//cyan one

addRel(A,B,1);
addRel(B,C,1);
addRel(C,A,-0.8);
addRel(C,D,0.8);
addRel(D,A,0.8);
addRel(D,B,0.7);

/*addRel(A,B,1);
addRel(B,C,0.7);
addRel(C,A,1);
addRel(C,D,-0.8);
addRel(D,A,1);
addRel(D,B,0.7);*/

var date = new Date();
var t1 = 1000*date.getSeconds() + date.getMilliseconds();
//Planning Starts
planSpace(A,10,false);
planSpace(C,10,false);
planSpace(D,10,false);
//renderCanvas();
//Planning Ends
date = new Date();
var t2 = 1000*date.getSeconds() + date.getMilliseconds();
console.log('Runtime : '+(t2-t1)+' ms');
//planning ends here so measuring runtime till here
renderCanvas();
