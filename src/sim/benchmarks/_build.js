var fs=require('fs');
var m=Buffer.alloc(0);
function w(s){m=Buffer.concat([m,Buffer.from(s+'
')]);}
