import React, { useState, useEffect } from 'react';
import { Button, Input, Table, Space, Popconfirm, message, Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import CreateForm from '@/components/createForm';
import axios from 'axios';
import dayjs from 'dayjs';
import * as styles from './index.module.scss';
interface IProps {
  canCreate: boolean;
}

const { Search } = Input;

export default function DataList(props: IProps) {
  const { canCreate } = props;
  // 是否是创建
  const [isCreate, setIsCreate] = useState(true);
  const [initValue, setInitValue] = useState(null);
  const [tableData, setTableData] = useState({
    list: [],
    total: 0,
  });

  const [showCreateForm, setShowCreateForm] = useState(false);
  // const [selectedDemand, setSelectedDemand] = useState<string[]>([]);
  const fbCodeOptions = [
    {
      text: '下载中',
      value: 0,
    },
    {
      text: '下载完成',
      value: 1,
    },
    {
      text: '不可下载',
      value: 2,
    },
    {
      text: '下载未开始',
      value: -1,
    },
  ];
  // 下载方式列表
  const [downloadWayOptions, setDownloadWayOptions] = useState([]);
  // 需求方列表
  const [demandOptions, setDemandOptions] = useState([]);
  const columns: any[] = [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 350,
      render: (text) => {
        return (
          <Popover placement="rightTop" content={<div style={{ width: '400px' }}>{text}</div>}>
            <div className={styles.description}>{text}</div>
          </Popover>
        );
      },
    },
    {
      title: '需求方',
      filters: demandOptions,
      dataIndex: 'demand',
      width: 120,
    },
    {
      title: '需求录入时间',
      dataIndex: 'demandTime',
      width: 160,
      // eslint-disable-next-line
      sorter: (a, b) => 0,
      render: (text) => {
        if (text) {
          return dayjs(parseInt(text)).format('YYYY-MM-DD HH:mm:ss');
        } else {
          return '-';
        }
      },
    },
    {
      title: '下载方式',
      filters: downloadWayOptions,
      dataIndex: 'downloadWay',
      width: 120,
    },
    {
      title: '下载开始时间',
      dataIndex: 'startTime',
      width: 160,
      // defaultSortOrder: 'descend',
      sorter: (a, b) => 0,
      render: (text) => {
        if (text) {
          return dayjs(parseInt(text)).format('YYYY-MM-DD HH:mm:ss');
        } else {
          return '-';
        }
      },
    },
    {
      title: '下载结束时间',
      dataIndex: 'endTime',
      width: 160,
      // defaultSortOrder: 'descend',
      sorter: (a, b) => 0,
      render: (text, record, index) => {
        if (text) {
          return dayjs(parseInt(text)).format('YYYY-MM-DD HH:mm:ss');
        } else {
          return '-';
        }
      },
    },
    {
      title: '数据总量',
      dataIndex: 'totalTxt',
      // defaultSortOrder: 'descend',
      sorter: (a, b) => 0,
      width: 120,
    },
    {
      title: '已下载数据量',
      dataIndex: 'downloaded',
      // defaultSortOrder: 'descend',
      sorter: (a, b) => 0,
      width: 120,
    },
    {
      title: '评估反馈',
      filters: fbCodeOptions,
      dataIndex: 'fbCode',
      width: 160,
      render: (text, record) => {
        if (text === 0) {
          return '下载中';
        } else if (text === 1) {
          return '下载完成';
        } else if (text === 2) {
          return (
            <>
              <Popover content={record?.fbTxt} title="不可下载原因">
                <span className={styles.downloadErrorTxt}>不可下载</span>
                <QuestionCircleOutlined style={{ marginLeft: '10px' }} />
              </Popover>
            </>
          );
        } else if (text === -1) {
          return '下载未开始';
        }
        return '-';
      },
    },
  ];
  if (props.canCreate) {
    columns.push({
      title: '操作',
      render: (text, record) => {
        return (
          <Space>
            <Button onClick={() => onEditClick(record)} type="link" className={styles.actionFirstBtn}>
              编辑
            </Button>
            <Popconfirm
              title="提示"
              description="确认删除此任务吗?"
              okText="确认"
              cancelText="取消"
              onConfirm={() => onDeleteClick(record)}
            >
              <Button danger type="link">
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    });
  }

  const onEditClick = (record) => {
    setIsCreate(false);
    setInitValue(record);
    setShowCreateForm(true);
  };

  // 删除
  const onDeleteClick = (record: { id: string }) => {
    // 删除操作
    axios
      .post('/api/portal/downloadManager/del', {
        id: record?.id,
      })
      .then((res) => {
        if (res?.data?.code >= 0) {
          message.success('删除成功');
          setQueryParams({
            ...queryParams,
            page: 1,
          });
        } else {
          return Promise.reject({
            msg: res?.data?.msg,
          });
        }
      })
      .catch((err) => {
        message.error(err?.msg || '删除接口异常');
      });
  };

  // 查询参数
  const [queryParams, setQueryParams] = useState<{
    page: number;
    pageSize: number;
    search?: string;
    demand?: string[];
    downloadWay?: string[];
    fbCode?: number[];
    sortType?: number;
    sortWay?: string;
  }>({
    page: 1,
    pageSize: 25,
  });

  const handleChange = (pagination, filters, sorter, extra) => {
    let { action } = extra;
    if (action === 'paginate') {
      let current;
      if (pagination.pageSize !== queryParams.pageSize) {
        current = 1;
      } else {
        current = pagination.current;
      }
      setQueryParams({
        ...queryParams,
        page: current,
        pageSize: pagination.pageSize,
      });
    } else if (action === 'filter') {
      const newQueyParams = {
        page: 1,
        pageSize: queryParams.pageSize,
        search: queryParams.search,
        sortType: queryParams.sortType,
        sortWay: queryParams.sortWay,
        ...filters,
      };
      setQueryParams(newQueyParams);
    } else if (action === 'sort') {
      const newQueyParams: any = {
        page: 1,
        pageSize: queryParams.pageSize,
        search: queryParams.search,
        demand: queryParams.demand,
        downloadWay: queryParams.downloadWay,
        fbCode: queryParams.fbCode,
      };
      if (sorter?.order) {
        const sortTypeMap: any = {
          demandTime: 1,
          startTime: 2,
          endTime: 3,
          totalTxt: 4,
          downloaded: 5,
        };
        newQueyParams.sortType = sortTypeMap[sorter.field];
        newQueyParams.sortWay = sorter.order === 'ascend' ? 'asc' : 'desc';
      }
      setQueryParams(newQueyParams);
    }
    console.log('+++ action', action);
    console.log('+++ pagination', pagination);
    console.log('+++ filters', filters);
    console.log('+++ sorter', sorter);
  };

  useEffect(() => {
    axios
      .get('/api/portal/downloadManager/getDict', {
        params: {
          type: 'XQF',
        },
      })
      .then((res) => {
        if (res?.data?.code >= 0) {
          const list = res?.data?.data || [];
          setDemandOptions(
            list.map((one) => {
              return {
                text: one,
                value: one,
              };
            }),
          );
        }
      })
      .catch(() => {});
    axios
      .get('/api/portal/downloadManager/getDict', {
        params: {
          type: 'XZFS',
        },
      })
      .then((res) => {
        if (res?.data?.code >= 0) {
          const list = res?.data?.data || [];
          setDownloadWayOptions(
            list.map((one) => {
              return {
                text: one,
                value: one,
              };
            }),
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    axios
      .post('/api/portal/downloadManager/getList', queryParams)
      .then((res) => {
        console.log('+++ data', res);
        if (res?.data?.code >= 0) {
          const { data } = res!.data;
          const newTableData = (data?.list || []).map((item, index) => {
            return {
              ...item,
              key: index,
            };
          });
          setTableData({
            list: newTableData,
            total: data?.total || 0,
          });
        }
      })
      .catch(() => {});
  }, [queryParams]);

  const onCreateSuccess = () => {
    setQueryParams({
      ...queryParams,
      page: 1,
    });
    setShowCreateForm(false);
  };

  const onKeyWordSearch = (value) => {
    setQueryParams({
      ...queryParams,
      page: 1,
      search: value ? value.trim() : value,
    });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.searchWrap}>
        {canCreate ? (
          <Button
            type="primary"
            onClick={() => {
              setIsCreate(true);
              setShowCreateForm(true);
            }}
          >
            新建任务
          </Button>
        ) : (
          <div />
        )}

        <Search placeholder="请输入名称/需求方进行检索" onSearch={onKeyWordSearch} className={styles.search} allowClear />
      </div>
      <Table
        className={styles.tableData}
        dataSource={tableData.list}
        columns={columns}
        onChange={handleChange}
        pagination={{
          total: tableData.total,
          pageSize: queryParams.pageSize,
          current: queryParams.page,
          pageSizeOptions: [25, 50],
          showSizeChanger: true,
        }}
      />
      {showCreateForm && (
        <CreateForm
          isCreate={isCreate}
          showForm={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSuccess={onCreateSuccess}
          initValue={initValue}
        />
      )}
    </div>
  );
}
