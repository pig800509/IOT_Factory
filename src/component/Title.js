import React, { Component } from 'react';
import './kanban.css';
import {Breadcrumb,  Row,  Col } from 'antd';

import moment from 'moment'

class Title extends Component {
	constructor(props){
		super(props);
		this.state = {
			time :  moment().format('hh:mm dddd, MMMM.D'),
		}
	}
	componentDidMount(){
		this.interval = setInterval(this.updatetime.bind(this), 3000);
	}
	componentWillUnmount(){
			clearInterval(this.interval);
	}

	updatetime(){
     	this.setState({
        	time : moment().format('hh:mm dddd, MMMM.D'),
		})
	}
  render() {
		
    return (
    	<Row className="rowStyle">
    		<Col span={8}>
					<Breadcrumb  className="breadcrumbStyle">
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>{this.props.linkName}</Breadcrumb.Item>
          </Breadcrumb>
				</Col>
    		<Col span={8} className="titleStyle">
    			{this.props.titlename} 
    		</Col>
    		<Col span={8}>
    			<span  className="titleTime" >{this.state.time }</span>
    		</Col>
    	</Row>
       
    );
  }
}

export default Title;