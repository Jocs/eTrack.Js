/**
 * create by Jocs 2016.04.28
 */
import fs from 'fs'
import Error from './model'
import Environment from '../environment/model'
import UserAgentInfo from '../userAgentInfo/model'
import App from '../applications/model'

export const receiveFault = (req, res) => {
	res.status(200).send('fault received thank you!')
}


function getClientIp(req) {
	return req.headers['x-forwarded-for'] ||
		req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress
}

export const receiveError = (req, res) => {
	let ip = ''
	try {
		ip = getClientIp(req).split(/fff\:/)[1]
	} catch (err) {
		console.log('服务器端获取ip失败')
	}
	// 解构取值
	const { applicationId, errorType, time, logger } = req.body
	const {
		location,
		dependencies,
		loadon,
		runTime,
		url,
		version,
		viewportHeight,
		viewportWidth,
		currentUser
	} = req.body.environment

	const { browser, cpu, device, engine, os, ua } = req.body.environment.userAgentInfo

	const { columnNumber, fileName, lineNumber, message, stack } = req.body.error

	const en = new Environment({
		appId: applicationId,
		location: location,
		dependencies: JSON.stringify(dependencies),
		runTime,
		url,
		version,
		viewportHeight,
		viewportWidth,
		loadOn: loadon,
		ip
	})

	const ui = new UserAgentInfo({
		appId: applicationId,
		browser: JSON.stringify(browser),
		cpu: JSON.stringify(cpu),
		device: JSON.stringify(device),
		engine: JSON.stringify(engine),
		os: JSON.stringify(os),
		ua
	})
	const errorHandler = err => err && console.log(err)
	// 以下是统计浏览器使用率或浏览器出错比例

	const browserStr = `\n${applicationId} ${browser.name}-${browser.major} 1`
	fs.appendFile(`${__dirname}/browser.txt`, browserStr, 'utf8', errorHandler)

	// 以下用来统计每日js 和 ajax错误的数量
	const statisticStr = `\n${applicationId} ${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()} ${errorType === 'ajax@error' ? 'ajax' : 'js'}`
	fs.appendFile(`${__dirname}/statistic.txt`, statisticStr, 'utf8', errorHandler)

	// 以下用来存入错误
	Promise.all([en.save(), ui.save(), App.findOne({_id: applicationId})])
		.then(data => {
			const er = new Error({
				errorType,
				lineNumber,
				columnNumber,
				fileName,
				message,
				stack,
				environment: data[0]._id,
				user: currentUser,
				userAgentInfo: data[1]._id,
				time,
				appId: applicationId,
				appOwner: data[2].creator,
				logger: JSON.stringify(logger)
			})

			const handleSuccess = data => {
				// console.log(data)
			}
			const handError = err => console.log(err)

			er.save()
			.then(handleSuccess)
			.catch(handError)
		})
		.catch(err => {
			console.log(err)
		})

	res.status(200).send('error reveived thank you for your use of eTrack.js')
}

export const getError = (req, res) => {
	const { appId, pageNumber, pageSize } = req.params
	Error.find({appId})
		.sort({'time': -1})
		.skip((Number(pageNumber) - 1) * Number(pageSize))
		.limit(Number(pageSize))
		.populate({
			path: 'environment',
			select: 'url'
		})
		.populate({
			path: 'userAgentInfo',
			select: 'browser'
		})
		.select('environment userAgentInfo message errorType time user')
		.then(data => {
			res.send({code: 1, data})
		})
		.catch(err => {
			res.send({code: 0, err})
		})
}

export const singleError = (req, res) => {
	const { errorId } = req.params
	Error.findById(errorId)
		.populate('environment')
		.populate('userAgentInfo')
		.then(data => {
			res.send({code: 1, data})
		})
		.catch(err => {
			res.send({code: 0, err})
		})
}

export const errorsWithLocation = (req, res) => {
	const { appId } = req.params
	Error.find({appId})
		.sort({'time': -1})
		.limit(100)
		.populate({
			path: 'environment',
			select: 'location'
		})
		.select('environment message errorType time user')
		.then(data => {
			const filterData = data.filter(d => d.environment.location)
			res.send({code: 1, data: filterData})
		})
		.catch(err => {
			res.send({code: 0, err})
		})
}

export const simpleSearch = (req, res) => {
	const { appId, pageNumber, pageSize, message } = req.params
	Error
	.find({appId})
	.sort({'time': -1})
	.where({'message': {$regex: new RegExp(message, 'i')}})
	.skip((Number(pageNumber) - 1) * Number(pageSize))
	.limit(Number(pageSize))
	.populate({
		path: 'environment',
		select: 'url'
	})
	.populate({
		path: 'userAgentInfo',
		select: 'browser'
	})
	.select('environment userAgentInfo message errorType time user')
	.then(data => {
		return Error.find({appId}).count({'message': {$regex: new RegExp(message, 'i')}})
		.then(total => {
			res.send({code: 1, data, pageSize, pageNumber, total: Math.ceil(total / pageSize)})
		})
	})
	.catch(err => {
		res.send({code: 0, err})
	})
}

export const complexSearch = (req, res) => {
	const {
		appId,
		pageNumber,
		pageSize,
		include,
		errorType,
		start,
		end,
		browser,
		user
	} = req.body

	const IN_REGEXP = include !== '' ? new RegExp(include, 'i') : new RegExp(/.*/, 'i')
	const USER_REGEXP = user !== '' ? new RegExp(user, 'i') : new RegExp(/.*/, 'i')
	const Error_TYPE_REGEXP = errorType === 'all' ? new RegExp(/.*/, 'i') : errorType === 'ajax' ? new RegExp('ajax', 'i') : new RegExp('^((?!ajax).)*$', 'i')
	const BROWSER_REGEXP = browser === 'all' ? new RegExp(/.*/, 'i') : new RegExp(browser, 'i')

	const getSpecialData = () => {
		return 	Error
		.find({appId})
		.sort({'time': -1})
		.where({message: {$regex: IN_REGEXP}})
		.where({errorType: {$regex: Error_TYPE_REGEXP}})
		.where({createdAt: {$gt: start, $lt: end}})
		.where({user: {$regex: USER_REGEXP}})
		.populate({
			path: 'userAgentInfo',
			select: 'browser',
			match: {browser: new RegExp(BROWSER_REGEXP, 'i')}
		})
	}

	getSpecialData()
	.skip((Number(pageNumber) - 1) * Number(pageSize))
	.limit(Number(pageSize))
	.populate({
		path: 'environment',
		select: 'url'
	})
	.select('environment userAgentInfo message errorType time user')
	.then(data => {
		getSpecialData()
		.count()
		.then(total => {
			res.send({code: 1, data, total: Math.ceil(total / pageSize), pageSize, pageNumber})
		})
	})
	.catch(err => {
		res.send({code: 0, err})
	})
}
