import React, { PureComponent } from "react";
import {
  Form,
  Input,
  Button,
  InputNumber,
  Checkbox,
  message,
  notification,
  Spin
} from "antd";
import _ from "lodash";
import { formItemLayout, tailFormItemLayout } from "./SettingConfig";
import {systemApiUrl} from "../../config";
import "./App.css";
import CheckError from '../../component/handleErrors';

const FormItem = Form.Item;

//設定TimeSync 頁面的 Form,由於form的樣式有不一致的地方, 故form 沒有在分出component

class TimeSyncSettingFrom extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      pageLoading: true,
      initialForm: {},
      syncCheck: false
    };
  }
  getTimeSyncsetting = async () => {     //抓取API資料的function
    const data = await fetch(
      systemApiUrl+"/systemConfigs/systemTime",
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
    return data;
  };
  async componentDidMount() {     
    let initial = await this.getTimeSyncsetting();  //一開始先抓資料
    if (initial.config_settings) {                  //資料抓完用State設定Form的內容
      this.setState({
        initialForm: initial.config_settings,
        pageLoading: false,
        syncCheck: initial.config_settings.ntp_sync.enabled
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
  handleSubmit = e => {                              //送出資料事件, POST form中的資料到API
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        //console.log('Received values of form: ', {timezone:values.timezone,ntp_sync:_.omit(values, ['timezone'])});
        const hide = message.loading("Saving setting...", 0);
        const putBody = {
          // timezone: values.timezone,
          ntp_sync: {
            enabled: this.state.syncCheck,
            ..._.omit(values, ["timezone"])
          }
        };
        const putResponse = await fetch(
          systemApiUrl+"/systemConfigs/systemTime",
          {
            method: "PUT",
            headers: {
              'Accept': "application/json",
              "Content-Type": "application/json",
              'Authorization': this.props.token
            },
            body: JSON.stringify(putBody)
          }
        )
          .then(CheckError.resCheck)
          .catch(err => {
            console.log("Server error:", err);
          });
        hide();
        if (putResponse.results.status === "OK") {
          this.setState({ initialForm: putBody });
          message.success("Saved successfully.");
        } else message.error("Saved failed.");
      }
    });
  };
  cancel = () => {         //還原form的設定
    const checked = this.state.initialForm.ntp_sync.enabled;
    this.setState({ syncCheck: checked });
    this.props.form.setFieldsValue({
      timezone: this.state.initialForm.timezone,
      ntp_server: this.state.initialForm.ntp_sync.ntp_server,
      ntp_port: parseInt(this.state.initialForm.ntp_sync.ntp_port, 10),
      sync_interval: parseInt(this.state.initialForm.ntp_sync.sync_interval, 10)
    });
  };
  render() {              
    const { getFieldDecorator } = this.props.form;
    const { syncCheck, pageLoading } = this.state;
    const { timezone } = this.state.initialForm || null;
    return (
      <Spin spinning={pageLoading}>
        <Form
          className="settingform"
          onSubmit={this.handleSubmit}
          hideRequiredMark
        >
          <FormItem {...formItemLayout} label="Time zone">
            {getFieldDecorator("timezone", {
              rules: [
                {
                  required: true,
                  message: "Please select your time zone!"
                }
              ]
            })(<span className="ant-form-text">{timezone}</span>)}
          </FormItem>

          <FormItem
            {...formItemLayout}
            colon={false}
            label={
              <Checkbox
                checked={syncCheck}
                onChange={e => {
                  this.setState({ syncCheck: e.target.checked });
                }}
              />
            }
          >
            <span className="ant-form-text">Sync with NTP server</span>
          </FormItem>
          <FormItem {...formItemLayout} label="NTP server">
            {getFieldDecorator("ntp_server", {
              rules: [
                {
                  pattern: new RegExp(
                    "^[a-z0-9]+([-.]{1}[a-z0-9]+)*.[a-z]{1,20}?(/.*)?$"
                  ),
                  message: "The input is not valid server address!"
                },
                {
                  required: true,
                  message: "Please input your mail server address!"
                }
              ]
            })(<Input disabled={!syncCheck} />)}
          </FormItem>

          <FormItem {...formItemLayout} label="NTP Port">
            {getFieldDecorator("ntp_port", {
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
            })(<InputNumber disabled={!syncCheck} style={{ width: "auto" }} />)}
          </FormItem>

          <FormItem {...formItemLayout} label="Sync interval">
            {getFieldDecorator("sync_interval", {
              rules: [
                {
                  type: "integer",
                  message: "The input is not integer!"
                },
                {
                  required: true,
                  message: "Please input server interval!"
                }
              ]
            })(
              <InputNumber
                disabled={!syncCheck}
                style={{ width: "auto" }}
                min={1}
                max={1440}
              />
            )}
            <span className="ant-form-text">(1~1440 mins)</span>
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

// TimeSyncSetting.propTypes = {
//   location: PropTypes.object.isRequired
// };

const TimeSyncSetting = Form.create()(TimeSyncSettingFrom);

export default TimeSyncSetting;
