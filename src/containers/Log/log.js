import React, {PureComponent,Fragment} from 'react';
import {DatePicker} from 'antd';
import LogTable from '../../component/Table';
// import PropTypes from 'prop-types';
import _ from "lodash";
import moment from "moment";
import {logColumns, logPages} from './logSetting';
import {logApiUrl} from "../../config";
import "./App.css";
const {RangePicker} = DatePicker;

class LogMonitorPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {                    //搜尋日期初始化
      startTime: moment()
        .add(-3, 'days')
        .format('YYYY-MM-DD'),
      endTime: moment()
        .add(1, 'days')
        .format('YYYY-MM-DD')
    }
  }
  // isBottom(el) {                                       //這一大段是為了判斷是否scroll到底
  //   return el.getBoundingClientRect().bottom <= window.innerHeight;
  // }
  // componentDidMount() {
  //   document.addEventListener('scroll', this.trackScrolling);
  // }
  // componentWillUnmount() {
  //   document.removeEventListener('scroll', this.trackScrolling);
  // }
  // trackScrolling = () => {
  //   console.log("scroll");
  //   const wrappedElement = document.querySelector('.ant-layout-content');
  //   if (this.isBottom(wrappedElement)) {
  //     console.log('header bottom reached');
  //   }
  // };  

  pickerOnChange = (mo, str) => {         //選取日期物件事件發生
    this.setState({startTime: str[0], endTime: str[1]});
  }

  render() {
    const {location, token} = this.props;
    const {startTime, endTime} = this.state;
    return (
        <Fragment>
            <RangePicker
                style={{
                float: "right"
            }}
                defaultValue={[moment(startTime), moment(endTime)]}
                onChange={this.pickerOnChange}/>
            <LogTable sourceApi = {                            //自訂的Table 資料可直接從API 抓取並 render 參考component/Table
            `${logApiUrl}/logData?category=${    
              _.find(logPages, ['path', location.pathname])
                .category}&start_time=${startTime}&end_time=${endTime}&limit=999999999999999&sort=log_time DESC`
            }
            columns = { logColumns }
            pagination = {false}
            token={token}
            />
        </Fragment>
    );
  }
}

// LogMonitorPage.propTypes = {            
//   location: PropTypes.string.isRequired  //由於定義成物件也報錯誤,所以註解
// };

export default LogMonitorPage;
