import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Table, Spin, Icon} from 'antd';
import CheckError from './handleErrors';

/*用於接收來自API的資料,sourceProp 的default 為 results, 意思是會回傳 {results:[...]} results 底下的array 到data,
抓取完畢後會將這個 array type 的資料傳給 Table的 dataSource
任何props都可覆寫這個 Table, 簡單來說這個 Table 只是為了*直接*接收來自API的資料, 如果資料來源不符合 antd Table中 column,dataSource
Schema要求的話, 這個Table就不能用 */
class FactoryTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isLoaing: true,
      tableData: []
    }
  }
  componentDidMount() {
    this.getData(this.props.sourceApi);
  }
  componentWillReceiveProps(nextProps){
    this.setState({isLoaing: true});
    this.getData(nextProps.sourceApi);
  }
  getData = async (source)=>{
    console.log(this.props.token,"tokennnnnn");
    // token:{"headers":{"Authorization":_.get(userData, 'token',false)}},  
    console.log(source,"source");
    const Response = await fetch(source, 
      {
        method: 'GET',
        headers: {
          'Authorization': this.props.token?this.props.token:false
        }
      }).then(CheckError.resCheck);
    const data = Response
    const result = this.props.sourceProp?data[this.props.sourceProp]:data.results;
    this.setState({isLoaing: false, tableData: result});
  }
  
  render() {
    const myprops = this.props;
    const {isLoaing, tableData} = this.state;
    const antIcon = <Icon type="loading" style={{
      fontSize: 32
    }} spin/>;
    return (isLoaing
      ? <Spin
          size="large"
          style={{
          display: "block"
        }}
          indicator={antIcon}/>
      : <Table
        dataSource={tableData}
        pagination={false}
        rowKey={(record,index) => index}
        {...myprops}/>);
  }
}
FactoryTable.propTypes = {
  columns: PropTypes.array.isRequired,
  sourceApi: PropTypes.string.isRequired,
  sourceProp: PropTypes.string
};
export default FactoryTable;
