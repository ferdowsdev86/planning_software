import { ResourceModel } from '../../../build/thin/schedulerpro.module.thin.js';

// Create our own model representing a resource, a Lab in this demo
export default class Lab extends ResourceModel {

    static fields = [
        // Redefine rowHeight field and add a defaultValue
        { name : 'rowHeight', defaultValue : 70 },
        // A new field storing the expanded tow height
        { name : 'expandedRowHeight', defaultValue : 180 },
        // Add a few new fields unique to this demo
        { name : 'maxCapacity', defaultValue : 100 }, 'rowExpanded', 'showCapacityLine'
    ];

    toggleExpanded(value) {
        this.rowExpanded = value != null ? value : !this.rowExpanded;
    }

    get rowHeight() {
        return this.rowExpanded ? this.expandedRowHeight : super.rowHeight;
    }

    set rowHeight(value) {
        super.rowHeight = value;
    }

    get resourceMargin() {
        // This only matters if the demo is reconfigured with allowOverlap : true.
        // With overlap on, keep event band spacing stable and put extra expanded height below events for the chart.
        const
            baseMargin  = 15,
            extraHeight = this.rowExpanded ? this.expandedRowHeight - super.rowHeight : 0;

        return {
            start : baseMargin,
            end   : baseMargin + extraHeight
        };
    }

    get cls() {
        return (super.cls || '') + ' ' + (this.rowExpanded ? 'b-row-expanded' : '');
    }

    set cls(value) {
        super.cls = value;
    }

    // Generate some dummy data
    getUtilizationData(dateIntervals) {
        if (dateIntervals.length !== this.utilizationData?.length) {
            this.utilizationData = dateIntervals.map(tick => 100 + (Math.round(Math.random() * 3) * 100));
        }
        return this.utilizationData;
    }
}
