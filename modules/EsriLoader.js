define(function () {
    // summary:
    //      A dojo loader plugin for loading esri modules so that 
    //      they get ignored by the build system.
    return {
        load: function (id, require, callback) {
            // id: String
            //      esri module id
            // require: Function
            //      AMD require; usually a context-sensitive require bound to the module making the plugin request
            // callback: Function
            //      Callback function which will be called, when the loading finished.
            require([id], function (mod) {
                callback(mod);
            });
        }
    };
});