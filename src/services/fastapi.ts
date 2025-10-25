const FASTAPI_BASE_URL = 'http://185.241.151.219:8000';

interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id?: string;
}

interface OCRResponse {
  extracted_data: {
    name?: string;
    id_number?: string;
    license_number?: string;
    expiry_date?: string;
    nationality?: string;
    [key: string]: any;
  };
  confidence: number;
}

interface ContractResponse {
  contract_id: string;
  status: string;
  created_at: string;
}

interface DamageDetectionResponse {
  damages_detected: boolean;
  damage_locations: Array<{
    type: string;
    severity: string;
    location: string;
    confidence: number;
  }>;
  estimated_cost: number;
}

interface FineCheckResponse {
  fines: Array<{
    fine_id: string;
    violation: string;
    amount: number;
    date: string;
    status: string;
    location: string;
  }>;
  total_amount: number;
}

interface ChatbotResponse {
  message: string;
  suggestions?: string[];
}

interface WhatsAppResponse {
  message_id: string;
  status: string;
}

interface DashboardReportResponse {
  total_contracts: number;
  active_contracts: number;
  total_revenue: number;
  pending_fines: number;
  vehicles_in_use: number;
  damages_reported: number;
}

export class FastAPIService {
  private static token: string | null = null;

  static setToken(token: string) {
    this.token = token;
    localStorage.setItem('fastapi_token', token);
  }

  static getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('fastapi_token');
    }
    return this.token;
  }

  static clearToken() {
    this.token = null;
    localStorage.removeItem('fastapi_token');
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${FASTAPI_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('FastAPI request error:', error);
      throw error;
    }
  }

  private static async uploadFile(endpoint: string, file: File): Promise<any> {
    const token = this.getToken();
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${FASTAPI_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('FastAPI upload error:', error);
      throw error;
    }
  }

  static async register(email: string, password: string, fullName: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${FASTAPI_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(error.detail || 'Invalid credentials');
    }

    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  static async uploadIDDocument(file: File): Promise<OCRResponse> {
    return this.uploadFile('/api/documents/upload-id', file);
  }

  static async uploadLicenseDocument(file: File): Promise<OCRResponse> {
    return this.uploadFile('/api/documents/upload-license', file);
  }

  static async createContract(contractData: {
    driver_id: string;
    vehicle_id: string;
    start_date: string;
    end_date: string;
    rental_amount: number;
    deposit_amount: number;
  }): Promise<ContractResponse> {
    return this.request<ContractResponse>('/api/contracts/create', {
      method: 'POST',
      body: JSON.stringify(contractData),
    });
  }

  static async getContractPDF(contractId: string): Promise<Blob> {
    const token = this.getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${FASTAPI_BASE_URL}/api/contracts/${contractId}/pdf`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch contract PDF');
    }

    return await response.blob();
  }

  static async uploadBeforeDamagePhoto(file: File): Promise<{ photo_id: string }> {
    return this.uploadFile('/api/damage/upload-before', file);
  }

  static async uploadAfterDamagePhoto(file: File): Promise<{ photo_id: string }> {
    return this.uploadFile('/api/damage/upload-after', file);
  }

  static async compareDamagePhotos(contractId: string): Promise<DamageDetectionResponse> {
    return this.request<DamageDetectionResponse>(`/api/damage/compare/${contractId}`, {
      method: 'POST',
    });
  }

  static async checkDubaiPoliceFines(vehiclePlate: string): Promise<FineCheckResponse> {
    return this.request<FineCheckResponse>('/api/fines/check-dubai-police', {
      method: 'POST',
      body: JSON.stringify({ vehicle_plate: vehiclePlate }),
    });
  }

  static async getMyFines(): Promise<FineCheckResponse> {
    return this.request<FineCheckResponse>('/api/fines/my-fines');
  }

  static async sendChatbotMessage(message: string, conversationId?: string): Promise<ChatbotResponse> {
    return this.request<ChatbotResponse>('/api/chatbot/message', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_id: conversationId }),
    });
  }

  static async sendWhatsAppNotification(
    phoneNumber: string,
    message: string,
    templateName?: string
  ): Promise<WhatsAppResponse> {
    return this.request<WhatsAppResponse>('/api/notifications/whatsapp/send', {
      method: 'POST',
      body: JSON.stringify({ phone_number: phoneNumber, message, template_name: templateName }),
    });
  }

  static async getDashboardReport(): Promise<DashboardReportResponse> {
    return this.request<DashboardReportResponse>('/api/reports/dashboard');
  }

  static async exportPDFReport(): Promise<Blob> {
    const token = this.getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${FASTAPI_BASE_URL}/api/reports/export-pdf`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to export PDF report');
    }

    return await response.blob();
  }
}
