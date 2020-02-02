import React, {PureComponent} from 'react';
import {Layout, Input, Tabs} from 'antd';
import '../../App.css';
import './App.css';
import MenuBar from '../../component/Menu'
import Title from '../../component/Title';
import Footer from '../../component/Footer';
import LogTable from '../../component/Table';
import {logColumns,logTabs} from './constants/logSetting';
import CheckError from '../../component/handleErrors';
import { logApiUrl } from '../../config';

const {Header, Content} = Layout;
const {Search} = Input;
const TabPane = Tabs.TabPane;

class LogManagement extends PureComponent {
  // componentDidMount() { }

  render() {
    return (
      <Layout className="layout" style={{ height: "100vh" ,overflowY:"scroll"}}>
        <Header>
          <MenuBar defaultSelectedKeys='6'/>
        </Header>
        <Content style={{
          padding: '0 50px'
        }}>
          <Title linkName="Log" titlename="Log"/>
          <Search
            onSearch={(value) => this.search(value)}
            style={{
            width: 200,
            float: "right"
          }}
            className="searchColor"/>
          <Tabs style={{
            display: "contents"
          }}>
          {logTabs.map((value,index)=>{
            return <TabPane tab={value.title} key={index}><LogTable sourceApi={`${logApiUrl}/logData?category=${value.type}&limit=10`} columns={logColumns}/></TabPane>
          })}
          </Tabs >
        </Content>
        <Footer/>
      </Layout>
    );
  }
}

export default LogManagement;
