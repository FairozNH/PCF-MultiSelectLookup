import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { createRoot, Root } from 'react-dom/client';
import * as React from 'react';
import { Lookup } from './Lookup';
import { IEntityRef, ExtendedEntityRecord, ILookupProps, ExtendPaging } from "./types";
type DataSet = ComponentFramework.PropertyTypes.DataSet;
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;

export class MultiSelectLookup implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _root: Root;
    private _container: HTMLDivElement;

    /**
     * Empty constructor.
     */
    constructor() {
        // Empty
    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this._container = container;
    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        const gridParams = context.parameters.items;

        const lookupRecords: IEntityRef[] = [];
        const records: Record<string, DataSetInterfaces.EntityRecord> = gridParams.records;
        for (const key in records) {
            const record: ExtendedEntityRecord = records[key] as ExtendedEntityRecord;
            lookupRecords.push({
                id: record._entityReference._id,
                entityType: record._entityReference._etn,
                name: record._entityReference._name
            })
        }

        const props: ILookupProps = {
            context: context,
            lookUpRecords: lookupRecords
        }

        if (!this._root) {
            this._root = createRoot(this._container);
        }

        this._root.render(React.createElement(Lookup, props))
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs {
        return {};
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        this._root.unmount();
    }
}
