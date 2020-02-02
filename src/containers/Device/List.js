import React, { Component } from 'react';
import {   logTypeData } from '../../config';
import { Badge, Tooltip,    Radio,   Modal, Form, Input,   Icon,   Select, Row, Button, Table, Upload  } from 'antd';
import openSocket from 'socket.io-client';
import CheckError from '../../component/handleErrors';
import { devApiUrl, devServerUrl } from '../../config';
import _ from 'lodash';

const socket = openSocket(`${devServerUrl}`, {path:"/dev",transports: ['websocket']});
// const Search = Input.Search;
// const { Header, Content } = Layout;
const FormItem = Form.Item;
const { TextArea } = Input;
const RadioGroup = Radio.Group;

// function hasErrors(fieldsError) {
//   return Object.keys(fieldsError).some(field => fieldsError[field]);
// }
 
const Option = Select.Option;

class App extends Component {
  constructor(props) {
      super(props);
      // const userData =  props.userData;
      
      this.state = {

        token:{"headers":{"Authorization":_.get(props.userData, 'token',false)}},
        Device_Management_Create: (props.userData.permission_settings.EquipmentManagement.Device_Management_Create === 1) ? true : false,
        Device_Management_Delete: (props.userData.permission_settings.EquipmentManagement.Device_Management_Delete === 1) ? true : false,
        Device_Management_Edit: (props.userData.permission_settings.EquipmentManagement.Device_Management_Edit === 1) ? true : false,
        Device_Management_View: (props.userData.permission_settings.EquipmentManagement.Device_Management_View === 1) ? true : false,

        deviceData:{}, 
        deviceList: [], 
        showCreateModal: false,
        showEditModal: false,
        showUploadModal: false,
        showSettingModal: false,
        trash: false,
        modelVisible: false,
        filter:'',
        securityData:{},
        profileData:{
          time_sync_settings : {
        },
       }
      };
  }
  componentWillReceiveProps(nextProps) {

    this.setState({ filter: nextProps.searchvalue});
  }
  componentDidUpdate(prevProps){

    if (this.props.searchvalue !== prevProps.searchvalue || this.props.create !== prevProps.create) {
      let url;
      if(this.state.filter==="null"|| this.state.filter===''){
        url=`${devApiUrl}/devices`;
      }else{
        url=`${devApiUrl}/devices?device_name=${this.state.filter}`;
      }
      fetch(url,this.state.token).then(CheckError.resCheck)
      .then((data) => {
        console.log(data,'data');
        this.setState({
          deviceList:data.device_list,
        }) 
      })
    }
  }
  componentDidMount() {

    console.log(`${devApiUrl}/devices/`,'device');
    fetch(`${devApiUrl}/devices/`, this.state.token).then(CheckError.resCheck)
    .then((data) => {
      console.log('data.device_list ',data);
      socket.on('connect', function(){ console.log("socket shot connect");        });
        _.map(data.device_list,(device )=>{
          socket.on('device'+device.device_id, (res)=>{
            // console.log(res ,"socket shot EVENT");               
            
            // need check real START
            fetch(`${devApiUrl}/devices/`, this.state.token).then(CheckError.resCheck)
            .then((data) => { 
              this.setState({
                deviceList:data.device_list,
              }) 
            })
            // need check real END

          });
        })


      this.setState({
        deviceList:data.device_list,
      }) 
    })

  }  

  // 1-showEdit
  showEdit =(device_id) =>{
    this.setState({
      device_id:device_id, 
      showEditModal:true
    });

    let url = `${devApiUrl}/devices/`+device_id;
    fetch(url, this.state.token).then(CheckError.resCheck)
    .then((data) => {this.setState({ deviceData:data})})

    let securityUrl = `${devApiUrl}/devices/security/`+device_id;
    fetch(securityUrl, this.state.token).then(CheckError.resCheck)
    .then((data) => {

      this.setState({ securityData:data})})
      console.log(this.state.securityData,'secoureddd');

  }

