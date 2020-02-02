import React, { Component } from 'react';
import { Layout, Row, Col, Input } from 'antd';
import _ from 'lodash';
import './App.css';
import MenuBar from '../../component/Menu'
import Title from '../../component/Title';
import CheckError from '../../component/handleErrors';
import {dashboardApiUrl} from '../../config';

const {Search} = Input;
const { Header, Content, Footer } = Layout;

class App extends Component {
  
  constructor(props) {
    super(props);
    const userData =  props.userData;
    this.state = {
      token:{"headers":{"Authorization":_.get(userData, 'token',false)}},
      productionlines:[],
      configList:{},
    };   
  }
  
  componentDidMount() {
   
    fetch(`${dashboardApiUrl}/dashboardData/lineCycleTime`,this.state.token).then(CheckError.resCheck)
    .then((data) => {
      this.setState({productionlines:data.productionlines,}) 
    })
    .catch((error) => {console.error(error)}) 

    fetch(`${dashboardApiUrl}/dashboardConfigs/lineCycleTime/criteriaSettings/`,this.state.token).then(CheckError.resCheck)
    .then((data) => {
      this.setState({configList:data,}) 
    })
    .catch((error) => {console.error(error)}) 
    
    let updateInterval=this.state.configList.update_interval!==undefined?this.state.configList.update_interval:'300'

    setInterval(() => {

      fetch(`${dashboardApiUrl}/dashboardData/lineCycleTime/`,this.state.token).then(CheckError.resCheck)
      .then((data) => {
        this.setState({productionlines:data.productionlines,}) 
      })
      .catch((error) => {console.error(error)});

      fetch(`${dashboardApiUrl}/dashboardConfigs/lineCycleTime/criteriaSettings/`,this.state.token).then(CheckError.resCheck)
      .then((data) => {
        this.setState({configList:data,}) 
      })
      .catch((error) => {console.error(error)}) 
      
    }, 1000*updateInterval);

  }
  
  search(value){
    
    let URL=`${dashboardApiUrl}/dashboardData/lineCycleTime`
    let URL_search=value!=null && value!=='' && value!==undefined ? URL+'?pl_name='+value:URL
    
    fetch(URL_search,this.state.token).then(CheckError.resCheck)
    .then((data) => {
      this.setState({productionlines:data.productionlines,}) 
    })
    .catch((error) => {console.error(error)}) 

  }
  
