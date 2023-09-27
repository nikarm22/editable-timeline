import { FC, useMemo, useState, useCallback, useRef, useEffect } from "react";
import moment from "moment";

import Timeline from "react-calendar-timeline";

import generateMockData from "../utils/generate-mock-data";

import "./EditableTimeline.css";
import { EditProvider, useEdit } from "./EditContext";
import { CustomItem } from "./CustomItem";
import { createItem } from "../utils/create-new-item";
import { last } from "../utils/last";

const keys = {
  groupIdKey: "id",
  groupTitleKey: "title",
  groupRightTitleKey: "rightTitle",
  itemIdKey: "id",
  itemTitleKey: "title",
  itemDivTitleKey: "title",
  itemGroupKey: "group",
  itemTimeStartKey: "start",
  itemTimeEndKey: "end",
  groupLabelKey: "title"
};

const EditableTimelineUnwrapped: FC = () => {
    const data = useMemo(generateMockData, []);
    const startTime = useMemo(() => moment().startOf("day").toDate(), []);
    const endTime = useMemo(() => moment().startOf("day").add(1, "day").toDate(), []);
    const groups = data.groups;

    const { currentEditId, setCurrentEditId } = useEdit();
    const [key, setKey] = useState(0);
    const timelineRef = useRef<any>(null);

    // Force re-render of the timeline component
    const forceUpdate = useCallback(async () => {
        const prevSelectedItem = timelineRef.current?.state.selectedItem;
        setKey(prev => prev + 1);
        await Promise.resolve();
        timelineRef.current?.selectItem(prevSelectedItem);
    }, []);

    const [items, setItems] = useState(data.items);

    // Handlers
    const moveItem = useCallback((itemId: string, dragTime: number, newGroupId: number) => {
        const group = groups[newGroupId];

        setItems(prev => prev.map(item =>
            item.id === itemId
                ? {
                    ...item,
                    start_time: dragTime,
                    end_time: dragTime + (item.end - item.start),
                    start: dragTime,
                    end: dragTime + (item.end - item.start),
                    group: group.id,
                } : item
        ));
    }, [groups]);

    const resizeItem = useCallback((itemId: string, time: number, edge: "left" | "right") => {
        setItems(prev => prev.map(item =>
            item.id === itemId
                ? {
                    ...item,
                    start_time: edge === "left" ? time : item.start,
                    end_time: edge === "left" ? item.end : time,
                    start: edge === "left" ? time : item.start,
                    end: edge === "left" ? item.end : time,
                } : item
        ));
    }, []);

    const deleteItem = useCallback((itemId: string) => {
        if (!confirm("Are you sure you want to delete selected item?")) return;
        setItems(prev => prev.filter(v => v.id !== itemId));
    }, []);

    const changeItem = useCallback((itemId: string, newValue) => {
        setItems(prev => prev.map(item => item.id === itemId ? { ...item, title: newValue } : item));
        forceUpdate();
    }, []);

    const createNewItem = useCallback(async (groupId, time) => {
        setItems(prev => {
            const newId = prev.reduce((maxId, item) => Math.max(maxId, Number(item.id)), 0) + 1;
            return [...prev, createItem(String(newId), groupId, time)];
        });
        await Promise.resolve();
        const items = timelineRef.current?.state.items as { id: string }[];
        const newItemId = last(items)?.id;
        timelineRef.current?.selectItem(newItemId);
        setCurrentEditId(newItemId);
    }, []);

    useEffect(() => {
        const handleHotKeys = (event: KeyboardEvent) => {
            const selectedItem = timelineRef.current?.state.selectedItem;
            if (!selectedItem) return;
            if (event.key === "Delete") {
                deleteItem(selectedItem);
            } else if (event.key === "Enter") {
                setCurrentEditId(selectedItem);
            }
        };

        document.addEventListener("keydown", handleHotKeys);
        return () => document.removeEventListener("keydown", handleHotKeys);
    }, []);

    return (
        <Timeline
            ref={timelineRef}
            key={key}
            groups={groups}
            items={items}
            keys={keys}
            itemTouchSendsClick={false}
            stackItems
            itemHeightRatio={0.75}
            canMove={currentEditId === null}
            canResize={"both"}
            defaultTimeStart={startTime}
            defaultTimeEnd={endTime}
            onItemMove={moveItem}
            onItemResize={resizeItem}
            onItemDoubleClick={(itemId) => setCurrentEditId(itemId)}
            onCanvasDoubleClick={createNewItem}
            useResizeHandle
            itemRenderer={
                ({
                    item,
                    itemContext,
                    getItemProps,
                    getResizeProps
                }) => {
                const { left, right } = getResizeProps();
                const itemProps = getItemProps(item.itemProps);
                return (
                    <CustomItem
                        item={item}
                        itemContext={itemContext}
                        itemProps={itemProps}
                        leftResizeProps={left}
                        rightResizeProps={right}
                        onDelete={deleteItem}
                        onChange={changeItem}
                    />
                )}
            
            }
        />
    );
};

export const EditableTimeline = () => (
    <EditProvider><EditableTimelineUnwrapped /></EditProvider>
);
