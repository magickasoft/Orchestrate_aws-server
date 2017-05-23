// fimple fingerprint configuration

module.exports = {
     offset      : 0.543, 
     frequencies : [ 343.75, 687.5 ],
     precision   : 3, // frequency +- 3
   
     // duration of the sound minus offset of the frequency duration
     duration    : 3.5 // cut 3 seconds from the control point
};
