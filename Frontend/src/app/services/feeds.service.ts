import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Feed {
  id: number;
  name: string;
  key: string;
  description: string;
  last_value: string;
  created_at: string;
  updated_at: string;
  unit_type: string;
  unit_symbol: string;
  history: boolean;
  visibility: string;
  license: string;
}

export interface FeedDetails {
  id: number;
  name: string;
  key: string;
  description: string;
  last_value: string;
  created_at: string;
  updated_at: string;
  unit_type: string;
  unit_symbol: string;
  history: boolean;
  visibility: string;
  license: string;
}

export interface FeedData {
  id: string;
  value: string;
  created_at: string;
  updated_at: string;
  feed_id: number;
}

export interface FeedsStats {
  total_feeds: number;
  active_feeds: number;
  private_feeds: number;
  public_feeds: number;
  feeds_with_data: number;
  last_updated: string;
}

@Injectable({
  providedIn: 'root'
})
export class FeedsService {
  private apiUrl = 'http://localhost:3000/api/adafruit';

  constructor(private http: HttpClient) {}

  // ==================== SERVICIOS YA IMPLEMENTADOS ====================

  // All Feeds - GET /feeds
  getAllFeeds(): Observable<any> {
    return this.http.get(`${this.apiUrl}/feeds`);
  }

  // Get Feed Stats - GET /feeds/stats
  getFeedsStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/feeds/stats`);
  }

  // Get Feed - GET /feeds/{feed_key}
  getFeedDetails(feedKey: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/feeds/${feedKey}`);
  }

  // Get Feed Data - GET /feeds/{feed_key}/data
  getFeedData(feedKey: string, limit: number = 50, startTime?: string, endTime?: string): Observable<any> {
    let params = `limit=${limit}`;
    if (startTime) params += `&start_time=${startTime}`;
    if (endTime) params += `&end_time=${endTime}`;
    
    return this.http.get(`${this.apiUrl}/feeds/${feedKey}/data?${params}`);
  }

  // Create Data - POST /feeds/{feed_key}/data
  createFeedData(feedKey: string, value: string | number): Observable<any> {
    return this.http.post(`${this.apiUrl}/feeds/${feedKey}/data`, { value });
  }

  // ==================== SERVICIOS FALTANTES A IMPLEMENTAR ====================

  // Update Data Point - PATCH /feeds/{feed_key}/data/{data_id}
  updateDataPoint(feedKey: string, dataId: string, value: string | number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/feeds/${feedKey}/data/${dataId}`, { value });
  }

  // Delete Data Point - DELETE /feeds/{feed_key}/data/{data_id}
  deleteDataPoint(feedKey: string, dataId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/feeds/${feedKey}/data/${dataId}`);
  }

  // Create Feed - POST /feeds
  createFeed(feedData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/feeds`, feedData);
  }

  // Update Feed - PATCH /feeds/{feed_key}
  updateFeed(feedKey: string, feedData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/feeds/${feedKey}`, feedData);
  }

  // Delete Feed - DELETE /feeds/{feed_key}
  deleteFeed(feedKey: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/feeds/${feedKey}`);
  }

  // ==================== UTILIDADES ====================

  // Formatear valor según el tipo de unidad
  formatValue(value: string, unitType: string, unitSymbol: string): string {
    if (!value || value === 'N/A') return 'N/A';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    
    switch (unitType) {
      case 'temperature':
        return `${numValue.toFixed(1)}${unitSymbol || '°C'}`;
      case 'humidity':
        return `${numValue.toFixed(1)}${unitSymbol || '%'}`;
      case 'distance':
        return `${numValue.toFixed(2)}${unitSymbol || 'cm'}`;
      case 'boolean':
        return numValue > 0 ? 'Activo' : 'Inactivo';
      default:
        return `${numValue}${unitSymbol || ''}`;
    }
  }

  // Determinar el color de estado según el tipo de feed
  getStatusColor(feedKey: string, value: string): string {
    if (!value || value === 'N/A') return 'text-muted';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'text-info';
    
    // Reglas específicas por tipo de feed
    switch (feedKey.toLowerCase()) {
      case 'temperatura':
      case 'temperature':
        if (numValue >= 18 && numValue <= 27) return 'text-success';
        if (numValue >= 15 && numValue <= 30) return 'text-warning';
        return 'text-danger';
        
      case 'humedad':
      case 'humidity':
        if (numValue >= 30 && numValue <= 60) return 'text-success';
        if (numValue >= 20 && numValue <= 70) return 'text-warning';
        return 'text-danger';
        
      case 'distancia':
      case 'distance':
      case 'objeto':
        if (numValue <= 18) return 'text-danger'; // Objeto detectado
        return 'text-success'; // Sin objeto
        
      case 'puerta':
      case 'door':
        return numValue > 0 ? 'text-success' : 'text-warning';
        
      case 'vibracion':
      case 'vibration':
      case 'pir':
        return numValue > 0 ? 'text-danger' : 'text-success';
        
      default:
        return 'text-info';
    }
  }

  // Obtener icono según el tipo de feed
  getFeedIcon(feedKey: string): string {
    switch (feedKey.toLowerCase()) {
      case 'temperatura':
      case 'temperature':
        return 'fas fa-thermometer-half';
      case 'humedad':
      case 'humidity':
        return 'fas fa-tint';
      case 'distancia':
      case 'distance':
      case 'objeto':
        return 'fas fa-ruler';
      case 'puerta':
      case 'door':
        return 'fas fa-door-open';
      case 'vibracion':
      case 'vibration':
        return 'fas fa-wave-square';
      case 'pir':
        return 'fas fa-running';
      case 'rfid':
        return 'fas fa-credit-card';
      default:
        return 'fas fa-rss';
    }
  }
}
