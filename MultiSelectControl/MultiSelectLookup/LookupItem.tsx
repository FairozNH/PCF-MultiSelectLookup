import * as React from 'react';
import { useState, useEffect } from 'react';
import { IEntityRef, ILookupItemProps, ExtendedUtils, ExecuteRequest, ExtendedWebApi, IExtendedContextMode, ExtendPaging } from './types';
import { Icon } from '@fluentui/react/lib/Icon';
import { Spinner, SpinnerSize } from '@fluentui/react';
import { lookupIcon } from './Icons';

export const LookupItem: React.FC<ILookupItemProps> = (props) => {
    const [hovered, setHovered] = useState(false);
    const [removing, setRemoving] = useState(false);

    const OpenLookupRecord = async (lookupRef: IEntityRef) => {
        try {
            const pageInput = {};

            const navigationOptions: ComponentFramework.NavigationApi.EntityFormOptions = {
                entityName: lookupRef.entityType,
                entityId: lookupRef.id,
                width: 80,
                height: 70,
                windowPosition: 1
            };

            await props.context.navigation.openForm(navigationOptions, pageInput);
        } catch (error) {
            console.error("Failed to open contact record:", error);
        }
    }

    const RemoveItemFromGrid = async (removingRecord: IEntityRef) => {
        setRemoving(true);
        // Get relationship and target entity type from extended utils
        const utils = props.context.utils as ExtendedUtils;
        const descriptorParams = utils._customControlProperties?.descriptor?.Parameters;

        const relationshipName = descriptorParams?.["RelationshipName"];
        let entityToOpen = descriptorParams?.["TargetEntityType"];

        // Fallback to target entity type from records property
        if (!entityToOpen) {
            entityToOpen = props.context.parameters.items.getTargetEntityType();
        }

        // Construct the disassociate request
        const disassociateRequest: ExecuteRequest = {
            getMetadata: () => ({
                boundParameter: null,
                parameterTypes: {},
                operationType: 2,
                operationName: "Disassociate"
            }),
            relationship: relationshipName ?? "",
            target: {
                entityType: (props.context.mode as IExtendedContextMode).contextInfo?.entityTypeName,
                id: (props.context.mode as IExtendedContextMode).contextInfo?.entityId
            },
            relatedEntityId: removingRecord.id
        };

        const webApi = props.context.webAPI as ExtendedWebApi;

        if (webApi.execute) {
            try {
                const response = await webApi.execute(disassociateRequest);
                if (response.ok) {
                    const paging = (props.context.parameters.items.paging as ExtendPaging)
                    if (!paging.hasNextPage && (paging.totalResultCount % paging.pageSize) === 1) {
                        paging.loadExactPage(paging.pageNumber - 1);
                    } else {
                        paging.loadExactPage(paging.pageNumber);
                    }
                }
            } catch (ex: unknown) {
                console.error("Error", ex);
            }
        }
    }

    return (
        <div style={{
            display: 'inline-flex',
            flexDirection: 'row',
            borderRadius: '4px',
            backgroundColor: removing ? 'rgb(255, 255, 255)' : hovered ? 'rgb(189, 219, 253)' : 'rgb(235, 243, 252)',
            width: 'fit-content',
            maxWidth: "200px",
            alignItems: 'center',
            color: 'rgb(17, 94, 163)',
            height: '24px',
            boxShadow: hovered
                ? '0 4px 6px rgba(0, 0, 0, 0.1)'
                : '0 2px 4px rgba(0, 0, 0, 0.05)',
            transition: 'background-color 50ms ease, box-shadow 0.3s ease',
            cursor: 'pointer',
            userSelect: 'none',
            boxSizing: 'border-box'
        }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                flexGrow: 1,
                overflow: 'hidden',
                marginLeft: '2px',
                marginRight: '2px'
            }}>
                {lookupIcon}
                <span
                    style={{
                        display: 'block',
                        minWidth: 0,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        marginLeft: '4px',
                        marginRight: '6px',
                        textDecoration: 'underline',
                        flexShrink: 1,
                        fontWeight: 400,
                        fontSize: '14px',
                        cursor: 'pointer'
                    }}

                    onClick={() => {
                        OpenLookupRecord(props.record)
                    }}
                >{props.record.name}</span>
            </div>
            <div
                style={{
                    marginRight: '4px'
                }}
            >
                {
                    removing ? (
                        <Spinner size={SpinnerSize.xSmall} />
                    ) : (
                        <Icon
                            style={{
                                fontSize: '10px',
                                fontWeight: 'bold',
                            }}
                            iconName='Cancel'
                            onClick={() => {
                                RemoveItemFromGrid(props.record)
                            }}
                        />
                    )
                }
            </div>
        </div>
    );
}