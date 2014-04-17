//>>built
define(["dojo/_base/declare","dojo/_base/lang","dojo/_base/array","dojo/_base/connect","dojo/_base/json","dojo/_base/Color","dojo/has","dojo/sniff","dojo/DeferredList","dojo/json","dojo/number","dojo/dom","dojo/dom-construct","dojo/dom-style","dijit/_Widget","dojox/gfx","dojox/gfx/matrix","dojox/html/entities","esri/kernel","esri/config","esri/request","esri/lang","esri/renderers/SimpleRenderer","esri/renderers/UniqueValueRenderer","esri/renderers/ClassBreaksRenderer","esri/renderers/ScaleDependentRenderer","esri/renderers/DotDensityRenderer","esri/symbols/SimpleMarkerSymbol","esri/symbols/PictureFillSymbol","esri/symbols/jsonUtils","esri/dijit/_EventedWidget","dojo/i18n!esri/nls/jsapi","dojo/i18n!dojo/cldr/nls/number"],
function(B,s,m,l,C,D,q,T,E,F,G,n,f,r,H,I,J,K,U,w,x,L,y,z,A,M,N,O,P,v,Q,R,S){var u=B([Q,H],{declaredClass:"esri.dijit.Legend",widgetsInTemplate:!1,layers:null,alignRight:!1,hoverLabelShowing:!1,dotDensitySwatchSize:26,dotCoverage:75,reZeros:RegExp("\\"+S.decimal+"0+$","g"),reZerosFractional:RegExp("(\\d)0*$","g"),_ieTimer:100,constructor:function(a,b){s.mixin(this,R.widgets.legend);a=a||{};a.map?b?(this.map=a.map,this.layerInfos=a.layerInfos,this._respectCurrentMapScale=!1===a.respectCurrentMapScale?
!1:!0,this.arrangement=a.arrangement===u.ALIGN_RIGHT?u.ALIGN_RIGHT:u.ALIGN_LEFT,this.arrangement===u.ALIGN_RIGHT&&(this.alignRight=!0),this.autoUpdate=!1===a.autoUpdate?!1:!0,this._surfaceItems=[]):console.error("esri.dijit.Legend: must specify a container for the legend"):console.error("esri.dijit.Legend: unable to find the 'map' property in parameters")},startup:function(){this.inherited(arguments);this._initialize();q("ie")&&(this._repaintItems=s.hitch(this,this._repaintItems),setTimeout(this._repaintItems,
this._ieTimer))},destroy:function(){this._deactivate();this._removeHoverHandlers();this.inherited(arguments)},refresh:function(a){if(this.domNode){a?(this.layerInfos=a,this.layers=[],m.forEach(this.layerInfos,function(a){this._isSupportedLayerType(a.layer)&&(a.title&&(a.layer._titleForLegend=a.title),a.layer._hideDefaultSymbol=!1===a.defaultSymbol?!0:!1,a.hideLayers?(a.layer._hideLayersInLegend=a.hideLayers,this._addSubLayersToHide(a)):a.layer._hideLayersInLegend=[],a.hoverLabel&&(a.layer._hoverLabel=
a.hoverLabel),a.hoverLabels&&(a.layer._hoverLabels=a.hoverLabels),this.layers.push(a.layer))},this)):this.useAllMapLayers&&(this.layers=this.layerInfos=null);for(a=this.domNode.children.length-1;0<=a;a--)f.destroy(this.domNode.children[a]);this._removeHoverHandlers();this.startup()}},_legendUrl:"http://utility.arcgis.com/sharing/tools/legend",_initialize:function(){this.layerInfos&&(this.layers=[],m.forEach(this.layerInfos,function(a){this._isSupportedLayerType(a.layer)&&(a.title&&(a.layer._titleForLegend=
a.title),a.layer._hideDefaultSymbol=!1===a.defaultSymbol?!0:!1,a.hideLayers?(a.layer._hideLayersInLegend=a.hideLayers,this._addSubLayersToHide(a)):a.layer._hideLayersInLegend=[],a.hoverLabel&&(a.layer._hoverLabel=a.hoverLabel),a.hoverLabels&&(a.layer._hoverLabels=a.hoverLabels),this.layers.push(a.layer))},this));this.useAllMapLayers=!1;if(!this.layers){this.useAllMapLayers=!0;this.layers=[];var a=[],b=[];m.forEach(this.map.layerIds,function(c){c=this.map.getLayer(c);var e;this._isSupportedLayerType(c)&&
(c.arcgisProps&&c.arcgisProps.title&&(c._titleForLegend=c.arcgisProps.title),this.layers.push(c));"esri.layers.KMLLayer"==c.declaredClass&&(e=c.getLayers(),m.forEach(e,function(b){a.push(b.id)},this));"esri.layers.GeoRSSLayer"==c.declaredClass&&(e=c.getFeatureLayers(),m.forEach(e,function(a){b.push(a.id)},this))},this);m.forEach(this.map.graphicsLayerIds,function(c){var e=this.map.getLayer(c);-1==m.indexOf(a,c)&&-1==m.indexOf(b,c)&&(this._isSupportedLayerType(e)&&e._params&&e._params.drawMode)&&(e.arcgisProps&&
e.arcgisProps.title&&(e._titleForLegend=e.arcgisProps.title),this.layers.push(e))},this)}this._createLegend()},_activate:function(){this._deactivate();this.autoUpdate&&(this._respectCurrentMapScale&&(this._ozeConnect=l.connect(this.map,"onZoomEnd",this,"_refreshLayers")),this.useAllMapLayers&&(this._olaConnect=l.connect(this.map,"onLayerAdd",this,"_updateAllMapLayers"),this._olrConnect=l.connect(this.map,"onLayerRemove",this,"_updateAllMapLayers"),this._olroConnect=l.connect(this.map,"onLayersReordered",
this,"_updateAllMapLayers")),m.forEach(this.layers,function(a){a.ovcConnect=l.connect(a,"onVisibilityChange",this,"_refreshLayers");a.oscConnect=l.connect(a,"onScaleRangeChange",this,"_refreshLayers");"esri.layers.ArcGISDynamicMapServiceLayer"===a.declaredClass&&a.supportsDynamicLayers&&(a.odcConnect=l.connect(a,"_onDynamicLayersChange",s.hitch(this,"_updateDynamicLayers",a)));"esri.layers.ArcGISImageServiceLayer"===a.declaredClass&&(a.oirConnect=l.connect(a,"onRenderingChange",s.partial(this._updateImageServiceLayers,
this,a)))},this))},_deactivate:function(){this._ozeConnect&&l.disconnect(this._ozeConnect);this._olaConnect&&l.disconnect(this._olaConnect);this._olroConnect&&l.disconnect(this._olroConnect);this._olrConnect&&l.disconnect(this._olrConnect);m.forEach(this.layers,function(a){a.ovcConnect&&l.disconnect(a.ovcConnect);a.oscConnect&&l.disconnect(a.oscConnect);a.odcConnect&&l.disconnect(a.odcConnect);a.oirConnect&&l.disconnect(a.oirConnect)},this)},_updateDynamicLayers:function(a){delete a.legendResponse;
this._refreshLayers()},_updateImageServiceLayers:function(a,b){delete b.legendResponse;a._refreshLayers()},_refreshLayers:function(){this.refresh()},_updateAllMapLayers:function(){this.layers=[];m.forEach(this.map.layerIds,function(a){a=this.map.getLayer(a);this._isSupportedLayerType(a)&&this.layers.push(a)},this);m.forEach(this.map.graphicsLayerIds,function(a){a=this.map.getLayer(a);this._isSupportedLayerType(a)&&(a._params&&a._params.drawMode)&&this.layers.push(a)},this);this.refresh()},_createLegend:function(){var a=
!1;r.set(this.domNode,"position","relative");f.create("div",{id:this.id+"_msg",innerHTML:this.NLS_creatingLegend+"..."},this.domNode);var b=[];m.forEach(this.layers,function(c){if("esri.layers.KMLLayer"==c.declaredClass||"esri.layers.GeoRSSLayer"==c.declaredClass){var d;c.loaded?("esri.layers.KMLLayer"==c.declaredClass?d=c.getLayers():"esri.layers.GeoRSSLayer"==c.declaredClass&&(d=c.getFeatureLayers(),c._hideLayersInLegend&&(d=m.filter(d,function(a){return-1==m.indexOf(c._hideLayersInLegend,a.id)}))),
m.forEach(d,function(a){"esri.layers.FeatureLayer"==a.declaredClass&&c._titleForLegend&&(a._titleForLegend=c._titleForLegend+" - ","esriGeometryPoint"==a.geometryType?a._titleForLegend+=this.NLS_points:"esriGeometryPolyline"==a.geometryType?a._titleForLegend+=this.NLS_lines:"esriGeometryPolygon"==a.geometryType&&(a._titleForLegend+=this.NLS_polygons),b.push(a))},this)):l.connect(c,"onLoad",s.hitch(this,function(){this.refresh(this.layerInfos)}))}else"esri.layers.WMSLayer"===c.declaredClass?c.loaded?
c.visible&&(0<c.layerInfos.length&&m.some(c.layerInfos,function(a){return a.legendURL}))&&(f.create("div",{innerHTML:"\x3cspan class\x3d'esriLegendServiceLabel'\x3e"+(c._titleForLegend||c.name||c.id)+"\x3c/span\x3e"},this.domNode),m.forEach(c.layerInfos,function(b){-1<m.indexOf(c.visibleLayers,b.name)&&(f.create("div",{innerHTML:"\x3cimg src\x3d'"+b.legendURL+"'/\x3e"},this.domNode),a=!0)},this)):l.connect(c,"onLoad",s.hitch(this,function(){this.refresh(this.layerInfos)})):b.push(c)},this);var c=
[];m.forEach(b,function(a){if(a.loaded){if(!0===a.visible&&(a.layerInfos||a.renderer||"esri.layers.ArcGISImageServiceLayer"==a.declaredClass)){var b=f.create("div",{id:this.id+"_"+a.id,style:"display: none;","class":"esriLegendService"});f.create("span",{innerHTML:this._getServiceTitle(a),"class":"esriLegendServiceLabel"},f.create("td",{align:this.alignRight?"right":"left"},f.create("tr",{},f.create("tbody",{},f.create("table",{width:"95%"},b)))));f.place(b,this.id,"first");q("ie")&&r.set(n.byId(this.id+
"_"+a.id),"display","none");a.legendResponse||a.renderer?this._createLegendForLayer(a):c.push(this._legendRequest(a))}}else var p=l.connect(a,"onLoad",this,function(a){l.disconnect(p);p=null;this.refresh()})},this);0===c.length&&!a?(n.byId(this.id+"_msg").innerHTML=this.NLS_noLegend,this._activate()):(new E(c)).addCallback(s.hitch(this,function(b){a?n.byId(this.id+"_msg").innerHTML="":n.byId(this.id+"_msg").innerHTML=this.NLS_noLegend;this._activate()}))},_createLegendForLayer:function(a){if(a.legendResponse||
a.renderer){var b=!1;if(a.legendResponse){var c=a.dynamicLayerInfos||a.layerInfos;c?m.forEach(c,function(c,d){if(!a._hideLayersInLegend||-1==m.indexOf(a._hideLayersInLegend,c.id)){var f=this._buildLegendItems(a,c,d);b=b||f}},this):"esri.layers.ArcGISImageServiceLayer"==a.declaredClass&&(b=this._buildLegendItems(a,{id:0,name:null,title:a.name,subLayerIds:null,parentLayerId:-1},0))}else a.renderer&&(c=a.url?a.url.substring(a.url.lastIndexOf("/")+1,a.url.length):"fc_"+a.id,b=this._buildLegendItems(a,
{id:c,name:null,subLayerIds:null,parentLayerId:-1},0));b&&(r.set(n.byId(this.id+"_"+a.id),"display","block"),r.set(n.byId(this.id+"_msg"),"display","none"))}},_legendRequest:function(a){if(a.loaded)return 10.01<=a.version?this._legendRequestServer(a):this._legendRequestTools(a);l.connect(a,"onLoad",s.hitch(this,"_legendRequest"))},_legendRequestServer:function(a){var b=a.url,c=b.indexOf("?"),b=-1<c?b.substring(0,c)+"/legend"+b.substring(c):b+"/legend";(c=a._getToken())&&(b+="?token\x3d"+c);var e=
s.hitch(this,"_processLegendResponse"),c={f:"json"};a._params.dynamicLayers&&(c.dynamicLayers=F.stringify(this._createDynamicLayers(a)),"[{}]"===c.dynamicLayers&&(c.dynamicLayers="[]"));a._params.bandIds&&(c.bandIds=a._params.bandIds);a._params.renderingRule&&(c.renderingRule=a._params.renderingRule);return x({url:b,content:c,callbackParamName:"callback",load:function(b,c){e(a,b,c)},error:w.defaults.io.errorHandler})},_legendRequestTools:function(a){var b=a.url.toLowerCase().indexOf("/rest/"),b=a.url.substring(0,
b)+a.url.substring(b+5,a.url.length),b=this._legendUrl+"?soapUrl\x3d"+window.escape(b);if(!q("ie")||8<q("ie"))b+="\x26returnbytes\x3dtrue";var c=s.hitch(this,"_processLegendResponse");return x({url:b,content:{f:"json"},callbackParamName:"callback",load:function(b,d){c(a,b,d)},error:w.defaults.io.errorHandler})},_processLegendResponse:function(a,b){b&&b.layers?(a.legendResponse=b,n.byId(this.id+"_"+a.id)&&f.empty(n.byId(this.id+"_"+a.id)),f.create("span",{innerHTML:this._getServiceTitle(a),"class":"esriLegendServiceLabel"},
f.create("td",{align:this.alignRight?"right":"left"},f.create("tr",{},f.create("tbody",{},f.create("table",{width:"95%"},n.byId(this.id+"_"+a.id)))))),this._createLegendForLayer(a)):console.log("Legend could not get generated for "+a.url+": "+C.toJson(b))},_buildLegendItems:function(a,b,c){var e=!1,d=n.byId(this.id+"_"+a.id),p=b.parentLayerId;if(b.subLayerIds)c=f.create("div",{id:this.id+"_"+a.id+"_"+b.id+"_group",style:"display: none;","class":-1==p?0<c?"esriLegendGroupLayer":"":this.alignRight?
"esriLegendRight":"esriLegendLeft"},-1==p?d:n.byId(this.id+"_"+a.id+"_"+p+"_group")),q("ie")&&r.set(n.byId(this.id+"_"+a.id+"_"+b.id+"_group"),"display","none"),f.create("td",{innerHTML:b.name.replace(/[\<]/g,"\x26lt;").replace(/[\>]/g,"\x26gt;"),align:this.alignRight?"right":"left"},f.create("tr",{},f.create("tbody",{},f.create("table",{width:"95%","class":"esriLegendLayerLabel"},c))));else{if(a.visibleLayers&&-1==(","+a.visibleLayers+",").indexOf(","+b.id+","))return e;c=f.create("div",{id:this.id+
"_"+a.id+"_"+b.id,style:"display:none;","class":-1<p?this.alignRight?"esriLegendRight":"esriLegendLeft":""},-1==p?d:n.byId(this.id+"_"+a.id+"_"+p+"_group"));q("ie")&&r.set(n.byId(this.id+"_"+a.id+"_"+b.id),"display","none");f.create("td",{innerHTML:b.name?b.name.replace(/[\<]/g,"\x26lt;").replace(/[\>]/g,"\x26gt;"):"",align:this.alignRight?"right":"left"},f.create("tr",{},f.create("tbody",{},f.create("table",{width:"95%","class":"esriLegendLayerLabel"},c))));a.legendResponse?e=e||this._buildLegendItems_Tools(a,
b,c):a.renderer&&(e=e||this._buildLegendItems_Renderer(a,b,c))}return e},_buildLegendItems_Tools:function(a,b,c){var e=b.parentLayerId,d=this.map.getScale(),p=!1,k=function(a,b){var c,d;for(c=0;c<a.length;c++)if(b.dynamicLayerInfos)for(d=0;d<b.dynamicLayerInfos[d].length;d++){if(b.dynamicLayerInfos[d].mapLayerId==a[c].layerId)return a[c]}else if(b.id==a[c].layerId)return a[c];return{}};if(!this._respectCurrentMapScale||this._respectCurrentMapScale&&this._isLayerInScale(a,b,d)){var h=k(a.legendResponse.layers,
b).legend;if(h){c=f.create("table",{cellpadding:0,cellspacing:0,width:"95%","class":"esriLegendLayer"},c);var g=f.create("tbody",{},c);(a._hoverLabel||a._hoverLabels)&&this._createHoverAction(c,a,b);m.forEach(h,function(c){if(!(10.1<=a.version&&!c.values&&1<h.length&&(a._hideDefaultSymbol||"\x3call other values\x3e"===c.label||!c.label)))if(c.url&&0===c.url.indexOf("http")||c.imageData&&0<c.imageData.length)p=!0,this._buildRow_Tools(c,g,a,b.id)},this)}}p&&(r.set(n.byId(this.id+"_"+a.id+"_"+b.id),
"display","block"),-1<e&&(r.set(n.byId(this.id+"_"+a.id+"_"+e+"_group"),"display","block"),this._findParentGroup(a.id,a,e)));return p},_buildRow_Tools:function(a,b,c,e){var d=f.create("tr",{},b),p;this.alignRight?(b=f.create("td",{align:"right"},d),p=f.create("td",{align:"right",width:35},d)):(p=f.create("td",{width:35},d),b=f.create("td",{},d));d=a.url;(!q("ie")||8<q("ie"))&&a.imageData&&0<a.imageData.length?d="data:image/png;base64,"+a.imageData:0!==a.url.indexOf("http")&&(d=c.url+"/"+e+"/images/"+
a.url,(e=c._getToken())&&(d+="?token\x3d"+e));e=f.create("img",{src:d,border:0,style:"opacity:"+c.opacity},p);f.create("td",{innerHTML:a.label.replace(/[\&]/g,"\x26amp;").replace(/[\<]/g,"\x26lt;").replace(/[\>]/g,"\x26gt;").replace(/^#/,""),align:this.alignRight?"right":"left"},f.create("tr",{},f.create("tbody",{},f.create("table",{width:"95%",dir:"ltr"},b))));9>q("ie")&&(e.style.filter="alpha(opacity\x3d"+100*c.opacity+")")},_buildLegendItems_Renderer:function(a,b,c){var e=b.parentLayerId,d=this.map,
p=d.getScale(),k=!1;if(!this._respectCurrentMapScale||this._isLayerInScale(a,b,p)){var h,g=a.renderer;if(g instanceof M&&(g=(g="zoom"===g.rangeType?g.getRendererInfoByZoom(d.getZoom()):g.getRendererInfoByScale(p))&&g.renderer,!g))return!1;g instanceof N?(k=!0,this._showDotDensityLegend(a,b,g,c)):g instanceof z?g.infos&&0<g.infos.length&&(k=!0,d=f.create("table",{cellpadding:0,cellspacing:0,width:"95%","class":"esriLegendLayer"},c),h=f.create("tbody",{},d),(a._hoverLabel||a._hoverLabels)&&this._createHoverAction(d,
a,b),m.forEach(g.infos,function(b,c){var d=null;a._editable&&a.types&&(d=this._getTemplateFromTypes(a.types,b.value));var e=b.label;null==e&&(e=b.value);this._buildRow_Renderer(a,b.symbol,e,d,h)},this)):g instanceof A?g.infos&&0<g.infos.length&&(k=!0,d=f.create("table",{cellpadding:0,cellspacing:0,width:"95%","class":"esriLegendLayer"},c),h=f.create("tbody",{},d),(a._hoverLabel||a._hoverLabels)&&this._createHoverAction(d,a,b),m.forEach(g.infos,function(b,c){var d=b.label;null==d&&(d=b.minValue+" - "+
b.maxValue);this._buildRow_Renderer(a,b.symbol,d,null,h)},this)):g instanceof y&&(k=!0,d=f.create("table",{cellpadding:0,cellspacing:0,width:"95%","class":"esriLegendLayer"},c),h=f.create("tbody",{},d),(a._hoverLabel||a._hoverLabels)&&this._createHoverAction(d,a,b),d=null,a._editable&&(a.templates&&0<a.templates.length)&&(d=a.templates[0]),this._buildRow_Renderer(a,g.symbol,g.label,d,h));k&&g.proportionalSymbolInfo&&this._showProportionalLegend(a,b,g,c);!a._hideDefaultSymbol&&g.defaultSymbol&&(k=
!0,this._buildRow_Renderer(a,g.defaultSymbol,g.defaultLabel?g.defaultLabel:"others",null,h))}k&&(r.set(n.byId(this.id+"_"+a.id+"_"+b.id),"display","block"),-1<e&&(r.set(n.byId(this.id+"_"+a.id+"_"+e+"_group"),"display","block"),this._findParentGroup(a.id,e)));return k},_showDotDensityLegend:function(a,b,c,e){var d=c.legendOptions,p,k,h,g,l,n,r,t=this.dotDensitySwatchSize,q=Math.round(t/2);d&&(k=d.backgroundColor,h=d.outline,g=d.valueUnit,l=d.dotCoverage);l=(l||this.dotCoverage)/100;r=Math.round(t*
t/Math.pow(c.dotSize,2)*l);e=f.create("table",{cellpadding:0,cellspacing:0,width:"95%","class":"esriLegendLayer"},e);n=f.create("tbody",{},e);(a._hoverLabel||a._hoverLabels)&&this._createHoverAction(e,a,b);this._addSubHeader(n,L.substitute({value:c.dotValue,unit:g||""},this.NLS_dotValue));m.forEach(c.fields,function(b){b=s.mixin({},b);b.numPoints=r;p=new P(c._generateImageSrc(t,t,[b],{x:0,y:0},{x:t,y:t},k),h||c.outline,t,t);b=a._getField(b.name,!0)||b;this._buildRow_Renderer(a,p,b.alias||b.name,null,
n,{type:"path",path:"M "+-q+","+-q+" L "+q+","+-q+" L "+q+","+q+" L "+-q+","+q+" L "+-q+","+-q+" E"})},this)},_showProportionalLegend:function(a,b,c,e){var d=c.proportionalSymbolInfo,p=d.legendOptions,p=p&&p.customValues,k,h=d.minDataValue,g=d.maxDataValue,l=this._getProportionalSymbol(c);"unknown"!==d.valueUnit||(!l||!p&&(null==h||null==g))||(e=f.create("table",{cellpadding:0,cellspacing:0,width:"95%","class":"esriLegendLayer"},e),k=f.create("tbody",{},e),(a._hoverLabel||a._hoverLabels)&&this._createHoverAction(e,
a,b),b=a._getField(d.field,!0),this._addSubHeader(k,b.alias||b.name),b=p||this._getDataValues(h,g),m.forEach(b,function(b){l=v.fromJson(l.toJson());this._applySize(l,c,b);b=G.format(b,{places:20,round:-1}).replace(this.reZerosFractional,"$1").replace(this.reZeros,"");this._buildRow_Renderer(a,l,b,null,k)},this))},_getProportionalSymbol:function(a){var b,c;if(a instanceof y)c=!0,b=a.symbol;else if(a instanceof z||a instanceof A)b=a.infos[0].symbol;if(b=-1!==b.type.indexOf("fillsymbol")?null:b)!c&&
"picturemarkersymbol"===b.type?(b=new O,b.setStyle("square"),b.outline.setWidth(1)):b=v.fromJson(b.toJson()),c||b.setColor(new D([127,127,127]));return b},_applySize:function(a,b,c){var e=a.type;b=b.getSize(c,-1!==e.indexOf("markersymbol")?{shape:a.style}:null);switch(e){case "simplemarkersymbol":a.setSize(b);break;case "picturemarkersymbol":a.setWidth(b);a.setHeight(b);break;case "simplelinesymbol":case "cartographiclinesymbol":a.setWidth(b)}},_getDataValues:function(a,b){var c=[a,b],e=Math.LN10,
d=Math.log(a),f=Math.log(b),k,h,g,l,n;m.forEach([1,2.5,5],function(a){l=Math.log(a);k=Math.ceil((d-l)/e);h=Math.floor((f-l)/e);if(!(Infinity===Math.abs(k)||Infinity===Math.abs(h)))for(g=k;g<h+1;g++)n=a*Math.pow(10,g),-1===m.indexOf(c,n)&&c.push(n)});c.sort(this._sorter);return c},_sorter:function(a,b){return a-b},_buildRow_Renderer:function(a,b,c,e,d,p){var k=f.create("tr",{},d),h;this.alignRight?(d=f.create("td",{align:"right"},k),h=f.create("td",{align:"right",width:35},k)):(h=f.create("td",{width:35,
align:"center"},k),d=f.create("td",{},k));var g=k=30;"simplemarkersymbol"==b.type?(k=Math.min(Math.max(k,b.size+12),125),g=Math.min(Math.max(g,b.size+12),125)):"picturemarkersymbol"==b.type&&(k=Math.min(Math.max(k,b.width),125),g=Math.min(b.height?b.height:g,125));h=f.create("div",{style:"width:"+k+"px;height:"+g+"px;"},h);f.create("td",{innerHTML:c?c.replace(/[\&]/g,"\x26amp;").replace(/[\<]/g,"\x26lt;").replace(/[\>]/g,"\x26gt;").replace(/^#/,""):"",align:this.alignRight?"right":"left"},f.create("tr",
{},f.create("tbody",{},f.create("table",{width:"95%"},d))));a=this._drawSymbol(h,b,k,g,e,a,p);this._surfaceItems.push(a)},_addSubHeader:function(a,b){var c=f.create("tr",{},a),c=f.create("td",{align:this.alignRight?"right":"left",colspan:2},c);f.create("td",{innerHTML:b?b.replace(/[\&]/g,"\x26amp;").replace(/[\<]/g,"\x26lt;").replace(/[\>]/g,"\x26gt;").replace(/^#/,""):"",align:this.alignRight?"right":"left"},f.create("tr",{},f.create("tbody",{},f.create("table",{width:"95%"},c))))},_drawSymbol:function(a,
b,c,e,d,f,k){b=v.fromJson(b.toJson());var h,g=f.opacity;if("simplelinesymbol"===b.type||"cartographiclinesymbol"===b.type||"textsymbol"===b.type){if(!b.color)return;h=b.color.toRgba();h[3]*=g;b.color.setColor(h)}else if("simplemarkersymbol"===b.type||"simplefillsymbol"===b.type){if(!b.color)return;h=b.color.toRgba();h[3]*=g;b.color.setColor(h);b.outline&&b.outline.color&&(h=b.outline.color.toRgba(),h[3]*=g,b.outline.color.setColor(h))}else"picturemarkersymbol"===b.type&&(a.style.opacity=g,a.style.filter=
"alpha(opacity\x3d("+100*g+"))");a=I.createSurface(a,c,e);q("ie")&&(h=a.getEventSource(),r.set(h,"position","relative"),r.set(h.parentNode,"position","relative"));d=this._getDrawingToolShape(b,d)||v.getShapeDescriptors(b);var l;try{l=a.createShape(k||d.defaultShape).setFill(d.fill).setStroke(d.stroke)}catch(m){a.clear();a.destroy();return}d=l.getBoundingBox();h=d.width;var g=d.height,n=-(d.x+h/2),t=-(d.y+g/2);k=a.getDimensions();n={dx:n+k.width/2,dy:t+k.height/2};if("simplemarkersymbol"===b.type&&
"path"===b.style)c=f._getScaleMatrix(d,b.size),l.applyTransform(J.scaleAt(c.xx,c.yy,{x:k.width/2,y:k.height/2}));else if(h>c||g>e)c=((c<e?c:e)-5)/(h>g?h:g),s.mixin(n,{xx:c,yy:c});l.applyTransform(n);return a},_getDrawingToolShape:function(a,b){var c;switch(b?b.drawingTool||null:null){case "esriFeatureEditToolArrow":c={type:"path",path:"M 10,1 L 3,8 L 3,5 L -15,5 L -15,-2 L 3,-2 L 3,-5 L 10,1 E"};break;case "esriFeatureEditToolTriangle":c={type:"path",path:"M -10,14 L 2,-10 L 14,14 L -10,14 E"};break;
case "esriFeatureEditToolRectangle":c={type:"path",path:"M -10,-10 L 10,-10 L 10,10 L -10,10 L -10,-10 E"};break;case "esriFeatureEditToolCircle":c={type:"circle",cx:0,cy:0,r:10};break;case "esriFeatureEditToolEllipse":c={type:"ellipse",cx:0,cy:0,rx:10,ry:5};break;default:return null}return{defaultShape:c,fill:a.getFill(),stroke:a.getStroke()}},_repaintItems:function(){m.forEach(this._surfaceItems,function(a){this._repaint(a)},this)},_repaint:function(a){if(a){a.getStroke&&a.setStroke&&a.setStroke(a.getStroke());
try{a.getFill&&a.setFill&&a.setFill(a.getFill())}catch(b){}a.children&&s.isArray(a.children)&&m.forEach(a.children,this._repaint,this)}},_createHoverAction:function(a,b,c){var e=b._hoverLabel||b._hoverLabels[c.id];e&&(b.mouseMoveHandler=b.mouseMoveHandler||{},b.mouseMoveHandler[c.id]=l.connect(a,"onmousemove",s.hitch(this,function(a,b){this.mouseX=b.clientX;this.mouseY=b.clientY;this.hoverLabelShowing&&(this.hoverLabelShowing=!1,r.set(n.byId(this.id+"_hoverLabel"),"display","none"));setTimeout(s.hitch(this,
function(a,b,c){if(a==this.mouseX&&b==this.mouseY&&!this.hoverLabelShowing)if(this.hoverLabelShowing=!0,n.byId(this.id+"_hoverLabel")){var d=n.byId(this.id+"_hoverLabel");d.innerHTML="\x3cspan\x3e"+c+"\x3c/span\x3e";r.set(d,"top",b+"px");r.set(d,"left",a+15+"px");r.set(d,"display","")}else f.create("div",{innerHTML:"\x3cspan\x3e"+c+"\x3c/span\x3e",id:this.id+"_hoverLabel","class":"esriLegendHoverLabel",style:{top:b+"px",left:a+15+"px"}},document.body)},b.clientX,b.clientY,a),500)},e)),b.mouseOutHandler=
b.mouseOutHandler||{},b.mouseOutHandler[c.id]=l.connect(a,"onmouseout",s.hitch(this,function(a){this.mouseY=this.mouseX=-1;this.hoverLabelShowing&&(this.hoverLabelShowing=!1,r.set(n.byId(this.id+"_hoverLabel"),"display","none"))})))},_removeHoverHandlers:function(){var a;m.forEach(this.layers,function(b){if(b.mouseMoveHandler)for(a in b.mouseMoveHandler)l.disconnect(b.mouseMoveHandler[a]);if(b.mouseOutHandler)for(a in b.mouseOutHandler)l.disconnect(b.mouseOutHandler[a])})},_createDynamicLayers:function(a){var b=
[],c;m.forEach(a.dynamicLayerInfos||a.layerInfos,function(e){c={id:e.id};c.source=e.source&&e.source.toJson();var d;a.layerDefinitions&&a.layerDefinitions[e.id]&&(d=a.layerDefinitions[e.id]);d&&(c.definitionExpression=d);var f;a.layerDrawingOptions&&a.layerDrawingOptions[e.id]&&(f=a.layerDrawingOptions[e.id]);f&&(c.drawingInfo=f.toJson());c.minScale=e.minScale||0;c.maxScale=e.maxScale||0;b.push(c)});return b},_getTemplateFromTypes:function(a,b){var c;for(c=0;c<a.length;c++)if(a[c].id==b&&a[c].templates&&
0<a[c].templates.length)return a[c].templates[0];return null},_findParentGroup:function(a,b,c){var e,d=b.dynamicLayerInfos||b.layerInfos;for(e=0;e<d.length;e++)if(c==d[e].id){-1<d[e].parentLayerId&&(r.set(n.byId(this.id+"_"+a+"_"+d[e].parentLayerId+"_group"),"display","block"),this._findParentGroup(a,b,d[e].parentLayerId));break}},_addSubLayersToHide:function(a){function b(c,e){var d=a.layer.dynamicLayerInfos||a.layer.layerInfos,f,k;for(f=0;f<d.length;f++)if(d[f].id===c&&d[f].subLayerIds)for(k=0;k<
d[f].subLayerIds.length;k++){var h=d[f].subLayerIds[k];-1===m.indexOf(e,h)&&(e.push(h),b(h,e))}}a.layer.layerInfos&&m.forEach(a.layer._hideLayersInLegend,function(c){b(c,a.layer._hideLayersInLegend)})},_isLayerInScale:function(a,b,c){var e,d=!0;if(a.legendResponse&&a.legendResponse.layers)for(e=0;e<a.legendResponse.layers.length;e++){var f=a.legendResponse.layers[e];if(b.id==f.layerId){var k,h;!a.minScale&&0!==a.minScale||!a.maxScale&&0!==a.maxScale?(0==f.minScale&&a.tileInfo&&(k=a.tileInfo.lods[0].scale),
0==f.maxScale&&a.tileInfo&&(h=a.tileInfo.lods[a.tileInfo.lods.length-1].scale)):(k=Math.min(a.minScale,f.minScale)||a.minScale||f.minScale,h=Math.max(a.maxScale,f.maxScale));if(0<k&&k<c||h>c)d=!1;break}}else if(a.minScale||a.maxScale)if(a.minScale&&a.minScale<c||a.maxScale&&a.maxScale>c)d=!1;return d},_getServiceTitle:function(a){var b=a._titleForLegend;b||((b=a.url)?-1<a.url.indexOf("/MapServer")?(b=a.url.substring(0,a.url.indexOf("/MapServer")),b=b.substring(b.lastIndexOf("/")+1,b.length)):-1<a.url.indexOf("/ImageServer")?
(b=a.url.substring(0,a.url.indexOf("/ImageServer")),b=b.substring(b.lastIndexOf("/")+1,b.length)):-1<a.url.indexOf("/FeatureServer")&&(b=a.url.substring(0,a.url.indexOf("/FeatureServer")),b=b.substring(b.lastIndexOf("/")+1,b.length)):b="",a.name&&(b=0<b.length?b+(" - "+a.name):a.name));return K.encode(b)},_isSupportedLayerType:function(a){return a&&("esri.layers.ArcGISDynamicMapServiceLayer"===a.declaredClass||"esri.layers.ArcGISImageServiceLayer"===a.declaredClass&&10.2<=a.version||"esri.layers.ArcGISTiledMapServiceLayer"===
a.declaredClass||"esri.layers.FeatureLayer"===a.declaredClass||"esri.layers.KMLLayer"===a.declaredClass||"esri.layers.GeoRSSLayer"===a.declaredClass||"esri.layers.WMSLayer"===a.declaredClass)?!0:!1}});s.mixin(u,{ALIGN_LEFT:0,ALIGN_RIGHT:1});return u});