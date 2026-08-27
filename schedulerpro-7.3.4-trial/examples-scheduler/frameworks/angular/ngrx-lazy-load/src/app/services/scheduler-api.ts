import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { EventData, ResourceData } from '../store/scheduler.actions';

// Shape returned by resource/read.php. `total` lets the store size the scrollbar.
export interface ResourceResponse {
    success : boolean;
    data    : ResourceData[];
    total   : number;
}

// Shape returned by event/read.php (no total — events are bounded by the date range).
export interface EventResponse {
    success : boolean;
    data    : EventData[];
}

// Thin HttpClient wrapper around the two read endpoints. The NgRx effects call these; the
// rest of the app never touches HTTP directly.
@Injectable({ providedIn : 'root' })
export class SchedulerApiService {
    // Relative URL so the demo works wherever it is hosted. In `ng serve` a proxy forwards
    // `/php` to Apache (see proxy.conf.json); a PHP-capable server resolves `./php/` directly.
    private readonly baseUrl = './php/';

    constructor(private http : HttpClient) {}

    // GET resource/read.php?startIndex&count → a page of generated resources.
    getResources(startIndex : number, count : number) : Observable<ResourceResponse> {
        return this.http.get<ResourceResponse>(`${this.baseUrl}resource/read.php`, {
            params : { startIndex, count }
        });
    }

    // GET event/read.php?startIndex&count&startDate&endDate → events generated for the
    // visible resource window within the requested date range.
    getEvents(startIndex : number, count : number, startDate : string, endDate : string) : Observable<EventResponse> {
        return this.http.get<EventResponse>(`${this.baseUrl}event/read.php`, {
            params : { startIndex, count, startDate, endDate }
        });
    }
}
