import React, { Component } from 'react';
import { Layout,  Tabs, Table, Button, Input   } from 'antd';
import '../../App.css';
import './App.css';
import MenuBar from '../../component/Menu';
import BreadcrumbHeader from '../../component/Breadcrumb';
import Title from '../../component/Title';
import Footer from '../../component/Footer';

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const { Header, Content } = Layout;
function callback(key) {
  console.log(key);
}

const columns = [{
  title: 'Model Name',
  dataIndex: 'model_name',
}, {
  title: 'Platform',
  dataIndex: 'platform',
}, {
  title: 'Agent',
  dataIndex: 'agent',
}, 
{
  title: 'Register Type',
  dataIndex: 'register_type',
}, 
{
  title: 'Description',
  dataIndex: 'description',
}, 
{
  title: 'Used',
  dataIndex: 'used',
}, 
{
  title: 'Active Status',
  dataIndex: 'status',
}, {
  title: 'Action',
  dataIndex: 'action',
}];

const data = [{
  key: '1',
  id: '',
  modelname: 'IOT getway 100',
  agrnt: 'Yes',
  description:'',
  activeStatus:'',
  protocol:'HTTP',
  occupied:'No',
  action:''
}, {
  key: '2',
  id: '',
  modelname: 'IOT getway 101',
  agrnt: 'Yes',
  description:'',
  activeStatus:'',
  protocol:'HTTP',
  occupied:'No',
  action:''
}, {
  key: '3',
  id: '',
  modelname: 'IOT getway 102',
  agrnt: 'Yes',
  description:'',
  activeStatus:'',
  protocol:'HTTP',
  occupied:'No',
  action:''
}];
class App extends Component {

  
  
  render() {
    return (
      
      <Layout className="layout">
          <Header>
              <MenuBar defaultSelectedKeys='4'/>
          </Header>
          <Content style={{ padding: '0 50px' }}>
              <BreadcrumbHeader linkName="Device"/> 
              <div className="contentStyle">
                  <Title titlename="Device Model" />
                  <Tabs defaultActiveKey="1" onChange={callback}>
                    <TabPane tab="Model" key="1">
                    <div className="searchBtn" >
                      <div className="divStyle"> 
                          <Search
                          placeholder="input search text"
                          onSearch={value => console.log(value)}
                          style={{ width: 200 }}
                          />
                      </div>
                      <div className="divStyle rightStyle">
                        <Button>Add</Button>
                      </div> 
                      
                    </div>     
                    <Table
                        columns={columns}
                        dataSource={data}
                        bordered
                      />
                    </TabPane>
                    <TabPane tab="List" key="2">
                      <Table
                        columns={columns}
                        dataSource={data}
                        bordered
                      />
                    </TabPane>
                  </Tabs>
              </div>
          </Content>
          <Footer />
      </Layout>
    );
  }
}

export default App;
