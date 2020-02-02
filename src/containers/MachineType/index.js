import React, { Component } from 'react';
 
import {Upload, Modal, message, Switch, Avatar, Form,Badge, Icon, Tooltip,  Layout,  Table,  Input, Button, Col } from 'antd';
import Title from '../../component/Title';
import Footer from '../../component/Footer';

import {  Link } from "react-router-dom";
import './App.css';
import MenuBar from '../../component/Menu'
// import openSocket from 'socket.io-client';
import AttributeList from './attributeList';
import _ from 'lodash';
import CheckError from '../../component/handleErrors';
import { plApiUrl } from '../../config';

const confirmModal = Modal.confirm;
let delconform;

// const socket = openSocket(`${plServerUrl}`, {path:"/pl",transports: ['websocket']});
const { TextArea } = Input;
const FormItem = Form.Item;
const { Header, Content } = Layout;
const {Search} = Input;

// rowSelection object indicates the need for row selection
// const rowSelection = {
//   onChange: (selectedRowKeys, selectedRows) => {
//     console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
//   },
//   getCheckboxProps: record => ({
//     disabled: record.name === 'Disabled User', // Column configuration not to be checked
//     name: record.name,
//   }),
// };
class App extends Component {
  constructor(props) {
    super(props);
    const userData =  props.userData;

    this.state = {
      token:{"headers":{"Authorization":_.get(userData, 'token',false)}},
      // 只有1 能看，其他都是false，(還沒處理到2)

      Machine_Type_Management_Create: (props.userData.permission_settings.EquipmentManagement.Machine_Type_Management_Create === 1) ? true : false,
      Machine_Type_Management_Delete: (props.userData.permission_settings.EquipmentManagement.Machine_Type_Management_Delete === 1) ? true : false,
      Machine_Type_Management_Edit: (props.userData.permission_settings.EquipmentManagement.Machine_Type_Management_Edit === 1) ? true : false,
      Machine_Type_Management_View: (props.userData.permission_settings.EquipmentManagement.Machine_Type_Management_View === 1) ? true : false,


      machineTypeData:{
        machine_type_name:"",
        description:"",
        manufacturer:"",
        model:"",
        photo_filename:"",
        photo_url:"",

      }, 
      machineTypeList: [], 
      showCreateModal: false,
      showEditModal: false,
      visible: false ,
      machineTypeId:''
      
    };
  }
  componentDidMount() {

      fetch(`${plApiUrl}/machineTypes/`,this.state.token).then(CheckError.resCheck)
      .then((data) => {
        console.log(data,'data');
        // socket.on('connect', function(){ console.log("socket shot connect");        });
        // // socket.on('machine/'+data.machine_list, (res)=>{
        //   data.machine_list.map( (machine)=>{
        //     socket.on('machine/'+machine.machine_id, (res)=>{
        //       // console.log(res ,"socket shot EVENT");               
              
        //       // need check real START
        //       fetch(`${plApiUrl}/machineTypes').then(CheckError.resCheck)
        //       .then((data) => { 
        //         this.setState({
        //           machineTypeList:data.machine_type_list,
        //         }) 
        //       })
        //       // need check real END

        //     });
    
        //   })
        
        this.setState({
          machineTypeList:data.machine_type_list,
        }) 
      })
      .catch((error) => {
        console.error(error)
      }) 
  }
  // 1 show create model
  onCreateBtnClick = () => {
    this.setState({
      showCreateModal: true,
    });
  }
  // 2 search machine
  search = (value) => {
    console.log(value)
    let url = (value==='')?`${plApiUrl}/machineTypes/`:`${plApiUrl}/machineTypes?machine_type_name=${value}`

    fetch(url,this.state.token).then(CheckError.resCheck)
    .then((data) => {
      this.setState({
        machineTypeList:data.machine_type_list,
      }) 
    }).catch((error) => {console.error(error)})  
    
  }

  showEdit =(machine_type_id) =>{
    this.setState({
      machine_type_id:machine_type_id, 
      showEditModal:true
    });

    let url = `${plApiUrl}/machineTypes/${machine_type_id}`;
    fetch(url,this.state.token).then(CheckError.resCheck)
    .then((data) => {console.log(data,'dddddd');this.setState({ machineTypeData:data})})

  }
  showAttribute = (machine_type_id) =>{
    this.setState({
      visible: true,
      machineTypeId:machine_type_id
    });

    
  }

