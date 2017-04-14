
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
			//         {
			//             name: "extjs",
			// location: location.pathname.replace(/\/[^/]+$/, "") + "plugins/coastal_defense/lib/ext-4.2.1-gpl",
			//             main: "ext-all"
			//         },
        {
            name: "tv4",
            location: location.pathname.replace(/\/[^/]+$/, "") + "plugins/coastal_defense/lib",
            main: "tv4.min"
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
		"dojo/parser",
		"dijit/registry",
		"use!underscore", 
		"./CoastalDefense",
		"dojo/text!plugins/coastal_defense/CoastalDefense.json"
       ],
       function (declare, PluginBase, parser, registry, _, cd, configFile) {
           return declare(PluginBase, {
               toolbarName: "Coastal Defense",
               toolbarType: "sidebar",
               allowIdentifyWhenActive: false,
			   
               activate: function () { 
					console.log( this.cdTool); 

					if(this.cdTool.windowOpen == false){
					   this.cdTool.initialize(this.cdTool)
					} else {
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
				   		     
			   },
			   
               initialize: function (frameworkParameters) {
				   console.log(location);
				   declare.safeMixin(this, frameworkParameters); 
	               var djConfig = {
	                   parseOnLoad: true
	               };
				   self = this;
				   this.cdTool = new cd(this.container, this.map, this.app, configFile);
				   
			   },
				   
               getState: function () { },
               setState: function () { },
           });
       });
