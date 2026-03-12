import {
  BankOutlined,
  BarChartOutlined,
  DownOutlined,
  EditOutlined,
  FileTextOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Card, DatePicker, Form, Input, InputNumber, Layout, Menu, message, Select, Space, Table, Tag, Typography } from 'antd';
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

const DEFAULT_FILTER_VALUES: Pick<FilterFormValues, 'currency' | 'direction' | 'transferType'> = {
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
    // 初始化筛选项默认值，避免初次加载出现空状态
    filterForm.setFieldsValue(DEFAULT_FILTER_VALUES);
  }, [filterForm]);

  useEffect(() => {
    void loadTableData();
  }, [loadTableData]);

  useEffect(() => {
    void loadOverviewData();
  }, [loadOverviewData]);

  const handleSearch = async (): Promise<void> => {
    const values = await filterForm.validateFields();
    if (
      typeof values.amountMin === 'number' &&
      typeof values.amountMax === 'number' &&
      values.amountMin > values.amountMax
    ) {
      messageApi.warning('Amount Min 不能大于 Amount Max');
      return;
    }

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
    filterForm.setFieldsValue(DEFAULT_FILTER_VALUES);
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

  const handleUploadCsv = useCallback((): void => {
    // TODO: 替换成真实上传接口，例如 POST /api/transactions/upload-csv
    messageApi.info('这里预留给真实 CSV 上传接口');
  }, [messageApi]);

  const handleEditColumns = useCallback((): void => {
    // TODO: 这里可接入“列配置弹窗”或用户偏好存储接口
    messageApi.info('这里预留给列配置功能');
  }, [messageApi]);

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
      // 列宽按 Figma 表头比例设置，便于后续继续做像素级微调
      { title: '编号', dataIndex: 'id', width: 120, fixed: 'left' },
      { title: 'Bank Name', dataIndex: 'bankName', width: 200 },
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
      { title: 'Memo', dataIndex: 'memo', ellipsis: true, width: 304 },
      {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 96,
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
    <Layout className="figma-layout">
      {contextHolder}

      <Sider
        breakpoint="lg"
        collapsedWidth={64}
        width={160}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ background: '#FFFFFF', borderRight: '1px solid #E9EAEB' }}
      >
        <div className="figma-logo-row">
          <div className="figma-logo-mark">
            <span />
            <span />
            <span />
          </div>
          {!collapsed ? <span className="brand-title">F System</span> : null}
        </div>

        <Menu
          mode="inline"
          defaultSelectedKeys={['bank-details']}
          className="figma-side-menu"
          items={[
            { key: 'bank-details', icon: <BankOutlined />, label: 'Bank Details' },
            { key: 'je', icon: <FileTextOutlined />, label: 'JE' },
            { key: 'reports', icon: <BarChartOutlined />, label: 'Reports' },
          ]}
        />

        <div className="figma-sidebar-footer">
          <div className="figma-user-card">
            <Avatar size={28}>A</Avatar>
            {!collapsed ? (
              <div className="figma-user-meta">
                <Typography.Text strong style={{ fontSize: 12 }}>
                  Admin
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  li.yi@ctw.inc
                </Typography.Text>
              </div>
            ) : null}
          </div>
        </div>
      </Sider>

      <Layout>
        {/* 顶部 CTA 区（对应 Figma 的 56px 高导航带） */}
        <Header className="figma-topbar">
          <Space size={12}>
            <Button className="figma-topbar-btn">
              万円 <DownOutlined />
            </Button>
            <Button className="figma-topbar-btn figma-topbar-input">
              Pending Input... <DownOutlined />
              <span className="figma-ai-badge">AI</span>
            </Button>
          </Space>
        </Header>

        <Content className="figma-content">
          <Card className="figma-overview-card">
            <div className="figma-overview-title-row">
              <div>
                <Typography.Title level={4} style={{ margin: 0, fontSize: 24 }}>
                  Bank Details
                </Typography.Title>
                <Typography.Text type="secondary">（{total}）</Typography.Text>
              </div>
              <Space>
                <Button icon={<UploadOutlined />} onClick={handleUploadCsv}>
                  Upload CSV
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                  新增记录
                </Button>
              </Space>
            </div>

            <div className="figma-overview-scroll">
              {overviewCards.map((item) => (
                <Card key={item.key} size="small" className="figma-balance-item">
                  <Typography.Text type="secondary">{item.label}</Typography.Text>
                  <Typography.Title level={5} style={{ margin: '8px 0 0' }}>
                    ¥{item.amount.toLocaleString()}
                  </Typography.Title>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="figma-table-panel">
            {/* 搜索/筛选区：提交后会触发服务端分页模拟 */}
            <Form form={filterForm} layout="vertical">
              <div className="figma-filter-grid-row-1">
                <Form.Item label="Bank" name="bankName">
                  <Select allowClear placeholder="All Banks" options={BANK_OPTIONS.map((item) => ({ value: item, label: item }))} />
                </Form.Item>
                <Form.Item label="Currency" name="currency">
                  <Select
                    placeholder="All Currency"
                    options={[
                      { value: 'ALL', label: 'All Currency' },
                      ...CURRENCY_OPTIONS.map((item) => ({ value: item, label: item })),
                    ]}
                  />
                </Form.Item>
                <Form.Item label="Transaction Date" name="dateRange">
                  <DatePicker.RangePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="Amount Min" name="amountMin">
                  <InputNumber style={{ width: '100%' }} min={0} placeholder="Amount Min" />
                </Form.Item>
                <Form.Item label="Amount Max" name="amountMax">
                  <InputNumber style={{ width: '100%' }} min={0} placeholder="Amount Max" />
                </Form.Item>
                <Form.Item label="Transfer Type" name="transferType">
                  <Select
                    placeholder="Transaction Type"
                    options={[
                      { value: 'ALL', label: 'All Type' },
                      ...TRANSFER_TYPE_OPTIONS.map((item) => ({ value: item, label: item })),
                    ]}
                  />
                </Form.Item>
              </div>

              <div className="figma-filter-grid-row-2">
                <Form.Item label="关键词" name="keyword">
                  <Input prefix={<SearchOutlined />} placeholder="Memo / Description / Counterparty" />
                </Form.Item>
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
                <div className="figma-filter-actions">
                  <Button type="primary" icon={<FilterOutlined />} onClick={() => void handleSearch()}>
                    Filter
                  </Button>
                  <Button onClick={handleReset}>Reset</Button>
                  <Button icon={<EditOutlined />} onClick={handleEditColumns}>
                    Edit columns
                  </Button>
                </div>
              </div>
            </Form>

            <Table<TransactionItem>
              rowKey="id"
              columns={columns}
              dataSource={list}
              loading={tableLoading}
              className="figma-table"
              scroll={{ x: 1600 }}
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

            <div className="figma-bottom-actions">
              <Button type="primary" icon={<SearchOutlined />} onClick={() => void handleSearch()}>
                Refresh
              </Button>
              <Button onClick={handleCreate} icon={<PlusOutlined />}>
                Add
              </Button>
              <Button onClick={handleReset}>Reset Filter</Button>
            </div>
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
