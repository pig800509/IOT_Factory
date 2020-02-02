import React from "react";
import { Layout } from "antd";
import MenuBar from "../../component/Menu";
import Title from "../../component/Title";
import Footer from "../../component/Footer";
import DashboardTable from "./DashboardTable";
import Search from "./SeachAuto";
import MachineProvider from "./MachineProvider";
import "./App.css";

const { Header, Content } = Layout;

//進入點 只有3個元件
//MachineProvider 用於將Table中的資料共享到 Search
const MachineDashboard = ({ userData }) => (
  <Layout className="layout" style={{ height: "100vh" }}>
    <Header>
      <MenuBar defaultSelectedKeys="6" />
    </Header>
    <Content style={{ padding: "0 50px" }}>
      <Title linkName="Machine Dashboard" titlename="Machine Dashboard" />
      <MachineProvider token={userData}>
        <Search />
        <br />
        <DashboardTable />
      </MachineProvider>
    </Content>
    <Footer />
  </Layout>
);

export default MachineDashboard;
