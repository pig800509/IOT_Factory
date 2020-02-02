import React, { Component } from 'react';
import {  Table,  Button, Modal, Form, Input, Select, Switch, Tooltip, message } from 'antd';
import _ from 'lodash';
import CheckError from '../../component/handleErrors';
import {devApiUrl} from '../../config';
const { TextArea } = Input;
const FormItem = Form.Item;
const Option = Select.Option;
const confirmModal = Modal.confirm;
let delconform;
const CollectionCreateForm = Form.create()(
  class extends React.Component {
    render() {
      const formItemLayout = {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 6 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 14 },
        },
      };
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;
      return (
        <Modal
          visible={visible}
          title="Edit Device Model"
          okText="OK"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form>
            <FormItem label="Model Name" {...formItemLayout}>
              {getFieldDecorator('model_name', {
                rules: [{ required: true, message: 'Please input the Model Name!' }],initialValue: this.props.model_name
              })(
                <Input />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label={(<span>Platform</span>)}>
              {getFieldDecorator('platform', {rules: [{
                  required: true,
                }],initialValue: this.props.platform
              })(
                <Select  style={{ width: '100%' }} disabled>
                  <Option value="Linux">Linux</Option>
                  <Option value="RTOS">RTOS</Option>
                </Select>
                )} 
            </FormItem>
            <FormItem {...formItemLayout} label={(<span>Agent</span>)}>
              {getFieldDecorator('agent', {rules: [{
                  required: true,
                }],initialValue: this.props.agent
              })(
                <Select  style={{ width: '100%' }} disabled>
                  <Option value="0">No</Option>
                  <Option value="1">Yes</Option>
                </Select>
                )} 
            </FormItem>
            <FormItem {...formItemLayout} label={(<span>Register Type</span>)}>
              {getFieldDecorator('register_type', {rules: [{
                  required: true,
                }],initialValue: this.props.register_type
              })(
                <Select  style={{ width: '100%' }} disabled>
                  <Option value="0">None</Option>
                  <Option value="1">By Security Key</Option>
                  <Option value="2">By Mac Address</Option>
                </Select>
                )} 
            </FormItem>
            <FormItem label="Description" {...formItemLayout}>
              {getFieldDecorator('description',{initialValue: this.props.description})(<TextArea rows={4} />)}

            </FormItem>
          </Form>
        </Modal>
      );
    }
  }
);


class ModelTab extends Component {
  constructor(props) {
      super(props);

      console.log(props.userData.permission_settings,"props.userData.permission_settings");
      this.state = {
        token:{"headers":{"Authorization":_.get(props.userData, 'token',false)}},
        Device_Model_Management_Create: (props.userData.permission_settings.EquipmentManagement.Device_Model_Management_Create === 1) ? true : false,
        Device_Model_Management_Delete: (props.userData.permission_settings.EquipmentManagement.Device_Model_Management_Delete === 1) ? true : false,
        Device_Model_Management_Edit: (props.userData.permission_settings.EquipmentManagement.Device_Model_Management_Edit === 1) ? true : false,
        Device_Model_Management_View: (props.userData.permission_settings.EquipmentManagement.Device_Model_Management_View === 1) ? true : false,
        currentModel: {}, 
        list: [], 
        visible: false,
        personinfo:{},
        filter:'',
      };
      this.deleteFunction = this.deleteFunction.bind(this);
  }
  

  componentDidMount() {
     
      fetch(`${devApiUrl}/deviceModels`,this.state.token).then(CheckError.resCheck)
      .then((data) => {
        this.setState({
          list:data.devicemodel_list,
        }) 
      })
  }  
  showModal = (model_id) => {
    this.setState({
      visible: true,
    });
    
    var url=`${devApiUrl}/deviceModels/${model_id}`
    fetch(url ,this.state.token).then(CheckError.resCheck)
    .then((userData) => {
      this.setState({
        personinfo:userData,
      })
    })
  }

  handleCancel = () => {
      const form = this.formRef.props.form;
      form.resetFields();
      this.setState({ visible: false });
  }

