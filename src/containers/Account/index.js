import React, { Component } from 'react';
import { Tooltip, Switch, Avatar, message, Layout, Modal, Form, Input, Icon, Select, Col, Checkbox, Button, Table, Upload } from 'antd';
import './App.css';
import MenuBar from '../../component/Menu'
import Title from '../../component/Title';
import Footer from '../../component/Footer';
import { accountApiUrl,accountServerUrl } from '../../config';
import CheckError from '../../component/handleErrors';

import _ from 'lodash';

import openSocket from 'socket.io-client';
// const socket = openSocket(`${accountServerUrl}`, {path:"/account", transports: ['websocket'] });
const socket = openSocket(`${accountServerUrl}`, {path:"/account", transports: ['websocket'] });


const Search = Input.Search;
const { Header, Content } = Layout;
const FormItem = Form.Item;
const Option = Select.Option;
 

class App extends Component {

  constructor(props) {

    super(props);
    const userData = props.userData;
    let permission = (props.userData.permission_settings.AccountManagement || {})
    //editable  0 disable, 1 enable, 2 unvisible
    this.state = {
      token: { "headers": { "Authorization": _.get(userData, 'token', false) } },
      // 只有1 能看，其他都是false，(還沒處理到2)
      creatable: (props.userData.permission_settings.AccountManagement.Account_Create === 1) ? true : false,
      deletable: (props.userData.permission_settings.AccountManagement.Account_Delete === 1) ? true : false,
      editable: (props.userData.permission_settings.AccountManagement.Account_Edit === 1) ? true : false,
      viewable: (props.userData.permission_settings.AccountManagement.Account_View === 1) ? true : false,

      permission: permission,
      // roleTypeData:[],
      userData:userData,
      list: [],
      currentUser: {},
      first_name: '',
      last_name: '',
      // username:'',
      photo_url:   (_.isNull(userData.photo_url))?`${accountServerUrl}/defaultThumb.png` :userData.photo_url,
      photo_preview_url:   (_.isNull(userData.photo_url))?`${accountServerUrl}/defaultThumb.png` :userData.photo_url,
      password: '',
      email: '',
      phone: '',
      role_id: '',
      user_id: '',
      imageUrl: '',
      role_list: [],
      previewVisible: false,
      inputType: "password",
      previewImage: '',
      pswEditable: true,
      emailAsPassword: true,

    };

  }


  componentDidMount() {


    fetch(`${accountApiUrl}/accounts/`, this.state.token)
      .then(CheckError.resCheck)
      .then((data) => {
        console.log(data, "data shot EVENT");

        socket.on('connect', function () { console.log("socket shot connect"); });
        // 回傳值有 results 表示失敗 403
        // console.log(      _.some(data.results, _.isEmpty),"ddddddSOME"      );
        if (_.some(data.results, _.isEmpty)) return false
        _.map(data.account_list, (account) => {
          socket.on('account/' + account.user_id, (res) => {
            console.log(res, "ACCOUNT ");

            let index = _.findIndex(this.state.list, { user_id: account.user_id });
            const newList = this.state.list.slice() //copy the array
            // _.assign({}, newList[index], res.data),
            newList[index].online = res.data.online;
            this.setState({ list: newList });
          })
        })

        this.setState({
          list: data.account_list,
        })
      })
  }

  state = {
    visible: false,
    modal2Visible: false,

  }

  //onClick Edit Button

  onStatusChange(user_id, e) {

    const num = (e) ? 1 : 0

    const stateObj = { "active_status": num }
    // console.log(stateObj)

    fetch(`${accountApiUrl}/accounts/actions/active/${user_id}`, {
      ...this.state.token,
      method: 'PUT',
      body: JSON.stringify(stateObj)
    }).then(CheckError.resCheck)

      .then((userData) => {
        console.log(userData);
        fetch(`${accountApiUrl}/accounts/`, this.state.token)
          .then(CheckError.resCheck)
          .then((itemList) => {
            this.setState({
              list: itemList.account_list,
            })
          })
      })
  }

  //Delete 
  showConfirm(value) {
    Modal.confirm({
      title: 'Are you sure you want to delete this account?',
      okText: 'OK',
      cancelText: 'Cancel',
      onOk: (e) => this.yes(value),
    });
  }

