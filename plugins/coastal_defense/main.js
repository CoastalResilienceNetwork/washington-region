
// Plugins should load their own versions of any libraries used even if those libraries are also used 
// by the GeositeFramework, in case a future framework version uses a different library version. 

require({
    // Specify library locations.
    // The calls to location.pathname.replace() below prepend the app's root path to the specified library location. 
    // Otherwise, since Dojo is loaded from a CDN, it will prepend the CDN server path and fail, as described in
    // https://dojotoolkit.org/documentation/tutorials/1.7/cdn
    packages: [
	    {
	        name: "jquery",
	        location: "//ajax.googleapis.com/ajax/libs/jquery/1.9.0",
	        main: "jquery.min"
	    },
		{
	        name: "underscore",
	        location: "//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4",
	        main: "underscore-min"
	    },
        {
            name: "jquery_ui",
            location: "//ajax.googleapis.com/ajax/libs/jqueryui/1.10.1",
            main: "jquery-ui.min"
        }
		
		

    ]
});





define([
        "dojo/_base/declare",
        "framework/PluginBase",
		"jquery",
		"dojo/parser",
		"dijit/registry",
		"dojo/dom-class",
		"dojo/dom-style",
		"dojo/_base/lang",
		"dojo/query",
		"use!underscore", 
		"./CoastalDefense",
		"dojo/text!plugins/coastal_defense/CoastalDefense.json"
       ],
       function (declare, PluginBase, $, parser, registry, domClass, domStyle, lang, query, _, cd, configFile) {
           return declare(PluginBase, {
               toolbarName: "Coastal Defense",
               toolbarType: "sidebar",
			   resizable: false,
			   showServiceLayersInLegend: true,
               allowIdentifyWhenActive: false,
			   infoGraphic: "plugins/coastal_defense/CoastalDefense_c.jpg",
			   width: 835,
			   height: 600,
			   
			   
               activate: function () { 
					// console.log( this.cdTool); 
					// 
					// if(this.cdTool.windowOpen == false){
					// 	console.log('test');
					//    //this.cdTool.initialize(this.cdTool)
					// } else 
					
					dojo.query(".identify-info-window").addClass("CD_HidePopup");
					console.log(dojo.query(".identify-info-window"));    
					
					if(this.cdTool.parameters.windowOpen == true){
						registry.byId("cd_profileLocationsCheckbox").checked? this.cdTool.profileLandPoints.show() : this.cdTool.profileLandPoints.hide() ;	
						registry.byId("cd_marshExtentCheckbox").checked? this.cdTool.marshLayer.show() : this.cdTool.marshLayer.hide() ;	
						registry.byId("cd_dikeCheckbox").checked? this.cdTool.dikeLayer.show() : this.cdTool.dikeLayer.hide() ;		
						registry.byId("cd_elevationCheckbox").checked? this.cdTool.contours.show() : this.cdTool.contours.hide() ;		      
					}
			   },
			   
               deactivate: function () { },
			   
               hibernate: function () { 
			   
				   console.log(this.cdTool.profileLandPoints.visible);
				   
				   this.cdTool.profileLandPoints.hide();
				   this.cdTool.marshLayer.hide();
				   this.cdTool.dikeLayer.hide();
				   this.cdTool.contours.hide();
				   this.cdTool.habExtentLayer.hide();
				   		     
			   },
			   
               initialize: function (frameworkParameters) {
				   
				
				   declare.safeMixin(this, frameworkParameters); 
				   
	               var djConfig = {
	                   parseOnLoad: true
	               };
				   self = this;
				   
				   domClass.add(this.container, "claro");

				   //console.log(configFile);
				   this.cdTool = new cd(this.container, this.map, this.app, configFile);
				   console.log(this);
				   
				   this.cdTool.initialize(this.cdTool);
				   
			   },
				   
               getState: function () {
				   
				   // console.log(this.cdTool.startPanel);
				   // state = {
				   // 					   panel: this.cdTool.startPanel
				   // }
				   
				   //state = 'test';
				   
				  
				   console.log(this.cdTool);
				   
				   this.cdTool.getPanelParameters();
				   
				   state = this.cdTool.parameters;
				   
				   console.log(state);
				   
				   return state
				   
	 		   	},
				
               setState: function (state) { 
				    
					this.cdTool.parameters = state;
					
					parentContainer = this.container.parentElement;

					parentContainer.style.display = 'block';
					
					this.cdTool.resetState();
					
					parentContainer.style.display = 'none';
				   		   

					
			   },
			   
			   identify: function(){
				   console.log(dojo.query(".identify-info-window")); dojo.query(".identify-info-window").addClass("CD_HidePopup");
			   }
           });
       });
