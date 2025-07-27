export var Flags;
(function (Flags) {
    Flags[Flags["NoFlags"] = 0] = "NoFlags";
    Flags[Flags["Placement"] = 2] = "Placement";
    Flags[Flags["Update"] = 4] = "Update";
    Flags[Flags["Deletion"] = 8] = "Deletion";
    Flags[Flags["Passive"] = 128] = "Passive";
    Flags[Flags["Layout"] = 256] = "Layout";
})(Flags || (Flags = {}));