  yes(value) {

    return new Promise((resolve, reject) => {

      setTimeout(Math.random() > 0.3 ? resolve : reject, 10);
      var url = `${accountApiUrl}/accounts/` + value;
      // console.log(value, '=====')
      fetch(url, {
        ...this.state.token,
        method: 'DELETE',
      })
        .then(CheckError.resCheck)
        .then(() => {

          this.setState({
            visible: false,
          });
          fetch(`${accountApiUrl}/accounts/`, this.state.token)
            .then(CheckError.resCheck)
            .then((itemList) => {
              this.setState({
                list: itemList.account_list,
              })

            })
        })
    })
  }

  showAddAccountModal = () => {
    fetch(`${accountApiUrl}/roles/`, this.state.token)
    .then(CheckError.resCheck)
    .then((data) => {
      this.setState({role_list: data.role_list})
    })
    this.setState({
      visible: true,
      emailAsPassword:true,

    });
  }
  search = (value) => {
    var url = (value === '') ? `${accountApiUrl}/accounts/` : `${accountApiUrl}/accounts?username=${value}`
    fetch(url, this.state.token).then(CheckError.resCheck)
      .then((data) => {
        this.setState({
          list: data.account_list,
        })
      }).catch((error) => { console.error(error) })

  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  }

  //0- Add or edit onClick Submit
  addAccount = (evt, method) => {

    evt.preventDefault();
    console.log(method,'err');

    // console.log( this.props.form,' this.props.form');
    this.props.form.validateFields((err, values) => {
      console.log(err,'err');
      if (!err) {
        if (method === "PUT")
        {
          delete values.username;
          if(!values.resetPassword)delete values.password 
          else values.password=values.email
        } else{
          if(this.state.emailAsPassword) values.password=values.email
        }
        // if (method === "PUT" && values.resetPassword===false) 
        // console.log(values, 'data')
        console.log(values,'values');


        var data = new FormData(values);
        for (var key in values) {
          data.append(key, values[key]);
        }

        // var imagedata = document.querySelector('input[type="file"]').files[0];
        var imagedata = this.state.file;
        data.append("photo", imagedata);

        var url = `${accountApiUrl}/accounts/`;
        if (method === "PUT") url = `${accountApiUrl}/accounts/${this.state.user_id}`

        fetch(url, {...this.state.token, method: method,body: data,})
          .then(CheckError.resCheck)
          .then((res) => {

            /* Start 判斷修正account，是否剛好為 使用者 影響 Menu */
            console.log(res.results.user_id,'account result');
            console.log(this.state.userData,'this.state.userData');
            if(this.state.userData.user_id=== res.results.user_id){
              let userData = _.clone(this.state.userData);
              userData.photo_url  = res.results.photo_url;  
              userData.photo_preview_url = res.results.photo_preview_url;                     
              this.setState({ photo_preview_url:   (_.isNull(res.results.photo_preview_url))?`${accountServerUrl}/defaultThumb.png` :res.results.photo_preview_url, })
              
              sessionStorage.setItem('userData', JSON.stringify(userData));
            }
            /* End 判斷修正account，是否剛好為 使用者 影響 Menu */
            
            // this.setState({visible: false});
            fetch(`${accountApiUrl}/accounts/`, this.state.token)
              .then(CheckError.resCheck)
              .then((itemList) => {
                console.log('FAIL NOT ALLOW ')
                this.props.form.resetFields()

                this.setState({
                  list: itemList.account_list,
                  visible: false,
                  modal2Visible: false,
                  first_name: '',
                  last_name: '',
                  username: '',
                  password: '',
                  email: '',
                  phone: '',
                  role_id: '',
                  email4cc: '',
                  photo_url: '',
                  imageUrl: '',


                })

              })
          }
          );

      }
    });

  }
  setModifyAccountModal = (modal2Visible) => {
    var url = `${accountApiUrl}/accounts/${modal2Visible}`
    fetch(url, this.state.token).then(CheckError.resCheck)
      .then((userData) => {

        this.setState({
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,

          password: userData.password,
          email: userData.email,
          phone: userData.phone,
          role_id: userData.role_id,
          role_name: userData.role_name,
          email4cc: userData.email4cc,
          photo_url: "https://" + userData.photo_preview_url,
          modal2Visible: !this.state.modal2Visible,
          user_id: modal2Visible,
          emailAsPassword:false,
          // imageUrl:new Buffer(bitmap).toString('base64'),
        })
      })
  }


