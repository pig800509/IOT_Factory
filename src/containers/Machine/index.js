import React, { Component } from 'react';
 
import { Avatar, Form,   Layout,    Table,  Input,  } from 'antd';
import Title from '../../component/Title';
import {  Link } from "react-router-dom";
import './App.css';
import MenuBar from '../../component/Menu'
import Footer from '../../component/Footer';
import _ from 'lodash';
import CheckError from '../../component/handleErrors';
import { plApiUrl } from '../../config';

const { Header, Content } = Layout;
const {Search} = Input;

class App extends Component {
  constructor(props) {
    super(props);
    const userData =  props.userData;
    this.state = {
      token:{"headers":{"Authorization":_.get(userData, 'token',false)}},
      machineData:{
        machine_type_name:"",
        description:"",
        manufacturer:"",
        model:"",
        photo_filename:"",
        photo:"",
      }, 
      machineList: [], 
      showCreateModal: false,
      showEditModal: false,
      
    };
  }
  componentDidMount() {

      fetch(`${plApiUrl}/machines/`,this.state.token).then(CheckError.resCheck)
      .then((data) => {
        this.setState({
          machineList:data.machine_list,
        }) 
      })
      .catch((error) => {
        console.error(error)
      }) 
  }  
  
  // 2 search machine
  search = (value) => {
    console.log(value)
    let url = (value==='')?`${plApiUrl}/machines/`:`${plApiUrl}/machines?machine_name=${value}`

    fetch(url,this.state.token).then(CheckError.resCheck)
    .then((data) => {
      this.setState({
        machineList:data.machine_list,
      }) 
    })
  }
  
  render() {
    // const roleTypeOptions= Object.keys(roleTypeData).map((key, index)=>
    //   <Option key={key}>{roleTypeData[key]}</Option>
    // );
 

    const columns = [  
      {
        title: 'Photo',
        dataIndex: 'photo_preview_url',
        render: (text, record) => ( 
          <Avatar shape="square"  icon="picture" src={ 'https://'+text} />
        )
      }, {
        title: 'Machine Name',
        dataIndex: 'machine_name',
        sorter: (a, b) => { return a.machine_name.localeCompare(b.machine_name)},

      }, 
      {
        title: 'Type Name',
        dataIndex: 'machine_type_name',
      }, 
      {
        title: 'Serial No.',
        dataIndex: 'serial_no',
      }, 
      {
        title: 'Description',
        dataIndex: 'description',
      }, 
      {
        title: 'Production Line',
        dataIndex: 'pl_name',
      }, 
 
      {
        title: 'Attached Qty',
        dataIndex: 'num_of_devices',
      }
    ];
    return (
      
    <Layout className="layout" style={{height:"100vh",overflowY:"scroll"}}>
      <Header>
        <MenuBar defaultSelectedKeys='3' />
      </Header>
    <Content style={{ padding: '0 50px' }}>
    <Title linkName="Machine" titlename="Machine" />
    {/* <div className="demo-nav">
      <Link to="/machinetype">Type</Link>
      <Link to="/machine">Machine</Link>
 
      <Search onSearch={(value) => this.search(value)} style={{ width: 200, float:"right" }} className="NameColor"/> 
    </div> */}
      <div className="demo-nav">
        <Link to="/machinetype" className="linkTab">Type</Link>
        <Link to="/machine" className="linkTabSelected">List</Link>
        {/* <Tooltip placement="top" title="Add"><Button shape="circle" style={{  float:"right" }}  onClick={this.onCreateBtnClick}  icon="plus" className="addColor"></Button></Tooltip> */}

        <Search onSearch={(value) => this.search(value)} style={{ width: 200, float:"right" }} className="searchColor"/> 
      </div>

      <Table
            dataSource={this.state.machineList}
            columns={columns}
            pagination={false}
            rowKey={record => record.machine_id}
            
        /> 
    </Content>
    <Footer/>
  </Layout>
    );
  }
}

const MachineType = Form.create()(App);
export default MachineType;
