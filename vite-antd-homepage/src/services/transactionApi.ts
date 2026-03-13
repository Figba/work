import type {
  CurrencyCode,
  OverviewItem,
  TransactionItem,
  TransactionListResponse,
  TransactionQuery,
  TransferType,
  UpsertTransactionInput,
} from '../types/transaction';

export const BANK_OPTIONS = [
  '三井住友（法人）',
  '三菱UFJ',
  '三井住友銀行 外貨口座',
  '三井住友 担保定期預金',
  'EastWest Bank (checking)',
  'Citi Bank',
] as const;

export const CURRENCY_OPTIONS: CurrencyCode[] = ['JPY', 'USD', 'SGD', 'CNY'];
export const TRANSFER_TYPE_OPTIONS: TransferType[] = ['Wire', 'Card', 'Internal'];

const wait = async (ms: number): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const API_BASE = '/api';

// 统一请求函数：把网络错误和 JSON 解析都收敛在这里
const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API ${response.status}: ${message}`);
  }

  return (await response.json()) as T;
};

// 这里是“服务端分页模拟（HTTP 版）”
// TODO: 替换为真实后端地址，例如 https://api.xxx.com/transactions
export const fetchTransactions = async (query: TransactionQuery): Promise<TransactionListResponse> => {
  await wait(120);
  const params = new URLSearchParams();
  params.set('page', String(query.page));
  params.set('pageSize', String(query.pageSize));
  if (query.keyword) params.set('keyword', query.keyword);
  if (query.bankName) params.set('bankName', query.bankName);
  if (query.currency) params.set('currency', query.currency);
  if (query.direction) params.set('direction', query.direction);
  if (query.transferType) params.set('transferType', query.transferType);
  if (typeof query.amountMin === 'number') params.set('amountMin', String(query.amountMin));
  if (typeof query.amountMax === 'number') params.set('amountMax', String(query.amountMax));
  if (query.dateRange?.[0] && query.dateRange?.[1]) {
    params.set('dateStart', query.dateRange[0]);
    params.set('dateEnd', query.dateRange[1]);
  }

  return requestJson<TransactionListResponse>(`/transactions?${params.toString()}`);
};

// TODO: 替换为真实 API，例如 POST https://api.xxx.com/transactions
export const createTransaction = async (payload: UpsertTransactionInput): Promise<TransactionItem> => {
  await wait(80);
  return requestJson<TransactionItem>('/transactions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// TODO: 替换为真实 API，例如 PUT https://api.xxx.com/transactions/:id
export const updateTransaction = async (
  id: number,
  payload: UpsertTransactionInput,
): Promise<TransactionItem> => {
  await wait(80);
  return requestJson<TransactionItem>(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

// 顶部卡片数据（HTTP 版模拟接口）
// TODO: 替换为真实 API，例如 GET https://api.xxx.com/dashboard/overview
export const fetchOverview = async (): Promise<OverviewItem[]> => {
  await wait(80);
  return requestJson<OverviewItem[]>('/overview');
};