  handleCancel = (e) => {
    console.log(e, 'handleCancelhandleCancel');
    // this.setState({ visible: false,  modal2Visible: false});
    this.setState({
      modal2Visible: false,
      visible: false,
      first_name: '',
      last_name: '',
      username: '',

      password: '',
      email: '',
      phone: '',
      role_id: '',
      email4cc: '',
      photo_url: '',
      imageUrl: '',
    })
    this.props.form.resetFields()

  }
  showPassword = (e) => {
    console.log(this.props.form.getFieldValue('email'), ' this.state.email');
    // this.props.form.setFieldValue('email')
    this.setState({ inputType: "text" });
    if (this.state.emailAsPassword) {
      this.setState({ inputType: "text", password: this.props.form.getFieldValue('email') });
      this.props.form.setFieldsValue({ password: this.props.form.getFieldValue('email') });
    }

  }

  hidePassword = (e) => {
    this.setState({
      inputType: "password",
    });
  }

  onEmailChange = (e) => {
    console.log('ee.target.value ', e.target.value)
    // console.log('onEmailChange',this.props.form)
    if (this.state.emailAsPassword) {
      this.setState({ password: this.props.form.getFieldValue('email') });
      this.props.form.setFieldsValue({ password: this.props.form.getFieldValue('email') });
    }

    // if(this.state.emailAsPassword )  this.setState({ password: e.target.value});
    // this.setState({ password: e.target.value});     

  }

  handlePreview = (file) => {
    console.log('handle preview ', file)
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }
  setEmailAsPassword = (e) => {
    console.log("setEmailAsPassword",e.target.checked);
    // emailAsPassword= !e.target.checked 
    this.setState({
      emailAsPassword: e.target.checked
    });

  }

  onPswEditableClick = (e) => {
    console.log("onPswEditableClick")
    this.setState({ pswEditable: false })

  }

  handleChange = ({ file }) => {
    console.log(file, 'file');
  }

  onUpload = ({ file, onSuccess }) => {
    var reader = new window.FileReader();
    reader.readAsDataURL(file);
    reader.onload = (...args) => {
      console.log("-----onload",reader.result);
      let fileContents = reader.result;
      this.setState({ imageUrl: fileContents, file: file, photo_url: fileContents })
      // Do some file processing (perhaps converting an image to base 64?)
      // Show that you have to call onSuccess with `<some string>, file`
      onSuccess('done', file);
    };
  }

  render() {
 
    // const min = window.innerHeight - 131 + 'px';

    const roleTypeOptions =this.state.role_list.map((role) =>
      <Option disabled={(role.role_name==="IT")?true:false} key={role.role_id}>{role.role_name}</Option>
    );

    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: { xs: { span: 24 }, sm: { span: 8 }, },
      wrapperCol: { xs: { span: 24 }, sm: { span: 14 }, },
    };

    const columns = [
      {
        title: 'Photo',
        dataIndex: 'photo_preview_url',
        render: (text, record) => {
          const URL = (text==="" ||_.isNull(text))?`${accountServerUrl}/defaultThumb.png` :`https://${text}`
          return <Avatar icon="user" src={`${URL}`} />
        }
      }, {
        title: 'User Name',
        dataIndex: 'username',
        sorter: (a, b) => { return a.username.localeCompare(b.username) },
      }, {
        title: 'E-mail',
        dataIndex: 'email',
      }, {
        title: 'Phone No.',
        dataIndex: 'phone',
      }, {
        title: 'Role',
        dataIndex: 'role_name',
      }, {
        title: 'Supervisor',
        dataIndex: 'email4cc',
      }, {
        title: 'Online',
        dataIndex: 'online',
        render: (text, record) => (
          (text) ? <Icon type="check" /> : <Icon type="close" />
        )
      }, {
        title: 'Active Status',
        dataIndex: 'active_status',
        render: (text, record) => {
          const status = (text === 3 || text === 4 || text === 0) ? false : true
          // if(text===1) text=true
          return (<div>
            <Switch checked={status} onChange={(e) => this.onStatusChange(record.user_id, e)} disabled={!this.state.editable} />
            {(text === 3) ? <Icon type="lock" /> : null}
          </div>)
        }
      }, {
        title: 'Action',
        dataIndex: 'action',
        render: (text, record) => (
          <span>
            {/* <Button shape="circle" onClick={() => this.setModifyAccountModal(record.user_id)} icon="edit" className="addColor"/> */}
            <Tooltip trigger={(this.state.editable) ? "hover" : "false"} title="Edit"   ><Button disabled={!this.state.editable} shape="circle" onClick={() => this.setModifyAccountModal(record.user_id)} icon="edit" className="addColor" /></Tooltip>
            <Tooltip trigger={(this.state.deletable && !record.active_status) ? "hover" : "false"} title="Delete"> <Button disabled={!this.state.deletable || record.active_status} shape="circle" onClick={() => this.showConfirm(record.user_id)} icon="delete" className="addColor" /> </Tooltip>
          </span>
        )
      }
    ];


