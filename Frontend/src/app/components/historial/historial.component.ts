import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeedsService } from '../../services/feeds.service';

interface Acceso {
  tsIso: string;
  fecha: Date;
}

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.css'
})
export class HistorialComponent implements OnInit {
  loading = false;
  accesos: Acceso[] = [];
  lastAccess: Date | null = null;

  // Filtros
  limit = 50;
  start?: string; // datetime-local
  end?: string;   // datetime-local

  constructor(private feeds: FeedsService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    const startIso = this.start ? new Date(this.start).toISOString() : undefined;
    const endIso = this.end ? new Date(this.end).toISOString() : undefined;

    const isOpen = (v: any) => {
      if (v == null) return false;
      const s = String(v).trim().toLowerCase();
      return s === '1' || s === 'on' || s === 'true' || s === 'open' || s === 'abierto';
    };
    const isClosed = (v: any) => {
      if (v == null) return false;
      const s = String(v).trim().toLowerCase();
      return s === '0' || s === 'off' || s === 'false' || s === 'closed' || s === 'cerrado';
    };

    // Detectar solo aperturas (transición 0 -> 1)
    const extractOpenings = (res: any): Acceso[] => {
      const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      // Orden cronológico ascendente para detectar transiciones
      const ordered = [...raw].sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      const openings: Acceso[] = [];
      let prevOpen: boolean | null = null;
      for (const d of ordered) {
        const nowOpen = isOpen(d?.value);
        // Contar apertura solo si la transición es explícitamente de cerrado -> abierto
        if (prevOpen === false && nowOpen) {
          openings.push({ tsIso: d.created_at, fecha: new Date(d.created_at) });
        }
        // Actualiza estado previo solo si podemos inferirlo (abierto/cerrado)
        if (nowOpen) prevOpen = true;
        else if (isClosed(d?.value)) prevOpen = false;
        // Si no es ni abierto ni cerrado (valor extraño), no cambiamos prevOpen
      }
      // Mostramos más reciente primero
      return openings.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    };

    this.feeds.getFeedData('estado-puerta', this.limit, startIso, endIso).subscribe({
      next: (res: any) => {
        const eventos = extractOpenings(res);
        if (eventos.length === 0) {
          this.feeds.getFeedData('puerta', this.limit, startIso, endIso).subscribe({
            next: (res2: any) => {
              this.accesos = extractOpenings(res2);
              this.lastAccess = this.accesos.length ? this.accesos[0].fecha : null;
              this.loading = false;
            },
            error: () => {
              this.accesos = [];
              this.lastAccess = null;
              this.loading = false;
            }
          });
        } else {
          this.accesos = eventos;
          this.lastAccess = this.accesos.length ? this.accesos[0].fecha : null;
          this.loading = false;
        }
      },
      error: () => {
        this.feeds.getFeedData('puerta', this.limit, startIso, endIso).subscribe({
          next: (res2: any) => {
            this.accesos = extractOpenings(res2);
            this.lastAccess = this.accesos.length ? this.accesos[0].fecha : null;
            this.loading = false;
          },
          error: () => {
            this.accesos = [];
            this.lastAccess = null;
            this.loading = false;
          }
        });
      }
    });
  }

  clearFilters(): void {
    this.start = undefined;
    this.end = undefined;
    this.cargar();
  }

  applyPreset(preset: 'today' | '7d'): void {
    const now = new Date();
    if (preset === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      this.start = this.toLocalInputValue(start);
      this.end = this.toLocalInputValue(now);
    } else if (preset === '7d') {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
      this.start = this.toLocalInputValue(start);
      this.end = this.toLocalInputValue(now);
    }
    this.cargar();
  }

  private toLocalInputValue(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
  }
}