  //1-1 Add or edit onClick Submit
  editDevice = (evt,method) => {

    console.log( this.refs,' this.refs');
    evt.preventDefault()
    // console.log( this.props.form,' this.props.form');
    this.props.form.validateFields((err, values) => {
      console.log( values,' values this.props.form');
      console.log( err,' ERORR');

      if (!err) {
        console.log(values,'data')
        var url = `${devApiUrl}/devices/`;
        if(method==="PUT")  url = `${devApiUrl}/devices/${this.state.device_id}`
        fetch(url, {
          ...this.state.token,
          method: method,       
          body:JSON.stringify(values),          
        })
        .then(CheckError.resCheck)
        .then((res) => {
            console.log(res, 'editdevice')
            // if (res.results.status==="Fail") return false
            // this.setState({modelVisible: false});
              fetch(`${devApiUrl}/devices/`, this.state.token)
              .then(CheckError.resCheck)
              .then((data) => {
                console.log('FAIL NOT ALLOW data',data)
                this.props.form.resetFields()

                this.setState({
                  deviceList:data.device_list,
                  modelVisible: false,
                  showEditModal: false,
                })

              })
 
          }
        );

      }
    });

  }



  // 2-showInfo
  showInfo =(device_id) =>{
    this.setState({
      device_id:device_id, 
      showInfoModal:true
    });
    fetch(`${devApiUrl}/devices/${device_id}`, this.state.token).then(CheckError.resCheck)
    .then((data) => {
      this.setState({
        deviceData:data,
      })

    })

    console.log('device',device_id);
 
  }

  // 3-showSoftwareUpdate
  showSoftwareUpdate =(device_id) =>{
    this.setState({
      device_id:device_id, 
      showUploadModal:true
    });
    console.log('device',device_id);
 
  }
  //3-1 

  setUnregister=(device_id)=>{
    console.log(device_id,'setUnregister');
    const url=`${devApiUrl}/devices/actions/unregister/${device_id}`

  
    fetch(url,{
      ...this.state.token,
      method: 'PUT',
      body: JSON.stringify({})
    }).then(CheckError.resCheck)
    .then((data)=>{
        console.log(data,'data');
        fetch(`${devApiUrl}/devices/`, this.state.token)
        .then(CheckError.resCheck)
        .then((data) => {
          this.setState({
            deviceList:data.device_list,
          })
      
        })
        
      })

  }
  
