import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { SensorsService } from '../../services/sensors.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

interface SensorData {
  temperature?: number;
  humidity?: number;
  doorState?: boolean;
  objectDistance?: number;
  objectDetected?: boolean;
  vibrationDetected?: boolean;
  failedAttempts?: number;
  lastUpdate?: Date;
}

interface EventLog {
  timestamp: Date;
  type: 'door' | 'security' | 'sensor' | 'error';
  message: string;
}

@Component({
  selector: 'app-sensores',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './sensores.component.html',
  styleUrl: './sensores.component.css'
})
export class SensoresComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('tempChart') tempChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('humidityChart') humidityChart!: ElementRef<HTMLCanvasElement>;

  // Datos de sensores
  ambientalData = {
    temperature: 22,
    humidity: 45
  };

  doorData = {
    state: false,
    lastAccess: new Date()
  };

  objectData = {
    distance: 25,
    detected: false
  };

  vibrationData = {
    detected: false
  };

  securityData = {
    attempts: 0
  };

  lastUpdate = new Date();
  recentEvents: EventLog[] = [];

  // Subscripciones
  private refreshSubscription?: Subscription;
  private charts: any = {};
  
  // Datos para gráficos
  private temperatureData: number[] = [];
  private humidityData: number[] = [];
  private timeLabels: string[] = [];
  private maxDataPoints = 20; // Máximo 20 puntos en el gráfico

  constructor(
    private http: HttpClient,
    private sensorsService: SensorsService
  ) {}

  ngOnInit() {
    this.addEvent('sensor', 'Sistema de monitoreo iniciado');
    this.refreshAllSensors();
    // Actualizar cada 5 segundos
    this.refreshSubscription = interval(5000).subscribe(() => {
      this.refreshAllSensors();
    });
  }

  ngAfterViewInit() {
    // Inicializar gráficos después de que la vista esté lista
    setTimeout(() => {
      this.initCharts();
    }, 100);
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    
    // Limpiar gráficos
    Object.values(this.charts).forEach((chart: any) => {
      if (chart && chart.destroy) {
        chart.destroy();
      }
    });
  }

  // Métodos de API para obtener datos
  refreshAllSensors() {
    this.getAmbientalData();
    this.getDoorData();
    this.getObjectData();
    this.getVibrationData();
    this.getSecurityData();
    this.lastUpdate = new Date();
  }

  getAmbientalData() {
    this.sensorsService.getAmbientalData().subscribe({
      next: (response: any) => {
        console.log('Respuesta ambiental completa:', response); // Debug
        if (response.success && response.condiciones) {
          // Estructura actual: { success: true, timestamp, condiciones: {temperatura: {valor}, humedad: {valor}}, ambiente: {...} }
          const temp = response.condiciones.temperatura?.valor || this.ambientalData.temperature;
          const hum = response.condiciones.humedad?.valor || this.ambientalData.humidity;
          
          this.ambientalData.temperature = temp;
          this.ambientalData.humidity = hum;
          this.updateCharts();
          this.addEvent('sensor', `Datos ambientales actualizados: ${temp}°C, ${hum}%`);
        }
      },
      error: (error: any) => {
        console.error('Error obteniendo datos ambientales:', error);
        this.addEvent('error', 'Error al obtener datos de temperatura/humedad');
        // Datos simulados en caso de error
        this.simulateAmbientalData();
      }
    });
  }

  getDoorData() {
    this.sensorsService.getDoorStatus().subscribe({
      next: (response: any) => {
        console.log('Respuesta puerta completa:', response); // Debug
        if (response.success && response.data) {
          const previousState = this.doorData.state;
          // El valor viene en response.data.value (0 = cerrada, 1 = abierta)
          this.doorData.state = response.data.value === '1' || response.data.value === 1;
          
          if (previousState !== this.doorData.state) {
            this.doorData.lastAccess = new Date();
            this.addEvent('door', 
              this.doorData.state ? 'Puerta abierta' : 'Puerta cerrada'
            );
          }
        }
      },
      error: (error: any) => {
        console.error('Error obteniendo estado de puerta:', error);
        this.addEvent('error', 'Error al obtener estado de la puerta');
      }
    });
  }

  getDoorStatusFallback() {
    this.sensorsService.getDoorStatus().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          // Usar la misma lógica que el método principal
          this.doorData.state = response.data.value === '1' || response.data.value === 1;
        }
      },
      error: (error: any) => {
        console.error('Error en fallback de puerta:', error);
      }
    });
  }

  getObjectData() {
    this.sensorsService.getObjectData().subscribe({
      next: (response: any) => {
        console.log('Respuesta objeto completa:', response); // Debug
        if (response.success && response.data) {
          // El valor viene en response.data.value (distancia en cm)
          const distance = parseFloat(response.data.value) || this.objectData.distance;
          this.objectData.distance = distance;
          
          const wasDetected = this.objectData.detected;
          // Objeto detectado si la distancia es menor o igual a 16 cm
          this.objectData.detected = distance <= 16;
          
          if (wasDetected !== this.objectData.detected) {
            this.addEvent('sensor', 
              this.objectData.detected ? 'Objeto detectado' : 'Objeto removido'
            );
          }
        }
      },
      error: (error: any) => {
        console.error('Error obteniendo datos de objeto:', error);
        this.addEvent('error', 'Error al obtener datos del sensor de objeto');
        // Simular datos aleatorios
        this.simulateObjectData();
      }
    });
  }

  getVibrationData() {
    this.sensorsService.getVibrationData().subscribe({
      next: (response: any) => {
        console.log('Respuesta vibración completa:', response); // Debug
        if (response.success && response.data) {
          const wasDetected = this.vibrationData.detected;
          // El valor viene en response.data.value (0 = sin vibración, 1 = vibración detectada)
          this.vibrationData.detected = response.data.value === '1' || response.data.value === 1;
          
          if (!wasDetected && this.vibrationData.detected) {
            this.addEvent('security', 'Vibración detectada - Posible manipulación');
          }
        }
      },
      error: (error: any) => {
        console.error('Error obteniendo datos de vibración:', error);
        this.addEvent('error', 'Error al obtener datos del sensor de vibración');
      }
    });
  }

  getSecurityData() {
    this.sensorsService.getSecurityData().subscribe({
      next: (response: any) => {
        console.log('Respuesta seguridad completa:', response); // Debug
        if (response.success && response.data) {
          const previousAttempts = this.securityData.attempts;
          // El valor viene en response.data.value (número de intentos fallidos)
          this.securityData.attempts = parseInt(response.data.value) || 0;
          
          if (this.securityData.attempts > previousAttempts) {
            this.addEvent('security', `Intento fallido #${this.securityData.attempts}`);
          }
        }
      },
      error: (error: any) => {
        console.error('Error obteniendo datos de seguridad:', error);
        this.addEvent('error', 'Error al obtener datos de seguridad');
      }
    });
  }

  // Control de puerta
  toggleDoor() {
    const action = this.doorData.state ? 'close' : 'open';
    this.sensorsService.controlDoor(action).subscribe({
      next: (response) => {
        if (response.success) {
          this.addEvent('door', `Comando ${action} enviado`);
          // Actualizar estado inmediatamente
          setTimeout(() => this.getDoorData(), 1000);
        }
      },
      error: (error) => {
        console.error('Error controlando puerta:', error);
        this.addEvent('error', 'Error al controlar la puerta');
        // Simular cambio de estado para demo
        this.simulateDoorToggle();
      }
    });
  }

  // Métodos de simulación para desarrollo/demo
  simulateAmbientalData() {
    this.ambientalData.temperature = 18 + Math.random() * 15; // 18-33°C
    this.ambientalData.humidity = 30 + Math.random() * 40; // 30-70%
    this.updateCharts();
  }

  simulateObjectData() {
    this.objectData.distance = 10 + Math.random() * 30; // 10-40cm
    const wasDetected = this.objectData.detected;
    this.objectData.detected = this.objectData.distance <= 16;
    
    if (wasDetected !== this.objectData.detected) {
      this.addEvent('sensor', 
        this.objectData.detected ? 'Objeto detectado (simulado)' : 'Objeto removido (simulado)'
      );
    }
  }

  simulateDoorToggle() {
    this.doorData.state = !this.doorData.state;
    this.doorData.lastAccess = new Date();
    this.addEvent('door', `Puerta ${this.doorData.state ? 'abierta' : 'cerrada'} (simulado)`);
  }

  // Métodos para clases CSS y estados
  getStatusClass(): string {
    if (this.securityData.attempts >= 3) return 'text-danger';
    if (this.vibrationData.detected) return 'text-warning';
    if (this.doorData.state) return 'text-success';
    return 'text-primary';
  }

  getStatusIcon(): string {
    if (this.securityData.attempts >= 3) return 'fas fa-exclamation-triangle';
    if (this.vibrationData.detected) return 'fas fa-hand-rock';
    if (this.doorData.state) return 'fas fa-unlock';
    return 'fas fa-lock';
  }

  getStatusText(): string {
    if (this.securityData.attempts >= 3) return 'BLOQUEADA';
    if (this.vibrationData.detected) return 'ALERTA';
    if (this.doorData.state) return 'ABIERTA';
    return 'SEGURA';
  }

  getDoorStatusClass(): string {
    return this.doorData.state ? 'text-success' : 'text-primary';
  }

  getDoorIcon(): string {
    return this.doorData.state ? 'fas fa-door-open' : 'fas fa-door-closed';
  }

  getAttemptsClass(): string {
    if (this.securityData.attempts >= 3) return 'badge-danger';
    if (this.securityData.attempts > 0) return 'badge-warning';
    return 'badge-success';
  }

  getObjectStatusClass(): string {
    return this.objectData.detected ? 'text-danger' : 'text-success';
  }

  getObjectIcon(): string {
    return this.objectData.detected ? 'fas fa-cube' : 'far fa-square';
  }

  getVibrationStatusClass(): string {
    return this.vibrationData.detected ? 'text-danger' : 'text-success';
  }

  getVibrationIcon(): string {
    return this.vibrationData.detected ? 'fas fa-hand-rock' : 'fas fa-hand-paper';
  }

  getVibrationStatus(): string {
    return this.vibrationData.detected ? 'MOVIMIENTO' : 'ESTABLE';
  }

  // Método para posición del blip en el radar
  getBlipPosition(): number {
    if (!this.objectData.distance) return 50;
    // Convertir distancia a posición en el radar (0-100%)
    // 0cm = centro (50%), 40cm+ = borde (10% o 90%)
    const maxDistance = 40;
    const distancePercent = Math.min(this.objectData.distance / maxDistance, 1);
    return 50 - (distancePercent * 40); // Centro hacia arriba
  }

  // Eventos
  addEvent(type: EventLog['type'], message: string) {
    this.recentEvents.unshift({
      timestamp: new Date(),
      type,
      message
    });
    
    // Mantener solo los últimos 10 eventos
    if (this.recentEvents.length > 10) {
      this.recentEvents = this.recentEvents.slice(0, 10);
    }
  }

  // ==================== CONTROL DE PUERTA ====================
  
  openDoor() {
    this.sensorsService.controlDoor('open').subscribe({
      next: (response: any) => {
        console.log('Respuesta abrir puerta:', response);
        if (response.success) {
          this.addEvent('door', 'Puerta abierta desde control remoto');
          // Actualizar estado inmediatamente
          this.doorData.state = true;
          this.doorData.lastAccess = new Date();
          // Refrescar datos después de un momento
          setTimeout(() => this.getDoorData(), 1000);
        } else {
          this.addEvent('error', 'Error al abrir puerta: ' + (response.message || 'Error desconocido'));
        }
      },
      error: (error: any) => {
        console.error('Error al abrir puerta:', error);
        this.addEvent('error', 'Error de comunicación al abrir puerta');
      }
    });
  }

  closeDoor() {
    this.sensorsService.controlDoor('close').subscribe({
      next: (response: any) => {
        console.log('Respuesta cerrar puerta:', response);
        if (response.success) {
          this.addEvent('door', 'Puerta cerrada desde control remoto');
          // Actualizar estado inmediatamente
          this.doorData.state = false;
          this.doorData.lastAccess = new Date();
          // Refrescar datos después de un momento
          setTimeout(() => this.getDoorData(), 1000);
        } else {
          this.addEvent('error', 'Error al cerrar puerta: ' + (response.message || 'Error desconocido'));
        }
      },
      error: (error: any) => {
        console.error('Error al cerrar puerta:', error);
        this.addEvent('error', 'Error de comunicación al cerrar puerta');
      }
    });
  }

  getEventClass(type: string): string {
    switch (type) {
      case 'error': return 'event-error';
      case 'security': return 'event-security';
      case 'door': return 'event-door';
      default: return 'event-sensor';
    }
  }

  getEventIcon(type: string): string {
    switch (type) {
      case 'error': return 'fas fa-exclamation-circle text-danger';
      case 'security': return 'fas fa-shield-alt text-warning';
      case 'door': return 'fas fa-door-open text-primary';
      default: return 'fas fa-microchip text-info';
    }
  }

  // Gráficos (implementación básica)
  initCharts() {
    // Esperar un poco para asegurar que los elementos canvas estén en el DOM
    setTimeout(() => {
      this.createTemperatureChart();
      this.createHumidityChart();
    }, 500);
  }

  createTemperatureChart() {
    const canvas = document.getElementById('temperatureChart') as HTMLCanvasElement;
    if (!canvas) {
      console.warn('Canvas temperatureChart no encontrado');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.charts.temperature = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.timeLabels,
        datasets: [{
          label: 'Temperatura (°C)',
          data: this.temperatureData,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Temperatura en Tiempo Real'
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 0,
            max: 50,
            title: {
              display: true,
              text: 'Temperatura (°C)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Tiempo'
            }
          }
        }
      }
    });
  }

  createHumidityChart() {
    const canvas = document.getElementById('humidityChart') as HTMLCanvasElement;
    if (!canvas) {
      console.warn('Canvas humidityChart no encontrado');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.charts.humidity = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.timeLabels,
        datasets: [{
          label: 'Humedad (%)',
          data: this.humidityData,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.1,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Humedad en Tiempo Real'
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            min: 0,
            max: 100,
            title: {
              display: true,
              text: 'Humedad (%)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Tiempo'
            }
          }
        }
      }
    });
  }

  updateCharts() {
    // Agregar timestamp actual
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });

    // Agregar nuevos datos
    this.temperatureData.push(this.ambientalData.temperature);
    this.humidityData.push(this.ambientalData.humidity);
    this.timeLabels.push(timeString);

    // Limitar el número de puntos
    if (this.temperatureData.length > this.maxDataPoints) {
      this.temperatureData.shift();
      this.humidityData.shift();
      this.timeLabels.shift();
    }

    // Actualizar gráficos si existen
    if (this.charts.temperature) {
      this.charts.temperature.data.labels = this.timeLabels;
      this.charts.temperature.data.datasets[0].data = this.temperatureData;
      this.charts.temperature.update('none'); // Sin animación para mejor rendimiento
    }

    if (this.charts.humidity) {
      this.charts.humidity.data.labels = this.timeLabels;
      this.charts.humidity.data.datasets[0].data = this.humidityData;
      this.charts.humidity.update('none');
    }

    console.log('Gráficos actualizados', {
      temperature: this.ambientalData.temperature,
      humidity: this.ambientalData.humidity,
      dataPoints: this.temperatureData.length
    });
  }
}
