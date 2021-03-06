/**
 * create by Jocs 2016.04.24
 */
import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { push } from 'redux-router'
import LeftNav from 'material-ui/Drawer'
import MenuItem from 'material-ui/MenuItem'
import DashIcon from 'material-ui/svg-icons/action/dashboard'
import ListIcon from 'material-ui/svg-icons/device/dvr'
import AppIcon from 'material-ui/svg-icons/content/font-download'
import SearchIcon from 'material-ui/svg-icons/action/pageview'

import * as consoleActionsCreator from '../../actions/console'

import style from './style'

import './index.scss'

class Console extends Component {
	constructor(props) {
		super(props)
	}

	static propTypes = {
		children: PropTypes.object.isRequired,
		consoleLeftNav: PropTypes.bool.isRequired,
		unReadCount: PropTypes.number.isRequired
	}

	render() {
		const { consoleLeftNav, unReadCount } = this.props
		return (
			<div className='console'>
				<LeftNav
					open={consoleLeftNav}
					containerStyle={style.leftNav}
				>
					<Link to='/dashboard'
						className='console-link'
						activeClassName='console-current'
					>
						<MenuItem
							innerDivStyle={style.inDiv}
							leftIcon={<DashIcon style={style.icon}/>}
						>
							统计图表
						</MenuItem>
					</Link>
					<Link to='/current'
						className='console-link'
						activeClassName='console-current'
					>
						<MenuItem
							innerDivStyle={style.inDiv}
							leftIcon={<ListIcon style={style.icon}/>}
						>
							实时错误
							{unReadCount !== 0 && <span className='barget'>{unReadCount}</span>}
						</MenuItem>
					</Link>
					<Link to='/search'
						className='console-link'
						activeClassName='console-current'
					>
						<MenuItem
							innerDivStyle={style.inDiv}
							leftIcon={<SearchIcon style={style.icon}/>}
						>
							错误检索
						</MenuItem>
					</Link>
					<Link to='/applist'
						className='console-link'
						activeClassName='console-current'
					>
						<MenuItem
							innerDivStyle={style.inDiv}
							leftIcon={<AppIcon style={style.icon}/>}
						>
							应用列表
						</MenuItem>
					</Link>
				</LeftNav>
				{this.props.children}
			</div>
		)
	}
}

const mapStateToProps = state => {
	const {
		consoleLeftNav
	} = state.console
	const { unReadCount } = state.current
	return { consoleLeftNav, unReadCount }
}

const mapDispatchToProps = dispatch => {
	return {push, dispatch, ...bindActionCreators(Object.assign({}, consoleActionsCreator), dispatch)}
}

export default connect(mapStateToProps, mapDispatchToProps)(Console)
