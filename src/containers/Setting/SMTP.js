import React, { PureComponent } from "react";
import {
  Form,
  Input,
  Button,
  InputNumber,
  Spin,
  message,
  notification
} from "antd";
import { formItemLayout, tailFormItemLayout } from "./SettingConfig";
import {systemApiUrl} from "../../config";
import "./App.css";
import CheckError from '../../component/handleErrors';

const FormItem = Form.Item;

//設定SMTP 頁面的 Form,由於form的樣式有不一致的地方, 故form 沒有在分出component

class SMTPSettingFrom extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      pageLoading: true,
      initialForm: null
    };
  }
  getSMTPsetting = async () => { //抓取API資料的function
    const data = await fetch(
      systemApiUrl+"/systemConfigs/smtp",
      {
        method: "GET",
        headers: {
          'Authorization': this.props.token
        }
      }
    )
      .then(CheckError.resCheck)
      .catch(err => {
        console.log("Server error:", err);
        return { config_settings: null, error: err };
      });
    console.log("fetch data:", data);
    return data;
  };
  async componentDidMount() {
    let initial = await this.getSMTPsetting(); //一開始先抓資料
    if (initial.config_settings) {             //資料抓完用State設定Form的內容
      this.setState({
        initialForm: initial.config_settings,
        pageLoading: false
      });
      this.cancel();
    } else {
      this.openNotificationWithIcon("error", "Server error", initial.error);
    }
  }
  openNotificationWithIcon = (type, title, des) => {  //彈出通知的事件
    notification[type]({
      message: title,
      description: des.toString()
    });
  };
  handleSubmit = e => {          //送出資料事件, POST form中的資料到API
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        //console.log('Received values of form: ', values);
        const hide = message.loading("Saving setting...", 0);
        const putResponse = await fetch(
          systemApiUrl+"/systemConfigs/smtp",
          {
            method: "PUT",
            headers: {
              'Authorization': this.props.token,
              'Accept': "application/json",
              'Content-Type': "application/json"
            },
            body: JSON.stringify(values)
          }
        )
          .then(CheckError.resCheck)
          .catch(err => {
            console.log("Server error:", err);
          });
        hide();
        if (putResponse.results.status === "OK") {
          this.setState({ initialForm: values });
          message.success("Saved successfully.");
        } else message.error("Saved failed.");
      }
    });
  };
  cancel = () => {                            //還原form的設定
    this.props.form.setFieldsValue({
      ...this.state.initialForm,
      smtp_port: parseInt(this.state.initialForm.smtp_port, 10)
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const { pageLoading } = this.state;
    return (
      <Spin spinning={pageLoading}>
        <Form
          className="settingform"
          onSubmit={this.handleSubmit}
          hideRequiredMark
        >
          <FormItem {...formItemLayout} label="SMTP server">
            {getFieldDecorator("smtp_server", {
              rules: [
                {
                  pattern: new RegExp(
                    "^[a-z0-9]+([-.]{1}[a-z0-9]+)*.[a-z]{1,20}?(/.*)?$"
                  ),
                  message: "The input is not valid server address!"
                },
                {
                  required: true,
                  message: "Please input mail server address!"
                }
              ]
            })(<Input />)}
          </FormItem>

          <FormItem {...formItemLayout} label="SMTP Port">
            {getFieldDecorator("smtp_port", {
              rules: [
                {
                  type: "integer",
                  message: "The input is not integer!"
                },
                {
                  required: true,
                  message: "Please input mail server port!"
                }
              ]
            })(<InputNumber style={{ width: "auto" }} />)}
          </FormItem>

          <FormItem {...formItemLayout} label="Username">
            {getFieldDecorator("username", {
              rules: [
                {
                  required: true,
                  message: "Please input username!"
                }
              ]
            })(<Input />)}
          </FormItem>

          <FormItem {...formItemLayout} label="Password">
            {getFieldDecorator("password", {
              rules: [
                {
                  required: true,
                  message: "Please input passwird!"
                }
              ]
            })(<Input type="password" />)}
          </FormItem>

          <FormItem {...tailFormItemLayout}>
            <Button htmlType="button" onClick={this.cancel}>
              Cancel
            </Button>
            <Button
              style={{ marginLeft: "15px" }}
              type="primary"
              htmlType="submit"
            >
              Save
            </Button>
          </FormItem>
        </Form>
      </Spin>
    );
  }
}

// SMTPSetting.propTypes = {   location: PropTypes.object.isRequired };

const SMTPSetting = Form.create()(SMTPSettingFrom);

export default SMTPSetting;