  // 3- Add or edit onClick Submit
  modifyMachine = (evt,method) => {

    console.log( this.refs,' this.refs');
    evt.preventDefault()
    // console.log( this.props.form,' this.props.form');
    this.props.form.validateFields((err, values) => {
      values.photo_filename=_.get(this.state.file,'name','Defualt_XYZ.png');
      console.log( values,' values====');
      console.log( err,' err====');

      if (!err) {
        if(method==="PUT")  delete values.username;

        var data = new FormData(values);
        for ( var key in values ) {
          data.append(key, values[key]);
        }


        
        // var imagedata = document.querySelector('input[type="file"]').files[0];
        var imagedata = this.state.file;
        // 和後端確認，傳入的值
        // return console.log(this.state.file,);
        data.append("photo", imagedata);
        // data.append("photo", { uri:"http://localhost:3000/img/gears.png"  });

        
        console.log(values,'valuesssss');
        console.log(data,'imagedata');

        var url = `${plApiUrl}/machineTypes/`;
        if(method==="PUT")  url = `${plApiUrl}/machineTypes/${this.state.machine_type_id}`
    
        
        fetch(url, { ...this.state.token, method: method,body:data, })
        .then(CheckError.resCheck)
        .then((res) => {
              console.log(res, 'handleRenew')
              if (res.results.status==="Fail") return false
              // this.setState({visible: false});
                fetch(`${plApiUrl}/machineTypes/`,this.state.token)
                .then(CheckError.resCheck)
                .then((data) => {
                  console.log('FAIL NOT ALLOW ')
                  this.props.form.resetFields()
                  
                  //imageUrl 存後恢復 空值
                  this.setState({
                    imageUrl:"",
                    machineTypeList: data.machine_type_list, 
                    showCreateModal: false,
                    showEditModal: false,
                  })

                })

            }
        );

      }
    });

  }


  //5-change status 
  onStatusChange(machine_type_id, evt) {
    console.log(evt,'eeeeeve')
    const num= (evt) ? 1:0

    const stateObj={"active_status" : num}
    console.log(stateObj,'dddddd')
    console.log(machine_type_id,'machine_type_id')
    fetch(`${plApiUrl}/machineTypes/actions/active/${machine_type_id}`,
    {
      ...this.state.token, 
      method: 'PUT',
      body: JSON.stringify(stateObj)
    })
    .then(CheckError.resCheck)
    .then((data)=>{
        console.log(data);
        fetch(`${plApiUrl}/machineTypes/`,this.state.token)
        .then(CheckError.resCheck )
        .then((data) => {
          this.setState({
            machineTypeList:data.machine_type_list,
          })
        })

      })
  }

  //6 onClick Delete click
  showConfirm(machine_type_id) {
    delconform=confirmModal({
      title:'Are you sure you want to delete this Type ?',
      okText: 'OK',
      cancelText: 'Cancel',
      visible:true,
      onOk:(e) => this.deleteFunction(machine_type_id) ,
    });
   
  }

  deleteFunction(value){
    console.log(value);
    const url = `${plApiUrl}/machineTypes/${value}`;
    fetch(url, {
        ...this.state.token,
        method: 'DELETE',
      })
      .then((response) => {
        delconform.destroy();
        message.success('Deleted!',2);
      })
      .then(()=>{
        fetch(`${plApiUrl}/machineTypes`,this.state.token).then(CheckError.resCheck)
        .then((data) => {
          this.setState({
            machineTypeList:data.machine_type_list,
          }) 
        })
    }) 
  
  }

	onUpload = ({ file, onSuccess}) => {
    var reader = new window.FileReader();
    reader.readAsDataURL(file);
    reader.onload = (...args) => {
  
      let fileContents = reader.result;
      console.log(file,'fileee')
      console.log(fileContents,'fileContents');
      
      this.setState({imageUrl:fileContents,file:file, photo_url:fileContents})
      // Do some file processing (perhaps converting an image to base 64?)
  
      // Show that you have to call onSuccess with `<some string>, file`
      onSuccess('done', file);
    };
  }
  onCancelBtnClick = (e) => {
    console.log(this.props.form,'this.props.form');
    // this.setState({ visible: false,  modal2Visible: false});
    this.setState({
      // machineTypeList: data.machine_type_list, 
      showCreateModal: false,
      showEditModal: false,
      machineTypeData:{ },
    })

    this.props.form.resetFields()

  }

  handleCancelCreateAttribute = () => {
    this.setState({ visible: false });
  }

