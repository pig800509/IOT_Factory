import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import './App.css';
import { Layout, Menu, Breadcrumb } from 'antd';

const { Header, Content, Footer } = Layout;


class App extends Component {
  render() {
    return (
      
      <Layout className="layout">
    <Header>
      <div className="logo" />
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={['2']}
        style={{ lineHeight: '64px' }}
      >
        <Menu.Item key="1">Production Line</Menu.Item>
        <Menu.Item key="2">Dashboard</Menu.Item>
        <Menu.Item key="3">Machine</Menu.Item>
        <Menu.Item key="4">Device</Menu.Item>
        <Menu.Item key="5">Account</Menu.Item>
        <Menu.Item key="6">System</Menu.Item>
        <Menu.Item key="7">Notification</Menu.Item>
        <Menu.Item key="8" style={{ float: 'right' }}>Logout</Menu.Item>
      </Menu>
    </Header>
    <Content style={{ padding: '0 50px' }}>
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item>Home</Breadcrumb.Item>
        <Breadcrumb.Item>List</Breadcrumb.Item>
        <Breadcrumb.Item>App</Breadcrumb.Item>
      </Breadcrumb>
      <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>Content</div>
    </Content>
    <Footer style={{ textAlign: 'center' }}>
      Ant Design ©2016 Created by Ant UED
    </Footer>
  </Layout>
    );
  }
}

export default App;
