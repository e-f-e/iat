/**
 * merge object
 */
exports.mergeObject = function mergeObject (oldObj, newObj) {
	Object.keys(newObj).forEach(function (prop) {
		if (oldObj[prop]) {
			var value = newObj[prop];

			if (Array.isArray(value)) {

			} else if (typeof value == 'object') {
				mergeObject(oldObj[prop], value);
			} else {
				oldObj[prop] = value;
			}
		}
	})

	return oldObj;
}