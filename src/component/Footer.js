import React, { Component } from 'react';
import { Layout } from 'antd';
import './kanban.css';
const { Footer } = Layout;
export default class extends Component {
  render() {  
    return (
        <Footer className="footerStyle">
            Copyright © 2018 Wistron All Rights Reserved
        </Footer>
    );
  }
}

