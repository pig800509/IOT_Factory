import React, { Component } from 'react';
import './kanban.css';

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true
    };
    this.getTime();
  }

  getTime() {
    const self = this;
    setInterval(function(){
      self.forceUpdate();
    }, 1000);
  }
  //單個數字( 1~9 )的月、日、時、分、秒皆補0
  formatNumber(num) {
    if(num < 10) {
      num = '0'+num;
    }
    return num;
  }
  
  render() {
    const { formatNumber } = this;
    const today = new Date();
    const date = today.getFullYear() + '/'+ formatNumber((today.getMonth()+1)) + '/' + formatNumber(today.getDate());//自動抓取今天年月日
    const time = formatNumber(today.getHours()) + ':' + formatNumber(today.getMinutes()) + ':' + formatNumber(today.getSeconds());//自動抓取現在時間

    return (
      <div className="kanban" style={{height: this.props.height}}>
        <div className="kanban-header">
          {this.props.title}
        </div>
        <div className="kanban-body">
          <div className="kanban-info">
            <div className="kanban-info-text">Plant: F230</div>
            <div className="kanban-info-text">Shift: D</div>
            {this.props.line? " ｜ Line 1" : ""}
            <span className="kanban-time">
              Date：{date}&nbsp;&nbsp;&nbsp;&nbsp;Time：{time}
            </span>
          </div>
          <hr/>
          {this.props.children}
        </div>
      </div>
    );
  }
}
