import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { ExecuteRequest, ExtendedUtils, ExtendedWebApi, IEntityRef, IExtendedContextMode, ILookupOptions } from './types';
import { ILookupProps, ExtendPaging } from './types';
import { LookupItem } from './LookupItem';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { Icon } from '@fluentui/react/lib/Icon';
initializeIcons();

export const Lookup = (props: ILookupProps) => {
    const [lookups, setLookups] = useState(props.lookUpRecords);
    const [iconSearchHovered, setIconSearchHovered] = useState<boolean>(false);
    const paging = useRef<ExtendPaging>(props.context.parameters.items.paging as ExtendPaging);


    useEffect(() => {
        setLookups(props.lookUpRecords);
        const propsPaging = (props.context.parameters.items.paging as ExtendPaging);
        paging.current = propsPaging;
    }, [props])

    const OpenLookupSearch = async (): Promise<void> => {
        const utils = props.context.utils as ExtendedUtils;

        const descriptorParams = utils._customControlProperties?.descriptor?.Parameters;

        const relationshipName = descriptorParams?.["RelationshipName"];
        let entityToOpen = descriptorParams?.["TargetEntityType"];

        if (!entityToOpen) {
            entityToOpen = props.context.parameters.items.getTargetEntityType();
        }

        const lookupOptions: ILookupOptions = {
            defaultEntityType: entityToOpen,
            entityTypes: [entityToOpen],
            allowMultiSelect: true,
            disableMru: true
        };

        try {
            const selectedRecords = await props.context.utils.lookupObjects(lookupOptions);

            if (!selectedRecords || selectedRecords.length === 0) return;

            const relatedEntities = selectedRecords.map(rec => ({
                id: rec.id.replace("{", "").replace("}", ""),
                entityType: rec.entityType
            }));

            const associateRequest: ExecuteRequest = {
                getMetadata: () => ({
                    boundParameter: null,
                    parameterTypes: {},
                    operationType: 2,
                    operationName: "Associate"
                }),
                target: {
                    entityType: (props.context.mode as IExtendedContextMode).contextInfo?.entityTypeName,
                    id: (props.context.mode as IExtendedContextMode).contextInfo?.entityId
                },
                relatedEntities: relatedEntities,
                relationship: relationshipName ?? "",
            };

            const webApi = props.context.webAPI as ExtendedWebApi;

            if (webApi.execute) {
                await webApi.execute(associateRequest);
                props.context.parameters.items.refresh();
            }
        } catch (error: unknown) {
            console.error("Lookup or associate operation failed:", error);
        }
    };

    return (
        <div style={{ position: 'relative', margin: '2px', boxSizing: 'border-box' }}>
            <div style={{
                position: 'absolute',
                top: '4px',
                right: '18px',
                zIndex: 1,
                fontSize: '14px',
                fontWeight: 400,
                cursor: 'pointer'
            }}
                onMouseEnter={() => setIconSearchHovered(true)}
                onMouseLeave={() => setIconSearchHovered(false)}
            >
                <Icon
                    style={{
                        color: iconSearchHovered ? 'rgb(17, 94, 163)' : 'rgb(97, 97, 97)'
                    }}
                    iconName='Search'
                    onClick={() => {
                        OpenLookupSearch();
                    }}
                />
            </div>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                borderRadius: "4px",
                backgroundColor: '#f3f3f3',
                gap: "2px",
                height: "auto",
                minHeight: '30px',
                maxHeight: "70px",
                width: "100%",
                overflowY: 'auto',
                padding: "4px",
                paddingRight: "20px",
                alignItems: "flex-starts",
                boxSizing: 'border-box'
            }}>
                {lookups.map((lookup: IEntityRef) => {
                    return (
                        <LookupItem
                            key={lookup.id}
                            context={props.context}
                            record={lookup}
                            entityImageURL={""}
                        />
                    )
                }

                )}
            </div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '4px',
                gap: '4px',
                fontSize: '14px',
                color: '#333',
                paddingLeft: '4px',
                paddingRight: '4px'
            }}>
                <div>
                    <span style={{ minWidth: '80px', textAlign: 'center' }}>
                        Rows: {paging.current.totalResultCount}
                    </span>
                </div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '2px',
                        fontSize: '14px',
                        color: '#333'
                    }}
                >
                    <Icon
                        iconName='Back'
                        style={{ cursor: paging.current.hasPreviousPage ? 'pointer' : 'not-allowed', opacity: paging.current.hasPreviousPage ? 1 : 0.4 }}
                        onClick={() => {
                            if (paging.current.hasPreviousPage) {
                                paging.current.loadExactPage(paging.current.pageNumber - 1);
                            }
                        }}
                    />
                    <span style={{ minWidth: '80px', textAlign: 'center' }}>
                        Page {paging.current.pageNumber}
                    </span>
                    <Icon
                        iconName='Forward'
                        style={{ cursor: paging.current.hasNextPage ? 'pointer' : 'not-allowed', opacity: paging.current.hasNextPage ? 1 : 0.4 }}
                        onClick={() => {
                            if (paging.current.hasNextPage) {
                                paging.current.loadExactPage(paging.current.pageNumber + 1);
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}