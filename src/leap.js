const leapjs = require('leapjs');
const leapController = new leapjs.Controller({hitThreshold: 0.6});
let LeapTrainer = require('./leap-trainer-html/leap-trainer');

// let latestGesture;
// let gestureCount = 0;

// function consoleUpdate(){
// 	process.stdout.clearLine();
// 	process.stdout.cursorTo(0);
// 	process.stdout.write(`Gesture Count: ${gestureCount} - Latest gesture: ${latestGesture}`);
// }

// controller.on('deviceFrame', function(frame) {
// 	for(var i = 0; i < frame.gestures.length; i++){
// 		var gesture = frame.gestures[i];
// 		var type = gesture.type;          

// 		switch( type ){

// 		case 'circle':
// 			if (gesture.state == 'stop') {
// 				latestGesture = 'circle';
// 				gestureCount++;
// 				consoleUpdate();
// 			}
// 			break;

// 		case 'swipe':
// 			if (gesture.state == 'stop') {
// 				latestGesture = 'swipe';
// 				gestureCount++;
// 				consoleUpdate();
// 			}
// 			break;

// 		case 'screenTap':
// 			if (gesture.state == 'stop') {
// 				latestGesture = 'screen tap';
// 				gestureCount++;
// 				consoleUpdate();
// 			}
// 			break;

// 		case 'keyTap':
// 			if (gesture.state == 'stop') {
// 				latestGesture = 'key tap';
// 				gestureCount++;
// 				consoleUpdate();
// 			}
// 			break;

// 		}
// 	}
// });

// controller.connect();

var gesturesToCreate = ['out', 'in', 'roll-over', 'swipe'];

// var leapController = new Leap.Controller({
// 	hitThreshold: 0.6
// });

var trainer = new LeapTrainer.Controller({
	controller: leapController
});

leapController.on('connect', function () {

	console.log('connected');
	// trainer.on('started-recording', function () {

	//     console.log('Started recording');
	// });

	// trainer.on('stopped-recording', function () {

	//     console.log('Stopped recording');
	// });

	trainer.on('training-started', function (movementName) {

		console.log('Started training ' + movementName);
	});

	trainer.on('training-complete', function (gestureName, trainingGestures, isPose) {

		console.log('Completed training ' + gestureName);
		var nextGesture = gesturesToCreate.pop();
		if (nextGesture !== undefined) {
			trainer.create(nextGesture);
		}
	});

	trainer.on('training-countdown', function (args) {
		console.log(args);

	});

	trainer.on('gesture-created', function (gestureName) {

		console.log(`${gestureName} gesture created`);

	});

	// trainer.on('gesture-detected', function (gesture, frameCount){
	//     console.log(`gesture detected frame: ${frameCount} and gesture data:${gesture}`);
	// });

	trainer.on('gesture-recognized', function (hit, gestureName) {
		console.log(`${gestureName} gesture recognized`);
		console.log(`hit score: ${hit}`);
	});

	// trainer.on('gesture-unknown', function (bestHit, closestGestureName) {
	//     console.log(`unknown gesture, best guess ${closestGestureName}, best hit ${bestHit}`);
	// });

	// trainer.on('swipe-right', function () {
	//     console.log('right');
	// });

	setTimeout(function () { trainer.create(gesturesToCreate.pop()); }, 5000);
});






leapController.connect();
