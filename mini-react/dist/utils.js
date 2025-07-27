import { WorkTag } from "./workTags";
function isPrimitive(o) {
    const to = typeof o;
    return (to === "string" ||
        to === "number" ||
        to === "bigint" ||
        to === "boolean" ||
        to === "undefined" ||
        o === null);
}
function isClassComponent(type) {
    if (type.prototype &&
        type.prototype.__COMPONENT_MARKER_DO_NOT_MODIFY_OR_YOU_WILL_BE_FIRED ===
            true) {
        return true;
    }
    return false;
}
function getHostParentFiber(fiber) {
    let parent = fiber.return;
    while (parent !== null) {
        if (parent.tag === WorkTag.HostComponent ||
            parent.tag === WorkTag.HostText) {
            return parent;
        }
        parent = parent.return;
    }
    return null;
}
function defaultDiff(oldProps, newProps) {
    const changes = {
        modifications: {},
        additions: {},
        deletions: [],
    };
    for (const k in newProps) {
        const v = newProps[k];
        const ov = oldProps[k];
        if (typeof ov === "undefined") {
            changes.additions[k] = v;
        }
        else {
            if (v !== ov) {
                changes.modifications[k] = v;
            }
        }
    }
    for (const ok in oldProps) {
        if (typeof changes.additions[ok] === "undefined" &&
            typeof changes.modifications[ok] === "undefined" &&
            typeof newProps[ok] === "undefined") {
            changes.deletions.push(ok);
        }
    }
    return changes;
}
export { defaultDiff, isClassComponent, isPrimitive, getHostParentFiber };