  handleCreateCreateAttribute = (array) => {
    const form = this.formRefCreateAttribute.props.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
  
      console.log('Received values of form: ', values);
      
      form.resetFields();
      this.setState({ visible: false });
    });
  }
  saveFormRefCreateAttribute = (formRefCreateAttribute) => {
    this.formRefCreateAttribute = formRefCreateAttribute;
  }

  render() {
    
    const { getFieldDecorator } = this.props.form;
    const {photo_url} =this.state.machineTypeData
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

    const columns = [  
      {
        title: 'Photo',
        dataIndex: 'photo_url',
        render: (text, record) => ( 
          <Avatar shape="square"   icon="picture"  src={ 'https://'+text} />
        )
      }, {
        title: 'Type Name',
        dataIndex: 'machine_type_name',
        sorter: (a, b) => { return a.machine_type_name.localeCompare(b.machine_type_name)},
      }, 
      {
        title: 'Manufacturer',
        dataIndex: 'manufacturer',
      }, 
      {
        title: 'Model',
        dataIndex: 'model',
      }, 
      {
        title: 'Description',
        dataIndex: 'description',
      }, 
      {
        title: 'Used',
        dataIndex: 'used',
        render:(text, record)=>{
          return (text)? <Badge  status="success" />:<Badge status="error" />
        }
      }, 
      {
        title: 'Active Status',
        dataIndex: 'active_status',
        render:(text, record)=>{
          // console.log(text,'text');
          // console.log(record.used,'used');
          
          const status=(text===0) ? false:true
          const used=(record.used===0) ? false:true
          // console.log(record.used ,'record.used ');
          // console.log(!this.state.Machine_Type_Management_Edit,'!this.state.Machine_Type_Management_Edit ');

          // if(text===1) text=true
          return (<div>
            <Switch checked={ status}  disabled={used || !this.state.Machine_Type_Management_Edit } onChange={(e) => this.onStatusChange(record.machine_type_id,e)}  />
            {/* {(text===3)? <Icon type="lock" />:null} */}
            </div>)
        }
      }, 
      {
        title: 'Action',
        dataIndex: 'action',
        render: (text, record) => (
          <span>

            <Tooltip trigger={(this.state.Machine_Type_Management_Edit)?"hover":"false"}  title="Attribute Setting">
              <Button disabled={!this.state.Machine_Type_Management_Edit} shape="circle" onClick={() => this.showAttribute(record.machine_type_id)} icon="setting" className="addColor"/>
            </Tooltip>
            {/* <Button type="primary" >Edit</Button> */}
            {/* <Button shape="circle" onClick={() => this.setModal2Visible(record.user_id)} icon="edit" className="addColor"/> */}
            <Tooltip trigger={(this.state.Machine_Type_Management_Edit)?"hover":"false"}  title="Edit">
            <Button disabled={!this.state.Machine_Type_Management_Edit} shape="circle" onClick={() => this.showEdit(record.machine_type_id)} icon="edit" className="addColor"/>
             </Tooltip>
            {/* <Divider type="vertical" /> */}
            <Tooltip trigger={(this.state.Machine_Type_Management_Edit && !record.used)?"hover":"false"}  title="Delete">
            <Button disabled={!this.state.Machine_Type_Management_Delete || record.used} shape="circle" onClick={() => this.showConfirm(record.machine_type_id)} icon="delete" className="addColor"/>
            </Tooltip>
    
            {/* <Button onClick={() => this.showConfirm(record.user_id)}>Delete</Button> */}
          </span>
        )
      }
    ];
    function beforeUpload(file) {
      const isJPG = (file.type === 'image/jpeg'|| file.type === 'image/png' );
      if (!isJPG) {
        message.error('You can only upload JPG file!');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must smaller than 2MB!');
      }
      return isJPG && isLt2M;
    }
  
    const uploadButton = (
    <div>
       {/* <Avatar shape="square"  size={164} icon="user" /> */}
      <Icon type={this.state.loading ? 'loading' : "setting"}   style={{ fontSize: 206, color: '#ddd' }}  />
      <div className="ant-upload-text">Photo</div>
    </div>
    );
    
    return (
      
    <Layout className="layout" style={{height:"100vh",overflowY:"scroll"}}>
      <Header>
      <MenuBar defaultSelectedKeys='3' />
      </Header>
    <Content style={{ padding: '0 50px' }}>
    <Title linkName="Machine Type" titlename="Machine Type" />
      <div className="demo-nav">
        <Link to="/machinetype" className="linkTabSelected">Type</Link>
        <Link to="/machine" className="linkTab">List</Link>
        <Tooltip trigger={(this.state.Machine_Type_Management_Create)?"hover":"false"} title="Add">
          <Button disabled={  !this.state.Machine_Type_Management_Create}  shape="circle" style={{  float:"right" }}  onClick={this.onCreateBtnClick}  icon="plus" className="addColor"></Button>
        </Tooltip>
        <Search onSearch={(value) => this.search(value)} style={{ width: 200, float:"right" }} className="searchColor"/> 
      </div>

    {/*Add Modal*/}
    {/* <Modal title="Create Account" width={640} visible={this.state.visible} onOk={this.modifyMachine('POST')} onCancel={this.onCancelBtnClick}> */}
    <Modal title="Create Machine Type" width={640} visible={this.state.showCreateModal} onOk={(evt) => this.modifyMachine(evt,'POST')} onCancel={this.onCancelBtnClick}>
      <FormItem >
        <Col span={12}  offset={8}>
          <Upload 
            name="avatar"
            listType="picture-card"
            className="avatar-uploader uploadpic"
            showUploadList={false}
            beforeUpload={beforeUpload}
            customRequest={this.onUpload}
            // onChange={this.uploadChange}
            >
            {this.state.imageUrl ? <Avatar shape="square"  size={264} src={this.state.imageUrl} /> : uploadButton}
            </Upload> 
          
 
        </Col>
      </FormItem>
      {/* < FormItem { ...formItemLayout} label = "photo File Name" >
        {getFieldDecorator('photo_filename', {rules: [{
              required: true,
              message: 'Please input your file name!'
            }],
          })( <Input />)}
      </FormItem> */}

      < FormItem { ...formItemLayout} label = "Type Name"  >
        {getFieldDecorator('machine_type_name', {rules: [{
              required: true,
              message: 'Please input your type name!'
            }],
          })( <Input />)} 
      </FormItem>
      < FormItem { ...formItemLayout} label = "Model" >
        {getFieldDecorator('model', {rules: [{
              required: true,
              message: 'Please input your model name!'
            }],
          })( <Input />)} 

      </FormItem>
      < FormItem { ...formItemLayout} label = "Manufacturer" >
          {getFieldDecorator('manufacturer', {rules: [{
              required: true,
              message: 'Please input your manufacturer name!'
            }],
          })( <Input />)} 
      </FormItem>


      < FormItem { ...formItemLayout} label = "Description" >
        {getFieldDecorator('description')(<TextArea rows={4} />)}
      </FormItem>

    </Modal>
      
      {/*Edit Modal*/}
      {/* <Modal title="Create Account" width={640} visible={this.state.visible} onOk={this.modifyMachine('POST')} onCancel={this.onCancelBtnClick}> */}
      
      <Modal title="Edit Machine" width={640} visible={this.state.showEditModal} onOk={(evt) => this.modifyMachine(evt,'PUT')} onCancel={this.onCancelBtnClick}>
        <FormItem >
          <Col span={12}  offset={8}>
            {/* <Avatar shape="square" icon="picture"  size={264} src={"https://"+photo_url} />  */}
            {photo_url ? <Avatar shape="square"  size={264} src={"https://"+photo_url} /> : <Avatar shape="square" size={264} icon="picure" />}


          </Col>
        </FormItem>
        {/* < FormItem { ...formItemLayout} label = "photo File Name" >
          {getFieldDecorator('photo_filename', {rules: [{
                required: true,
                message: 'Please input your file name!'
              }],initialValue: this.state.machineTypeData.photo_filename
            })( <Input disabled />)}
        </FormItem> */}

        < FormItem { ...formItemLayout} label = "Type Name"  >
          {getFieldDecorator('machine_type_name', {rules: [{
                required: true,
                message: 'Please input your type name!'
              }],initialValue: this.state.machineTypeData.machine_type_name
            })( <Input disabled/>)} 
        </FormItem>
        < FormItem { ...formItemLayout} label = "Model" >
          {getFieldDecorator('model', {rules: [{
                required: true,
                message: 'Please input your model name!'
              }],initialValue: this.state.machineTypeData.model
            })( <Input />)} 

        </FormItem>
        < FormItem { ...formItemLayout} label = "Manufacturer" >
            {getFieldDecorator('manufacturer', {rules: [{
                required: true,
                message: 'Please input your manufacturer name!'
              }],initialValue: this.state.machineTypeData.manufacturer
            })( <Input />)} 
        </FormItem>


        < FormItem { ...formItemLayout} label = "Description" >
          {getFieldDecorator('description',{initialValue: this.state.machineTypeData.description})( <TextArea rows={4} />)}
        </FormItem>

      </Modal>
      <Table
            dataSource={this.state.machineTypeList}
            columns={columns}
            pagination={false}
            rowKey={record => record.machine_type_id}
        /> 
      <AttributeList
        wrappedComponentRef={this.saveFormRefCreateAttribute}
        visible={this.state.visible}
        onCancel={this.handleCancelCreateAttribute}
        onCreate={(value) => this.handleCreateCreateAttribute(value)}
        machineTypeId={this.state.machineTypeId}
        token={this.state.token}
      />

    </Content>


     <Footer />
  </Layout>
    );
  }
}

const MachineType = Form.create()(App);
export default MachineType;
