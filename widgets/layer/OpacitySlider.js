define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-style',
    'dojo/text!agrc/widgets/layer/templates/OpacitySlider.html',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dijit/form/HorizontalSlider'
], function (
    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domStyle,
    template,
    declare,
    lang
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //        Dynamically controls the opacity of the passed in layer with a slider bar.
        // example:
        // |    var widget = new agrc.widgets.layer.OpacitySlider({mapServiceLayer: lyr}, 'test-div');

        baseClass: 'opacity-slider',
        widgetsInTemplate: true,
        templateString: template,

        // Parameters to constructor

        // mapServiceLayer: esri/layer
        //        Reference to the esri.layer that you want the slider to be connected to
        mapServiceLayer: null,

        // displayLegend: Boolean
        //        Controls whether the legend div is displayed or not.
        displayLegend: false,

        postCreate: function () {
            // summary:
            //        Overrides method of same name in dijit._Widget.
            console.log('agrc.widgets.layer.OpacitySlider:postCreate', arguments);

            if (this.displayLegend) {
                domStyle.set(this.legend, 'display', 'block');
            }

            // set slider value to layer opacity value
            this.slider.set('value', this.mapServiceLayer.opacity);

            this._updateLegendOpacity();

            this._wireEvents();

            this.inherited(arguments);
        },

        _wireEvents: function () {
            // summary:
            //        Wire events.
            console.log('agrc.widgets.layer.OpacitySlider:_wireEvents', arguments);

            this.slider.on('change', lang.hitch(this, '_onSliderChange'));
        },

        _onSliderChange: function (newValue) {
            // summary:
            //        Handles when the slider's value is changed.
            //        Update the map service opacity and legend opacity
    //        console.log(this.declaredClass + '::' + arguments.callee.nom, arguments);

            this.mapServiceLayer.setOpacity(newValue, true);

            this._updateLegendOpacity();
        },

        _updateLegendOpacity: function () {
            // summary:
            //        Updates the legend box opacity to match the mapServiceLayer's opacity
    //        console.log(this.declaredClass + '::' + arguments.callee.nom, arguments);

            domStyle.set(this.legend, 'opacity', this.mapServiceLayer.opacity);
        }
    });
});
