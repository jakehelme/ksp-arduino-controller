const PRECISION = 2;
const MODIFIER = 10^PRECISION;
var Leap = require('leapjs');

function round(number) {
	return Math.round(number * MODIFIER) / MODIFIER;
}

var controller = new Leap.Controller({
	enableGestures: true
});
controller.loop(function (frame) {
	for (var i in frame.handsMap) {
		var hand = frame.handsMap[i];
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
		process.stdout.write(`Roll: ${hand.roll().toFixed(3)}\t\tPitch: ${hand.pitch().toFixed(3)}\t\tYaw: ${hand.yaw().toFixed(3)}\t\t Palm Pos: ${hand.stabilizedPalmPosition[2]}`);

	}
});
controller.on('ready', function () {
	console.log('ready');
});
controller.on('connect', function () {
	console.log('connect');
});
controller.on('disconnect', function () {
	console.log('disconnect');
});
controller.on('focus', function () {
	console.log('focus');
});
controller.on('blur', function () {
	console.log('blur');
});
controller.on('deviceStreaming', function () {
	console.log('deviceStreaming');
});
controller.on('deviceStopped', function () {
	console.log('deviceStopped');
});