    const data = this.state.list;

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
    //     {/* <Avatar size={164} icon="user" /> */}
    //     <Icon type={this.state.loading ? 'loading' : 'user'} style={{ fontSize: 206, color: '#ddd' }} />
    //     <div className="ant-upload-text">Photo</div>
    //   </div>
    // );



    return (

      <Layout className="layout" style={{ height: "100vh", overflowY:"scroll" }}>
        <Header>
          <MenuBar photo_preview_url={this.state.photo_preview_url} defaultSelectedKeys='5' />
        </Header>
        <Content style={{ padding: '0 50px', background: '#222731' }}>
          <Title titlename="Account Management" linkName="Account" />
          <div className="demo-nav">
            <Tooltip trigger={(this.state.creatable) ? "hover" : "false"} title="Add">  <Button disabled={!this.state.creatable} shape="circle" style={{ float: "right" }} onClick={this.showAddAccountModal} icon="plus" className="addColor"></Button> </Tooltip>
            <Search onSearch={(value) => this.search(value)} style={{ width: 200, float: "right" }} className="searchColor" />
          </div>

          {/*Add Modal*/}
          {/* <Modal title="Create Account" width={640} visible={this.state.visible} onOk={this.addAccount('POST')} onCancel={this.handleCancel}> */}
          <Modal title="Create Account" width={640} visible={this.state.visible} onOk={(evt) => this.addAccount(evt, 'POST')} onCancel={this.handleCancel}>
            <FormItem >
              <Col span={12} offset={8}>
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  customRequest={this.onUpload}
                  onChange={this.uploadChange}
                >
                  {this.state.imageUrl ? <Avatar size={264} src={this.state.imageUrl} /> : <Icon type={this.state.loading ? 'loading' : 'user'}   style={{ fontSize: 206, color: '#ddd' }}  />}
                </Upload>
              </Col>
            </FormItem>
            < FormItem {...formItemLayout} label="First Name"  >
              {getFieldDecorator('first_name')(<Input />)}
            </FormItem>
            < FormItem {...formItemLayout} label="Last Name" >
              {getFieldDecorator('last_name')(<Input />)}

            </FormItem>
            < FormItem {...formItemLayout} label="User Name" >
              {getFieldDecorator('username', {
                rules: [{
                  required: true,
                  message: 'Please input your user name!'
                }],
              })(<Input />)}
            </FormItem>

            <FormItem {...formItemLayout} label={(<span>Role</span>)}>
              {getFieldDecorator('role_id', {
                rules: [{
                  required: true,
                  message: 'Please select your role!'
                }],
              })(
                <Select placeholder="Please select a Role" style={{ width: '100%' }}>
                  {roleTypeOptions}
                </Select>
              )}
            </FormItem>
            {
              /* <FormItem {...formItemLayout} label={(<span>Role</span>)}>
              {getFieldDecorator('role_id',{initialValue:Object.keys(roleTypeData)[0] })(
                  <Select defaultValue={Object.keys(roleTypeData)[0]}  placeholder="Please select a Role" style={{ width: '100%' }}>
                  {roleTypeOptions}
                  </Select>
              )} 
            </FormItem>
             */
            }
            <FormItem {...formItemLayout} label="E-mail" >
              {
                getFieldDecorator('email', {
                  rules: [{
                    required: true,
                    message: 'Please input your E-mail!',
                  }], onChange: this.onEmailChange, initialValue: this.state.email
                })(<Input type="email" />)
              }
            </FormItem>
            {/* <Input type="email" onChange={this.onEmailChange}  /> */}

            <FormItem {...formItemLayout} label="Password" >
              {getFieldDecorator('password', {
                rules: [{
                  required: true,
                  message: 'Please input your password!',
                }]
              })(
                <Input type={this.state.inputType} style={{ width: '270px' }} disabled={this.state.emailAsPassword} />
                // <Input  style={{ width: '270px' }} />

              )}
              <Button onMouseDown={this.showPassword} onMouseUp={this.hidePassword} type="primary"><Icon type="eye" /></Button>

              <Checkbox style={{ margin: '0px' }} checked={this.state.emailAsPassword} onChange={ this.setEmailAsPassword}>Use E-mail As Password</Checkbox>
            </FormItem>


            < FormItem {...formItemLayout} label="Phone No." >
              {getFieldDecorator('phone')(<Input />)}
            </FormItem>

            {/* < FormItem {...formItemLayout} label="Phone No." >
              {getFieldDecorator('phone')(<Checkbox style={{marginRight:'5px'}} onChange={this.setEmailAsPassword} checked={this.state.emailAsPassword}/> )}
            </FormItem> */}

            < FormItem {...formItemLayout} label="Supervisor E-mail" >
              {getFieldDecorator('email4cc')(<Input />)}
            </FormItem>

          </Modal>

          {/*Edit Modal*/}

          <Modal title="Edit Account" width={640} visible={this.state.modal2Visible} onOk={(evt) => this.addAccount(evt, 'PUT')} onCancel={this.handleCancel}>
            {/* <Modal title="Create Account" width={640} visible={this.state.visible} onOk={this.addAccount} onCancel={this.handleCancel}> */}

            <FormItem >
              <Col span={12} offset={8}>
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  customRequest={this.onUpload}
                  onChange={this.uploadChange}
                >
                  {this.state.photo_url!==''&&this.state.photo_url!=='https://null' ? <Avatar size={264} src={this.state.photo_url} /> : <Icon type={this.state.loading ? 'loading' : 'user'}   style={{ fontSize: 206, color: '#ddd' }}  />}
                </Upload>
              </Col>
            </FormItem>
            < FormItem {...formItemLayout} label="First Name"  >
              {getFieldDecorator('first_name', { initialValue: this.state.first_name })(<Input />)}
            </FormItem>
            < FormItem {...formItemLayout} label="Last Name" >
              {getFieldDecorator('last_name', { initialValue: this.state.last_name })(<Input />)}

            </FormItem>
            < FormItem {...formItemLayout} label="User Name" >
              {getFieldDecorator('username', {
                rules: [{
                  required: true,
                  message: 'Please input your user name!'
                }], initialValue: this.state.username
              })(<Input disabled={true} />)}
            </FormItem>


            <FormItem style={{display:"none"}} {...formItemLayout} label={(<span>Role</span>)}>
              {getFieldDecorator('role_id', {
                rules: [{
                  required: true,
                  message: 'Please Select role!'
                }], initialValue: this.state.role_id
              })(
                <Select disabled placeholder="Please select a country" style={{ width: '100%' }}>
                  {roleTypeOptions}
                </Select>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label={(<span>Role</span>)}>
            {getFieldDecorator('role_name', { initialValue: this.state.role_name })(<Input  disabled/>)}

            </FormItem>

            <FormItem {...formItemLayout} label="E-mail"  >
              {
                getFieldDecorator('email', {
                  rules: [{
                    type: 'email',
                    message: 'The input is not valid E-mail!',
                  }, {
                    required: true,
                    message: 'Please input your E-mail!',
                  }], initialValue: this.state.email
                })(<Input />)
              }
            </FormItem>
            <FormItem {...formItemLayout}  label={('Reset password')} > 
              {getFieldDecorator('resetPassword')(
                <Checkbox style={{ margin: '0px' }}
                checked={this.state.emailAsPassword}
                onChange={this.setEmailAsPassword}
                // onChange={this.handleChange}
              >
                Reset Password As E-mail 
                  </Checkbox>
              )}
             
            </FormItem>
  
            <FormItem style={{display:"none"}} {...formItemLayout} label="Password" >
              {getFieldDecorator('password', { initialValue: this.state.password })(<Input />)}
            </FormItem>

            < FormItem {...formItemLayout} label="Phone No." >
              {getFieldDecorator('phone', { initialValue: this.state.phone })(<Input />)}
            </FormItem>

            < FormItem {...formItemLayout} label="Supervisor E-mail" >
              {getFieldDecorator('email4cc', { initialValue: this.state.email4cc })(<Input />)}
            </FormItem>

          </Modal>

          {/*List*/}
          <Table

            columns={columns}
            dataSource={data}
            rowKey={data => data.user_id}
            pagination={false}
            className="test"
          />
          {/* <Pagination className="btn-right" showQuickJumper defaultCurrent={2} total={500} onChange={onPageChange} />, */}

        </Content>
        <Footer />
      </Layout>
    );
  }
}
const WrappedNormalLoginForm = Form.create()(App);
export default WrappedNormalLoginForm;

