import { IInputs } from "./generated/ManifestTypes";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
import LookupOptions = ComponentFramework.UtilityApi.LookupOptions;

export interface ILookupProps {
    context: ComponentFramework.Context<IInputs>;
    lookUpRecords: IEntityRef[]
}

interface targetType {
    entityType: string;
    id: string;
}
export interface ExecuteRequest {
    getMetadata: () => object;
    relationship: string;
    target: targetType;
    relatedEntityId?: string;
    relatedEntities?: targetType[]
}


export interface IExtendedContextMode extends ComponentFramework.Mode {
    contextInfo: {
        entityId: string;
        entityRecordName: string;
        entityTypeName: string;
    }
}

export interface ExtendedWebApi extends ComponentFramework.WebApi {
    execute?: (request: ExecuteRequest) => Promise<Response>;
}

export interface ExtendedUtils extends ComponentFramework.Utility {
    _customControlProperties?: {
        descriptor?: {
            Parameters?: Record<string, string>;
        };
    };
}

export interface ILookupOptions extends LookupOptions {
    disableMru?: boolean,
    filters?: [{ filterXml: string, entityLogicalName: string }]
}

export interface IEntityRef {
    id: string,
    entityType: string,
    name: string
}

export interface ILookupItemProps {
    context: ComponentFramework.Context<IInputs>;
    record: IEntityRef,
    entityImageURL: string
}

export interface ExtendedEntityRecord extends DataSetInterfaces.EntityRecord {
    _entityReference: {
        _etn: string;
        _id: string;
        _name: string;
    }
}

export interface ExtendPaging extends ComponentFramework.PropertyHelper.DataSetApi.Paging {
    pageNumber: number
}