  render() {
   
    let plTitle = [];
    let plRate = [];
    // const plLength=this.state.productionlines.length;
    this.state.productionlines.map((value,key)=>{

      //Odd and Even css style.
      const OddEven=(key%2 ===0) ?"titleBackgroundOdd":"titleBackgroundEven"
      const machineTitleOddEven=(key%2 ===0) ?"cycletimeDivMachineNameOdd":"cycletimeDivMachineNameEven"
      const RightTitleOddEven=(key%2 ===0) ?"cycletimeRightTitleOdd":"cycletimeRightTitleEven" 
      const RightValueOddEven=(key%2 ===0) ?"cycletimeRightValueOdd":"cycletimeRightValueEven" 
      const machineCycleLength= value.machine_cycletimes.length;
      let plData = [];
   
      //machine title and detail.
      let objects = value.machine_cycletimes;
      let max=_.maxBy(objects, 'cycletime')

      value.machine_cycletimes.map((machine_value,machine_key)=>{
          let style= max===undefined?'':max.cycletime===machine_value.cycletime?'red':''
          // let machineLength = machine_value.machine_name.length>=9? "nowrap":''
          // let machineLength= machine_value.machine_name.length>=10? "break-all":''
          plData.push(<div key={machine_key} className="cycletimeDivOneMachine cycletimeDivMachineInline">   
            <div className={'cycletimeDivMachine ' + machineTitleOddEven} style={{height:"33px",lineHeight:1.1,display:'table-cell',width:'1%',wordBreak:'break-all'}}><span style={{verticalAlign:"middle",lineHeight:"normal"}}>{machine_value.machine_name}</span></div>
            <div className={'cycletimeDivMachine cycletimeDivMachineValue'} style={{color:style}}>{machine_value.cycletime===null?'--':machine_value.cycletime}</div>
          </div>)
          if((machine_key+1)%10===0){plData.push(<br key={`${machine_key}-br`}/>);}
          return plData
        }
      )   
    
      //if machine not enough 10, create machine field. 
      if(machineCycleLength%10!==0){
        for (let index = 0; index < 10-(machineCycleLength%10); index++) {
          plData.push(<div key={`${index}-add`} className="cycletimeDivOneMachine cycletimeDivMachineInline">
           <div className={'cycletimeDivMachine ' + machineTitleOddEven}>--</div>
           <div className={'cycletimeDivMachine cycletimeDivMachineValue'}>--</div>
          </div>)
        }      
      }

      //plLine Name.
      plTitle.push(
        <div className="cycletimeLine" key={key}>
          <Row>
            <Col span={2}><div className={'cycletimeDiv ' + OddEven} style={{lineHeight:Math.ceil((machineCycleLength/10))*64+'px'}}>{value.pl_name}</div></Col>
            <Col span={21}>{plData}</Col>
          </Row>
        </div>
      )
      let actual_balance_rate='';
      let color=''
      if(value.actual_balance_rate===null){ actual_balance_rate='--'}
      else{
         actual_balance_rate=value.actual_balance_rate.toFixed(2)+' %'
        if(value.actual_balance_rate>=value.standard_balance_rate){
          color='#22d069' 
        }else{
          
          let criteria_diff=this.state.configList?this.state.configList.criteria_diff:''
          let sum=value.standard_balance_rate-value.actual_balance_rate
          if(sum>value.standard_balance_rate*(criteria_diff/100)){
            color='#e31446'
          }else if(0<sum<value.standard_balance_rate*(criteria_diff/100)){
            color='#ffc300'
          }
        }
      }
      plRate.push(
        
        <Row  className="cycletimeLine" key={`${key}-rate`}>
          <Col span={12}>
            <div className="cycletimeDivMachineInline cycletimeRight">
              <div className={'cycletimeDivMachine ' + RightTitleOddEven}  style={{lineHeight:Math.ceil(Math.ceil((machineCycleLength/10))*64)/2+'px'}}>Standard Balance Rate</div>
              <div className={'cycletimeDivMachine ' + RightValueOddEven} style={{lineHeight:Math.ceil(Math.ceil((machineCycleLength/10))*64)/2+'px'}}>{value.standard_balance_rate===null?'--':value.standard_balance_rate+' %'}</div>
            </div>
          </Col>
          <Col span={12}>
              <div className="cycletimeDivMachineInline cycletimeRight">
                <div className={'cycletimeDivMachine ' + RightTitleOddEven} style={{lineHeight:Math.ceil(Math.ceil((machineCycleLength/10))*64)/2+'px'}}>Actual Balance Rate</div>
                <div className={'cycletimeDivMachine ' + RightValueOddEven} style={{lineHeight:Math.ceil(Math.ceil((machineCycleLength/10))*64)/2+'px'}}>
                  {/* {value.actual_balance_rate===null?'--':value.actual_balance_rate.toFixed(2)+' %'} */}
                  <span style={{color:color}}>{actual_balance_rate}</span>
                </div>
              </div>
          </Col>
        </Row>
      )

      return [plTitle, plRate]
    })
    
    return (
      <Layout className="layout" style={{height:"100vh",overflowY:"scroll"}}>
          <Header>
          <MenuBar defaultSelectedKeys='1' />
          </Header>
        <Content style={{ padding: '0 50px' }}>
        <Title linkName="Cycle Time Dashboard" titlename="Cycle Time Dashboard" />
          <Row style={{marginBottom:"12px"}}>
            <Col span={10}>
              <Search onSearch={(value) => this.search(value)} style={{ width: 200, float:"left" }} className="searchColor"/> 
            </Col>
            <Col offset={0} span={6} className="CtRateStyle"><div className="CtRate"><div style={{width:"12px",height:"12px",borderRadius:"999em",marginTop:"14px",marginLeft:"15px" ,background:'rgb(255, 195, 0)',display:'inline-block'}}></div><span>0&lt;(Standard-Actual)&le;Standard {this.state.configList?this.state.configList.criteria_diff:''} %</span></div></Col>
            <Col span={5} className="CtRateStyle"><div className="CtRate"><div style={{width:"12px",height:"12px",borderRadius:"999em",marginTop:"14px",marginLeft:"15px" ,background:'rgba(227, 20, 70, 1)',display:'inline-block'}}></div><span>(Standard-Actual)&gt;Standard {this.state.configList?this.state.configList.criteria_diff:''} %</span></div></Col>
            <Col span={3} className="CtRateStyle"><div className="CtRate"><div style={{width:"12px",height:"12px",borderRadius:"999em",marginTop:"14px",marginLeft:"15px" ,background:'rgb(34, 208, 105)',display:'inline-block'}}></div><span>Actual&ge;Standard</span></div></Col>
          </Row>
          <Row>
            <Col span={17}>{plTitle}</Col>
            <Col span={7}>{plRate}</Col>
          </Row>
        </Content>
        <Footer />
      </Layout>
    );
  }
}

export default App;
