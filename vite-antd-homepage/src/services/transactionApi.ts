import dayjs from 'dayjs';
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

const MEMOS = [
  '游戏收入',
  '内部账户转账',
  '购买软件服务',
  '团队聚餐费用',
  '顾问服务费',
  '营销活动支出',
];

const COUNTERPARTIES = ['Company A', 'Company B', 'Company C', 'Vendor X', 'Partner Y'];

// 模拟数据库（前端内存版）
let mockDatabase: TransactionItem[] = Array.from({ length: 83 }).map((_, index) => {
  const bankName = BANK_OPTIONS[index % BANK_OPTIONS.length];
  const currency = CURRENCY_OPTIONS[index % CURRENCY_OPTIONS.length];
  const transferType = TRANSFER_TYPE_OPTIONS[index % TRANSFER_TYPE_OPTIONS.length];
  const counterparty = COUNTERPARTIES[index % COUNTERPARTIES.length];
  const memo = MEMOS[index % MEMOS.length];
  const signed = index % 4 === 0 ? -1 : 1;
  const amount = signed * (1000 + ((index * 1735) % 98000));

  return {
    id: index + 1,
    bankName,
    transactionDate: dayjs().subtract(index, 'day').format('YYYY-MM-DD'),
    currency,
    amount,
    transferType,
    memo,
    counterparty,
  };
});

mockDatabase = mockDatabase.sort((a, b) => dayjs(b.transactionDate).valueOf() - dayjs(a.transactionDate).valueOf());

const wait = async (ms: number): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

// 这里是“服务端分页模拟”：
// TODO: 替换为真实 API，例如 GET /api/transactions?page=1&pageSize=10...
export const fetchTransactions = async (query: TransactionQuery): Promise<TransactionListResponse> => {
  await wait(450);

  const keyword = query.keyword?.trim().toLowerCase();
  let filtered = [...mockDatabase];

  if (keyword) {
    filtered = filtered.filter((item) => {
      const fullText = `${item.bankName} ${item.memo} ${item.counterparty}`.toLowerCase();
      return fullText.includes(keyword);
    });
  }

  if (query.bankName) {
    filtered = filtered.filter((item) => item.bankName === query.bankName);
  }

  if (query.currency && query.currency !== 'ALL') {
    filtered = filtered.filter((item) => item.currency === query.currency);
  }

  if (query.transferType && query.transferType !== 'ALL') {
    filtered = filtered.filter((item) => item.transferType === query.transferType);
  }

  if (query.direction && query.direction !== 'ALL') {
    filtered = filtered.filter((item) => (query.direction === 'IN' ? item.amount > 0 : item.amount < 0));
  }

  if (typeof query.amountMin === 'number') {
    const min = query.amountMin;
    filtered = filtered.filter((item) => Math.abs(item.amount) >= min);
  }

  if (typeof query.amountMax === 'number') {
    const max = query.amountMax;
    filtered = filtered.filter((item) => Math.abs(item.amount) <= max);
  }

  if (query.dateRange && query.dateRange[0] && query.dateRange[1]) {
    const [start, end] = query.dateRange;
    filtered = filtered.filter((item) => {
      const current = dayjs(item.transactionDate);
      return !current.isBefore(dayjs(start), 'day') && !current.isAfter(dayjs(end), 'day');
    });
  }

  const total = filtered.length;
  const startIndex = (query.page - 1) * query.pageSize;
  const data = filtered.slice(startIndex, startIndex + query.pageSize);

  return { data, total };
};

// TODO: 替换为真实 API，例如 POST /api/transactions
export const createTransaction = async (payload: UpsertTransactionInput): Promise<TransactionItem> => {
  await wait(300);
  const signedAmount = payload.direction === 'IN' ? Math.abs(payload.amount) : -Math.abs(payload.amount);
  const nextId = mockDatabase.length === 0 ? 1 : Math.max(...mockDatabase.map((item) => item.id)) + 1;

  const createdItem: TransactionItem = {
    id: nextId,
    bankName: payload.bankName,
    transactionDate: payload.transactionDate,
    currency: payload.currency,
    amount: signedAmount,
    transferType: payload.transferType,
    memo: payload.memo,
    counterparty: payload.counterparty,
  };

  mockDatabase = [createdItem, ...mockDatabase];
  return createdItem;
};

// TODO: 替换为真实 API，例如 PUT /api/transactions/:id
export const updateTransaction = async (
  id: number,
  payload: UpsertTransactionInput,
): Promise<TransactionItem> => {
  await wait(300);
  const signedAmount = payload.direction === 'IN' ? Math.abs(payload.amount) : -Math.abs(payload.amount);

  let updatedItem: TransactionItem | null = null;
  mockDatabase = mockDatabase.map((item) => {
    if (item.id !== id) {
      return item;
    }

    const nextItem: TransactionItem = {
      ...item,
      bankName: payload.bankName,
      transactionDate: payload.transactionDate,
      currency: payload.currency,
      amount: signedAmount,
      transferType: payload.transferType,
      memo: payload.memo,
      counterparty: payload.counterparty,
    };
    updatedItem = nextItem;
    return nextItem;
  });

  if (!updatedItem) {
    throw new Error(`Transaction ${id} not found`);
  }

  return updatedItem;
};

// 顶部卡片数据（模拟接口）
// TODO: 替换为真实 API，例如 GET /api/dashboard/overview
export const fetchOverview = async (): Promise<OverviewItem[]> => {
  await wait(250);

  const sumByBank = BANK_OPTIONS.map((bank) => {
    const amount = mockDatabase
      .filter((item) => item.bankName === bank)
      .reduce((sum, item) => sum + item.amount, 0);
    return { key: bank, label: bank, amount };
  });

  const totalAmount = mockDatabase.reduce((sum, item) => sum + item.amount, 0);

  return [{ key: 'all', label: '所有余额', amount: totalAmount }, ...sumByBank.slice(0, 4)];
};
