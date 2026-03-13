import dayjs from 'dayjs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

type TransactionDirection = 'IN' | 'OUT';
type CurrencyCode = 'JPY' | 'USD' | 'SGD' | 'CNY';
type TransferType = 'Wire' | 'Card' | 'Internal';

interface TransactionItem {
  id: number;
  bankName: string;
  transactionDate: string;
  currency: CurrencyCode;
  amount: number;
  transferType: TransferType;
  memo: string;
  counterparty: string;
}

interface UpsertTransactionInput {
  bankName: string;
  transactionDate: string;
  currency: CurrencyCode;
  direction: TransactionDirection;
  amount: number;
  transferType: TransferType;
  memo: string;
  counterparty: string;
}

const BANK_OPTIONS = [
  '三井住友（法人）',
  '三菱UFJ',
  '三井住友銀行 外貨口座',
  '三井住友 担保定期預金',
  'EastWest Bank (checking)',
  'Citi Bank',
] as const;

const CURRENCY_OPTIONS: CurrencyCode[] = ['JPY', 'USD', 'SGD', 'CNY'];
const TRANSFER_TYPE_OPTIONS: TransferType[] = ['Wire', 'Card', 'Internal'];
const MEMOS = ['游戏收入', '内部账户转账', '购买软件服务', '团队聚餐费用', '顾问服务费', '营销活动支出'];
const COUNTERPARTIES = ['Company A', 'Company B', 'Company C', 'Vendor X', 'Partner Y'];

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

const sendJson = (res: ServerResponse, status: number, payload: unknown): void => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
};

const readBody = async (req: IncomingMessage): Promise<unknown> => {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString('utf-8');
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
};

const parseNumber = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const signedAmountFromInput = (payload: UpsertTransactionInput): number =>
  payload.direction === 'IN' ? Math.abs(payload.amount) : -Math.abs(payload.amount);

const handleTransactionsList = (url: URL, res: ServerResponse): void => {
  const page = parseInt(url.searchParams.get('page') ?? '1', 10) || 1;
  const pageSize = parseInt(url.searchParams.get('pageSize') ?? '10', 10) || 10;
  const keyword = (url.searchParams.get('keyword') ?? '').trim().toLowerCase();
  const bankName = url.searchParams.get('bankName') ?? '';
  const currency = url.searchParams.get('currency') ?? 'ALL';
  const transferType = url.searchParams.get('transferType') ?? 'ALL';
  const direction = url.searchParams.get('direction') ?? 'ALL';
  const amountMin = parseNumber(url.searchParams.get('amountMin'));
  const amountMax = parseNumber(url.searchParams.get('amountMax'));
  const dateStart = url.searchParams.get('dateStart');
  const dateEnd = url.searchParams.get('dateEnd');

  let filtered = [...mockDatabase];

  if (keyword) {
    filtered = filtered.filter((item) => {
      const fullText = `${item.bankName} ${item.memo} ${item.counterparty}`.toLowerCase();
      return fullText.includes(keyword);
    });
  }

  if (bankName) {
    filtered = filtered.filter((item) => item.bankName === bankName);
  }

  if (currency !== 'ALL') {
    filtered = filtered.filter((item) => item.currency === currency);
  }

  if (transferType !== 'ALL') {
    filtered = filtered.filter((item) => item.transferType === transferType);
  }

  if (direction === 'IN') {
    filtered = filtered.filter((item) => item.amount > 0);
  } else if (direction === 'OUT') {
    filtered = filtered.filter((item) => item.amount < 0);
  }

  if (typeof amountMin === 'number') {
    filtered = filtered.filter((item) => Math.abs(item.amount) >= amountMin);
  }

  if (typeof amountMax === 'number') {
    filtered = filtered.filter((item) => Math.abs(item.amount) <= amountMax);
  }

  if (dateStart && dateEnd) {
    filtered = filtered.filter((item) => {
      const current = dayjs(item.transactionDate);
      return !current.isBefore(dayjs(dateStart), 'day') && !current.isAfter(dayjs(dateEnd), 'day');
    });
  }

  const total = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const data = filtered.slice(startIndex, startIndex + pageSize);
  sendJson(res, 200, { data, total });
};

