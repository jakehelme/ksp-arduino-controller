const leapjs = require('leapjs');
const controller = new leapjs.Controller({enableGestures: true});

let latestGesture;
let gestureCount = 0;

function consoleUpdate(){
	process.stdout.clearLine();
	process.stdout.cursorTo(0);
	process.stdout.write(`Gesture Count: ${gestureCount} - Latest gesture: ${latestGesture}`);
}

controller.on('deviceFrame', function(frame) {
	for(var i = 0; i < frame.gestures.length; i++){
		var gesture = frame.gestures[i];
		var type = gesture.type;          

		switch( type ){

		case 'circle':
			if (gesture.state == 'stop') {
				latestGesture = 'circle';
				gestureCount++;
				consoleUpdate();
			}
			break;

		case 'swipe':
			if (gesture.state == 'stop') {
				latestGesture = 'swipe';
				gestureCount++;
				consoleUpdate();
			}
			break;

		case 'screenTap':
			if (gesture.state == 'stop') {
				latestGesture = 'screen tap';
				gestureCount++;
				consoleUpdate();
			}
			break;

		case 'keyTap':
			if (gesture.state == 'stop') {
				latestGesture = 'key tap';
				gestureCount++;
				consoleUpdate();
			}
			break;

		}
	}
});

controller.connect();
