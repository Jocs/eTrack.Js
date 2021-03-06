/**
 * create by Jocs 2016.04.21
 */

import React from 'react'
import {
	Route,
	IndexRoute
} from 'react-router'

import App from '../containers/App.js'
import { Home, Console, Dashboard, Current, Applist, Create, Detail, Search,
	Document, Start, TopApi, UiApi
} from '../components'
import { getToken } from '../utils'

function consoleEnter(nextState, replace, next) {
	const token = getToken()
	if (token) next()
	else {
		replace('/')
		next()
	}
}

export default (
	<Route path='/' component={App}>
		<IndexRoute component={Home}/>
		<Route path='console' component={Console} onEnter={consoleEnter}>
			<Route path='/dashboard' component={Dashboard}/>
			<Route path='/current' component={Current}/>
			<Route path='/applist' component={Applist}/>
			<Route path='/createApp' component={Create}/>
			<Route path='/detail/:id' component={Detail}/>
			<Route path='/search' component={Search}/>
		</Route>
		<Route path='document' component={Document}>
			<Route path='/start' component={Start}/>
			<Route path='/topApi' component={TopApi}/>
			<Route path='/uiApi' component={UiApi}/>
		</Route>
	</Route>
)

