define(function () {
    // summary:
    //      A dojo loader plugin for loading .json files and returning objects
    //      instead of text like dojo/text.
    return {
        load: function (id, require, callback) {
            // id: String
            //      module id
            // require: Function
            //      AMD require; usually a context-sensitive require bound to the 
            //      module making the plugin request
            // callback: Function
            //      Callback function which will be called, when the loading is finished
            require(['dojo/text!' + id], function (txt) {
                callback(JSON.parse(txt));
            });
        }
    };
});