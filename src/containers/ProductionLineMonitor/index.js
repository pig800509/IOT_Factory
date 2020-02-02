import React, { Component } from 'react';

import { Icon,  Form,  Tooltip,   Layout,  Input,  Row, Col } from 'antd';
import './App.css';
import MenuBar from '../../component/Menu';
import Title from '../../component/Title';
import Footer from '../../component/Footer';
import {  Chart, Geom, Axis,   Coord,   Legend,  Guide    } from 'bizcharts';
import DataSet from "@antv/data-set";
import CheckError from '../../component/handleErrors';
import { plApiUrl,dashboardApiUrl,dashboardServerUrl } from '../../config';

// import AttachedDevices from './attachedDevices';
// import CreateProductionLine from './createProductionLine';

import _ from 'lodash';
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import openSocket from 'socket.io-client';
const socket = openSocket(`${dashboardServerUrl}`, { path:"/dashboard",transports: ['websocket'] });

const { DataView } = DataSet;
const { Html } = Guide;
 
const dv = new DataView();

const cols = {
  percent: {
    formatter: val => {
      val = (val * 100) + '%';
      return val;
    }
  }
}   

const {Search} = Input;
const { Header, Content } = Layout;

class App extends Component {
  constructor(props) {
    super(props);
    const userData =  props.userData;

    this.state = {
      token:{"headers":{"Authorization":_.get(userData, 'token',false)}},
      machineTypeList:[],
      proLineList:[],
      pieChart:[],
      opacity:1,
      rightSideSpan:21,
      leftSideSpan:3,
      triggerIcon:"caret-right",
      currentMachineType:{},
      machineInfo:{
        "machine_data" : []
      }
      // totalMachines:"0"
      // proLineSortData:{}
    };

    dv.source(this.state.pieChart).transform({
      type: 'percent',
      field: 'count',
      dimension: 'item',
      as: 'percent'
    });
  }
  componentDidMount() {

      // this.setState({ machines: this.props.machineList });
      const url=`${plApiUrl}/machineTypes?active_status=1`
      // console.log(this.state,"STATEEE MAIN");
      fetch(url,this.state.token).then(CheckError.resCheck)
      .then((res) => {
        // console.log(res,'rsssssssDDD'); 
          this.setState({ machineTypeList: res.machine_type_list });
      })     

      fetch(`${dashboardApiUrl}/dashboardData/lineOperatingStatus/`,this.state.token).then(CheckError.resCheck)
      .then((data) => {
        console.log(data.productionlines,"data.productionlines");
        this.setState({proLineList:data.productionlines })

        // Socketio
        socket.on('connect', function () { console.log("socket shot connect"); });

        _.map(data.productionlines,(pl)=>(
          socket.on('dashboardData/lineOperatingStatus/' + pl.pl_id, (res) => {
            // console.log(res, "dashboardData/lineOperatingStatus ");

            const proLineList = this.state.proLineList.slice() //copy the array

            let plIndex = _.findIndex(proLineList, { pl_id: pl.pl_id });
            // console.log(plIndex,"plIndex");
            // console.log(proLineList[plIndex].machine_operating_status,"proLineList[plIndex].machines_data");
            // console.log(res.data.machine.machine_id,"res.data.machine.machine_id");
            let machineIndex = _.findIndex(proLineList[plIndex].machine_operating_status, { machine_id: res.data.machine.machine_id });
            // console.log(machineIndex,"machineIndex");

            proLineList[plIndex].machine_operating_status[machineIndex].opstatus_light = res.data.machine.opstatus_light;
            console.log(res.data.plant,"plant");
            
            this.setState({ proLineList: proLineList, pieChart:res.data.plant });
          })
        ))
        // data.account_list.map((account) => {
        //   socket.on('account/' + account.user_id, (res) => {
        //     console.log(res, "ACCOUNT ");

        //     let index = _.findIndex(this.state.list, { user_id: account.user_id });
        //     const newList = this.state.list.slice() //copy the array
        //     // _.assign({}, newList[index], res.data),
        //     newList[index].online = res.data.online;
        //     this.setState({ list: newList });
        //   })
        // })



      })
      fetch(`${dashboardApiUrl}/dashboardData/machineUtilization/`,this.state.token).then(CheckError.resCheck)
      .then((data) => {
        let pieChart=[
          { item: 'Operation', count: data.num_of_operation },
          { item: 'Breakdown', count: data.num_of_breakdown },
          { item: 'Expectation', count: data.num_of_expectation  },
          { item: 'Planned DT', count: data.num_of_planneddt  }
        ]

        dv.source(pieChart);
        this.setState({pieChart:data })
        console.log(this.state.pieChart,'piechart===');
      })
  }

