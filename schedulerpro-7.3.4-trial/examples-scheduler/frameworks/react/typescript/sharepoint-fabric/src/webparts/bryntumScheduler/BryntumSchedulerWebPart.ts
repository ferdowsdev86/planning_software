import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
    IPropertyPaneConfiguration,
    PropertyPaneTextField,
    PropertyPaneDropdown,
    PropertyPaneButton,
    IPropertyPaneDropdownOption
} from '@microsoft/sp-property-pane';
import { PropertyFieldDateTimePicker, DateConvention, IDateTimeFieldValue } from '@pnp/spfx-property-controls/lib/PropertyFieldDateTimePicker';

import { PropertyFieldNumber } from '@pnp/spfx-property-controls/lib/PropertyFieldNumber';

import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import { getSP } from './pnpjsConfig';

import * as strings from 'BryntumSchedulerWebPartStrings';
import App from './components/App';

import DataService from './data/DataService';
import BaseService from './data/service/BaseService';

// Allow using multiple self-contained Bryntum components on the same page
(globalThis.bryntum ??= {}).silenceBundleException = true;

export interface IBryntumSchedulerWebPartProps {
    description: string // Description set in the header and used for tasklist creation
    listId: string // The list guid
    disableCreateTaskList: boolean // Set to false to disable tasklist creation
    startDate: IDateTimeFieldValue // Start date of the timespan
    range: number // Number of months from startdate
}

export default class BryntumSchedulerWebPart extends BaseClientSideWebPart <IBryntumSchedulerWebPartProps> {

    private taskLists: IPropertyPaneDropdownOption[] = [];
    private service: BaseService;

    public render(): void {
        const element = React.createElement(
            App,
            {
                title       : this.context.pageContext.web.title,
                service     : this.service,
                description : this.properties.description,
                listId      : this.properties.listId,
                startDate   : this.properties.startDate?.value ?? new Date(),
                range       : this.properties.range
            }
        );
        ReactDom.render(element, this.domElement);
    }

    protected async onInit(): Promise<void> {
        await super.onInit();

        // Get the Service, Mock or Remote SPService
        this.service = DataService.getService(this.context);

        // When running on the SharePoint tenant
        getSP(this.context);

        this.properties.disableCreateTaskList = false;

        // Get all available TaskLists and trigger load
        this.loadTaskLists().catch(err => alert(err.message));
    }

    /**
     * Get available tasklists. Sets the retrieved items in the dropdown box in the PropertyPane.
     * On callback the default or saved listId will be loaded.
     */
    private async loadTaskLists(): Promise<void> {
        // Sets the retrieved items on the PropertyPaneDropDown automatically setting attached `listId` which will cause the default(set) list load
        this.taskLists = await this.service.getTaskLists();
    }

    /**
     * Create a demolist or ensure it exists on the SharePoint tenant.
     * On callback the newly created list is loaded by setting `listId` after refreshing the available tasklists.
     */
    private async ensureTaskList() {
        this.properties.disableCreateTaskList = true;

        const guid = await this.service.ensureList(this.properties.description + 'DemoData');

        await this.loadTaskLists();

        this.properties.disableCreateTaskList = false;
        this.properties.listId = guid;
        this.service.listId = guid;
        this.context.propertyPane.refresh();

        return true;
    }

    protected onDispose(): void {
        ReactDom.unmountComponentAtNode(this.domElement);
    }

    protected get dataVersion(): Version {
        return Version.parse('1.0');
    }

    /**
     * The PropertyPane with items for the WebPart configuration.
     * - Description field
     * - StartDate Picker field
     * - Timespan Range field (the length of the timespan in months)
     * - Dropdown field containing all available tasklists with `Bryntum demo` mentioned in the description
     * - Create button for a new demo tasklist. The name of the list is set in the PropertyPane Description field.
     */
    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
        return {
            pages : [
                {
                    header : {
                        description : strings.PropertyPaneDescription
                    },
                    groups : [
                        {
                            groupName   : strings.BasicGroupName,
                            groupFields : [
                                PropertyPaneTextField('description', {
                                    label : strings.DescriptionFieldLabel
                                }),
                                PropertyFieldDateTimePicker('startDate', {
                                    label                  : strings.StartDateFieldLabel,
                                    initialDate            : { value : new Date(), displayValue : new Date().toISOString() },
                                    dateConvention         : DateConvention.Date,
                                    onPropertyChange       : this.onPropertyPaneFieldChanged,
                                    properties             : this.properties,
                                    onGetErrorMessage      : null,
                                    deferredValidationTime : 0,
                                    key                    : 'startDateFieldId',
                                    showLabels             : false
                                }),
                                PropertyFieldNumber('range', {
                                    key         : 'numberValue',
                                    label       : strings.RangeFieldLabel,
                                    description : strings.RangeFieldDescription,
                                    value       : this.properties.range,
                                    maxValue    : 10,
                                    minValue    : 1,
                                    disabled    : false
                                }),
                                PropertyPaneDropdown('listId', {
                                    label       : strings.TaskListDropdownLabel,
                                    options     : this.taskLists,
                                    selectedKey : this.properties.listId
                                }),
                                PropertyPaneButton('createTaskList', {
                                    text     : strings.TaskListButtonCreateLabel + this.properties.description + 'Demo',
                                    onClick  : this.ensureTaskList.bind(this),
                                    disabled : this.properties.disableCreateTaskList
                                })
                            ]
                        }
                    ]
                }
            ]
        };
    }
}
