function createUrl(key, retpath, u, rep) {
	return [
		'https://uslugi.yandex.ru/checkcaptcha?',
		'key=' + key + '&',
		retpath + '&',
		u + '&',
		'rep=' + rep,
	].join('')
}

function getSolvedCaptchaURL(href, key, rep) {
	rep = encodeURIComponent(rep)
	const queryString = href.split('?')[1].split('&')

	const retpath = queryString[0]
	const u = queryString[2]

	return createUrl(key, retpath, u, rep)
}

module.exports = { getSolvedCaptchaURL }
