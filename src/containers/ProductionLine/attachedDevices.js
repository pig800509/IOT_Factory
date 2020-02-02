import React  from 'react';
import { Modal, Form, Table, Button, message } from 'antd';
import {   plApiUrl } from '../../config';

import CreateAttachedDevices from './createAttachedDevices';
import ListDataProcessRule from './listDataProcessRule';
import CheckError from '../../component/handleErrors';

import _ from 'lodash';
const confirmModal = Modal.confirm;
let delconform;
const attachedDevices = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      // console.log(props.token,'tokenpros');
       this.state = {    
        token : props.token, 
        creatAttacheddevices: false,
        editDataProcessRule:false,
        machine_id:props.machine_id,
        machineData:props.machineData,
        device_list:'',
        EditDataProcessRule_data:'',
      };
    }

    /*  Dont Fetch Machine List In First Time, Beacuse Premission Prohibition */ 
    componentDidMount() { 
      // fetch(`${plApiUrl}/machines/attachedDeviceList/${this.state.machine_id}`,this.state.token)
      
      // .then(CheckError.resCheck)
      // .then((data) => {
      //   this.setState({ device_list:data.device_list });
      // })

    }

    componentWillReceiveProps(nextProps) {
      // You don't have to do this check first, but it can help prevent an unneeded render
 
      if( _.isEmpty(nextProps.machine) )return false;
      if (nextProps.machine.machine_id !== this.state.machine_id) {
        this.setState({ machine_id: nextProps.machine.machine_id });
  

        fetch(`${plApiUrl}/machines/attachedDeviceList/${nextProps.machine.machine_id}`,this.state.token)
      
        .then(CheckError.resCheck)
        .then((data) => {
          console.log(data,'dataaaaaaa');
          this.setState({ device_list:data.device_list });
        })
      }
    }
  
    /*Create Attached_Devices start*/
    createAttacheddevices(){
      this.setState({creatAttacheddevices:true,});
    }
    cancelCreateAttacheddevices = () => {
      const form = this.formRef1.props.form;
      form.resetFields();
      this.setState({ creatAttacheddevices: false });
    }
    submitCreateAttacheddevices = (value) => {
      let data={"device_list": []};
      for(let i=0;i<value.length;i++){
        data.device_list.push({"device_id":value[i].device_id,"model_id":value[i].model_id})
      }

      let url=`${plApiUrl}/machines/actions/attachDevices/${this.state.machine_id}`;      
      fetch(url,{
        ...this.state.token,
        method: 'POST',
        body: JSON.stringify(data)
      }).then(CheckError.resCheck).then((response) => {
        fetch(`${plApiUrl}/machines/attachedDeviceList/${this.state.machine_id}`,this.state.token)
        .then(CheckError.resCheck)
        .then((data) => {this.setState({ device_list:data.device_list });})
                         
      })  
      this.setState({ creatAttacheddevices: false });
    }
    saveCreateAttacheddevicesFormRef = (formRef1) => {
      this.formRef1 = formRef1;
    }
    /*Create Attached_Devices end*/
    /*Edit  Data Process Rule start*/
    showeditDataProcessRule(device_id){
      this.setState({EditDataProcessRule_data:device_id});
      this.setState({editDataProcessRule:true});
    }
    cancelEditDataProcessRule = () => {
      const form = this.formRef.props.form;
      form.resetFields();
      this.setState({ editDataProcessRule: false });
    }
    submitEditDataProcessRule = () => {
      const form = this.formRef.props.form;
      form.resetFields();
      this.setState({ editDataProcessRule: false });
    }
    saveLtDataProcessRuleFormRef = (formRef) => {
      this.formRef = formRef;
    }
    showdeleteattachedDevice(device_id,model_id){
      delconform=confirmModal({
        title:'Are you sure you want to remove this device ?',
        okText: 'OK',
        cancelText: 'Cancel',
        visible:true,
        onOk:(e) => this.deleteFunction(device_id,model_id) ,
      });
    }
    deleteFunction(device_id,model_id){
      let url = `${plApiUrl}/machines/actions/detachDevices/${this.state.machine_id}`;
      let data={"device_list": [{"device_id":device_id,"model_id":model_id}]};
      fetch(url, {...this.state.token,method: 'DELETE',body: JSON.stringify(data)})
        .then((response) => {
          delconform.destroy();
          message.success('Deleted!',2);
        })
        .catch((error) => {
          console.error(error)
        }).then(()=>{
          fetch(`${plApiUrl}/machines/attachedDeviceList/${this.state.machine_id}`,this.state.token)
          .then(CheckError.resCheck)
          .then((data) => {this.setState({ device_list:data.device_list });})
               
    }) 
  
  }
  /*Edit Data Process Rule end*/
    render() {
      const { visible, onCancel, onCreate } = this.props;
      const dataSource = [...this.state.device_list];
      const columns = [{
        title: 'Device Name',
        dataIndex: 'device_name',
        className:'classcolor',
      }, {
        title: 'Model Name',
        dataIndex: 'model_name',
        className:'classcolor',
      }, {
        title: 'MAC Address',
        dataIndex: 'mac_addr',
        className:'classcolor',
      }, {
        title: 'Action',
        key: 'action',
        className:'classcolor',
        render: (text, record) => (
          <span>
            <Button shape="circle" icon="bars" className="actionbtn" onClick={() => this.showeditDataProcessRule(record.device_id)}/>
            <Button shape="circle" icon="close" className="actionbtn" onClick={() => this.showdeleteattachedDevice(record.device_id,record.model_id)}/>
          </span>
        ),
      }];
      
      return (
        <Modal
          visible={visible}
          title="Attached Devices"
          okText="OK"
          onCancel={onCancel}
          onOk={onCreate}
          width={691}
        >
          <Button shape="circle" icon="plus" className="actionbtn" style={{float:'right',marginBottom:'5px',zIndex:"2"}} onClick={() => this.createAttacheddevices()}/>
          <Table  columns={columns} dataSource={dataSource} pagination={false} rowKey={data => data.device_id} className="popuprow"/>
          <CreateAttachedDevices
            wrappedComponentRef={this.saveCreateAttacheddevicesFormRef}
            visible={this.state.creatAttacheddevices}
            onCancel={this.cancelCreateAttacheddevices}
            machine_id={this.state.machine_id}
            token={this.state.token}
            onCreate={(value) => this.submitCreateAttacheddevices(value)}
          />
          <ListDataProcessRule
            wrappedComponentRef={this.saveLtDataProcessRuleFormRef}
            visible={this.state.editDataProcessRule}
            onCancel={this.cancelEditDataProcessRule}
            onCreate={() => this.submitEditDataProcessRule()}
            editDataProcessRule_data={this.state.EditDataProcessRule_data}
            machine_id={this.state.machine_id}
            token={this.state.token}
          />
        </Modal>
      );
    }
  }
);
export default attachedDevices;