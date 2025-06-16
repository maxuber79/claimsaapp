import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of, throwError, map } from 'rxjs';
import { DashboardData } from '../models/metric.model';
import { catchError, retry } from 'rxjs/operators';
import { Claim } from '../models/claims';

import { generateUUID } from '../utils/uuid.util'; // Ajusta la ruta según corresponda

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

	private readonly BASE_PATH = 'assets/data/';
	private readonly DATA_FILE = 'dashboard-data.json';


  constructor(private http: HttpClient) {
		console.log('%c<<< Start MOCK-DATA service >>>','background: #fff3cd; color: #664d03; padding: 2px 5px;');
	 }

	 /** 🔹 Devuelve todas las métricas de dashboard (cards) */
	 getDashboardMetrics(): Observable<DashboardData> {
		return this.http.get<DashboardData>(`${this.BASE_PATH}dashboard-data.json`);
	}

  /** 🔹 Devuelve data para gráfico de tickets creados vs resueltos */
  getTicketGraph(): Observable<any> {
    return this.http.get<any>(`${this.BASE_PATH}${this.DATA_FILE}`)
      .pipe(map(data => data.chartData.tickets));
  }

  /** 🔹 Devuelve score de satisfacción (porcentaje) */
  getSatisfactionData(): Observable<any> {
		return this.http.get<any>(`${this.BASE_PATH}satisfaction.json`);
	}

  /** 🔹 Devuelve distribución por canal */
  getChannelsData(): Observable<any> {
		return this.http.get<any>(`${this.BASE_PATH}channels.json`);
	}

	/**
 * 🔹 Devuelve las notificaciones dummy para mostrar en el dashboard.
 * 
 * Este método realiza una petición HTTP GET al archivo `notifications.json` ubicado en la carpeta
 * `assets/data/` del proyecto. Este archivo contiene datos simulados como nombre de usuario,
 * mensaje, hora y avatar (por ejemplo, usando la API de https://randomuser.me/).
 * 
 * @returns Observable<any> - Un observable con la lista de notificaciones para suscribirse desde el componente.
 *
 * 📌 Ejemplo de uso:
 * this.mockService.getNotifications().subscribe(data => {
 *   this.notifications = data;
 * });
 */
	getNotifications(): Observable<Notification[]> {
		return this.http.get<Notification[]>(`${this.BASE_PATH}notifications.json`);
	}
	
	/** 🔸 Devuelve listado de reclamos frecuentes con retry y manejo de error */
	/* getReclamos(): Observable<Claim[]> {
		return this.http.get<Claim[]>(`${this.BASE_PATH}reclamos.json`).pipe(
			retry(2), // 🔁 Intenta 2 veces más si falla
			catchError((error) => {
				console.error('🚨 Error al cargar reclamos:', error);
				return of([]); // ❌ Devuelve array vacío para no romper el flujo
			})
		);
	} */
	 /** 🔸 Devuelve listado de reclamos frecuentes */
	 getReclamos(): Observable<Claim[]> {
    return this.http.get<Claim[]>(`${this.BASE_PATH}reclamos.json`).pipe(
      retry(2),
      catchError((error) => {
        console.error('❌ Error al cargar reclamos:', error);
        return of([]);
      })
    );
  }
	 
	/** 🔹 Generador UUID para reclamos */
  generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
	
}
