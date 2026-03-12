// 交易方向：IN 代表入账，OUT 代表出账
export type TransactionDirection = 'IN' | 'OUT';

// 货币类型
export type CurrencyCode = 'JPY' | 'USD' | 'SGD' | 'CNY';

// 转账方式（可按业务继续扩展）
export type TransferType = 'Wire' | 'Card' | 'Internal';

// 表格中的一条交易记录
export interface TransactionItem {
  id: number;
  bankName: string;
  transactionDate: string; // YYYY-MM-DD
  currency: CurrencyCode;
  amount: number; // 正数=入账，负数=出账
  transferType: TransferType;
  memo: string;
  counterparty: string;
}

// 查询参数（用于“服务端分页模拟”）
export interface TransactionQuery {
  page: number;
  pageSize: number;
  keyword?: string;
  bankName?: string;
  currency?: CurrencyCode | 'ALL';
  direction?: TransactionDirection | 'ALL';
  transferType?: TransferType | 'ALL';
  amountMin?: number;
  amountMax?: number;
  dateRange?: [string, string] | null;
}

// 列表接口返回结构
export interface TransactionListResponse {
  data: TransactionItem[];
  total: number;
}

// 新增/编辑时提交的数据结构
export interface UpsertTransactionInput {
  bankName: string;
  transactionDate: string; // YYYY-MM-DD
  currency: CurrencyCode;
  direction: TransactionDirection;
  amount: number; // 表单中统一输入正数，方向由 direction 控制
  transferType: TransferType;
  memo: string;
  counterparty: string;
}

// 首页顶部余额卡片的数据结构
export interface OverviewItem {
  key: string;
  label: string;
  amount: number;
}
