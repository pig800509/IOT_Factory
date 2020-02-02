import React, { Component } from 'react';

import { Layout,   Breadcrumb,  } from 'antd';
import MenuBar from '../../component/Menu'
import Footer from '../../component/Footer';

import './App.css';
const { Header, Content, Footer } = Layout;


class App extends Component {
  render() {
    return (
      <Layout className="layout">
    <Header>
      <MenuBar defaultSelectedKeys='1'/>
    </Header>
    <Content style={{ padding: '0 50px' }}>
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item>Home</Breadcrumb.Item>
        <Breadcrumb.Item>List</Breadcrumb.Item>
        <Breadcrumb.Item>App</Breadcrumb.Item>
      </Breadcrumb>
      <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>Content</div>
    </Content>
    <Footer />

  </Layout>
    );
  }
}

export default App;