  // 4-showProfileSetting
  showProfileSetting =(device_id) =>{

    fetch(`${devApiUrl}/devices/profile/${device_id}`, this.state.token )
    .then(CheckError.resCheck)
    .then((data) => {
      console.log("profile",data);
      this.setState({
        device_id:device_id, 
        profileData:data,
        showSettingModal:true
      })
    })

    console.log('device',device_id);
 
  }
  //4-1 setProfile
  setProfileData =(e) =>{
    console.log(this.props,'this.propsthis.props');
    this.setState({ showSettingModal:false});

    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log(values,"this.state.values");
      let profileData=_.clone(this.state.profileData)
      profileData.heartbeat = values.heartbeat;
      profileData.log_level = values.log_level;
      profileData.time_sync_settings.sync_mode = values.sync_mode;
      profileData.sysusage_update_interval = values.sysusage_update_interval;
      console.log(this.state.profileData,"AFTER.state.profileData");

      if (!err) {
        console.log('Received values of form: ', values);
        const url=`${devApiUrl}/devices/profile/${this.state.device_id}`
        fetch(url,{
          ...this.state.token,
          method: 'PUT',
          body: JSON.stringify(profileData)
        }).then(CheckError.resCheck).then((res)=>{console.log(res,"res");})
          
      }
    });

    

    // fetch(`${devApiUrl}/devices/profile/${device_id}`, this.state.token )
    // .then(CheckError.resCheck)
    // .then((data) => {
    //   console.log("profile",data);
    //   this.setState({
    //     profileData:data,
    //   })
    // })
  }
  
  //5-change status 
  onStatusChange(device_id, record) {
    console.log(record,'eeeeeve')
    const num= (record.active_status===1) ? 2:1

    const stateObj={"active_status" : num}
    console.log(stateObj,'dddddd')
    console.log(device_id,'device_id')
    fetch(`${devApiUrl}/devices/actions/active/${device_id}`,{
      ...this.state.token,
      method: 'PUT',
      body: JSON.stringify(stateObj)
    }).then(CheckError.resCheck)
    .then((userData)=>{
        console.log(userData);
        fetch(`${devApiUrl}/devices/`, this.state.token )
        .then(CheckError.resCheck)
        .then((data) => {
          this.setState({
            deviceList:data.device_list,
          })
        })
        
      })
    
  }
  


  // 6-Delete 
  showConfirm(value) {
    Modal.confirm({
      title: 'Are you sure you want to delete this device?',
      okText: 'OK',
      cancelText: 'Cancel',
      onOk:(e) => this.yes(value) ,
    });
  }

  yes(value){

    return new Promise((resolve, reject) => {

      setTimeout(Math.random() > 0.3 ? resolve : reject, 10);
      var url = `${devApiUrl}/devices/`+value; 
      fetch(url, {
          ...this.state.token,
          method: 'DELETE',
        })
        .then(CheckError.resCheck)
        .then(()=>{

          this.setState({
            modelVisible: false,
          });
          fetch(`${devApiUrl}/devices/`, this.state.token).then(CheckError.resCheck)
          .then((data) => {
            this.setState({ deviceList:data.device_list})
          })
          
        })  
      }).catch(() => console.log('Oops errors!'));
     
  }

  // 7- handle cancel
  handleCancel = (e) => {
    console.log(e,'handleCancelhandleCancel');
    this.setState({ 
      showCreateModal: false,
      showEditModal: false,
      showInfoModal: false,
      showUploadModal: false,
      showSettingModal: false,
    
    });

    this.props.form.resetFields()

  }
  handleRenew=()=>{
    // console.log( security,'security')
    
    let values = { "security_key": this.state.securityData.security_key}
    console.log(values,'values');
    fetch( `${devApiUrl}/devices/security/renew/${this.state.deviceData.device_id}`, {
        ...this.state.token,
        method: "POST",
        body: JSON.stringify(values)
      }).then(CheckError.resCheck).then((data)=>{
        console.log(data,'dataRENNNN');
        this.setState({securityData:data.results})
      })

  }




  render() {
    const logTypeOptions= Object.keys(logTypeData).map((key, index)=>
      <Option key={key}>{logTypeData[key]}</Option>
    );
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
      },
    };

    const columns = [{
        title: 'Device Name',
        dataIndex: 'device_name',
        sorter: (a, b) => { return a.device_name.localeCompare(b.device_name)},
        width:176

      }, {
        title: 'Model Name',
        dataIndex: 'model_name',
        width:136,

      }, {
        title: 'Attached Machine',
        dataIndex: 'machine_name',
        width:136,

      }, 
      {
        title: 'MAC Address',
        dataIndex: 'mac_addr',
        width:136,

      }, 
      {
        title: 'IP Address',
        dataIndex: 'ip_addr',
        width:136,

      }, 
      {
        title: 'Protocol',
        dataIndex: 'protocol',
        width:106,

      }, 
      {
        title: 'Online Status',
        dataIndex: 'online',
        width:136,
        render:(text, record)=>{
          return (text)? <Badge  status="success" />:<Badge status="error" />
        }
      }, 
      {
        title: 'Register Status',
        dataIndex: 'register_status',
        width:136,
        render:(text, record)=>{
          return (text)? <Icon type="check" style={{ fontSize: 20,  color: '#52c41a' }}  />:<Icon type="cross" style={{ fontSize: 20, color: 'red' }}  />
        }
      }, 
      {
        title: 'Active Status',
        dataIndex: 'active_status',
        width:"13%",
        render:(text, record)=>{

          let status= "Initial"

          if(text===1){ status="Active"}else if(text===2){status="Inactive" } 
          
          let statusColor="#000000"
          let TooltipTitle="start"
          
          if(record.active_status===1){ statusColor="#52c41a";TooltipTitle="Inactive"}else if(record.active_status===2){statusColor="red";TooltipTitle="Active" } else { statusColor="#000000" }

          let startBtn= <Button   shape="circle" disabled icon="poweroff" className="addColor"/>

          if(record.agent===0 )
          {
            startBtn =<Tooltip trigger={(this.state.Device_Management_Edit )?"hover":"false"}  title={TooltipTitle}><Button disabled={!this.state.Device_Management_Edit } style={{color:statusColor }} shape="circle" onClick={(e) => this.onStatusChange(record.device_id,record)} icon="poweroff" className="activeButton"/></Tooltip>
          }
          else if(record.agent === 1 && (record.active_status===1 || record.active_status===2))
          {
            startBtn=<Tooltip trigger={(this.state.Device_Management_Edit )?"hover":"false"} title={TooltipTitle}><Button disabled={!this.state.Device_Management_Edit } style={{color:statusColor }} shape="circle" onClick={(e) => this.onStatusChange(record.device_id,record)} icon="poweroff" className="activeButton"/></Tooltip>
          }
          return (
            <span>
              <span style={{width:"60px", display:"inline-block"}}>{status}</span>
              {startBtn}
 
              {/* {(record.active_status===2)? <Tooltip title="Unregister"><Button shape="circle" onClick={() => this.setUnregister(record.device_id)} icon="disconnect" className="addColor"/></Tooltip>: <Button shape="circle" disabled icon="disconnect" className="addColor"/>}              */}

            </span>
          )
        }
      }, 
      {
        title: 'Action',
        dataIndex: 'action',
        width:"16%",
        render: (text, record) =>{

          // record.agent 決定 disable
          // record.register_type 決定 #000000 or red or green
          // <Tooltip trigger={(this.state.Device_Model_Management_Edit )?"hover":"false"} title="Edit"   >
          //   <Button disabled={!this.state.Device_Model_Management_Edit } shape="circle" onClick={() => this.showModal(record.model_id)} icon="edit" className="addColor"/>
          // </Tooltip> 

          return (
            <span>
            <Tooltip trigger={(this.state.Device_Management_Edit )?"hover":"false"} title="Edit">
              <Button disabled={!this.state.Device_Management_Edit } shape="circle" onClick={() => this.showEdit(record.device_id)} icon="edit" className="addColor"/>
            </Tooltip>
  
            <Tooltip trigger={(this.state.Device_Management_View )?"hover":"false"} title="Information">
              <Button disabled={!this.state.Device_Management_View } shape="circle" onClick={() => this.showInfo(record.device_id)} icon="info" className="addColor"/>
            </Tooltip>
            
            {/* Softwave Upload Not Yet Impletement  */}
            {/* 
              <Tooltip title="Software update">
                <Button shape="circle" onClick={() => this.showSoftwareUpdate(record.device_id)} icon="arrow-up" className="addColor"/>
              </Tooltip> 
            */}
              <Button shape="circle" disabled icon="arrow-up" className="addColor"/>
            {/* Softwave Upload Not Yet Impletement  */}

            <Tooltip trigger={(this.state.Device_Management_Edit )?"hover":"false"} title="Profile Setting">
              <Button disabled={!this.state.Device_Management_Edit } shape="circle" onClick={() => this.showProfileSetting(record.device_id)} icon="setting" className="addColor"/>
            </Tooltip>
  
            {/* <Divider type="vertical" /> */}

            {/* <Button shape="circle" onClick={() => this.showConfirm(record.device_id)} icon="delete" className="addColor"/> */}
            {/* 0 : init : 剛被 created， 1 : active ，2 : inactive ，4 : deleded : 已被 deleted*/}
            {(record.active_status===2 ||record.active_status===0)? <Tooltip trigger={(this.state.Device_Management_Delete )?"hover":"false"} title="Delete"><Button disabled={!this.state.Device_Management_Delete } shape="circle" onClick={() => this.showConfirm(record.device_id)} icon="delete" className="addColor"/></Tooltip>: <Button shape="circle" disabled icon="delete" className="addColor"/>}             
            {/* {(record.active_status===1)? <Tooltip title="Unregister"><Button shape="circle" onClick={() => this.setUnregister(record.device_id)} icon="discnnect" className="addColor"/></Tooltip>: null}             
            {(record.active_status===2)? <Tooltip title="Unregister"><Button shape="circle" onClick={() => this.setUnregister(record.device_id)} icon="discnnect" className="addColor"/></Tooltip>: null}       */}

          </span>
          )

        }
      }
    ];
    
    
     
    return (
      <Row>


        {/*Edit Modal*/}
        <Modal title="Edit" width={640} visible={this.state.showEditModal} onOk={(evt) => this.editDevice(evt,'PUT')}  onCancel={this.handleCancel}>
          {/* <Modal title="Create Account" width={640} modelVisible={this.state.modelVisible} onOk={this.addAccount} onCancel={this.handleCancel}> */}

            < FormItem { ...formItemLayout} label = "Device Name" >
              {getFieldDecorator('device_model',{ initialValue: this.state.deviceData.device_name})( <Input disabled  />)} 
            </FormItem>

            < FormItem { ...formItemLayout} label = "Model Name" >
              {getFieldDecorator('device_model',{ rules: [{required: true }],initialValue: this.state.deviceData.model_name})( <Input disabled  />)} 
            </FormItem>
            
            < FormItem { ...formItemLayout} label = "MAC Address" >
              {getFieldDecorator('mac_addr',{ rules: [{required: true }],initialValue: this.state.deviceData.mac_addr})( <Input disabled  />)} 
            </FormItem>
            { (this.state.deviceData.register_type===0)? null :  
            < FormItem { ...formItemLayout} label = "Security Key" >
                {getFieldDecorator('security_key', { initialValue: this.state.securityData.security_key})( <Input disabled style={{ width: '260px' }}/>)} 
                <Button onClick={this.handleRenew}  type="primary">Renew</Button>

                <label>
                Expiration : {this.state.securityData.expiration}
                </label>
            </FormItem>
            }
 
            < FormItem { ...formItemLayout} label = "Description" >
              {getFieldDecorator('description',{ initialValue: this.state.deviceData.description},)( <TextArea rows={4} />)}
            </FormItem>

        </Modal>



        {/*Info Modal*/}
        <Modal title="Info" width={640} visible={this.state.showInfoModal} onOk={this.handleCancel}   onCancel={this.handleCancel}>
          {/* <Modal title="Create Account" width={640} modelVisible={this.state.modelVisible} onOk={this.addAccount} onCancel={this.handleCancel}> */}

            < FormItem { ...formItemLayout} label = "Device Name" >
              <Input disabled defaultValue={this.state.deviceData.device_name} />
            </FormItem>
            < FormItem { ...formItemLayout} label = "Model Name" >
              <Input disabled defaultValue={this.state.deviceData.model_name} />
            </FormItem>
            < FormItem { ...formItemLayout} label = "Description" >
              <TextArea rows={4} disabled  defaultValue={this.state.deviceData.description} />
            </FormItem>
            < FormItem { ...formItemLayout} label = "MAC Address" >
              <Input disabled defaultValue={this.state.deviceData.mac_addr} />
            </FormItem>
            < FormItem { ...formItemLayout} label = "IP Address" >
              <Input disabled defaultValue={this.state.deviceData.ip_addr} />
            </FormItem>
            < FormItem { ...formItemLayout} label = "OS Type" >
              <Input disabled defaultValue={this.state.deviceData.os_type} />
            </FormItem>
            < FormItem { ...formItemLayout} label = "OS version" >
              <Input disabled defaultValue={this.state.deviceData.os_version} />
            </FormItem>
            < FormItem { ...formItemLayout} label = "CPU Type" >
              <Input disabled defaultValue={this.state.deviceData.cpu_type} />
            </FormItem>
            < FormItem { ...formItemLayout} label = "Memory Size" >
              <Input disabled defaultValue={this.state.deviceData.mem_size} />
            </FormItem>
            < FormItem { ...formItemLayout} label = "Disk Size" >
              <Input disabled defaultValue={this.state.deviceData.disk_size} />
            </FormItem>
            < FormItem { ...formItemLayout} label = "Registration Time" >
              <Input disabled defaultValue={this.state.deviceData.register_time} />
            </FormItem>

        </Modal>        
        <Modal title="Update" width={640} visible={this.state.showUploadModal} onOk={(evt) => this.setSoftwave(evt)}  onCancel={this.handleCancel}>
          {/* <Modal title="Create Account" width={640} modelVisible={this.state.modelVisible} onOk={this.addAccount} onCancel={this.handleCancel}> */}

            <label> Current version: 1.0. Drop down the list, select the version and click [OK] to update the system.</label>
            <Upload {...formItemLayout}>
              <Button>
              <Icon type="upload" /> Upload
              </Button>
            </Upload>
 
        </Modal>  
        {/* <profileForm
                    wrappedComponentRef={this.saveFormRef_list}
                    visible={this.state.showSettingModal}
                    onCancel={this.handleCancel}
                    onCreate={(evt) => this.setProfileData(evt)}/> */}

        <Modal title="Profile Settings" width={640} visible={this.state.showSettingModal} onOk={(evt) => this.setProfileData(evt)}  onCancel={this.handleCancel}>
           < FormItem { ...formItemLayout} label = "Heartbeat Time"  >
            {getFieldDecorator('heartbeat',{ initialValue: this.state.profileData.heartbeat})( <Input />)} 
          </FormItem>

          <FormItem {...formItemLayout} label="Log Level">
            {getFieldDecorator('log_level',{initialValue: this.state.profileData.log_level})(
              <Select placeholder="Please select a log level" style={{ width: '100%' }}>
              {logTypeOptions}
              </Select>
            )} 

          </FormItem>
          
          < FormItem { ...formItemLayout} label = "Time Sync Setting" >
            {getFieldDecorator('sync_mode',{ initialValue: this.state.profileData.time_sync_settings.sync_mode})(
                  <RadioGroup onChange={this.onChange} >
                     <Radio value={"server"}>Server</Radio>
                     <Radio value={"none"}>None</Radio>

                  </RadioGroup>
                  // <RadioGroup options={options} onChange={this.onChange}  />
                  
              )} 

          </FormItem>
          < FormItem { ...formItemLayout} label = "Sync Interval" >
            {getFieldDecorator('sysusage_update_interval',{ initialValue: this.state.profileData.sysusage_update_interval})( <Input />)} 
          </FormItem>
          < FormItem style={{display:"none"}} { ...formItemLayout} label = "device_model" >
            {getFieldDecorator('device_model',{ initialValue:""})( <Input />)} 
          </FormItem>
          < FormItem style={{display:"none"}} { ...formItemLayout} label = "mac_addr" >
            {getFieldDecorator('mac_addr',{ initialValue: ""})( <Input />)} 
          </FormItem>
 
        </Modal>   

        <Table
            dataSource={this.state.deviceList}
            columns={columns}
            pagination={false}
            rowKey={record => record.device_id}
            
        /> 

      </Row>

       
    );
  }
}

// export default ListTab;
const ListTab = Form.create()(App);
// const Demo = Form.create()(ProfileForm);
export default ListTab;