const handleOverview = (res: ServerResponse): void => {
  const sumByBank = BANK_OPTIONS.map((bank) => {
    const amount = mockDatabase
      .filter((item) => item.bankName === bank)
      .reduce((sum, item) => sum + item.amount, 0);
    return { key: bank, label: bank, amount };
  });

  const totalAmount = mockDatabase.reduce((sum, item) => sum + item.amount, 0);
  sendJson(res, 200, [{ key: 'all', label: '所有余额', amount: totalAmount }, ...sumByBank.slice(0, 4)]);
};

const handleCreate = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  const payload = (await readBody(req)) as Partial<UpsertTransactionInput>;
  if (!payload.bankName || !payload.transactionDate || !payload.currency || !payload.transferType || !payload.memo || !payload.counterparty || !payload.direction || typeof payload.amount !== 'number') {
    sendJson(res, 400, { message: 'Invalid payload' });
    return;
  }

  const nextId = mockDatabase.length === 0 ? 1 : Math.max(...mockDatabase.map((item) => item.id)) + 1;
  const createdItem: TransactionItem = {
    id: nextId,
    bankName: payload.bankName,
    transactionDate: payload.transactionDate,
    currency: payload.currency,
    amount: signedAmountFromInput(payload as UpsertTransactionInput),
    transferType: payload.transferType,
    memo: payload.memo,
    counterparty: payload.counterparty,
  };

  mockDatabase = [createdItem, ...mockDatabase];
  sendJson(res, 201, createdItem);
};

const handleUpdate = async (req: IncomingMessage, res: ServerResponse, id: number): Promise<void> => {
  const payload = (await readBody(req)) as Partial<UpsertTransactionInput>;
  const index = mockDatabase.findIndex((item) => item.id === id);
  if (index < 0) {
    sendJson(res, 404, { message: `Transaction ${id} not found` });
    return;
  }

  if (!payload.bankName || !payload.transactionDate || !payload.currency || !payload.transferType || !payload.memo || !payload.counterparty || !payload.direction || typeof payload.amount !== 'number') {
    sendJson(res, 400, { message: 'Invalid payload' });
    return;
  }

  const updatedItem: TransactionItem = {
    ...mockDatabase[index],
    bankName: payload.bankName,
    transactionDate: payload.transactionDate,
    currency: payload.currency,
    amount: signedAmountFromInput(payload as UpsertTransactionInput),
    transferType: payload.transferType,
    memo: payload.memo,
    counterparty: payload.counterparty,
  };

  mockDatabase[index] = updatedItem;
  sendJson(res, 200, updatedItem);
};

const apiHandler = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const method = req.method ?? 'GET';

  try {
    if (method === 'GET' && url.pathname === '/api/transactions') {
      handleTransactionsList(url, res);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/overview') {
      handleOverview(res);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/transactions') {
      await handleCreate(req, res);
      return;
    }

    const updateMatch = url.pathname.match(/^\/api\/transactions\/(\d+)$/);
    if (method === 'PUT' && updateMatch) {
      const id = Number(updateMatch[1]);
      await handleUpdate(req, res, id);
      return;
    }

    sendJson(res, 404, { message: `Not found: ${url.pathname}` });
  } catch (error) {
    sendJson(res, 500, {
      message: 'Mock API internal error',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const mockApiPlugin = (): Plugin => {
  const middleware = (req: IncomingMessage, res: ServerResponse, next: () => void): void => {
    if (!req.url?.startsWith('/api/')) {
      next();
      return;
    }
    void apiHandler(req, res);
  };

  return {
    name: 'mock-api-plugin',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
};
