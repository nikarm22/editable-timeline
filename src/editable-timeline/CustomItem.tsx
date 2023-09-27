import { FC, useCallback, useState } from "react";

import editIcon from "../assets/edit.svg";
import deleteIcon from "../assets/delete.svg";
import saveIcon from "../assets/save.svg";
import discardIcon from "../assets/discard.svg";
import { useEdit } from "./EditContext";

interface ItemProps {
    key: number | string;
    ref: React.Ref<any>;
    className: string;
    onMouseDown: React.MouseEventHandler;
    onMouseUp: React.MouseEventHandler;
    onTouchStart: React.TouchEventHandler;
    onTouchEnd: React.TouchEventHandler;
    onDoubleClick: React.MouseEventHandler;
    onContextMenu: React.ReactEventHandler;
    style: React.CSSProperties;
}

interface ResizeProps {
    ref: React.Ref<any>;
    className: string;
    style: React.CSSProperties;
}

interface CustomItemProps {
    itemProps: ItemProps;
    item: any;
    itemContext: any;
    leftResizeProps?: ResizeProps;
    rightResizeProps?: ResizeProps;
    onDelete: (itemId: string) => void;
    onChange: (itemId: string, value: string) => void;
}

export const CustomItem: FC<CustomItemProps> = ({ item, itemContext, onDelete, onChange, itemProps, leftResizeProps, rightResizeProps }) => {
    const { currentEditId, setCurrentEditId } = useEdit();
    const isEditMode = currentEditId === item.id;
    const [value, setValue] = useState(item.title);

    const closeEdit = useCallback(() => {
        setCurrentEditId(null);
    }, [setCurrentEditId]);

    const saveItem = useCallback(() => {
        onChange(item.id, value);
        setCurrentEditId(null);
    }, [onChange, item.id, value, setCurrentEditId]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === "Enter") {
            saveItem();
        } else if (e.key === "Escape") {
            closeEdit();
        }
    }, [onChange, setCurrentEditId, value, item.id]);

    return (
        <div {...itemProps} className={`${itemProps?.className} et-item-wrapper ${itemContext.selected ? "et-selected" : ""}`}>
            {itemContext.useResizeHandle && itemContext.selected ? <div {...leftResizeProps} className={`${leftResizeProps?.className} et-left-handle`} /> : ''}
    
            {
            !isEditMode ?
            (
                <div
                className="rct-item-content et-item-content"
                style={{ maxHeight: `${itemContext.dimensions.height}` }}
                >
                    {itemContext.title}
                </div>
            ) : (
                <input
                    value={value}
                    className="et-item-edit"
                    autoFocus
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={saveItem}
                    onKeyDown={handleKeyDown}
                />
            )
            }
    
            {itemContext.useResizeHandle && itemContext.selected ? <div {...rightResizeProps} className={`${leftResizeProps?.className} et-right-handle`} /> : ''}
            {itemContext.selected && (
                <div className="et-item-actions">
                    {
                        isEditMode ? (
                            <>
                                <button className="et-item-action edit" onClick={saveItem}>
                                    <img src={saveIcon} alt="Save Item" title="Save" />
                                </button>
                                <button className="et-item-action delete" onClick={closeEdit}>
                                    <img src={discardIcon} alt="Discard Item" title="Discard" />
                                </button>
                            </>
                            ) : (
                            <>
                                <button className="et-item-action edit" onClick={() => setCurrentEditId(item.id)}>
                                    <img src={editIcon} alt="Edit Item" title="Edit item" />
                                </button>
                                <button className="et-item-action delete" onClick={() => onDelete(item.id)}>
                                    <img src={deleteIcon} alt="Delete Item" title="Delete item" />
                                </button>
                            </>
                        )
                    }
                </div>
            )}
        </div>
    );
};
