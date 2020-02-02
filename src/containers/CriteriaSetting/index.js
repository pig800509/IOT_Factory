import React, { Component } from 'react';
import { Layout, Table, Input, Row, Col, Divider, Button } from 'antd';
// import '../../App.css';
import './App.css';
import _ from 'lodash';
import MenuBar from '../../component/Menu'
import Title from '../../component/Title';
import Footer from '../../component/Footer';
import { Link } from "react-router-dom";
import CheckError from '../../component/handleErrors';
import {dashboardApiUrl} from '../../config';


const { Header, Content } = Layout;
const {Search} = Input;



class App extends Component {
  constructor(props) {
    super(props);

    const userData =  props.userData;
    this.state = {
      token:{"headers":{"Authorization":_.get(userData, 'token',false)}},
      rate:'',
      balanceRate:[]
    };   
    this.changeRate = this.changeRate.bind(this);
    this.saveRate = this.saveRate.bind(this);
    this.resetRate = this.resetRate.bind(this);
    this.changeBalanceRate = this.changeBalanceRate.bind(this);
    this.saveBalanceRate = this.saveBalanceRate.bind(this);
      
  }
  componentDidMount() {

    fetch(`${dashboardApiUrl}/dashboardConfigs/lineCycleTime/criteriaSettings/`,this.state.token).then(CheckError.resCheck)
    .then((data) => {
      this.setState({rate:data.criteria_diff,}) 
    })
    console.log(`${dashboardApiUrl}/dashboardConfigs/lineCycleTime/stdBalanceRates/`,'STD');
    fetch(`${dashboardApiUrl}/dashboardConfigs/lineCycleTime/stdBalanceRates/`,this.state.token).then(CheckError.resCheck)
    .then((data) => {
      this.setState({balanceRate:data.std_balance_rates,}) 
    })
   
  }

  changeRate(event) {
    this.setState({rate: event.target.value});
  }

  saveRate(){
    
    let url=`${dashboardApiUrl}/dashboardConfigs/lineCycleTime/criteriaSettings/`;
    fetch(url,{
      ...this.state.token,
      method: 'PUT',
      body: JSON.stringify({"criteria_diff" : this.state.rate})
    }) 
  }

  saveBalanceRate(){

    let data=[];
    for(let i=0;i<this.state.balanceRate.length;i++){
      data.push({"pl_id":this.state.balanceRate[i].pl_id,"standard_balance_rate":this.state.balanceRate[i].standard_balance_rate})
    }
    let url=`${dashboardApiUrl}/dashboardConfigs/lineCycleTime/stdBalanceRates/`;
    fetch(url,{
      ...this.state.token,
      method: 'PUT',
      body: JSON.stringify({"std_balance_rates" : data})
    }) 
  }

  resetRate(){
    this.setState({rate: ''});
  }

  changeBalanceRate(event){
    const BalanceRate=_.filter(this.state.balanceRate, { 'pl_id': event.target.id });
    BalanceRate[0].standard_balance_rate=event.target.value
  }

  search(value){
    let URL=`${dashboardApiUrl}/dashboardConfigs/lineCycleTime/stdBalanceRates/`
    let URL_search=value!==null && value!=='' && value!==undefined ? URL+'?pl_name='+value:URL
    
    fetch(URL_search,).then(CheckError.resCheck)
    .then((data) => {
      this.setState({balanceRate:data.std_balance_rates,}) 
    })
   }

  render() {
    const columns = [{
      title: 'Production Line',
      dataIndex: 'pl_name',
    }, {
      title: 'Standard Balance Rate',
      dataIndex: 'standard_balance_rate',
      render: (text, record) => { 
        return (<Input defaultValue={text} type="number" onChange={this.changeBalanceRate} id={record.pl_id}/>)
      }   
    }
    ,{
      title: '',
      dataIndex: 'pl_id',
      render: (text, record) => { 
        return (<span  >%</span>)
      }   
    }
  
    ];
    return (   
      <Layout className="layout">
        <Header>
          <MenuBar defaultSelectedKeys='6:1' />
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <Title titlename="Cycle Time Dashboard Configuration" linkName="Configurations"/>
          <div className="demo-nav">
            <Link to="/machineSetting" className="linkTab">Machine</Link>
            <Link to="/criteriaSetting" className="linkTabSelected">Cycle Time</Link>
            <Search onSearch={(value) => this.search(value)} style={{ width: 200, float:"right" }} className="searchColor"/> 
          </div>
          <Row style={{marginBottom:"12px"}}>
            <Col  offset={8} span={8}>
              <div className="contentStyle">
                
                <Divider orientation="left" className="ctConfigSetting">Actual Balance Rate Criterial</Divider>
                <div className="ctConfigSetting">
                  <div style={{width:"12px",height:"12px",borderRadius:"999em",marginTop:"14px",marginLeft:"15px" ,background:'rgb(255, 195, 0)',display:'inline-block',marginRight:'10px'}}></div><span>0&lt;(Standard-Actual)&le;Standard <Input style={{ width: 80,marginRight: 10,marginLeft: 8 }} type="number" value={this.state.rate} onChange={this.changeRate}/>%</span>
                </div>
                <div className="ctConfigSetting">
                  <div style={{width:"12px",height:"12px",borderRadius:"999em",marginTop:"14px",marginLeft:"15px" ,background:'rgba(227, 20, 70, 1)',display:'inline-block',marginRight:'10px'}}></div><span>(Standard-Actual)&gt;Standard <Input disabled style={{ width: 80,marginRight: 10,marginLeft: 10 }} value={this.state.rate} onChange={this.changeRate}/>%</span>
                </div>
                <div className="ctConfigSetting">
                  <div style={{width:"12px",height:"12px",borderRadius:"999em",marginTop:"14px",marginLeft:"15px" ,background:'rgb(34, 208, 105)',display:'inline-block',marginRight:'10px'}}></div><span>Actual&ge;Standard</span>
                </div>
                <div className="ctConfigBtn">
                <Button type="primary" onClick={this.resetRate}>Reset</Button><Button type="primary" style={{marginLeft:5}} onClick={this.saveRate}>OK</Button>
                </div>
                <Divider orientation="left" className="ctConfigSetting">Standard Balance Rate Setting</Divider>
                 
                 <Table
                  dataSource={this.state.balanceRate}
                  columns={columns}
                  pagination={false}
                  rowKey={data => data.pl_id}
                  />

                  <div className="ctConfigBtn" style={{marginTop:15}}>
                    <Button type="primary" style={{marginLeft:5}} onClick={this.saveBalanceRate}>OK</Button>
                  </div>
              </div>
            </Col>
          </Row>
        </Content>
        <Footer />
      </Layout>
    );
  }
}

export default App;
