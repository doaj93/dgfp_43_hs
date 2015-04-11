var Attribute = {
    createNew: function(_name, _value, _modified) {
        var attribute = {};
        attribute.name = _name;
        attribute.value = (typeof (_value) === "string" ? _value.replace(/&/g, "&amp;").replace(/</g, "&lt;") : _value);
        if (typeof (_modified) === "undefined") {
            attribute.modified = false;
        } else {
            attribute.modified = _modified;
        }

        attribute.setModified = function(_modified) {
            attribute.modified = _modified;
        };
        
        attribute.getModified = function() {
            return attribute.modified;
        };
        
        attribute.setName = function(_name) {
            attribute.name = _name;
        };
        
        attribute.setValue = function(_value) {
            attribute.value = (typeof (_value) === "string" ? _value.replace(/&/g, "&amp;").replace(/</g, "&lt;") : _value);
        };
        
        attribute.getName = function() {
            return attribute.name;
        };
        
        attribute.getValue = function() {
            return attribute.value;
        };
  
        return attribute;
    }
};