  // 3 search production line
  search = (value) => {
    let url = (value==='')?`${dashboardApiUrl}/dashboardData/lineOperatingStatus/`:`${dashboardApiUrl}/dashboardData/lineOperatingStatus?pl_name=${value}`
    fetch(url,this.state.token).then(CheckError.resCheck)
    .then((data) => {
      this.setState({
        proLineList:data.productionlines,
      }) 
    })
  }
  
  showMachineInfo=(machine)=>{
    const url=`${dashboardApiUrl}/dashboardData/lineOperatingStatus/byMachine/${machine.machine_id}`
    fetch(url,this.state.token).then(CheckError.resCheck)
    .then((res) => { 
      this.setState({ machineInfo: res });
    });    
  }
  onMachineTypeClick=(machineType)=>{
    let proLineList = _.clone(this.state.proLineList);
    let machineTypeList = _.clone(this.state.machineTypeList);

    if(machineType.machine_type_id===this.state.currentMachineType.machine_type_id){
      _.each(machineTypeList,(machineType)=>{ machineType.opacity=1 })      
      _.each(proLineList, (proLine)=>{
        _.each(proLine.machine_operating_status, (machine)=>{
           machine.opacity=1 
        })
      })
      this.setState({proLineList:proLineList, currentMachineType:{} })
    }else {
      _.each(machineTypeList,(machineType)=>{ machineType.opacity=0.2 })      
      _.each(proLineList, (proLine)=>{
        console.log(proLine);
        _.each(proLine.machine_operating_status, (machine)=>{
          (machine.machine_type_id===machineType.machine_type_id)? machine.opacity=1 :machine.opacity=0.2
        })
      })
      this.setState({proLineList:proLineList, currentMachineType:machineType, machineTypeList:machineTypeList })

    }
    


    // this.state.productionlines
    
  }
  onSideTriggerClick=()=>{
    console.log('this.onSideTriggerClick.form');
    // machineType.machine_type_id
    // this.state.productionlines
    (this.state.leftSideSpan===0)? this.setState({leftSideSpan:3,rightSideSpan:21, triggerIcon:"caret-right"  }): this.setState({leftSideSpan:0,rightSideSpan:24, triggerIcon:"caret-left"  })

  }