  handleCreate = (model_id) => {
    const form = this.formRef.props.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      var data;
      if(values.model_name===this.state.personinfo['model_name']){
        data={
          "description" : values.description
       }
      }else{
        data={
          "model_name" :values.model_name,
          "description" : values.description
       }
      }
      
      
      var url=`${devApiUrl}/deviceModels/${model_id}`
      fetch(url, {
        ...this.state.token,
        method: 'PUT',
        body:JSON.stringify(data)
      })
      .then(CheckError.resCheck)
      .then((userData) => {
        fetch(`${devApiUrl}/deviceModels`,this.state.token)
        .then(CheckError.resCheck)
        .then((data) => {
          this.setState({
            list:data.devicemodel_list,
          }) 
        })
        .catch((error) => {
          console.error(error)
        }) 
      })

      form.resetFields();
      this.setState({ visible: false });
    });
  }

  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }
  componentWillReceiveProps(nextProps) {

    this.setState({ filter: nextProps.searchvalue});
  }
  componentDidUpdate(prevProps){
      console.log(this.props,"MODEL DID UPDATE");
      if (this.props.searchvalue !== prevProps.searchvalue || this.props.create !== prevProps.create) {
        var url;
        console.log(this.state.filter,'this.state.filter');
        if(this.state.filter==="null"|| this.state.filter===''){
          url=`${devApiUrl}/deviceModels`;
        }else{
          url=`${devApiUrl}/deviceModels?model_name=${this.state.filter}`;
        }
       
        fetch(url,this.state.token).then(CheckError.resCheck)
        .then((data) => {
          this.setState({
            list:data.devicemodel_list,
          }) 
        })

    }
 
  }
  onStatusChange(model_id, e) {
    
    const num= (e) ? 1:0
    const stateObj={"active_status" : num}

    const url=`${devApiUrl}/deviceModels/actions/active/${model_id}`
    
    fetch(url,{
      ...this.state.token,
      method: 'PUT',
      body: JSON.stringify(stateObj)
    }).then(CheckError.resCheck)
    .then((userData)=>{
  
        fetch(`${devApiUrl}/deviceModels`,this.state.token).then(CheckError.resCheck)
        .then((itemList) => {
          this.setState({
            list:itemList.devicemodel_list,
          })
      
        })
        .catch((error) => {
          console.error(error)
        })
      })
  }
  
  confirm(model_id) {
    delconform=confirmModal({
      title:'Are you sure you want to delete this model ?',
      okText: 'OK',
      cancelText: 'Cancel',
      visible:true,
      onOk:(e) => this.deleteFunction(model_id) ,
    });
   
  }

  deleteFunction(value){
 
      var url = `${devApiUrl}/deviceModels/${value}`;
      fetch(url, {
          ...this.state.token,
          method: 'DELETE',
        }).then(CheckError.resCheck)
        .then((response) => {
          delconform.destroy();
          message.success('Deleted!',2);
        })
        .then(()=>{
          fetch(`${devApiUrl}/deviceModels`,this.state.token).then(CheckError.resCheck)
          .then((data) => {
            this.setState({
              list:data.devicemodel_list,
            }) 
          })
      }) 
  
  }

  render() {
    
    const columns = [{
        title: 'Model Name',
        dataIndex: 'model_name',
        sorter: (a, b) => {return a.model_name.localeCompare(b.model_name)},
        key: 'model_name' ,
      }, {
        title: 'Platform',
        dataIndex: 'platform',
        key: 'platform' 
      }, {
        title: 'Agent',
        dataIndex: 'agent',
        key: 'agent' ,
        render:(text, record)=>{
          if(text===1){return 'Yes'}else{return 'No'}
        }
      }, 
      {
        title: 'Register Type',
        dataIndex: 'register_type',
        key: 'register_type',
        render:(text, record)=>{
          if(text===0){return 'None'}else if(text===1){return 'By Security Key'}else{return 'By Mac Address'}
        }
      }, 
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description' 
      }, 
      {
        title: 'Used',
        dataIndex: 'used',
        key: 'used' ,
        render:(text, record)=>{
          if(text===1){return 'Yes'}else{return 'No'}
        }
      }, 
      {
        title: 'Active Status',
        dataIndex: 'active_status',
        key: 'active_status' ,

        render:(text, record)=>{
          const status=(text===1) ? true:false     
          const used=(record.used===1) ? true:false  
          // const editable= (this.state.management.edit)?true:false

          return (<Switch checked={ status}  disabled={used || !this.state.Device_Model_Management_Edit }  onChange={(e) => this.onStatusChange(record.model_id,e)}  />)}
      }, 
      {
        title: 'Action',
        dataIndex: 'action',
        render: (text, record) => (

          <span>
            {/* <Button type="primary" >Edit</Button> */}
            {/* <Button shape="circle" onClick={() => this.setModifyAccountModal(record.user_id)} icon="edit" className="addColor"/> */}
              <Tooltip trigger={(this.state.Device_Model_Management_Edit )?"hover":"false"} title="Edit"   ><Button disabled={!this.state.Device_Model_Management_Edit } shape="circle" onClick={() => this.showModal(record.model_id)} icon="edit" className="addColor"/></Tooltip> 
              <Tooltip trigger={(this.state.Device_Model_Management_Delete && !record.active_status )?"hover":"false"} title="Delete"> <Button disabled={!this.state.Device_Model_Management_Delete || record.active_status} shape="circle" onClick={() => this.confirm(record.model_id)} icon="delete" className="addColor"/> </Tooltip>  
           </span>
        )
        // render: (text, record) => (
          // const active_status=record.active_status;

 

        // )

          // if(active_status===1 && true ){
          //   return(<span> 
          //     <Button shape="circle" icon="edit" className="addColor" onClick={() => this.showModal(record.model_id)} />
          //     <Button shape="circle"  icon="delete" className="addColor" onClick={() => this.confirm(record.model_id)} disabled  />
          //   </span>)
          // }else{
          //   return(<span> 
          //     <Tooltip placement="top" title="Edit"><Button shape="circle" icon="edit" className="addColor" onClick={() => this.showModal(record.model_id)}/></Tooltip>
          //     <Tooltip placement="top" title="Delete"><Button shape="circle"  icon="delete" className="addColor" onClick={() => this.confirm(record.model_id)} /></Tooltip>
          //   </span>)
          // }
          
        
      }];
      

    return (
      <div>
    	  <Table
          dataSource={this.state.list}
          columns={columns}
          pagination={false}
          rowKey={data => data.model_id} /> 
        <CollectionCreateForm
          wrappedComponentRef={this.saveFormRef}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          // onCreate={this.handleCreate} 
          onCreate={() => this.handleCreate(this.state.personinfo['model_id'])}
          model_name={this.state.personinfo['model_name']}
          platform={String(this.state.personinfo['platform'])}
          agent={String(this.state.personinfo['agent'])}
          register_type={String(this.state.personinfo['register_type'])}
          description={this.state.personinfo['description']} 
          />
      </div> 
    );
  }
}
const ModelTabForm = Form.create()(ModelTab);
export default ModelTabForm;