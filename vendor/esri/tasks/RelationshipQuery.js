//>>built
define(["dojo/_base/declare","dojo/_base/lang","dojo/has","esri/kernel"],function(e,f,g,h){return e(null,{declaredClass:"esri.tasks.RelationshipQuery",definitionExpression:"",relationshipId:null,returnGeometry:!1,objectIds:null,outSpatialReference:null,outFields:null,toJson:function(){var a={definitionExpression:this.definitionExpression,relationshipId:this.relationshipId,returnGeometry:this.returnGeometry,maxAllowableOffset:this.maxAllowableOffset,geometryPrecision:this.geometryPrecision},b=this.objectIds,
c=this.outFields,d=this.outSpatialReference;b&&(a.objectIds=b.join(","));c&&(a.outFields=c.join(","));d&&(a.outSR=d.toJson());a._ts=this._ts;return a}})});