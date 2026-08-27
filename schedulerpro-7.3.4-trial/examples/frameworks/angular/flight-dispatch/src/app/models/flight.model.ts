import { DateHelper, Duration, EventModel } from '@bryntum/schedulerpro';

/**
 * Custom Flight model, based on EventModel with additional fields and changed defaults
 */
export class Flight extends EventModel {
    static override $name = 'Flight';

    declare flightNumber: number;
    declare pairedFlightNumber: number;
    declare originAirportCode: string;
    declare destinationAirportCode: string;
    declare resourceId: number;
    declare startDate: Date;
    declare endDate: Date;
    declare preamble: Duration;
    declare postamble: Duration;
    declare departureTime: Date;
    declare arrivalTime: Date;
    declare warning: boolean;
    declare nonmutable: boolean;
    declare mutable: boolean;
    declare changed: boolean;
    declare maintenance: boolean;
    declare overlap: boolean;
    declare delayed: boolean;
    declare shortened: boolean;
    declare tailviolation: boolean;
    declare locked: boolean;
    declare crewfeasibility: boolean;
    declare crewlink: boolean;
    declare uncertainty: boolean;

    static override get fields() {
        return [
            { name : 'airline', type : 'string' },
            { name : 'flightNumber', defaultValue : '', type : 'string' },
            { name : 'pairedFlightNumber', type : 'string' },
            { name : 'originAirportCode', defaultValue : '', type : 'string' },
            { name : 'destinationAirportCode', defaultValue : '', type : 'string' },
            { name : 'resourceId', dataSource : 'aircraftId', type : 'number' },
            { name : 'startDate', dataSource : 'schedule.departureTime', type : 'date' },
            { name : 'endDate', dataSource : 'schedule.arrivalTime', type : 'date' },
            { name : 'preamble', dataSource : 'schedule.loading', defaultValue : '10 minutes' },
            { name : 'postamble', dataSource : 'schedule.unloading', defaultValue : '10 minutes' },
            { name : 'departureTime', dataSource : 'schedule.departureTime', type : 'date' },
            { name : 'arrivalTime', dataSource : 'schedule.arrivalTime', type : 'date' },
            { name : 'warning', type : 'string' },
            { name : 'nonmutable', type : 'boolean' },
            { name : 'mutable', type : 'boolean' },
            { name : 'changed', type : 'boolean' },
            { name : 'maintenance', type : 'boolean' },
            { name : 'maintenance', type : 'boolean' },
            { name : 'overlap', type : 'boolean' },
            { name : 'delayed', type : 'boolean' },
            { name : 'shortened', type : 'boolean' },
            { name : 'tailviolation', type : 'boolean' },
            { name : 'locked', type : 'boolean' },
            { name : 'crewfeasibility', type : 'boolean' },
            { name : 'crewlink', type : 'boolean' },
            { name : 'uncertainty', type : 'boolean' }
        ];
    }

    static override defaults = {
        durationUnit : 'h'
    };

    get linkedFlight() {
        return this.firstStore.find(record => (record as Flight).flightNumber === this.pairedFlightNumber) as Flight;
    }

    get loadingTimeMinutes(): number {
        return this.loadingTimeMinutes || 0;
    }

    get unloadingTimeMinutes(): number {
        return this.unloadingTimeMinutes || 0;
    }

    get loadingStartDate() {
        return DateHelper.add(this.startDate, -this.preamble.magnitude, this.preamble.unit);
    }

    get unloadingStartDate() {
        return DateHelper.add(this.endDate, this.postamble.magnitude, this.postamble.unit);
    }

    override iconCls = (() => {
        switch (true) {
            case Boolean(this.warning):
            case this.uncertainty:
                return 'fa fa-warning';

            case this.crewlink:
                return 'fa fa-minus';

            case this.crewfeasibility:
                return 'fa fa-person';

            case this.locked:
                return 'fa fa-lock';

            case this.maintenance:
                return 'fa fa-wrench';

            default:
                return '';
        }
    })();

    override eventColor = (() => {
        switch (true) {
            case this.nonmutable:
                return 'pink';
            case this.mutable:
                return 'indigo';
            case this.changed:
                return 'purple';
            case this.maintenance:
                return 'lime';
            case this.overlap:
                return 'violet';
            case this.delayed:
                return 'orange';
            case this.shortened:
                return 'teal';

            default:
                return '';
        }
    })();
}
