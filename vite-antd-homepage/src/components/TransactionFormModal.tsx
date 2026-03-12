import { DatePicker, Form, Input, InputNumber, Modal, Select } from 'antd';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import type { Dayjs } from 'dayjs';
import {
  BANK_OPTIONS,
  CURRENCY_OPTIONS,
  TRANSFER_TYPE_OPTIONS,
} from '../services/transactionApi';
import type { TransactionItem, UpsertTransactionInput } from '../types/transaction';

interface TransactionFormValues {
  bankName: string;
  transactionDate: Dayjs;
  currency: UpsertTransactionInput['currency'];
  direction: UpsertTransactionInput['direction'];
  amount: number;
  transferType: UpsertTransactionInput['transferType'];
  counterparty: string;
  memo: string;
}

interface TransactionFormModalProps {
  open: boolean;
  submitting: boolean;
  record: TransactionItem | null;
  onCancel: () => void;
  onSubmit: (values: UpsertTransactionInput) => Promise<void>;
}

export const TransactionFormModal = ({
  open,
  submitting,
  record,
  onCancel,
  onSubmit,
}: TransactionFormModalProps) => {
  const [form] = Form.useForm<TransactionFormValues>();

  useEffect(() => {
    if (!open) {
      return;
    }

    if (record) {
      // 编辑模式：把已有数据回填到表单
      form.setFieldsValue({
        bankName: record.bankName,
        transactionDate: dayjs(record.transactionDate),
        currency: record.currency,
        direction: record.amount >= 0 ? 'IN' : 'OUT',
        amount: Math.abs(record.amount),
        transferType: record.transferType,
        counterparty: record.counterparty,
        memo: record.memo,
      });
      return;
    }

    // 新增模式：给一组更友好的默认值
    form.setFieldsValue({
      direction: 'IN',
      currency: 'JPY',
      transferType: 'Wire',
      transactionDate: dayjs(),
    });
  }, [form, open, record]);

  const handleOk = async (): Promise<void> => {
    const values = await form.validateFields();
    await onSubmit({
      bankName: values.bankName,
      transactionDate: values.transactionDate.format('YYYY-MM-DD'),
      currency: values.currency,
      direction: values.direction,
      amount: values.amount,
      transferType: values.transferType,
      counterparty: values.counterparty,
      memo: values.memo,
    });
    form.resetFields();
  };

  const handleCancel = (): void => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={record ? '编辑交易记录' : '新增交易记录'}
      open={open}
      onCancel={handleCancel}
      onOk={() => void handleOk()}
      confirmLoading={submitting}
      okText={record ? '保存' : '新增'}
      cancelText="取消"
      destroyOnHidden
      width={680}
    >
      {/* 基础表单校验都在 rules 里，便于你后续直接扩展 */}
      <Form form={form} layout="vertical">
        <Form.Item
          label="Bank Name"
          name="bankName"
          rules={[{ required: true, message: '请选择银行名称' }]}
        >
          <Select
            placeholder="请选择银行"
            options={BANK_OPTIONS.map((bank) => ({ label: bank, value: bank }))}
          />
        </Form.Item>

        <Form.Item
          label="Transaction Date"
          name="transactionDate"
          rules={[{ required: true, message: '请选择交易日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Currency" name="currency" rules={[{ required: true, message: '请选择币种' }]}>
          <Select options={CURRENCY_OPTIONS.map((currency) => ({ label: currency, value: currency }))} />
        </Form.Item>

        <Form.Item
          label="Direction"
          name="direction"
          rules={[{ required: true, message: '请选择交易方向' }]}
        >
          <Select
            options={[
              { label: 'IN (入账)', value: 'IN' },
              { label: 'OUT (出账)', value: 'OUT' },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Amount"
          name="amount"
          rules={[
            { required: true, message: '请输入金额' },
            { type: 'number', min: 0.01, message: '金额必须大于 0' },
          ]}
        >
          <InputNumber style={{ width: '100%' }} min={0.01} precision={2} />
        </Form.Item>

        <Form.Item
          label="Transfer Type"
          name="transferType"
          rules={[{ required: true, message: '请选择转账类型' }]}
        >
          <Select
            options={TRANSFER_TYPE_OPTIONS.map((type) => ({
              label: type,
              value: type,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Counterparty"
          name="counterparty"
          rules={[{ required: true, message: '请输入交易对手方' }]}
        >
          <Input placeholder="例如：Company A" />
        </Form.Item>

        <Form.Item
          label="Memo / Description"
          name="memo"
          rules={[
            { required: true, message: '请输入备注' },
            { min: 2, message: '备注至少 2 个字符' },
          ]}
        >
          <Input.TextArea rows={3} placeholder="填写交易说明..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
