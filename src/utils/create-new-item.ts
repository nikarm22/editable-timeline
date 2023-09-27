export const createItem = (id = "0", group = "0", time = Date.now(), duration = 2 * 60 * 60 * 1000) => ({
    id,
    group,
    title: "",
    start_time: time,
    end_time: time + duration,
    start: time,
    end: time + duration,
    className: "",
    itemProps: {},
});