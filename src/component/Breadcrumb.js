import React, { Component } from 'react';
import { Breadcrumb } from 'antd';
import './kanban.css';

class BreadcrumbHeader extends Component {

  render() {
    return (
        <Breadcrumb  className="breadcrumbStyle">
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>{this.props.linkName}</Breadcrumb.Item>
          </Breadcrumb>
    );
  }
}

export default BreadcrumbHeader;