import App from './model'
import User from '../user/model'

export const createApp = (req, res) => {
	const userId = req.body.creator
	const app = new App(req.body)

	Promise.all([app.save(), User.findOne({_id: userId})])
	.then(data => {
		data[1].applycations.push(data[0])
		return new Promise((resolve, reject) => {
			data[1].save()
			.then(user => resolve(data[0]))
			.catch(reject)
		})
	})
	.then(response => res.send({code: 1, response}))
	.catch(err => {
		res.send({code: 0, err})
	})
}

export const getAll = (req, res) => {
	const creator = req.body.userId
	App
	.find({creator})
	.then(apps => res.json({apps}))
	.catch(err => res.status(500).send(err))
}