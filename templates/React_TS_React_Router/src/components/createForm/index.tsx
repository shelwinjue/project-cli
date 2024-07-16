import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input, Form, Select, message, DatePicker, Modal } from 'antd';
import dayjs from 'dayjs';
interface IProps {
  isCreate: boolean;
  showForm: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initValue?: any;
}
export default function CreateForm(props: IProps) {
  const { isCreate } = props;
  const [formUpdataCount, setFormUpdataCount] = useState(1);
  const [form] = Form.useForm();
  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };
  useEffect(() => {
    if (!props.isCreate && props.initValue) {
      const initValue = {
        ...props.initValue,
      };
      if (initValue.demandTime) {
        initValue.demandTime = dayjs(initValue.demandTime);
      }
      if (initValue.startTime) {
        initValue.startTime = dayjs(initValue.startTime);
      }
      if (initValue.endTime) {
        initValue.endTime = dayjs(initValue.endTime);
      }
      form.setFieldsValue(initValue);
      setFormUpdataCount(formUpdataCount + 1);
    }
  }, []);
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        console.log('+++ values', values);
        const newValues = { ...values };
        if (newValues.demandTime) {
          newValues.demandTime = newValues.demandTime.valueOf();
        }
        if (newValues.startTime) {
          newValues.startTime = newValues.startTime.valueOf();
        }
        if (newValues.total) {
          newValues.total = parseFloat(newValues.total);
        }
        console.log('+++ newValues', newValues);
        if (props.isCreate) {
          axios
            .post('/api/portal/downloadManager/add', newValues)
            .then((res) => {
              if (res?.data?.code >= 0) {
                message.success('创建成功');
                props.onSuccess();
              } else {
                return Promise.reject({
                  msg: res?.data?.msg,
                });
              }
            })
            .catch((err) => {
              message.error(err?.msg || '创建接口异常');
            });
        } else {
          axios
            .post('/api/portal/downloadManager/update', {
              ...newValues,
              id: props.initValue?.id,
            })
            .then((res) => {
              if (res?.data?.code >= 0) {
                message.success('更新成功');
                props.onSuccess();
              } else {
                return Promise.reject({
                  msg: res?.data?.msg,
                });
              }
            })
            .catch((err) => {
              message.error(err?.msg || '更新接口异常');
            });
        }
      })
      .catch(() => {});
  };

  const handleCancel = () => {
    // setIsModalOpen(false);
    props.onClose();
  };
  const onValuesChange = () => {
    setFormUpdataCount(formUpdataCount + 1);
  };
  console.log(`form.getFieldValue('fbCode'):`, form.getFieldValue('fbCode'));
  return (
    <Modal width={700} closable={false} open={props.showForm} onOk={handleOk} onCancel={handleCancel}>
      <Form {...layout} form={form} onValuesChange={onValuesChange}>
        <Form.Item label="名称" name="name" rules={[{ required: true }]}>
          <Input placeholder="Please Enter" disabled={!isCreate} />
        </Form.Item>
        <Form.Item label="描述" name="description" rules={[{ required: true }]}>
          <Input placeholder="Please Enter" />
        </Form.Item>
        <Form.Item label="需求方" name="demand" rules={[{ required: true }]}>
          <Input placeholder="Please Enter" />
        </Form.Item>
        <Form.Item label="需求录入时间" name="demandTime">
          <DatePicker showTime />
        </Form.Item>
        <Form.Item label="下载方式" name="downloadWay" rules={[{ required: true }]}>
          <Input placeholder="Please Enter" />
        </Form.Item>
        <Form.Item label="数据总量">
          <Form.Item name="total" style={{ width: '200px', display: 'inline-block' }}>
            <Input placeholder="Please Enter" />
          </Form.Item>
          <Form.Item
            name="unit"
            initialValue="TB"
            style={{
              width: '100px',
              display: 'inline-block',
              marginLeft: '8px',
            }}
          >
            <Select
              options={[
                { label: 'KB', value: 'KB' },
                { label: 'MB', value: 'MB' },
                { label: 'GB', value: 'GB' },
                { label: 'TB', value: 'TB' },
                { label: 'PB', value: 'PB' },
              ]}
            />
          </Form.Item>
        </Form.Item>

        <Form.Item label="下载开始时间" name="startTime">
          <DatePicker showTime />
        </Form.Item>
        <Form.Item label="Endpoint" name="endpoint" rules={[{ required: true }]}>
          <Input placeholder="Please Enter" />
        </Form.Item>
        <Form.Item label="accessKeyId" name="accessKeyId" rules={[{ required: true }]}>
          <Input placeholder="Please Enter" />
        </Form.Item>
        <Form.Item label="accessKeySecret" name="accessKeySecret" rules={[{ required: true }]}>
          <Input placeholder="Please Enter" />
        </Form.Item>
        <Form.Item label="bucketName" name="bucketName" rules={[{ required: true }]}>
          <Input placeholder="Please Enter" />
        </Form.Item>
        <Form.Item label="folderName" name="folderName">
          <Input placeholder="Please Enter" />
        </Form.Item>
        {!isCreate && (
          <Form.Item label="下载反馈" name="fbCode">
            <Select
              options={[
                { value: -1, label: '下载未开始' },
                { value: 0, label: '下载中' },
                { value: 1, label: '下载完成' },
                { value: 2, label: '不可下载' },
              ]}
            />
          </Form.Item>
        )}
        {form.getFieldValue('fbCode') === 2 && (
          <Form.Item label="不可下载说明" name="fbTxt" shouldUpdate>
            <Input.TextArea placeholder="Please Enter" />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
