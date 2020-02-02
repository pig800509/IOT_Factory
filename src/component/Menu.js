import React from 'react';
import './Menu.css';
import { Menu, Row, Col, Avatar, Icon, Modal, Form, Input, Checkbox, Upload, message} from 'antd';
// import {   roleTypeData } from '../config';
import { NavLink } from 'react-router-dom'
import { withRouter } from "react-router-dom";
import _ from 'lodash';
// import { Redirect } from 'react-router-dom';

import { accountApiUrl,accountServerUrl } from '../config';
import CheckError from '../component/handleErrors';


const SubMenu = Menu.SubMenu;
const FormItem = Form.Item;
// const Option = Select.Option;

class MenuItem extends React.Component{
  
  constructor(props) {

    super(props);  

    this.state = { 
      
      userData:sessionStorage.getItem('userData'),
      first_name:'',
      last_name:'',
      username:"",
      photo_url:'',
      password:'',
      email:'',
      phone:'',
      role_id:'',
      user_id:'',
      imageUrl:'',
      role_list:[],
      previewVisible: false,
      inputType: "password",
      previewImage: '',
      pswEditable: true,
      emailAsPassword:true,
      pwd:true,
      photo_preview_url:"",

    }; 

  }

  componentDidMount() {
    let userData = JSON.parse(sessionStorage.getItem('userData'));
    let user_id = _.get(userData, 'user_id',false);
    let photo_url = (_.isNull(userData.photo_url))?`${accountServerUrl}/defaultThumb.png` :`https://${userData.photo_url}`;
    let photo_preview_url = (_.isNull(userData.photo_url))?`${accountServerUrl}/defaultThumb.png` :`https://${userData.photo_preview_url}`;
    let username = _.get(userData, 'username',false) ;
    
    this.setState({
      userData:userData,
      user_id:user_id,
      photo_url:photo_url,
      photo_preview_url:photo_preview_url,
      username:username,
    
    });

  }
  componentWillReceiveProps(nextProps){
    
    console.log(nextProps.photo_preview_url,'nextProps.photo_preview_url-====-');
    console.log(this.state.userData.photo_preview_url,'photo_preview_url-====-');

    if(nextProps.photo_preview_url!==undefined){
      this.setState({
        photo_preview_url:(_.isNull(nextProps.photo_preview_url))?`${accountServerUrl}/defaultThumb.png`:`https://${nextProps.photo_preview_url}` ,
      });
    }

  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  }
  setUserLogout = (e) => {
    const url = `${accountApiUrl}/accounts/logout/`;
    const values={
      "user_id":this.state.user_id
    }
    // console.log(values,'values OUT');

    fetch(url, 
    {
      method: 'POST',
      body: JSON.stringify(values)
    })
    .then((userData) => {
      // console.log(userData,'userData OUT');
      this.props.history.push('/');

    })

  }
  
  showUserSettingModal = () => {
    this.setState({
      visible: true,
    });


    const url = `${accountApiUrl}/accounts/${this.state.user_id}`;
    fetch(url,)
    .then(CheckError.resCheck)
    .then((userData) => {
      this.setState({
        first_name:userData.first_name,
        last_name:userData.last_name,
        username:userData.username,

        password:userData.password,
        email:userData.email,
        phone:userData.phone,
        role_id:userData.role_id,
        photo_url:   (_.isNull(userData.photo_url))?`${accountServerUrl}/defaultThumb.png`:`https://${userData.photo_url}`,
        photo_preview_url:   (_.isNull(userData.photo_preview_url))?`${accountServerUrl}/defaultThumb.png`:`https://${userData.photo_preview_url}` ,
        email4cc: userData.email4cc,

        // imageUrl:new Buffer(bitmap).toString('base64'),
      })
      console.log(this.state,'show USER state');
    })
  }

