window.dojoConfig = {
    packages: [{
        name: 'agrc',
        location: 'http://localhost:8000/'
    },{
        name: 'stubmodule',
        location: 'http://localhost:8000/widgets/tests/stubmodule'
    }],
    has: {'dojo-undef-api': true}
};