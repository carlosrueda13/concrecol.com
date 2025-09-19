import { cache } from 'react';

type SiigoAuthResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
};

type SiigoAuthError = {
  error: string;
  error_description: string;
};

type SiigoProductType = {
  id: string;
  code: string;
  name: string;
};

type SiigoInvoiceItem = {
  code: string; // Product code in SIIGO
  description: string;
  quantity: number;
  price: number;
  taxes?: Array<{
    id: number;
  }>;
  discount?: number;
};

type SiigoCustomer = {
  id?: string;
  identification: string;
  document_type: {
    code: string; // CC, NIT, CE, etc.
  };
  name?: string[];
  phones?: Array<{
    indicative?: string;
    number: string;
    extension?: string;
  }>;
  email?: string;
};

type SiigoInvoice = {
  document: {
    id: number;
  };
  date: string;
  customer: SiigoCustomer;
  seller?: number;
  items: SiigoInvoiceItem[];
  payments?: Array<{
    id: number;
    value: number;
    due_date?: string;
  }>;
  observations?: string;
  stamp?: {
    send: boolean;
  };
};

export interface SiigoInvoiceResponse {
  id: string;
  name: string;
  date: string;
  customer: {
    identification: string;
    name: string[];
  };
  items: Array<{
    code: string;
    description: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  total: number;
  balance: number;
  document: {
    id: number;
    name: string;
  };
  status: string;
  stamp?: {
    status: string;
    uuid: string;
    qr_link: string;
    pdf_link: string;
    xml_link: string;
  };
}

class SiigoClient {
  private baseUrl: string;
  private token: string | null = null;
  private tokenExpiry: number = 0;
  private clientId: string;
  private clientSecret: string;
  private username: string;
  private password: string;

  constructor() {
    // Determine environment and set base URL
    const env = process.env.SIIGO_ENV || 'sandbox';
    this.baseUrl = env === 'production'
      ? 'https://api.siigo.com'
      : 'https://api.siigo.com/sandbox';

    // Set credentials from environment variables
    this.clientId = process.env.SIIGO_CLIENT_ID || '';
    this.clientSecret = process.env.SIIGO_CLIENT_SECRET || '';
    this.username = process.env.SIIGO_USERNAME || '';
    this.password = process.env.SIIGO_PASSWORD || '';

    if (!this.clientId || !this.clientSecret || !this.username || !this.password) {
      console.warn('SIIGO credentials not fully configured');
    }
  }

  /**
   * Authenticate with SIIGO API and get access token
   */
  private async authenticate(): Promise<string> {
    // Check if token is still valid
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          username: this.username,
          password: this.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json() as SiigoAuthError;
        throw new Error(`SIIGO Auth Error: ${error.error} - ${error.error_description}`);
      }

      const data = await response.json() as SiigoAuthResponse;
      this.token = data.access_token;
      
      // Set expiry time (subtract 5 minutes as buffer)
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - (5 * 60 * 1000);
      
      return this.token;
    } catch (error) {
      console.error('Error authenticating with SIIGO:', error);
      throw new Error(`Failed to authenticate with SIIGO: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Make an authenticated request to the SIIGO API
   */
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    try {
      const token = await this.authenticate();
      
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const options: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      };
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SIIGO API Error (${response.status}): ${errorText}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error(`Error in SIIGO API request to ${endpoint}:`, error);
      throw new Error(`SIIGO API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get product types from SIIGO
   */
  async getProductTypes(): Promise<SiigoProductType[]> {
    return this.request<SiigoProductType[]>('/v1/product-types');
  }
  
  /**
   * Create a new electronic invoice in SIIGO
   */
  async createInvoice(invoiceData: SiigoInvoice): Promise<SiigoInvoiceResponse> {
    return this.request<SiigoInvoiceResponse>('/v1/invoices', 'POST', invoiceData);
  }
  
  /**
   * Get invoice details by ID
   */
  async getInvoice(invoiceId: string): Promise<SiigoInvoiceResponse> {
    return this.request<SiigoInvoiceResponse>(`/v1/invoices/${invoiceId}`);
  }
  
  /**
   * Map a document type to SIIGO format
   */
  getDocumentTypeCode(documentType: string): string {
    // Extract document type code from format: "CC 123456789"
    const type = documentType.split(' ')[0];
    
    switch (type) {
      case 'CC':
        return '13'; // Cédula de ciudadanía
      case 'NIT':
        return '31'; // NIT
      case 'CE':
        return '22'; // Cédula de extranjería
      case 'PP':
        return '41'; // Pasaporte
      default:
        return '13'; // Default to CC
    }
  }
  
  /**
   * Format a customer document number by removing any special characters
   */
  formatDocumentNumber(documentNumber: string): string {
    // Remove any non-numeric characters except hyphens
    return documentNumber.replace(/[^\d-]/g, '');
  }
}

// Export a singleton instance
export const siigoClient = new SiigoClient();
