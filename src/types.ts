export interface Market {
  id: string;
  name: string;
  color: string;
  address?: string;
}

export interface SubstituteSuggestion {
  substituteName: string;
  estimatedPrice: number;
  savings: number;
  reason: string;
  category?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string; // 'un', 'kg', 'g', 'L', 'ml', 'pct', 'cx', 'lata'
  checked: boolean;
  checkedBy?: string;
  checkedAt?: string;
  prices: Record<string, number>; // marketId -> price
  lastPriceUpdatedBy?: string;
  lastPriceUpdatedAt?: string;
  substituteSuggestion?: SubstituteSuggestion;
  addedBy: string;
  createdAt: string;
  notes?: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  roomId: string;
  items: ShoppingItem[];
  markets: Market[];
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userName: string;
  action: string; // e.g., "adicionou Leite Integral", "marcou Arroz como comprado", "atualizou preço no Atacadão"
  timestamp: string;
  type: 'add' | 'check' | 'uncheck' | 'price' | 'substitute' | 'delete' | 'join';
}

export interface FamilyRoom {
  id: string;
  code: string;
  name: string;
  members: string[];
  lists: ShoppingList[];
  activities: ActivityLog[];
  monthlySavings: number;
}

export interface WSMessage {
  type:
    | 'JOIN_ROOM'
    | 'ROOM_STATE'
    | 'ADD_ITEM'
    | 'UPDATE_ITEM'
    | 'DELETE_ITEM'
    | 'TOGGLE_CHECK'
    | 'UPDATE_PRICE'
    | 'APPLY_SUBSTITUTE'
    | 'CREATE_LIST'
    | 'ADD_MARKET'
    | 'MEMBER_JOINED'
    | 'MEMBER_LEFT'
    | 'PONG'
    | 'PING';
  roomId: string;
  userName?: string;
  payload?: any;
}

export interface MarketComparisonResult {
  marketId: string;
  marketName: string;
  color: string;
  totalCost: number;
  availableItemsCount: number;
  missingItemsCount: number;
  isCheapestOverall: boolean;
}

export interface SplitOptimizationResult {
  recommendedPurchases: {
    marketId: string;
    marketName: string;
    itemIds: string[];
    itemNames: string[];
    subtotal: number;
  }[];
  totalSplitCost: number;
  singleCheapestCost: number;
  extraSavings: number;
}
