import {
  BellOutlined,
  DownloadOutlined,
  EditOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
  TableOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Layout,
  Menu,
  message,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TransactionFormModal } from './components/TransactionFormModal';
import {
  BANK_OPTIONS,
  CURRENCY_OPTIONS,
  fetchOverview,
  fetchTransactions,
  TRANSFER_TYPE_OPTIONS,
  updateTransaction,
  createTransaction,
} from './services/transactionApi';
import type { OverviewItem, TransactionItem, TransactionQuery, UpsertTransactionInput } from './types/transaction';

const { Header, Sider, Content } = Layout;

interface FilterFormValues {
  keyword?: string;
  bankName?: string;
  currency?: TransactionQuery['currency'];
  direction?: TransactionQuery['direction'];
  transferType?: TransactionQuery['transferType'];
  amountMin?: number;
  amountMax?: number;
  dateRange?: [Dayjs, Dayjs];
}

const DEFAULT_QUERY: TransactionQuery = {
  page: 1,
  pageSize: 10,
  currency: 'ALL',
  direction: 'ALL',
  transferType: 'ALL',
};

function App() {
  const [messageApi, contextHolder] = message.useMessage();
  const [filterForm] = Form.useForm<FilterFormValues>();

  const [collapsed, setCollapsed] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [query, setQuery] = useState<TransactionQuery>(DEFAULT_QUERY);
  const [list, setList] = useState<TransactionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [overviewCards, setOverviewCards] = useState<OverviewItem[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<TransactionItem | null>(null);

  const loadTableData = useCallback(async () => {
    setTableLoading(true);
    try {
      const result = await fetchTransactions(query);
      setList(result.data);
      setTotal(result.total);
    } catch {
      messageApi.error('加载表格失败，请稍后重试');
    } finally {
      setTableLoading(false);
    }
  }, [messageApi, query]);

  const loadOverviewData = useCallback(async () => {
    try {
      const cards = await fetchOverview();
      setOverviewCards(cards);
    } catch {
      messageApi.error('加载统计卡片失败');
    }
  }, [messageApi]);

  useEffect(() => {
    void loadTableData();
  }, [loadTableData]);

  useEffect(() => {
    void loadOverviewData();
  }, [loadOverviewData]);

  const handleSearch = async (): Promise<void> => {
    const values = await filterForm.validateFields();
    setQuery((prev) => ({
      ...DEFAULT_QUERY,
      page: 1,
      pageSize: prev.pageSize,
      keyword: values.keyword?.trim() || undefined,
      bankName: values.bankName || undefined,
      currency: values.currency ?? 'ALL',
      direction: values.direction ?? 'ALL',
      transferType: values.transferType ?? 'ALL',
      amountMin: typeof values.amountMin === 'number' ? values.amountMin : undefined,
      amountMax: typeof values.amountMax === 'number' ? values.amountMax : undefined,
      dateRange:
        values.dateRange && values.dateRange.length === 2
          ? [values.dateRange[0].format('YYYY-MM-DD'), values.dateRange[1].format('YYYY-MM-DD')]
          : null,
    }));
  };

  const handleReset = (): void => {
    filterForm.resetFields();
    setQuery((prev) => ({
      ...DEFAULT_QUERY,
      page: 1,
      pageSize: prev.pageSize,
    }));
  };

  const handleCreate = (): void => {
    setEditingRow(null);
    setModalOpen(true);
  };

  const handleUploadCsv = (): void => {
    // TODO: 替换成真实上传接口，例如 POST /api/transactions/upload-csv
    messageApi.info('这里预留给真实 CSV 上传接口');
  };

  const handleEditColumns = (): void => {
    // TODO: 这里可接入“列配置弹窗”或用户偏好存储接口
    messageApi.info('这里预留给列配置功能');
  };

  const handleEdit = useCallback((row: TransactionItem): void => {
    setEditingRow(row);
    setModalOpen(true);
  }, []);

  const handleSubmitForm = async (values: UpsertTransactionInput): Promise<void> => {
    setSubmitLoading(true);
    try {
      if (editingRow) {
        await updateTransaction(editingRow.id, values);
        messageApi.success('编辑成功');
      } else {
        await createTransaction(values);
        messageApi.success('新增成功');
      }
      setModalOpen(false);
      setEditingRow(null);
      await Promise.all([loadTableData(), loadOverviewData()]);
    } catch {
      messageApi.error('保存失败，请稍后重试');
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns: ColumnsType<TransactionItem> = useMemo(
    () => [
      { title: '编号', dataIndex: 'id', width: 90, fixed: 'left' },
      { title: 'Bank Name', dataIndex: 'bankName', width: 240 },
      { title: 'Transaction Date', dataIndex: 'transactionDate', width: 160 },
      {
        title: 'Currency',
        dataIndex: 'currency',
        width: 120,
        render: (currency: TransactionItem['currency']) => <Tag color="blue">{currency}</Tag>,
      },
      {
        title: 'Amount',
        dataIndex: 'amount',
        width: 140,
        align: 'right',
        render: (amount: number) => (
          <span style={{ color: amount >= 0 ? '#389E0D' : '#D80027', fontWeight: 600 }}>
            {amount >= 0 ? '+' : '-'} {Math.abs(amount).toLocaleString()}
          </span>
        ),
      },
      { title: 'Transfer Type', dataIndex: 'transferType', width: 140 },
      { title: 'Counterparty', dataIndex: 'counterparty', width: 160 },
      { title: 'Memo', dataIndex: 'memo', ellipsis: true, width: 280 },
      {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 120,
        render: (_, row) => (
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(row)}>
            编辑
          </Button>
        ),
      },
    ],
    [handleEdit],
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {contextHolder}

      <Sider
        breakpoint="lg"
        collapsedWidth={64}
        width={176}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ background: '#FFFFFF', borderRight: '1px solid #E9EAEB' }}
      >
        <div className="brand-box">
          <HomeOutlined style={{ color: '#1677FF', fontSize: 18 }} />
          {!collapsed ? <span className="brand-title">F System</span> : null}
        </div>

        <Menu
          mode="inline"
          defaultSelectedKeys={['bank-details']}
          items={[
            { key: 'bank-details', icon: <TableOutlined />, label: 'Bank Details' },
            { key: 'reports', icon: <HomeOutlined />, label: 'Reports' },
            { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
          ]}
        />
      </Sider>

      <Layout>
        {/* 顶部导航栏（Navbar） */}
        <Header className="top-header">
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((prev) => !prev)}
            />
            <Typography.Text strong>Dashboard</Typography.Text>
          </Space>
          <Space size={16}>
            <Badge count={3}>
              <BellOutlined style={{ fontSize: 18 }} />
            </Badge>
            <Avatar icon={<UserOutlined />} />
          </Space>
        </Header>

        <Content style={{ padding: 16, background: '#F3F3F3' }}>
          <Breadcrumb
            items={[
              { title: 'Home' },
              { title: 'Bank Details' },
            ]}
            style={{ marginBottom: 12 }}
          />

          {/* 页面头（Page Header） */}
          <Card style={{ marginBottom: 12 }}>
            <div className="page-header-row">
              <div>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  Bank Details
                </Typography.Title>
                <Typography.Text type="secondary">（{total}）</Typography.Text>
              </div>
              <Space wrap>
                <Button icon={<DownloadOutlined />} onClick={handleUploadCsv}>
                  Upload CSV
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                  新增记录
                </Button>
              </Space>
            </div>
          </Card>

          <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
            {overviewCards.map((item) => (
              <Col key={item.key} xs={24} sm={12} lg={6}>
                <Card size="small">
                  <Typography.Text type="secondary">{item.label}</Typography.Text>
                  <Typography.Title level={5} style={{ margin: '8px 0 0' }}>
                    ¥{item.amount.toLocaleString()}
                  </Typography.Title>
                </Card>
              </Col>
            ))}
          </Row>

          <Card style={{ marginBottom: 12 }}>
            {/* 搜索/筛选区：提交后会触发服务端分页模拟 */}
            <Form form={filterForm} layout="vertical">
              <Row gutter={[12, 0]}>
                <Col xs={24} md={12} lg={8}>
                  <Form.Item label="关键词" name="keyword">
                    <Input placeholder="Memo / Description / Counterparty" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={4}>
                  <Form.Item label="Bank" name="bankName">
                    <Select allowClear placeholder="All Banks" options={BANK_OPTIONS.map((item) => ({ value: item, label: item }))} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={4}>
                  <Form.Item label="Currency" name="currency">
                    <Select
                      placeholder="All Currency"
                      options={[
                        { value: 'ALL', label: 'All Currency' },
                        ...CURRENCY_OPTIONS.map((item) => ({ value: item, label: item })),
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={4}>
                  <Form.Item label="Direction" name="direction">
                    <Select
                      placeholder="Direction"
                      options={[
                        { value: 'ALL', label: 'All' },
                        { value: 'IN', label: 'IN' },
                        { value: 'OUT', label: 'OUT' },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={4}>
                  <Form.Item label="Transfer Type" name="transferType">
                    <Select
                      placeholder="Transaction Type"
                      options={[
                        { value: 'ALL', label: 'All Type' },
                        ...TRANSFER_TYPE_OPTIONS.map((item) => ({ value: item, label: item })),
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={8}>
                  <Form.Item label="Transaction Date" name="dateRange">
                    <DatePicker.RangePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={4}>
                  <Form.Item label="Amount Min" name="amountMin">
                    <InputNumber style={{ width: '100%' }} min={0} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={4}>
                  <Form.Item label="Amount Max" name="amountMax">
                    <InputNumber style={{ width: '100%' }} min={0} />
                  </Form.Item>
                </Col>
              </Row>
              <Space wrap>
                <Button type="primary" icon={<SearchOutlined />} onClick={() => void handleSearch()}>
                  Filter
                </Button>
                <Button onClick={handleReset}>Reset</Button>
                <Button onClick={handleEditColumns}>Edit columns</Button>
              </Space>
            </Form>
          </Card>

          <Card>
            <Table<TransactionItem>
              rowKey="id"
              columns={columns}
              dataSource={list}
              loading={tableLoading}
              scroll={{ x: 1400 }}
              pagination={{
                current: query.page,
                pageSize: query.pageSize,
                total,
                showSizeChanger: true,
                showTotal: (countValue) => `共 ${countValue} 条`,
              }}
              onChange={(pagination) => {
                setQuery((prev) => ({
                  ...prev,
                  page: pagination.current ?? 1,
                  pageSize: pagination.pageSize ?? prev.pageSize,
                }));
              }}
            />
          </Card>
        </Content>
      </Layout>

      <TransactionFormModal
        open={modalOpen}
        submitting={submitLoading}
        record={editingRow}
        onCancel={() => {
          setModalOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmitForm}
      />
    </Layout>
  );
}

export default App;
