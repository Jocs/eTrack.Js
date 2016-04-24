/**
 * create by Jocs 2016.04.21
 */
import { combineReducers } from 'redux'
import { routerStateReducer } from 'redux-router'
import auth from './auth'
import loadStatus from './loading'
import consolo from './console'
import snackbar from './snackBar'

export default combineReducers({
	auth,
	loadStatus,
	console: consolo,
	snackbar,
	router: routerStateReducer
})

