/**
 * Application component
 */
import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { EventEditorComponent } from './event-editor/event-editor.component';
import { BryntumSchedulerComponent } from '@bryntum/schedulerpro-angular';
import { Scheduler, StringHelper } from '@bryntum/schedulerpro';
import { schedulerProps } from './app.config';

@Component({
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.None
})

export class AppComponent implements AfterViewInit {
    schedulerProps = schedulerProps;

    @ViewChild(BryntumSchedulerComponent, { static : false }) schedulerComponent!: BryntumSchedulerComponent;
    private scheduler!: Scheduler;

    constructor(public editor: MatDialog) { }

    beforeEventEdit(event: any): boolean {
        const
            { eventRecord, resourceRecord, eventEdit } = event,
            editorConfig = new MatDialogConfig();

        Object.assign(editorConfig, {
            disableClose : false,
            autoFocus    : true,
            width        : '500px',
            data         : {
                eventRecord,
                resourceRecord,
                eventStore : eventEdit.eventStore
            }
        });

        this.editor.open(EventEditorComponent, editorConfig);

        // suppress default event editor
        return false;
    }

    ngAfterViewInit(): void {
        // Store Scheduler instance
        this.scheduler = this.schedulerComponent.instance;
        // install beforeEventEdit listener
        this.scheduler.on('beforeEventEdit', this.beforeEventEdit.bind(this));
    }

    /**
     * Custom event renderer for the scheduler
     */
    eventRenderer = ({ eventRecord }: { eventRecord: any }): string => {
        return `
            <div class="info">
                <div class="name">${StringHelper.encodeHtml(eventRecord.name)}</div>
                <div class="desc">${StringHelper.encodeHtml(eventRecord.desc)}</div>
            </div>
        `;
    };

}
