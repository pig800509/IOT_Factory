import React, { Component } from 'react';
import { Layout, Input, Row, Col, Divider, Button, Checkbox, Select} from 'antd';
import '../../App.css';
import './App.css';
import MenuBar from '../../component/Menu'
import Title from '../../component/Title';
import Footer from '../../component/Footer';
import { Link } from "react-router-dom";
import MailSetting from '../ProductionLine/mailSetting';
import {systemApiUrl} from '../../config';
import CheckError from '../../component/handleErrors';
import _ from 'lodash';

const { Header, Content } = Layout;
const Option = Select.Option;

// function formatNumber(value) {
//   value += '';
//   const list = value.split('.');
//   const prefix = list[0].charAt(0) === '-' ? '-' : '';
//   let num = prefix ? list[0].slice(1) : list[0];
//   let result = '';
//   while (num.length > 3) {
//     result = `,${num.slice(-3)}${result}`;
//     num = num.slice(0, num.length - 3);
//   }
//   if (num) {
//     result = num + result;
//   }
//   return `${prefix}${result}${list[1] ? `.${list[1]}` : ''}`;
// }

class NumericInput extends React.Component {
  onChange = (e) => {
    const { value } = e.target;
    const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
    if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
      this.props.onChange(value);
    }
  }

  // '.' at the end or only '-' in the input box.
  onBlur = () => {
    const { value, onBlur, onChange } = this.props;
    // console.log(value)
    if (value.charAt(value.length - 1) === '.' || value === '-') {
      onChange({ value: value.slice(0, -1) });
    }
    if (onBlur) {
      onBlur();
    }
  }

  render() {
    // const { value } = this.props;
    // const title = value ? (
    //   <span className="numeric-input-title">
    //     {value !== '-' ? formatNumber(value) : '-'}
    //   </span>
    // ) : 'Input a number';
    return (
        <Input
          {...this.props}
          onChange={this.onChange}
          onBlur={this.onBlur}
          maxLength="25"
        />
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    const userData =  props.userData;
    this.state = {
      token:{"headers":{"Authorization":_.get(userData, 'token',false)}},
      mailsetting:false,
      mailsettingNumber:'',
      value: '',
      valueCheckBox1:'',
      minNumber:'',
      eventAlertConfig:[],
      mailSettingValue:{}
    };   
    this.checkBox1 = this.checkBox1.bind(this);
    this.saveEventAlert = this.saveEventAlert.bind(this);
  }
  componentDidMount() {
    fetch(`${systemApiUrl}/systemConfigs/eventAlertConfigs`,this.state.token)   
    .then(CheckError.resCheck)
    .then((data) => {
      this.setState({ eventAlertConfig:data });
      this.setState({
        valueCheckBox1:data.SM0006.thresholds.disk_space!==null?data.SM0006.thresholds.disk_space.toString():'',
        value:data.DA0307.thresholds.disk_space!==null?data.DA0307.thresholds.disk_space.toString():'',
        minNumber:data.DM0001.thresholds.offline_time!==null?data.DM0001.thresholds.offline_time:'',})
    })
    .catch((error) => {
      console.error(error)
    }) 
  }
  checkBox1 = (e) => {

    if(e.target.value==='SM0006'){
      // this.state.eventAlertConfig.SM0006.enabled=e.target.checked?1:0
      // this.setState({eventAlertConfig:this.state.eventAlertConfig})
      let Enabled = {...this.state.eventAlertConfig};
      Enabled.SM0006.enabled = e.target.checked?1:0                  
      this.setState({eventAlertConfig:Enabled});
    }else if(e.target.value==='SM0005'){
      // this.state.eventAlertConfig.SM0005.enabled=e.target.checked?1:0
      // this.setState({eventAlertConfig:this.state.eventAlertConfig})
      let Enabled = {...this.state.eventAlertConfig};
      Enabled.SM0005.enabled = e.target.checked?1:0                  
      this.setState({eventAlertConfig:Enabled});
    }else if(e.target.value==='AM0004'){
      // this.state.eventAlertConfig.AM0004.enabled=e.target.checked?1:0
      // this.setState({eventAlertConfig:this.state.eventAlertConfig})
      let Enabled = {...this.state.eventAlertConfig};
      Enabled.AM0004.enabled = e.target.checked?1:0                  
      this.setState({eventAlertConfig:Enabled});
    }else if(e.target.value==='DM0001'){
      // this.state.eventAlertConfig.DM0001.enabled=e.target.checked?1:0
      // this.setState({eventAlertConfig:this.state.eventAlertConfig})
      let Enabled = {...this.state.eventAlertConfig};
      Enabled.DM0001.enabled = e.target.checked?1:0                  
      this.setState({eventAlertConfig:Enabled});
    }else if(e.target.value==='DA0307'){
      // this.state.eventAlertConfig.DA0307.enabled=e.target.checked?1:0
      // this.setState({eventAlertConfig:this.state.eventAlertConfig})
      let Enabled = {...this.state.eventAlertConfig};
      Enabled.DA0307.enabled = e.target.checked?1:0                  
      this.setState({eventAlertConfig:Enabled});
    }else if(e.target.value==='DD0000'){
      // this.state.eventAlertConfig.DD0000.enabled=e.target.checked?1:0
      // this.setState({eventAlertConfig:this.state.eventAlertConfig})
      let Enabled = {...this.state.eventAlertConfig};
      Enabled.DD0000.enabled = e.target.checked?1:0                  
      this.setState({eventAlertConfig:Enabled});
    }
    

  }
  onChange = (value) => {
    this.setState({ value:value });
  }
  onChangeCheckBox1 = (value) => {
    this.setState({ valueCheckBox1:value });
  }
  checkNumber(evt) {
    const minNumber = (evt.target.validity.valid) ? evt.target.value : this.state.minNumber;
    this.setState({ minNumber });
  }
  saveEventAlert(){
    // this.state.eventAlertConfig.SM0006.thresholds.disk_space=parseInt(this.state.valueCheckBox1)
    // this.state.eventAlertConfig.DA0307.thresholds.disk_space=parseInt(this.state.value)
    // this.state.eventAlertConfig.DM0001.thresholds.offline_time=parseInt(this.state.minNumber)
    let DiskSpace = {...this.state.eventAlertConfig};
    DiskSpace.SM0006.thresholds.disk_space = parseInt(this.state.valueCheckBox1,10)
    DiskSpace.DA0307.thresholds.disk_space = parseInt(this.state.value,10) 
    DiskSpace.DM0001.thresholds.offline_time = parseInt(this.state.minNumber,10)                
    this.setState({eventAlertConfig:DiskSpace});

    let url=`${systemApiUrl}/systemConfigs/eventAlertConfigs`;
    fetch(url,{
      ...this.state.token,
      method: 'PUT',
      body: JSON.stringify(this.state.eventAlertConfig)
    }).then(CheckError.resCheck)
    .catch((error) => {console.error(error)}) 
    
  }
  /*Mail setting start*/
  showmailSetting(value){
    if(value==='SM0006'){this.setState({ mailSettingValue: this.state.eventAlertConfig.SM0006?this.state.eventAlertConfig.SM0006.actions.settings:{"title":'',"message":""} });}
    else if(value==='SM0005'){this.setState({ mailSettingValue: this.state.eventAlertConfig.SM0005?this.state.eventAlertConfig.SM0005.actions.settings:{"title":'',"message":""}});}
    else if(value==='AM0004'){this.setState({ mailSettingValue: this.state.eventAlertConfig.AM0004?this.state.eventAlertConfig.AM0004.actions.settings:{"title":'',"message":""} });}
    else if(value==='DM0001'){this.setState({ mailSettingValue: this.state.eventAlertConfig.DM0001?this.state.eventAlertConfig.DM0001.actions.settings:{"title":'',"message":""} });}
    else if(value==='DA0307'){this.setState({ mailSettingValue: this.state.eventAlertConfig.DA0307?this.state.eventAlertConfig.DA0307.actions.settings:{"title":'',"message":""} });}
    this.setState({mailsetting:true});
    this.setState({mailsettingNumber:value});
  }
  cancemailsetting = () => {
      const form = this.formRefmail.props.form;
      form.resetFields();
      this.setState({ mailsetting: false });
  }
  submitmailsetting = (e) => {
      const form = this.formRefmail.props.form;
      const eventAlertConfig=this.state.eventAlertConfig
      form.validateFields((err, values) => {
        if (err) {return;}
        if(values.number==='SM0006'){eventAlertConfig.SM0006.actions.settings.title=values.title;eventAlertConfig.SM0006.actions.settings.message=values.message;}
        else if(values.number==='SM0005'){eventAlertConfig.SM0005.actions.settings.title=values.title;eventAlertConfig.SM0005.actions.settings.message=values.message;}
        else if(values.number==='AM0004'){eventAlertConfig.AM0004.actions.settings.title=values.title;eventAlertConfig.AM0004.actions.settings.message=values.message;}
        else if(values.number==='DM0001'){eventAlertConfig.DM0001.actions.settings.title=values.title;eventAlertConfig.DM0001.actions.settings.message=values.message;}
        else if(values.number==='DA0307'){eventAlertConfig.DA0307.actions.settings.title=values.title;eventAlertConfig.DA0307.actions.settings.message=values.message;}
        form.resetFields();
        this.setState({ mailsetting: false });
      });
  }
  savemailsettingRuleFormRef = (formRefmail) => {
      this.formRefmail = formRefmail;
  }
  /*Mail setting end*/ 
  
  render() {
    const eventAlertConfig=this.state.eventAlertConfig
    return (   
      <Layout className="layout">
        <Header>
          <MenuBar defaultSelectedKeys='6:1' />
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <Title titlename="System alert setting" linkName="System setting"/>
          <div className="demo-nav">
            <Link to="/setting/systemInfo" className="linkTab">Information</Link>
            <Link to="/setting/smtp" className="linkTab">SMTP</Link>
            <Link to="/setting/timesync" className="linkTab">Time Sync</Link>
            <Link to="/setting/eventAlert" className="linkTabSelected">Event alert</Link>
          </div>
          <Row>
            <Col  offset={8} span={8}>
              <div className="contentStyle">
                
                <Divider orientation="left" className="ctConfigSetting">System Events</Divider>
                <Row>
                  <Col offset={3} span={18} className="ctConfigSetting">
                    <Checkbox onChange={this.checkBox1} checked={eventAlertConfig.SM0006?eventAlertConfig.SM0006.enabled===1?true:false:false} value="SM0006">Disk Usage Notification</Checkbox>
                    <div className="eventAlertDiv"><span>If the free disk space below </span><NumericInput style={{ width: 100 }} value={this.state.valueCheckBox1} onChange={this.onChangeCheckBox1} /><span> GB</span></div>
                    <div className="eventAlertDiv">
                      <span>Message Action: </span>
                      <Select defaultValue="email" style={{ width: 100 ,marginRight:10}}><Option value="email">Email</Option></Select>
                      <Button className="actionbtn" onClick={() => this.showmailSetting('SM0006')}>Setting</Button>  
                    </div>
                    <Divider style={{opacity:0.5}}/>
                    <Checkbox onChange={this.checkBox1} checked={eventAlertConfig.SM0005?eventAlertConfig.SM0005.enabled===1?true:false:false} value="SM0005">License Key  Issue Notification</Checkbox>
                    <div className="eventAlertDiv">
                      <span>Message Action: </span>
                      <Select defaultValue="email" style={{ width: 100 ,marginRight:10}}><Option value="email">Email</Option></Select>
                      <Button className="actionbtn" onClick={() => this.showmailSetting('SM0005')}>Setting</Button>  
                    </div>
                    <Divider style={{opacity:0.5}}/>
                    <Checkbox onChange={this.checkBox1} checked={eventAlertConfig.AM0004?eventAlertConfig.AM0004.enabled===1?true:false:false} value="AM0004">Account Locked Notification</Checkbox>
                    <div className="eventAlertDiv">
                      <span>Message Action: </span>
                      <Select defaultValue="email" style={{ width: 100 ,marginRight:10}}><Option value="email">Email</Option></Select>
                      <Button className="actionbtn" onClick={() => this.showmailSetting('AM0004')}>Setting</Button>  
                    </div>
                  </Col>
                </Row>
                
                <Divider orientation="left" className="ctConfigSetting">Management Events</Divider>
                <Row>
                  <Col offset={3} span={18} className="ctConfigSetting">
                    <Checkbox onChange={this.checkBox1} checked={eventAlertConfig.DD0000?eventAlertConfig.DD0000.enabled===1?true:false:false}  value="DD0000">Data Process Rule Alert</Checkbox>
                    <Divider style={{opacity:0.5}}/>
                    <Checkbox onChange={this.checkBox1} checked={eventAlertConfig.DM0001?eventAlertConfig.DM0001.enabled===1?true:false:false} value="DM0001">Device Offline Alert</Checkbox>
                    <div className="eventAlertDiv"><span>If device has been offline over </span><Input style={{width:100}} pattern="[0-9]*" onInput={this.checkNumber.bind(this)} value={this.state.minNumber}/><span> Mins.</span></div>
                    <div className="eventAlertDiv">
                      <span>Message Action: </span>
                      <Select defaultValue="email" style={{ width: 100 ,marginRight:10}}><Option value="email">Email</Option></Select>
                      <Button className="actionbtn" onClick={() => this.showmailSetting('DM0001')}>Setting</Button>  
                    </div>
                    <Divider style={{opacity:0.5}}/>
                    <Checkbox onChange={this.checkBox1} checked={eventAlertConfig.DA0307?eventAlertConfig.DA0307.enabled===1?true:false:false} value="DA0307">Device Disk Usage Notification</Checkbox>
                    <div className="eventAlertDiv"><span>If free disk space below </span> <NumericInput style={{ width: 100 }} value={this.state.value} onChange={this.onChange} /><span> GB</span></div>
                    <div className="eventAlertDiv">
                      <span>Message Action: </span>
                      <Select defaultValue="email" style={{ width: 100 ,marginRight:10}}><Option value="email">Email</Option></Select>
                      <Button className="actionbtn" onClick={() => this.showmailSetting('DA0307')}>Setting</Button>  
                    </div>
                  </Col>
                </Row> 
              </div>
              <div className="ctConfigBtn" style={{marginTop:20}}>
                <Button>Cancel</Button><Button type="primary" style={{marginLeft:5}} onClick={this.saveEventAlert}>OK</Button>
              </div>
            </Col>
          </Row>

          <MailSetting
            wrappedComponentRef={this.savemailsettingRuleFormRef}
            visible={this.state.mailsetting}
            onCancel={this.cancemailsetting}
            onCreate={() => this.submitmailsetting()}
            mailSettingValue={this.state.mailSettingValue}
            mailsettingNumber={this.state.mailsettingNumber}
          />    
        </Content>
        <Footer />
      </Layout>
    );
  }
}

export default App;
