const getFirstResult = (response) => {
	return getResultN(response, 0);
};

const getResultN = (response, n) => {
	if (response.error) {
		throw response.error;
	}
	let result = response.results[n];
	if (result.error) {
		throw result.error;
	}
	return result.value;
};

module.exports = {
	getFirstResult,
	getResultN
};