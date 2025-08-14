import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SensorResponse {
  success: boolean;
  message?: string;
  timestamp?: string;
  sensor?: string;
  data?: {
    id?: string;
    feed_id?: number;
    value?: any;
    location?: string;
    created_at?: string;
  };
  // Estructura específica para sensores ambientales
  condiciones?: {
    temperatura?: number;
    humedad?: number;
  };
  ambiente?: {
    estable?: boolean;
    estado?: string;
    recomendaciones?: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class SensorsService {
  private readonly API_BASE = 'http://localhost:3000/api/sensors';

  constructor(private http: HttpClient) {}

  // ==================== SENSORES AMBIENTALES ====================

  getAmbientalData(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/ambiental`);
  }

  getTemperatureData(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/temperatura`);
  }

  getTemperatureHistory(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/temperatura/historial`);
  }

  getHumidityData(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/humedad`);
  }

  getHumidityHistory(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/humedad/historial`);
  }

  getAmbientalChart(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/ambiental/chart`);
  }

  // ==================== CONTROL DE PUERTA ====================

  getDoorStatus(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/puerta/estado`);
  }

  getDoorControl(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/puerta/control`);
  }

  controlDoor(action: 'open' | 'close'): Observable<SensorResponse> {
    const accion = action === 'open' ? 'abrir' : 'cerrar';
    return this.http.post<SensorResponse>(`${this.API_BASE}/puerta/control`, { accion });
  }

  getDoorComplete(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/puerta/completo`);
  }

  getDoorHistory(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/puerta/historial`);
  }

  // ==================== SENSOR DE OBJETOS ====================

  getObjectData(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/objeto`);
  }

  getObjectHistory(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/objeto/historial`);
  }

  getObjectStats(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/objeto/estadisticas`);
  }

  getObjectChart(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/objeto/chart`);
  }

  getObjectAlerts(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/objeto/alertas`);
  }

  // ==================== SENSOR DE VIBRACIÓN ====================

  getVibrationData(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/vibracion`);
  }

  getVibrationHistory(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/vibracion/historial`);
  }

  getVibrationAlerts(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/vibracion/alertas`);
  }

  getVibrationStats(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/vibracion/estadisticas`);
  }

  getVibrationEvents(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/vibracion/eventos`);
  }

  getVibrationChart(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/vibracion/chart`);
  }

  // ==================== SEGURIDAD ====================

  getSecurityData(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/seguridad/intentos`);
  }

  resetFailedAttempts(): Observable<SensorResponse> {
    return this.http.post<SensorResponse>(`${this.API_BASE}/seguridad/reset`, {});
  }

  getSecurityHistory(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/seguridad/historial`);
  }

  getSecurityAlerts(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/seguridad/alertas`);
  }

  getSecurityStats(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/seguridad/estadisticas`);
  }

  getSecurityChart(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/seguridad/chart`);
  }

  simulateFailedAttempt(): Observable<SensorResponse> {
    return this.http.post<SensorResponse>(`${this.API_BASE}/seguridad/simular`, {});
  }

  // ==================== DATOS CONSOLIDADOS ====================

  getAllSensorsData(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/resumen`);
  }

  getChartData(): Observable<SensorResponse> {
    return this.http.get<SensorResponse>(`${this.API_BASE}/chart`);
  }

  // ==================== INFORMACIÓN GENERAL ====================

  getApiInfo(): Observable<any> {
    return this.http.get(`${this.API_BASE}/`);
  }

  // ==================== MÉTODOS DE CONVENIENCIA ====================

  // Para compatibilidad con el componente existente
  openDoor(): Observable<SensorResponse> {
    return this.controlDoor('open');
  }

  closeDoor(): Observable<SensorResponse> {
    return this.controlDoor('close');
  }

  // Obtener todos los datos de una vez (para dashboard)
  getDashboardData(): Observable<{
    ambiental: any;
    puerta: any;
    objeto: any;
    vibracion: any;
    seguridad: any;
  }> {
    return new Observable(observer => {
      Promise.all([
        this.getAmbientalData().toPromise(),
        this.getDoorComplete().toPromise(),
        this.getObjectData().toPromise(),
        this.getVibrationData().toPromise(),
        this.getSecurityData().toPromise()
      ]).then(([ambiental, puerta, objeto, vibracion, seguridad]) => {
        observer.next({
          ambiental: ambiental?.data,
          puerta: puerta?.data,
          objeto: objeto?.data,
          vibracion: vibracion?.data,
          seguridad: seguridad?.data
        });
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }
}