  render() {
    const tooltipBtnGroup=( machine)=>(
      
        <div >
        <h4 style={{color:"#ccc"}}>Machine Information</h4>
        <ul style={{listStyleType:"none"}}>          
          <li span={24}>  Name :{this.state.machineInfo.machine_name}</li>
          <li span={24}>  Type:{this.state.machineInfo.machine_type_name}</li>
          <li span={24}>  Serial No :{this.state.machineInfo.serial_no}</li>
          
        </ul>
        <h4 style={{color:"#ccc"}}>Information</h4>
        <ul style={{listStyleType:"none"}}>          
          {
            this.state.machineInfo.machine_data.map( (data, index)=>( 
              <div key={index}>
                <span span={24}>    {data.attribute_name} : {data.value} {data.unit}</span> 

              </div>
              
            ))

          }

        </ul>
      </div>
    )
    const showDotColor=(status)=>{
      let color =  <div className="grayDotStatus"></div>
      switch (status) {
        case "100":
          color=<div className="yellowDotStatus"></div>
          break;
        case "010":
          color=<div className="greenDotStatus"></div>
          break;
        case "001":
          color=<div className="redDotStatus"></div>
          break;
      
        default:
          color=<div className="grayDotStatus"></div>

          break;
      }

      return color
    }
    
    const settings = {
      dots: false,
      infinite: false,
      speed: 500,
      slidesToShow: 8,
      slidesToScroll: 1
    };

    return (
      
    <Layout className="layout " style={{height:"100vh",overflowY:"scroll" ,color:"#ccc" }}>
      <div  onClick={() => this.onSideTriggerClick()} className="triggerBtn" >
        <Icon type={this.state.triggerIcon} theme="outlined" />
      </div>
    <Header>
      <MenuBar defaultSelectedKeys='1:1' /> 
    </Header>
    <Content   style={{ padding: '0 50px' }}>

    <Title linkName="Production Line Dashboard" titlename="Production Line Dashboard" />
      <Row >
        <Col  span={this.state.leftSideSpan} >
        <Chart height={130} data={dv} scale={cols}  padding={[ 0, 16, 0, 0 ]}  forceFit >
          <Coord type={'theta'} radius={1} innerRadius={0.8} />
          <Axis name="percent" />
          <Legend position='right' offsetY={-window.innerHeight / 2 + 120} offsetX={-100} />
          <Guide >
            <Html position ={[ '50%', '50%' ]} html='<div style="color:#ccc;font-size:13px;text-align: center;width: 10em;">Utilization<br><span style="color:#ccc;font-size:10px;">(24H)</span></div>' alignX='middle' alignY='middle'/>
          </Guide>
          <Geom  
            select={false}
            type="intervalStack"
            position="percent"
            color={['item', ['limegreen',"red","gold","silver"]]}
            tooltip={['item*percent',(item, percent) => {
              percent = percent * 100 + '%';
              return {
                name: item,
                value: percent
              };
            }]}
            style={{lineWidth: 1,stroke: '#fff'}}
            >
            {/* <Label content='percent' formatter={(val, item) => {return item.point.item + ': ' + val;}} /> */}
          </Geom>
        </Chart>
        
        <Row style={{marginTop:"18px"}}>
          <div className="greenDotInfo"   ></div><span style={{float:"left"}}>Operation <span style={{fontSize:"22px"  }}>{(this.state.pieChart.total===0)?0:Math.floor((this.state.pieChart.num_of_operation/this.state.pieChart.total)* 100).toString()}</span>%</span>
        </Row>
        <Row style={{marginTop:"18px"}}>
          <div className="redDotInfo"   ></div><span style={{float:"left"}}>Breakdown <span style={{fontSize:"22px"}}>{(this.state.pieChart.total===0)?0:Math.floor((this.state.pieChart.num_of_breakdown/this.state.pieChart.total)* 100).toString()}</span>%</span>
        </Row>
        <Row style={{marginTop:"18px"}}>
          <div className="yellowDotInfo"   ></div><span style={{float:"left"}}>Expectation <span style={{fontSize:"22px"}}>{(this.state.pieChart.total===0)?0:Math.floor((this.state.pieChart.num_of_expectation/this.state.pieChart.total)* 100).toString()}</span>%</span>
        </Row>
        <Row style={{marginTop:"18px"}}>
          <div className="grayDotInfo"   ></div><span style={{float:"left"}}>Planned DT <span style={{fontSize:"22px"}}>{(this.state.pieChart.total===0)?0:Math.floor((this.state.pieChart.num_of_planneddt/this.state.pieChart.total)* 100).toString()}</span>%</span>
        </Row>
 
        

        <Row style={{marginTop:"18px"}}>
          <div className="greenDot" style={{border:"1px solid white" }}><span>{this.state.pieChart.num_of_operation}</span></div>
          <p style={{margin:"2px 0px 10px 18px"}}>Operation</p>
        </Row>
        <Row>
          <div className="redDot" style={{border:"1px solid white" }}><span>{this.state.pieChart.num_of_breakdown}</span></div>
          <p style={{margin:"2px 0px 10px 18px"}}>Breakdown</p>
        </Row>
        <Row>
          <div className="yellowDot" style={{border:"1px solid white" }}><span>{this.state.pieChart.num_of_expectation}</span></div>
          <p style={{margin:"2px 0px 10px 18px"}}>Expectation</p>
        </Row>
        <Row>
          <div className="grayDot" style={{border:"1px solid white" }}><span>{this.state.pieChart.num_of_planneddt}</span></div>
          <p style={{margin:"2px 0px 10px 18px"}}>Planned DT</p>
        </Row>
        <Row>
           <div className="totalMachineInfo" >Total machine(s): {this.state.pieChart.total}</div>
        </Row>
 
        </Col>
        <Col span={this.state.rightSideSpan}>
          <Row style={{marginBottom:"12px"}}>
            <Col span={5}>
              <Search onSearch={(value) => this.search(value)} style={{ width: 200, float:"left" }} className="searchColor"/> 
            </Col>
            <Col span={18} >
                <Slider {...settings}>
                {
                  this.state.machineTypeList.map((machineType) => (
                        <div style={{backgroundColor:"#5eafff"}}  onClick={() => this.onMachineTypeClick(machineType)}  className="machineTypeSlickItem"  key={machineType.machine_type_id} id={machineType.machine_type_id}   index={2}     url={machineType.photo_url} value={machineType.photo_url}> 
                        {machineType.machine_type_name}
                        {/* <img style={{float:"left"}} draggable={false} alt="printer" width="33" drag="false" height="33"  src={"http://"+machineType.photo_preview_url} /> */}
                        {/* <div style={{margin:"5px 0px 0px 38px", whiteSpace:"nowrap", textOverflow:"ellipsis", width:'50px', overflow:'hidden', textAlign:"left"}} >{machineType.machine_type_name}</div> */}
                      </div>
                    ))
                }
                </Slider>
            </Col>
          </Row>
          {
            this.state.proLineList.map((proLine)=>(

              <Row key={proLine.pl_id} style={{backgroundColor:"rgba(255, 255, 255, 0.1)", borderRadius:"14px", marginBottom:"4px" }}>
                <Col span={2}>
                  <div style={{paddingTop:"42px"}}>
 
                      <h2 style={{color:"#cccccc", textAlign:"center",whiteSpace:"nowrap", textOverflow:"ellipsis", width:'100px', overflow:'hidden' }}>{proLine.pl_name}</h2>
                       <h3 style={{color:"#cccccc", textAlign:"center",whiteSpace:"nowrap", textOverflow:"ellipsis", width:'100px', overflow:'hidden' }}>{proLine.description}</h3>
                  
                  </div>  
                </Col>
                <Col span={22}>
                        {
                          proLine.machine_operating_status.map((machine) => (
                            <li key={machine.machine_id} className="list-group-item reorder-box machineItem" style={{opacity:machine.opacity}} >
                              <Tooltip onVisibleChange={()=>this.showMachineInfo(machine)} title={tooltipBtnGroup(proLine,machine)}>
                                {
                                  showDotColor(machine.opstatus_light)
                                }
                              </Tooltip> 

                              <img id={machine.machine_id} draggable={false}  style={{float:"left"}} alt="machine_img" src={"https://"+machine.photo_preview_url} width={60} height={60} />
                              <p id={machine.machine_id}  style={{float:"left", width:"60px",whiteSpace:"nowrap"}}>{machine.machine_name}</p>
                            </li>
                          ))
                        }
 
                </Col>
 
                    <Col offset={18} span={3}>
                      <p> Cycle time:{proLine.total_cycletime}s</p>
                    </Col>
                    <Col   span={3}>
                      <p>Equipment time rate:{proLine.machine_availability}%</p>
                    </Col>
 

              </Row>

            ))
          }

        </Col>
      </Row>
     </Content>
    <Footer/>
  </Layout>
    );
  }
}

const ProductionLine = Form.create()(App);
export default ProductionLine;
