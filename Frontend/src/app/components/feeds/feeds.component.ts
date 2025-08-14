import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FeedsService, Feed, FeedsStats } from '../../services/feeds.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-feeds',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './feeds.component.html',
  styleUrl: './feeds.component.css'
})
export class FeedsComponent implements OnInit, OnDestroy {
  feeds: Feed[] = [];
  stats: FeedsStats | null = null;
  loading = true;
  error = '';
  refreshInterval: Subscription | null = null;
  selectedFeed: Feed | null = null;
  feedData: any[] = [];
  showDetails = false;

  // Estados para modales de edición y eliminación
  showEditModal = false;
  showDeleteModal = false;
  showCreateModal = false;
  editingFeed: Feed | null = null;
  feedToDelete: Feed | null = null;

  // Formulario de edición
  editForm = {
    name: '',
    description: '',
    unit_type: '',
    unit_symbol: ''
  };

  // Formulario para crear nuevo feed
  createForm = {
    name: '',
    description: ''
  };

  constructor(private feedsService: FeedsService) {}

  ngOnInit() {
    this.loadFeeds();
    this.loadStats();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      this.refreshInterval.unsubscribe();
    }
  }

  loadFeeds() {
    this.loading = true;
    this.feedsService.getAllFeeds().subscribe({
      next: (response) => {
        if (response.success) {
          this.feeds = response.feeds;
          this.error = '';
        } else {
          this.error = response.message || 'Error al cargar feeds';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar feeds:', error);
        this.error = 'Error al conectar con el servidor';
        this.loading = false;
      }
    });
  }

  loadStats() {
    this.feedsService.getFeedsStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.stats;
        }
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  startAutoRefresh() {
    // Actualizar cada 30 segundos
    this.refreshInterval = interval(30000).subscribe(() => {
      this.loadFeeds();
      this.loadStats();
    });
  }

  refreshFeeds() {
    this.loadFeeds();
    this.loadStats();
  }

  showFeedDetails(feed: Feed) {
    this.selectedFeed = feed;
    this.showDetails = true;
    this.loadFeedData(feed.key);
  }

  loadFeedData(feedKey: string) {
    this.feedsService.getFeedData(feedKey, 20).subscribe({
      next: (response) => {
        if (response.success) {
          this.feedData = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar datos del feed:', error);
      }
    });
  }

  closeFeedDetails() {
    this.showDetails = false;
    this.selectedFeed = null;
    this.feedData = [];
  }

  formatValue(value: string, unitType: string, unitSymbol: string): string {
    return this.feedsService.formatValue(value, unitType, unitSymbol);
  }

  getStatusColor(feedKey: string, value: string): string {
    return this.feedsService.getStatusColor(feedKey, value);
  }

  getFeedIcon(feedKey: string): string {
    return this.feedsService.getFeedIcon(feedKey);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTimeSince(dateString: string): string {
    if (!dateString) return 'N/A';
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Ahora mismo';
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return `Hace ${diffDays} días`;
  }

  // ==================== MÉTODOS FALTANTES A IMPLEMENTAR ====================

  // Editar feed
  editFeed(feed: Feed) {
    this.editingFeed = feed;
    this.editForm = {
      name: feed.name,
      description: feed.description || '',
      unit_type: feed.unit_type || '',
      unit_symbol: feed.unit_symbol || ''
    };
    this.showEditModal = true;
  }

  // Confirmar eliminación de feed
  confirmDeleteFeed(feed: Feed) {
    this.feedToDelete = feed;
    this.showDeleteModal = true;
  }

  // Guardar cambios del feed editado
  saveEditedFeed() {
    if (!this.editingFeed) return;
    
    this.feedsService.updateFeed(this.editingFeed.key, this.editForm).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Feed actualizado exitosamente');
          this.loadFeeds(); // Recargar la lista
          this.closeEditModal();
        } else {
          console.error('Error al actualizar feed:', response.message);
        }
      },
      error: (error) => {
        console.error('Error al actualizar feed:', error);
      }
    });
  }

  // Eliminar feed confirmado
  deleteFeedConfirmed() {
    if (!this.feedToDelete) return;
    
    this.feedsService.deleteFeed(this.feedToDelete.key).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Feed eliminado exitosamente');
          this.loadFeeds(); // Recargar la lista
          this.closeDeleteModal();
        } else {
          console.error('Error al eliminar feed:', response.message);
        }
      },
      error: (error) => {
        console.error('Error al eliminar feed:', error);
      }
    });
  }

  // Cerrar modal de edición
  closeEditModal() {
    this.showEditModal = false;
    this.editingFeed = null;
    this.editForm = {
      name: '',
      description: '',
      unit_type: '',
      unit_symbol: ''
    };
  }

  // Cerrar modal de eliminación
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.feedToDelete = null;
  }

  // Editar punto de datos específico
  editDataPoint(feedKey: string, dataId: string, currentValue: string) {
    const newValue = prompt(`Editar valor actual: ${currentValue}`, currentValue);
    if (newValue !== null && newValue !== currentValue) {
      this.feedsService.updateDataPoint(feedKey, dataId, newValue).subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Punto de datos actualizado');
            if (this.selectedFeed && this.selectedFeed.key === feedKey) {
              this.loadFeedData(feedKey); // Recargar datos del feed
            }
          } else {
            console.error('Error al actualizar punto de datos:', response.message);
          }
        },
        error: (error) => {
          console.error('Error al actualizar punto de datos:', error);
        }
      });
    }
  }

  // Eliminar punto de datos específico
  deleteDataPoint(feedKey: string, dataId: string) {
    if (confirm('¿Estás seguro de que quieres eliminar este punto de datos?')) {
      this.feedsService.deleteDataPoint(feedKey, dataId).subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Punto de datos eliminado');
            if (this.selectedFeed && this.selectedFeed.key === feedKey) {
              this.loadFeedData(feedKey); // Recargar datos del feed
            }
          } else {
            console.error('Error al eliminar punto de datos:', response.message);
          }
        },
        error: (error) => {
          console.error('Error al eliminar punto de datos:', error);
        }
      });
    }
  }

  // Función para crear nuevo feed
  showCreateFeedModal() {
    this.showCreateModal = true;
    this.resetCreateForm();
  }

  // Resetear formulario de creación
  resetCreateForm() {
    this.createForm = {
      name: '',
      description: ''
    };
  }

  // Crear nuevo feed
  createNewFeed() {
    const rawName = this.createForm.name ? this.createForm.name : '';
    const normalized = this.normalizeKey(rawName);

    if (!normalized || normalized.length === 0) {
      alert('El nombre del feed es requerido');
      return;
    }

    // Usar el nombre normalizado para evitar errores por espacios o acentos
    this.createForm.name = normalized;

    // Preparar los datos mínimos para crear el feed
    const feedData = {
      name: normalized,
      description: (this.createForm.description || '').trim()
    };

    console.log('Creando feed:', feedData);
    
    this.feedsService.createFeed(feedData).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Feed creado exitosamente:', response);
          this.loadFeeds(); // Recargar la lista
          this.loadStats(); // Actualizar estadísticas
          this.closeCreateModal();
          
          // Mostrar mensaje de éxito
          setTimeout(() => {
            alert(`Feed "${feedData.name}" creado exitosamente!`);
          }, 500);
        } else {
          console.error('Error al crear feed:', response.message);
          alert('Error al crear feed: ' + (response.message || 'Error desconocido'));
        }
      },
      error: (error) => {
        console.error('Error al crear feed:', error);
        alert('Error al crear feed: ' + (error.error?.message || error.message || 'Error de conexión'));
      }
    });
  }

  // Normalizar nombre -> clave válida (minúsculas, sin acentos, espacios a guiones, solo [a-z0-9-_])
  normalizeKey(text: string): string {
    return String(text)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '')
      .replace(/-{2,}/g, '-')
      .replace(/^[-_]+|[-_]+$/g, '');
  }

  // Cerrar modal de creación
  closeCreateModal() {
    this.showCreateModal = false;
    this.resetCreateForm();
  }

  // Función para track de feeds por ID
  trackByFeedId(index: number, feed: Feed): string {
    return String(feed.id) || feed.key;
  }

  // =============== FUNCIONES DE ESTILO PARA HTML ===============

  // Clase de estado para icono de feed
  getFeedStatusClass(feed: Feed): string {
    if (feed.last_value && feed.last_value !== 'N/A') {
      return 'status-active';
    } else {
      return 'status-inactive';
    }
  }

  // Clase para badge de valor
  getValueBadgeClass(value: string): string {
    if (value && value !== 'N/A') {
      return 'badge-success';
    } else {
      return 'badge-secondary';
    }
  }

  // Clase para dot de estado
  getStatusDotClass(feed: Feed): string {
    if (feed.last_value && feed.last_value !== 'N/A') {
      return 'dot-success';
    } else {
      return 'dot-muted';
    }
  }

  // Clase para texto de estado
  getStatusTextClass(feed: Feed): string {
    if (feed.last_value && feed.last_value !== 'N/A') {
      return 'text-success fw-semibold';
    } else {
      return 'text-muted';
    }
  }

  // Texto de estado
  getStatusText(feed: Feed): string {
    if (feed.last_value && feed.last_value !== 'N/A') {
      return 'Activo';
    } else {
      return 'Sin datos';
    }
  }
}
