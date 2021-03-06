/**
 * create by Jocs 2016.05.06
 */

import React, { Component, PropTypes } from 'react'
// import echarts from 'echarts'

export default class Line extends Component {
	constructor(props) {
		super(props)
	}

	static propTypes = {
		width: PropTypes.number.isRequired,
		height: PropTypes.number.isRequired,
		date: PropTypes.array.isRequired,
		js: PropTypes.array.isRequired,
		ajax: PropTypes.array.isRequired,
		theme: PropTypes.string
	}

	componentDidMount() {
		this.drawChart()
	}

	componentDidUpdate() {
		this.drawChart()
	}

	componentWillUnmount() {
		this.chart.dispose()
	}

	drawChart() {
		const node = this.refs.chart
		const { date, js, ajax, theme } = this.props
		const options = {
			title: {
				text: 'JavaScript和Ajax错误日变化趋势图',
				subtext: '折线图和柱状图'
			},
			tooltip: {
				trigger: 'axis'
			},
			legend: {
				data: ['JavaScript', 'Ajax']
			},
			toolbox: {
				show: true,
				feature: {
					dataZoom: {},
					dataView: {readOnly: false},
					magicType: {type: ['line', 'bar']},
					restore: {},
					saveAsImage: {}
				}
			},
			xAxis: {
				type: 'category',
				boundaryGap: false,
				data: date
			},
			yAxis: {
				type: 'value',
				axisLabel: {
					formatter: '{value} 次'
				}
			},
			dataZoom: [{
				type: 'slider',
				show: true,
				endValue: date.length - 1,
				startValue: date.length - 14 >= 0 ? date.length - 14 : 0,
				handleSize: 8
			}],
			series: [
				{
					name: 'JavaScript',
					type: 'line',
					data: js,
					markPoint: {
						data: [
							{type: 'max', name: '最大值'},
							{type: 'min', name: '最小值'}
						]
					},
					markLine: {
						data: [
							{type: 'average', name: '平均值'}
						]
					}
				},
				{
					name: 'Ajax',
					type: 'line',
					data: ajax,
					markPoint: {
						data: [
							{type: 'max', name: '最大值'},
							{type: 'min', name: '最小值'}
						]
					},
					markLine: {
						data: [
							{type: 'average', name: '平均值'}
						]
					}
				}
			]
		}

		this.chart = echarts.init(node, theme)
		this.chart.setOption(options)
	}

	render() {
		const { width, height } = this.props
		return (
			<div
				ref='chart'
				style={{
					width: width || '100%',
					height: height || '100%'
				}}
			></div>
		)
	}
}
