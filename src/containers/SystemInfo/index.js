import React, { Component } from 'react';
import { Layout, Row, Col} from 'antd';
import '../../App.css';
import './App.css';
import MenuBar from '../../component/Menu'
import Title from '../../component/Title';
import Footer from '../../component/Footer';
import { Link } from "react-router-dom";
import CheckError from '../../component/handleErrors';
import {systemApiUrl} from '../../config';
import _ from 'lodash';
const { Header, Content } = Layout;

class App extends Component {
  constructor(props) {
    super(props);
    const userData =  props.userData;
    this.state = {
      token:{"headers":{"Authorization":_.get(userData, 'token',false)}},
      info:[]
    };   
    
  }
  componentDidMount() {
    fetch(`${systemApiUrl}/systemConfigs/systemInfo`,this.state.token)   
    .then(CheckError.resCheck)
    .then((data) => {
      this.setState({ info:data });
    })
    .catch((error) => {
      console.error(error)
    }) 
  }
  
  render() {
    let disksRow = [];
    if(this.state.info.disks)
      this.state.info.disks.map((value,key)=>{
        return disksRow.push(<div key={key+'disksRow'}><Col span={5}></Col><Col span={19}><span>{value.disk_name}  {value.total_size} (Used:{value.used_size})</span></Col></div>)
      })
    let networksRow = [];
    if(this.state.info.networks)
      this.state.info.networks.map((value,key)=>{
        return networksRow.push(<div key={key+'networksRow'}><Col span={5}></Col><Col span={19}><span>MAC Address: {value.mac_addr}  (IP Address:{value.ip_addr})</span></Col></div>)
      })
    return (   
      <Layout className="layout">
        <Header>
          <MenuBar defaultSelectedKeys='6:1' />
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <Title titlename="System information" linkName="System setting"/>
          <div className="demo-nav">
            <Link to="/setting/systemInfo" className="linkTabSelected">Information</Link>
            <Link to="/setting/smtp" className="linkTab">SMTP</Link>
            <Link to="/setting/timesync" className="linkTab">Time Sync</Link>
            <Link to="/setting/eventAlert" className="linkTab">Event alert</Link>
          </div>
          <Row>
            <Col  offset={6} span={18}>
              <div className="contentStyle ctConfigSetting">
              <Row className="systemInfoStyle">
                  <Col  style={{textAlign:"right", paddingRight:"10px"}} span={5}><span>OS_Type:</span></Col>
                  <Col span={19}><span>{this.state.info.os_info?this.state.info.os_info.os_type:''}</span></Col>
              </Row>
              <Row className="systemInfoStyle">
                  <Col  style={{textAlign:"right", paddingRight:"10px"}} span={5}><span>Version:</span></Col>
                  <Col span={19}><span>{this.state.info.os_info?this.state.info.os_info.version:''}</span></Col>
              </Row>
              <Row className="systemInfoStyle">
                  <Col  style={{textAlign:"right", paddingRight:"10px"}} span={5}><span>CPU Type:</span></Col>
                  <Col span={19}><span>{this.state.info.cpu_info?this.state.info.cpu_info.cpu_type+'  (Used:'+this.state.info.cpu_info.cpu_usage+")":''}</span></Col>
              </Row>
              <Row className="systemInfoStyle">
                  <Col  style={{textAlign:"right", paddingRight:"10px"}} span={5}><span>Memory Size:</span></Col>
                  <Col span={19}><span>{this.state.info.mem_info?this.state.info.mem_info.total_size+'  (Used:'+this.state.info.mem_info.used_size+")":''}</span></Col>
              </Row>
              <Row className="systemInfoStyle">
                  <Col  style={{textAlign:"right", paddingRight:"10px"}} span={5}><span>Disk Size:</span></Col>
                  {disksRow}              
              </Row>
              <Row className="systemInfoStyle">
                  <Col  style={{textAlign:"right", paddingRight:"10px"}} span={5}><span>Network:</span></Col>
                  {networksRow}
              </Row>
              <Row className="systemInfoStyle">
                  <Col  style={{textAlign:"right", paddingRight:"10px"}} span={5}><span>License Status:</span></Col>
                  <Col span={19}><span>{this.state.info.license_info?this.state.info.license_info.check_status+'  (Cheaked at'+this.state.info.license_info.check_time+")":''}</span></Col>
              </Row>
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
