/*global profile:true*/
profile = (function() {
    var testResourceRe = /.*\/tests\//;
    var copyOnly = function(filename, mid) {
        var list = {
            "agrc/agrc.profile": true,
            "agrc/package.json": true
        };
        return (mid in list) ||
            (/^resources\//.test(mid) && !/\.css$/.test(filename)) ||
            /(png|jpg|jpeg|gif|tiff)$/.test(filename);
        // Check if it is one of the special files, if it is in
        // resource (but not CSS) or is an image
    };
    var ignores = {
        "agrc/Gruntfile": true
    };
    var nonAMDs = {
        // for some reason this breaks the build if it's
        // tagged as AMD
        "agrc/resources/libs/spin": true
    };

    return {
        resourceTags: {
            test: function(filename, mid) {
                return testResourceRe.test(mid);
            },
            copyOnly: function(filename, mid) {
                return copyOnly(filename, mid);
            },
            amd: function(filename, mid) {
                return (/\.js$/).test(filename) && !(mid in nonAMDs);
            },
            ignore: function(filename, mid) {
                return mid in ignores || /.*\/node_modules\//.test(mid);
            }
        }
    };
})();