  handleCancel = (e) => {
    console.log(e);
    this.setState({
      visible: false,
    });
  }
  showpsd = (e) => {
      this.setState({
        pwd:!this.state.pwd
      })
  }
  modifyAccount = (evt,method) => {

    evt.preventDefault()
    // console.log( this.props.form,' this.props.form');
    this.props.form.validateFields((err, values) => {

      if (!err) {
        console.log(values,'data')
        if(method==="PUT")  delete values.username;
        if(method==="PUT")  delete values.role_id;
        // let pwd=values.password?"1":"2"
        if(!values.password) delete values.password;


        var data = new FormData(values);
        
        for ( var key in values ) {
          data.append(key, values[key]);
        }
        // var imagedata = document.querySelector('input[type="file"]').files[0];
        var imagedata = this.state.file;
        data.append("photo", imagedata);
        
        var url = `${accountApiUrl}/accounts`;
        if(method==="PUT")  url = `${accountApiUrl}/accounts/${this.state.user_id}`
        
        fetch(url, { method: method,  body:data,  })
        .then(CheckError.resCheck)
        .then((res) => {
            console.log(res, 'handleRenew')
            if (res.results.status==="Fail") return false
          
              fetch(`${accountApiUrl}/accounts/${this.state.user_id}`)
              .then(CheckError.resCheck)
              .then((data) => {    
                let userData = _.clone(this.state.userData);
                userData.photo_url  = data.photo_url;  
                userData.photo_preview_url = data.photo_preview_url;                     
                console.log(userData,'after');

                sessionStorage.setItem('userData', JSON.stringify(userData));
                this.props.form.resetFields()
                this.setState({
                  photo_url:(_.isNull(data.photo_url))?`${accountServerUrl}/defaultThumb.png` :`https://${data.photo_url}`,
                  photo_preview_url:(_.isNull(data.photo_url))?`${accountServerUrl}/defaultThumb.png` :`https://${data.photo_preview_url}`,
                  username:_.get(data, 'username',false) ,
                  visible: false,
                  modal2Visible: false,

                })

              })

            }
        );

      }
    });

  }
  onUpload = ({file,onSuccess}) => {
    var reader = new window.FileReader();
    reader.readAsDataURL(file);
    reader.onload = (...args) => {
  
      let fileContents = reader.result;
      this.setState({imageUrl:fileContents,file:file, photo_url:fileContents})
       // Do some file processing (perhaps converting an image to base 64?)
      // Show that you have to call onSuccess with `<some string>, file`
      onSuccess('done', file);
    };
    }
  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!');
    } else {
      callback();
    }
  }

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  }
  render() {  
    // console.log('render2')
    // if(this.state.isLogin===false){ return <Redirect to=""/>}

    // if(this.state.isLogin!=="OK"){ return <Redirect to=""/>}

    const { getFieldDecorator } = this.props.form;

    // const roleTypeOptions= Object.keys(roleTypeData).map((key, index)=>
    //   <Option key={key}>{roleTypeData[key]}</Option>
    // );
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
    function beforeUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      if (!isJPG) {
        message.error('You can only upload JPG file!');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must smaller than 2MB!');
      }
      return isJPG && isLt2M;
    }

    // const uploadButton = (
    //   <div>
    //      <Avatar size={164} icon="user" /> 
    //     {/* <Icon type={this.state.loading ? 'loading' : 'user'}   style={{ fontSize: 206, color: '#ddd' }}  />
    //     <div className="ant-upload-text">Photo</div>*/}
    //   </div>
    // );

    return (
      <div>
        <Modal title="User Setting" width={640} visible={this.state.visible} onOk={(evt) => this.modifyAccount(evt,'PUT')} onCancel={this.handleCancel}>
          <FormItem >
            <Col span={12}  offset={8}>
              <Upload 
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={beforeUpload}
                customRequest={this.onUpload}
                onChange={this.uploadChange}
                >
                <Avatar  size={246}   src={this.state.photo_url} />
                </Upload> 
            </Col>
          </FormItem>
          < FormItem { ...formItemLayout} label = "User Name" >
              {getFieldDecorator('username', {rules: [{
                  required: true,
                  message: 'Please input your user name!'
                }],initialValue: this.state.username
              })( <Input disabled={true} />)} 
          </FormItem>
          < FormItem { ...formItemLayout} label = "First Name"  >
            {getFieldDecorator('first_name',{ initialValue: this.state.first_name})( <Input />)} 
          </FormItem>
          < FormItem { ...formItemLayout} label = "Last Name" >
            {getFieldDecorator('last_name',{ initialValue: this.state.last_name})( <Input />)} 
          </FormItem>
          <FormItem {...formItemLayout}  label={(<Checkbox className="checkBoxStyle" onChange={this.showpsd}>Change Password :</Checkbox>)} colon={false}> 
              {getFieldDecorator('password')(
                <div>
                  <br />
                </div>
              )}
             
          </FormItem>
          < FormItem { ...formItemLayout} label = "New Password"  >
            {getFieldDecorator('password', {
              rules: [{
                 message: 'Please input your password!',
              }, {
                validator: this.validateToNextPassword,
              }],
            })(
              <Input type="password" disabled={this.state.pwd}/>
            )}
          </FormItem>
          < FormItem { ...formItemLayout} label = "Confirm Password" >
            {getFieldDecorator('confirm', {
              rules: [{
                 message: 'Please confirm your password!',
              }, {
                validator: this.compareToFirstPassword,
              }],
            })(
              <Input type="password" disabled={this.state.pwd} />
            )}
          </FormItem>
          <FormItem { ...formItemLayout} label = "E-mail"  >
            {
              getFieldDecorator('email', {
                rules: [{
                  type: 'email',
                  message: 'The input is not valid E-mail!',
                }, {
                  required: true,
                  message: 'Please input your E-mail!',
                }],initialValue: this.state.email
              })( <Input />)
            }
          </FormItem>
          < FormItem { ...formItemLayout} label = "Phone No." >
            {getFieldDecorator('phone',{ initialValue: this.state.phone},)( <Input />)}
          </FormItem>

          <FormItem {...formItemLayout} label={(<span>Role</span>)}>
            { getFieldDecorator('role_name',{ initialValue: this.state.role_name},)( <Input disabled />)}

          </FormItem>
          < FormItem { ...formItemLayout} label = "Supervisor E-mail" >
            {getFieldDecorator('email4cc',{ initialValue: this.state.email4cc},)( <Input />)}
          </FormItem>   
        </Modal>

        <Row>
          <Col span={4}><img src="/img/wifactoryiotlogo.png"  alt="logo"/></Col>
          <Col span={17}>  
            <Menu
              onClick={this.handleClick}
              defaultSelectedKeys={[this.props.defaultSelectedKeys]}
              mode="horizontal"
              style={{background:'none',borderBottom:'0px',lineHeight:'53px'}}
            >
              {/* <SubMenu title={<span  className="subMenuStyle" >Dashboard<Icon type="down" /></span>} key="1" >     
                  <Menu.Item key="1:1"><NavLink to="/dashboard">Production Line</NavLink></Menu.Item>
                  <Menu.Item key="1:2">Machine</Menu.Item>
                  <Menu.Item key="1:3">Cycle Time</Menu.Item>
              </SubMenu> */}
              {/* <Menu.Item key="1">
                <NavLink to="/dashboard">Dashboard</NavLink>
              </Menu.Item> */}
              <SubMenu title={<span className="subMenuStyle">Dashboard<Icon type="down" /></span>} key="1" >     
                  <Menu.Item key="1:2"><NavLink to="/productionLineMonitor">Production Line</NavLink></Menu.Item>
                  <Menu.Item key="1:3"><NavLink to="/cycleTimeMonitor">Cycle Time</NavLink></Menu.Item>   
                  <Menu.Item key="1:1"><NavLink to="/machineMonitor">Machine</NavLink></Menu.Item>

              </SubMenu>

              <Menu.Item key="2">
                <NavLink to="/productionline">Production Line</NavLink>
              </Menu.Item>
              {/* <SubMenu title={<span  className="subMenuStyle" >Machine<Icon type="down" /></span>} key="3" >     
                  <Menu.Item key="3:1"><NavLink to="/machine">Type</NavLink></Menu.Item>
                  <Menu.Item key="3:2"><NavLink to="/machine">List</NavLink></Menu.Item>
              </SubMenu> */}
              <Menu.Item key="3">
                <NavLink to="/machinetype">Machine</NavLink>
              </Menu.Item>
              {/* <SubMenu title={<span  className="subMenuStyle">Device<Icon type="down" /></span>} key="4" >     
                  <Menu.Item key="4:1"><NavLink to="/device">Model</NavLink></Menu.Item>
                  <Menu.Item key="4:2"><NavLink to="/device">List</NavLink></Menu.Item>
              </SubMenu> */}
              <Menu.Item key="4">
                <NavLink to="/device">Device</NavLink>
              </Menu.Item>
              <Menu.Item key="5" className="MenuLiStyle" >
                <NavLink to="/account"> 
                    <span>Account</span>
                </NavLink>
              </Menu.Item>  
              <SubMenu title={<span className="subMenuStyle">System<Icon type="down" /></span>} key="6" >     
                  <Menu.Item key="6:1"><NavLink to="/setting/smtp">Setting</NavLink></Menu.Item>
                  <Menu.Item key="6:2"><NavLink to="/log/operation">Log</NavLink></Menu.Item>
                  <Menu.Item key="6:3"><NavLink to="/criteriaSetting">Dashboard config</NavLink></Menu.Item>   
              </SubMenu>
              <SubMenu title={<span className="subMenuStyle">English<Icon type="down" /></span>} key="7" >     
                  <Menu.Item key="7:1">English</Menu.Item>
                  <Menu.Item key="7:2">簡體中文</Menu.Item>
                  <Menu.Item key="7:3">繁體中文</Menu.Item>   
              </SubMenu>
            
            </Menu>
          </Col>
          <Col span={3}>    
            <Menu
              defaultSelectedKeys={[this.props.defaultSelectedKeys]}
              mode="horizontal"
              style={{background:'none',borderBottom:'0px',lineHeight:'53px'}}
            >
              <SubMenu title={<span style={{color:'rgba(255, 255, 255, 1)'}}>
                {/*{<Avatar icon="user"  size={45}  style={{ marginRight:'11px' }} src={"https://"+this.state.photo_url}/>*/}
                <Avatar icon="user"  size={45}  style={{ marginRight:'11px' }} src={this.state.photo_preview_url} />
                {this.state.username}<Icon type="down" /></span>}  key="6" className="menuDroplist">  
                <Menu.Item onClick={this.showUserSettingModal}>User Setting</Menu.Item>
                <Menu.Item onClick={this.setUserLogout}>Logout</Menu.Item>
              </SubMenu>
            </Menu>
          </Col>
        </Row>
        
      </div>
    
    );
  }
}
const WrappedNormalLoginForm = Form.create()(MenuItem);
export default withRouter(WrappedNormalLoginForm);
