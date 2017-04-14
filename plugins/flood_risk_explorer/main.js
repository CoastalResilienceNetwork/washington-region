require({
    packages: [
        {
            name: "jquery",
            location: "http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/",
            main: "jquery.min"
        }    
    ]
});
	
define([
        "dojo/_base/declare",
		"framework/PluginBase",
		'plugins/flood_risk_explorer/ConstrainedMoveable',
		'plugins/flood_risk_explorer/jquery-ui-1.11.0/jquery-ui',
		
		"esri/request",
		"esri/layers/ArcGISDynamicMapServiceLayer",
		"esri/layers/ArcGISImageServiceLayer",
		"esri/layers/ImageServiceParameters",
		"esri/layers/RasterFunction",
		"esri/tasks/ImageServiceIdentifyTask",
		"esri/tasks/ImageServiceIdentifyParameters",
		"esri/tasks/QueryTask",
		"esri/tasks/query",
		"esri/graphicsUtils",
		
		"esri/symbols/SimpleLineSymbol",
		"esri/symbols/SimpleFillSymbol",
		"esri/symbols/SimpleMarkerSymbol",
		"esri/graphic", 
		"esri/symbols/Font", 
		"esri/symbols/TextSymbol", 
		"esri/symbols/PictureMarkerSymbol",	
		"dojo/_base/Color",		
		
		"dijit/registry",
		"dijit/form/Button",
		"dijit/form/DropDownButton",
		"dijit/DropDownMenu", 
		"dijit/MenuItem",
		"dijit/layout/ContentPane",
		"dijit/form/HorizontalSlider",
		"dijit/form/CheckBox",
		"dijit/form/RadioButton",
		"dojo/dom",
		"dojo/dom-class",
		"dojo/dom-style",
		"dojo/_base/window",
		"dojo/dom-construct",
		"dojo/dom-attr",
		"dijit/Dialog",
		"dojo/dom-geometry",
		
		"dojo/_base/array",
		"dojo/_base/lang",
		"dojo/on",
		"dojo/parser",
		"dojo/query",
		"dojo/NodeList-traverse",
        "dojo/dnd/Moveable",
		"dojo/dnd/move",
		
		"dojo/text!./layerviz.json",
		"jquery"
				
       ],
       function (declare, 
					PluginBase, 
					ConstrainedMoveable,
					ui,
					ESRIRequest,
					ArcGISDynamicMapServiceLayer,
					ArcGISImageServiceLayer,
					ImageServiceParameters,
					RasterFunction,
					ImageServiceIdentifyTask,
					ImageServiceIdentifyParameters,
					QueryTask,
					esriQuery,
					graphicsUtils,
					SimpleLineSymbol,
					SimpleFillSymbol,
					SimpleMarkerSymbol,
					Graphic, 
					Font, 
					TextSymbol, 
					PictureMarkerSymbol,
					Color,
					registry,
					Button,
					DropDownButton, 
					DropDownMenu, 
					MenuItem,
					ContentPane,
					HorizontalSlider,
					CheckBox,
					RadioButton,
					dom,
					domClass,
					domStyle,
					win,
					domConstruct,
					domAttr,
					Dialog,
					domGeom,
					array,
					lang,
					on,
					parser,
					dojoquery,
					NodeListtraverse,
					Moveable,
					move,
					layerViz,
					$
					) {
					
           return declare(PluginBase, {
		       toolbarName: "Flood Risk Explorer",
               toolbarType: "sidebar",
			   showServiceLayersInLegend: true,
               allowIdentifyWhenActive: false,
			   infoGraphic: "plugins/flood_risk_explorer/FloodRiskExplorer.jpg",
			   height: 610,
			   rendered: false,
			   
               activate: function () { 
			   
					if (this.rendered == false) {
					
						this.rendered = true;
					
						this.render();
						
						this.currentLayer.setVisibility(true);
												
					
					} else {
			  
						if (this.currentLayer != undefined)  {
						
							this.currentLayer.setVisibility(true);
							
						}
						

					}
					
					
			    },
               deactivate: function () { },
               hibernate: function () { 
			   
					if (this.currentLayer != undefined)  {
					
						this.currentLayer.setVisibility(false);
						domStyle.set(this.picarea.domNode, 'display', 'none');
						dijit.byId(this.sliderpane.id + "i5").set('checked', false);
						dijit.byId(this.sliderpane.id + "sib").set('checked', false);
						dijit.byId(this.sliderpane.id + "hf").set('checked', false);
						this.pntSym1.url = "plugins/flood_risk_explorer/images/pp.png";
						this.pntSym2.url = "plugins/flood_risk_explorer/images/pp.png";
						this.pntSym3.url = "plugins/flood_risk_explorer/images/pp.png";
						this.ts1.setText("");
						this.ts2.setText("");
						this.ts3.setText("");
						this.pt1 = "n";
						this.pt2 = "n";
						this.pt3 = "n";
						this.map.graphics.clear();
					}
					
			   
			   },
			   
			   
				initialize: function (frameworkParameters) {
					
					this.picPath = "plugins/flood_risk_explorer/images/";
					this.picPre = "p1_";
				
					declare.safeMixin(this, frameworkParameters);

					domClass.add(this.container, "claro");
					
					con = dom.byId('plugins/flood_risk_explorer-0');
					domStyle.set(con, "width", "260px");
					domStyle.set(con, "height", "610px");
					
					con1 = dom.byId('plugins/flood_risk_explorer-1');
					if (con1 != undefined){
						domStyle.set(con1, "width", "260px");
						domStyle.set(con1, "height", "610px");
					}
					this.layerVizObject = dojo.eval("[" + layerViz + "]")[0];
					
					this.controls = this.layerVizObject.controls;

					this.groupindex = [];
					
					array.forEach(this.controls, lang.hitch(this,function(control, i){

						if (control.type == "group") {this.groupindex.push(i)};
					
					}));
					
					layersRequest = ESRIRequest({
							  url: this.layerVizObject.url,
							  content: { f: "json" },
							  handleAs: "json",
							  callbackParamName: "callback"
							});
							
					layersRequest.then(
							  lang.hitch(this,this.setup), function(error) {
								console.log("Error: ", error.message);
							});		
				},
				
				
				 resize: function(w, h) {
				 
					cdg = domGeom.position(this.container);
					
					if (cdg.h == 0) {
						
						this.sph = this.height - 120 
						
					} else {
					
						this.sph = cdg.h-82;
					
					}
					
					domStyle.set(this.sliderpane.domNode, "height", this.sph + "px");
					
					//domStyle.set(this.sliderpane.domNode, "height", "250px");
					

					
					//alert(cdg.h);
				 
				 },
			   

			   setup : function(response) {

					this.layerlist = {};
					
					array.forEach(response.layers, lang.hitch(this,function(layer, i){
					
						layerSplit = layer.name.split("__")
						//console.log(layerSplit)
						//console.log(layerSplit.length);
						
						this.layerlist[layer.name] = layer.id;
						//console.log(this.layerlist[layer.name])
						array.forEach(layerSplit, lang.hitch(this,function(cat, i){
						
							cgi = this.groupindex[i]
							
							
							if (this.controls[cgi].options == undefined) {
							
								this.controls[cgi].options = [];
								makedefault = true;
							
							} else {
							
								makedefault = false;
							
							}
							
							withingroup = false;
							
						    array.forEach(this.controls[cgi].options, lang.hitch(this,function(opts, i){
								
								if (opts.value == cat) {
								
									withingroup = true;
								
								}
							
							}));
							
							if (withingroup == false) {
							
								newoption = {};
								newoption.text = cat;
								newoption.selected = makedefault;
								newoption.value = cat;
							
								this.controls[cgi].options.push(newoption)
							
							}
							
						
						}));
						
					}));
					
				
					
							
				},
			
			   updateMap: function() {
			   					
					outvalues = [];
					
					array.forEach(this.controls, lang.hitch(this,function(entry, orderid){
					
						if (entry.type == "group") {
					
						array.forEach(entry.options, lang.hitch(this,function(option, i){
			   
							if (option.selected == true) {
							
								//need to put code to build here
								
								if (option.enabled) {outvalues.push(option.value)};
							
							}
			   
						}));
						
						}
						
					}));
				
					
					
					layertoAdd = this.layerlist[outvalues.join("__")];
					
					x = 0;
					while  (layertoAdd == undefined) {
					
						outvalues = outvalues.slice(0,outvalues.length -1)
						layertoAdd = this.layerlist[outvalues.join("__")];
						
						x = x + 1
						if (x > 9999) {
							layertoAdd = "None"
						}

					
					}
					
					slayers = [];
					slayers.push(layertoAdd);
					
					//this.currentLayer.setVisibility(true);
					this.currentLayer.setVisibleLayers(slayers);
										
					pic = this.currentLayer.layerInfos[layertoAdd].name + ".jpg";
					this.picName = pic.replace("%","");
					
					this.displayArray = [];
					this.agBreakdown = [];
					$('#' + this.sliderpane.id + 'peopleMore').show();
					if (this.picName == "Current Flood Depth__10.jpg"){
						this.displayArray = this.his10;
						this.agBreakdown = this.his10bd;
					}
					if (this.picName == "Current Flood Depth__1.jpg"){
						this.displayArray = this.his100;
						this.agBreakdown = this.his100bd;
					}
					if (this.picName == "2040 Flood Depth__10__Low.jpg"){
						this.displayArray = this.f2040_10L;
						this.agBreakdown = this.f2040_10Lbd;	
					}
					if (this.picName == "2040 Flood Depth__10__High.jpg"){
						this.displayArray = this.f2040_10H;
						this.agBreakdown = this.f2040_10Hbd;
					}
					if (this.picName == "2040 Flood Depth__1__Low.jpg"){
						this.displayArray = this.f2040_100L;
						this.agBreakdown = this.f2040_100Lbd;
					}
					if (this.picName == "2040 Flood Depth__1__High.jpg"){
						this.displayArray = this.f2040_100H;
						this.agBreakdown = this.f2040_100Hbd;
					}
					if (this.picName == "2080 Flood Depth__10__Low.jpg"){
						this.displayArray = this.f2080_10L;
						this.agBreakdown = this.f2080_10Lbd;
					}
					if (this.picName == "2080 Flood Depth__10__High.jpg"){
						this.displayArray = this.f2080_10H;
						this.agBreakdown = this.f2080_10Hbd;
						/*$('#' + this.sliderpane.id + 'peopleMore').hide();
						if ($("#" + this.sliderpane.id + "peopleDis").is(":visible")){
							$("#" + this.sliderpane.id + "peopleDis").animate({width:'toggle'},500);
						}*/
					}
					if (this.picName == "2080 Flood Depth__1__Low.jpg"){
						this.displayArray = this.f2080_100L;
						this.agBreakdown = this.f2080_100Lbd;
					}
					if (this.picName == "2080 Flood Depth__1__High.jpg"){
						this.displayArray = this.f2080_100H;
						this.agBreakdown = this.f2080_100Hbd;
						/*$('#' + this.sliderpane.id + 'peopleMore').hide();
						if ($("#" + this.sliderpane.id + "peopleDis").is(":visible")){
							$("#" + this.sliderpane.id + "peopleDis").animate({width:'toggle'},500);
						}*/
					}
					
					$("#" + this.sliderpane.id + "lossBar > .ui-progressbar-value").animate({width: this.displayArray[0]}, 500);
					$("#" + this.sliderpane.id + "acresBar > .ui-progressbar-value").animate({width: this.displayArray[1]}, 500);
					$("#" + this.sliderpane.id + "peopleBar > .ui-progressbar-value").animate({width: this.displayArray[2]}, 500);
					$("#" + this.sliderpane.id + "lossTitle").html(this.displayArray[3]);
					$("#" + this.sliderpane.id + "acresTitle").html(this.displayArray[4]);
					$("#" + this.sliderpane.id + "peopleTitle").html(this.displayArray[5]);
					
					//ag breakdown update
					// slide bars
					$("#" + this.sliderpane.id + "forage").animate({bottom : this.agBreakdown[0], height: this.agBreakdown[1]});
					$("#" + this.sliderpane.id + "grainSeed").animate({bottom : this.agBreakdown[2], height: this.agBreakdown[3] });   
					$("#" + this.sliderpane.id + "marketCrops").animate({bottom : this.agBreakdown[4], height: this.agBreakdown[5]});
					$("#" + this.sliderpane.id + "treeFarm").animate({bottom : this.agBreakdown[6], height: this.agBreakdown[7]});
					//update text
					$("#" + this.sliderpane.id + "acresMaxNum").html(this.agBreakdown[8])
					$("#" + this.sliderpane.id + "fallowAcres").html(this.agBreakdown[9]);
					$("#" + this.sliderpane.id + "forageAcres").html(this.agBreakdown[10]);
					$("#" + this.sliderpane.id + "grainAcres").html(this.agBreakdown[11]);
					$("#" + this.sliderpane.id + "marketAcres").html(this.agBreakdown[12]);
					$("#" + this.sliderpane.id + "treeAcres").html(this.agBreakdown[13]);
					//move Labels
					$("#" + this.sliderpane.id + "falDiv").animate({bottom: this.agBreakdown[14]});
					$("#" + this.sliderpane.id + "forDiv").animate({bottom: this.agBreakdown[15]});
					$("#" + this.sliderpane.id + "graDiv").animate({bottom: this.agBreakdown[16]});
					$("#" + this.sliderpane.id + "marDiv").animate({bottom: this.agBreakdown[17]});
					$("#" + this.sliderpane.id + "treDiv").animate({bottom: this.agBreakdown[18]});
					// update people breakdown
					if ($("#" + this.sliderpane.id + "peopleMore").is(":visible")){
						$("#" + this.sliderpane.id + "peoplePerm").animate({height: this.agBreakdown[19]});
						$("#" + this.sliderpane.id + "ppermNum").html(this.agBreakdown[20])
						$("#" + this.sliderpane.id + "ptempNum").html(this.agBreakdown[21]);
						$("#" + this.sliderpane.id + "ppermDiv").animate({bottom: this.agBreakdown[22]});
						$("#" + this.sliderpane.id + "ptempDiv").animate({bottom: this.agBreakdown[23]});
					}
					
					
					this.resize();
					
				},
				
				showGraphics: function(){
					//create marker symbols
					this.pntSym1 = new PictureMarkerSymbol("plugins/flood_risk_explorer/images/pp.png", 20, 20);
					this.pntSym2 = new PictureMarkerSymbol("plugins/flood_risk_explorer/images/pp.png", 20, 20);
					this.pntSym3 = new PictureMarkerSymbol("plugins/flood_risk_explorer/images/pp.png", 20, 20);
					//create Graphic points
					this.pt1 = new esri.geometry.Point(-122.173983, 48.004223, new esri.SpatialReference({ 'wkid': 4326 }));  
					this.map.graphics.add(new esri.Graphic( esri.geometry.geographicToWebMercator(this.pt1), this.pntSym1, { 'title': 'I-5 North' } ));
					this.pt2 = new esri.geometry.Point(-122.165, 47.993, new esri.SpatialReference({ 'wkid': 4326 })); 
					this.map.graphics.add(new esri.Graphic( esri.geometry.geographicToWebMercator(this.pt2), this.pntSym2, { 'title': 'Spencer Island Bridge' } )); 
					this.pt3 = new esri.geometry.Point(-122.1, 47.906, new esri.SpatialReference({ 'wkid': 4326 }));
					this.map.graphics.add(new esri.Graphic( esri.geometry.geographicToWebMercator(this.pt3), this.pntSym3, { 'title': 'Harvey Airfield' } )); 
					//set font for point labels
					this.font = new Font("12pt", Font.STYLE_ITALIC, Font.VARIANT_SMALLCAPS, Font.WEIGHT_BOLD, "Arial"); 
					//create and set text symbols
					this.ts1 = new TextSymbol( "_", new Font("13pt", Font.STYLE_ITALIC, Font.VARIANT_SMALLCAPS, Font.WEIGHT_BOLD, "Arial"), new Color("#000") );
					this.map.graphics.add(new esri.Graphic(esri.geometry.geographicToWebMercator(this.pt1), this.ts1, {title: "label1"}));	
					this.ts1.setOffset(-45,10);
					this.ts1.setText("");
					this.ts2 = new TextSymbol( "_", this.font, new Color("#000") );
					this.ts2.setOffset(90,0);
					this.ts2.setText("");
					this.map.graphics.add(new esri.Graphic(esri.geometry.geographicToWebMercator(this.pt2), this.ts2, {title: "label2"}));
					this.ts3 = new TextSymbol( "_", this.font, new Color("#000") );
					this.ts3.setOffset(63,10);
					this.ts3.setText("");
					this.map.graphics.add(new esri.Graphic(esri.geometry.geographicToWebMercator(this.pt3), this.ts3, {title: "label3"}));
					this.map.graphics.refresh();	
					//mouse-over graphics behavior
					this.map.graphics.on("mouse-over", lang.hitch(this,function(evt){
						this.mouseOverG(evt)
					}));	
					//mouse-out graphics behavior
					this.map.graphics.on("mouse-out", lang.hitch(this,function(evt){
						this.mouseOutG(evt)
					}));
					//mouse-down on graphic
					this.map.graphics.on("mouse-down", lang.hitch(this,function(evt){
						this.mouseDownG(evt)
					}));
					//mouse-up on graphic
					this.map.graphics.on("mouse-up", lang.hitch(this,function(evt){
						this.mouseUpG(evt)
					}));
				},
				
				mouseOverG: function(evt){
					var g = evt.graphic.attributes.title;
						
					if (g == "I-5 North"){
						this.pntSym1.url = "plugins/flood_risk_explorer/images/pp2.png";
						this.ts1.setText(g);
					}
					if (g == "Spencer Island Bridge"){
						this.pntSym2.url = "plugins/flood_risk_explorer/images/pp2.png";
						this.ts2.setText(g);
					}
					if (g == "Harvey Airfield"){
						this.pntSym3.url = "plugins/flood_risk_explorer/images/pp2.png";
						this.ts3.setText(g);
					}
					this.map.setMapCursor("pointer");
					
					this.map.graphics.refresh();
				},
				
				mouseOutG: function(evt){
					this.map.setMapCursor("default");
					if (this.pt1 == "y"){
						this.pntSym1.url = "plugins/flood_risk_explorer/images/pp1.png";
						this.pntSym2.url = "plugins/flood_risk_explorer/images/pp.png";
						this.pntSym3.url = "plugins/flood_risk_explorer/images/pp.png";
						this.ts2.setText("");
						this.ts3.setText("");
					}
					else if (this.pt2 == "y"){
						this.pntSym1.url = "plugins/flood_risk_explorer/images/pp.png";
						this.pntSym2.url = "plugins/flood_risk_explorer/images/pp1.png";
						this.pntSym3.url = "plugins/flood_risk_explorer/images/pp.png";
						this.ts1.setText("");
						this.ts3.setText("");
					}
					else if (this.pt3 == "y"){
						this.pntSym1.url = "plugins/flood_risk_explorer/images/pp.png";
						this.pntSym2.url = "plugins/flood_risk_explorer/images/pp.png";
						this.pntSym3.url = "plugins/flood_risk_explorer/images/pp1.png";
						this.ts1.setText("");
						this.ts2.setText("");
					}
					else {
						this.pntSym1.url = "plugins/flood_risk_explorer/images/pp.png";
						this.pntSym2.url = "plugins/flood_risk_explorer/images/pp.png";
						this.pntSym3.url = "plugins/flood_risk_explorer/images/pp.png";
						this.ts1.setText("");
						this.ts2.setText("");
						this.ts3.setText("");
					}
					this.map.graphics.refresh();
				},
				
				mouseDownG: function(evt){
					g = evt.graphic.attributes.title;	
					if (g == "I-5 North"){
						this.pntSym1.url = "plugins/flood_risk_explorer/images/pp.png";
						dijit.byId(this.sliderpane.id + "i5").set('checked', true);
						this.ts1.setText(g);
						this.pt1 = "y";
						this.pt3 = "n";
						this.pt2 = "n";
						this.map.graphics.refresh();
					}
					if (g == "Spencer Island Bridge"){
						this.pntSym2.url = "plugins/flood_risk_explorer/images/pp.png";
						dijit.byId(this.sliderpane.id + "sib").set('checked', true);
						this.ts2.setText(g);
						this.pt1 = "n";
						this.pt2 = "y";
						this.pt3 = "n";
						this.map.graphics.refresh();
					}
					if (g == "Harvey Airfield"){
						this.pntSym3.url = "plugins/flood_risk_explorer/images/pp.png";
						dijit.byId(this.sliderpane.id + "hf").set('checked', true);
						this.ts3.setText(g);
						this.pt1 = "n";
						this.pt2 = "n";
						this.pt3 = "y";
						this.map.graphics.refresh();
					}
				},
				
				mouseUpG: function(evt){
					g = evt.graphic.attributes.title;
					if (g == "I-5 North"){
						this.pntSym1.url = "plugins/flood_risk_explorer/images/pp1.png";
					}
					if (g == "Spencer Island Bridge"){
						this.pntSym2.url = "plugins/flood_risk_explorer/images/pp1.png";
					}
					if (g == "Harvey Airfield"){
						this.pntSym3.url = "plugins/flood_risk_explorer/images/pp1.png";
					}
					this.map.graphics.refresh();
				},
				
				hideGraphics: function(){
					domStyle.set(this.picarea.domNode, 'display', 'none');
					dijit.byId(this.sliderpane.id + "i5").set('checked', false);
					dijit.byId(this.sliderpane.id + "sib").set('checked', false);
					dijit.byId(this.sliderpane.id + "hf").set('checked', false);
					array.forEach(this.controls[7].options, lang.hitch(this,function(option, i){
						option.selected = false;
					}));
					this.pt1 = "n";
					this.pt2 = "n";
					this.pt3 = "n";
					this.map.graphics.clear();
				},
				
				updatePhotos: function(val,group) {
					//console.log(this.controls[group].options);
					array.forEach(this.controls[group].options, lang.hitch(this,function(option, i){
						option.selected = false;
					}));
					
					this.controls[group].options[val].selected = true;
					
					this.findPics();
				},
				
				findPics: function() {
				
					clist = [];
				
					array.forEach(this.groupindex, lang.hitch(this,function(cat, cgi){
	
						ccontrol = this.controls[cat]
						
						array.forEach(ccontrol.options, lang.hitch(this,function(option, i){
							
							if (option.value == "one" || option.value == "two" || option.value == "three"){
								if (option.selected == true) {
									
									clist.push(option.value)

									if (option.value == "one"){
										this.picPre = "p1_";
										this.picPlace = "Interstate 5 North";
										this.picTemp = this.picPre + this.picName;
										this.pntSym1.setUrl("plugins/flood_risk_explorer/images/pp1.png");
										this.ts1.setText("I-5 North");
										this.pntSym2.setUrl("plugins/flood_risk_explorer/images/pp.png");
										this.ts2.setText("");
										this.pntSym3.setUrl("plugins/flood_risk_explorer/images/pp.png");
										this.ts3.setText("");
										this.pt1 = "y";
										this.pt2 = "n";
										this.pt3 = "n";
									}
									if (option.value == "two"){
										this.picPre = "p2_";
										this.picPlace = "Spencer Island Bridge";
										this.picTemp = this.picPre + this.picName;
										this.pntSym1.setUrl("plugins/flood_risk_explorer/images/pp.png");
										this.ts1.setText("");
										this.pntSym2.setUrl("plugins/flood_risk_explorer/images/pp1.png");
										this.ts2.setText("Spencer Island Bridge");
										this.pntSym3.setUrl("plugins/flood_risk_explorer/images/pp.png");
										this.ts3.setText("");
										this.pt1 = "n";
										this.pt2 = "y";
										this.pt3 = "n";
									}
									if (option.value == "three"){
										this.picPre = "p3_";
										this.picPlace = "Harvey Airfield";
										this.picTemp = this.picPre + this.picName;
										this.pntSym1.setUrl("plugins/flood_risk_explorer/images/pp.png");
										this.ts1.setText("");
										this.pntSym2.setUrl("plugins/flood_risk_explorer/images/pp.png");
										this.ts2.setText("");
										this.pntSym3.setUrl("plugins/flood_risk_explorer/images/pp1.png");
										this.ts3.setText("Harvey Airfield");
										this.pt1 = "n";
										this.pt2 = "n";
										this.pt3 = "y";
									}	
									
									this.map.graphics.refresh();
									
									if (this.picTemp == "p1_Current Flood Depth__1.jpg"){
											this.title = this.picPlace + ": 6 feet of water";
 										}
										else if (this.picTemp == "p1_Current Flood Depth__10.jpg"){
											this.title = this.picPlace + ": 0 feet of water";
										}	
										else if (this.picTemp == "p1_2040 Flood Depth__1__High.jpg"){
											this.title = this.picPlace + ": 11 feet of water";
										}
										else if (this.picTemp == "p1_2040 Flood Depth__1__Low.jpg"){
											this.title = this.picPlace + ": 5 feet of water";
										}
										else if (this.picTemp == "p1_2040 Flood Depth__10__High.jpg"){
											this.title = this.picPlace + ": 0 feet of water";
										}
										else if (this.picTemp == "p1_2040 Flood Depth__10__Low.jpg"){
											this.title = this.picPlace + ": 0 feet of water";
										}
										else if (this.picTemp == "p1_2080 Flood Depth__1__High.jpg"){
											this.title = this.picPlace + ": 12 feet of water";
										}
										else if (this.picTemp == "p1_2080 Flood Depth__1__Low.jpg"){
											this.title = this.picPlace + ": 8 feet of water";
										}
										else if (this.picTemp == "p1_2080 Flood Depth__10__High.jpg"){
											this.title = this.picPlace + ": 8 feet of water";
										}
										else if (this.picTemp == "p1_2080 Flood Depth__10__Low.jpg"){
											this.title = this.picPlace + ": 0 feet of water";
										}
										else if (this.picTemp == "p2_Current Flood Depth__1.jpg"){
											this.title = this.picPlace + ": 12 feet of water";
 										}
										else if (this.picTemp == "p2_Current Flood Depth__10.jpg"){
											this.title = this.picPlace + ": 4 feet of water";
 										}
										else if (this.picTemp == "p2_2040 Flood Depth__1__High.jpg"){
											this.title = this.picPlace + ": 17 feet of water";
										}
										else if (this.picTemp == "p2_2040 Flood Depth__1__Low.jpg"){
											this.title = this.picPlace + ": 12 feet of water";
										}
										else if (this.picTemp == "p2_2040 Flood Depth__10__High.jpg"){
											this.title = this.picPlace + ": 6 feet of water";
										}
										else if (this.picTemp == "p2_2040 Flood Depth__10__Low.jpg"){
											this.title = this.picPlace + ": 4 feet of water";
										}
										else if (this.picTemp == "p2_2080 Flood Depth__1__High.jpg"){
											this.title = this.picPlace + ": 17.5 feet of water";
										}
										else if (this.picTemp == "p2_2080 Flood Depth__1__Low.jpg"){
											this.title = this.picPlace + ": 13.5 feet of water";
										}
										else if (this.picTemp == "p2_2080 Flood Depth__10__High.jpg"){
											this.title = this.picPlace + ": 12.5 feet of water";
										}
										else if (this.picTemp == "p2_2080 Flood Depth__10__Low.jpg"){
											this.title = this.picPlace + ": 6 feet of water";
										}
										else if (this.picTemp == "p3_Current Flood Depth__1.jpg"){
											this.title = this.picPlace + ": 9 feet of water";
 										}
										else if (this.picTemp == "p3_Current Flood Depth__10.jpg"){
											this.title = this.picPlace + ": 6 feet of water";
 										}
										else if (this.picTemp == "p3_2040 Flood Depth__1__High.jpg"){
											this.title = this.picPlace + ": 11.5 feet of water";
										}
										else if (this.picTemp == "p3_2040 Flood Depth__1__Low.jpg"){
											this.title = this.picPlace + ": 9 feet of water";
										}
										else if (this.picTemp == "p3_2040 Flood Depth__10__High.jpg"){
											this.title = this.picPlace + ": 8.5 feet of water";
										}
										else if (this.picTemp == "p3_2040 Flood Depth__10__Low.jpg"){
											this.title = this.picPlace + ": 6.5 feet of water";
										}
										else if (this.picTemp == "p3_2080 Flood Depth__1__High.jpg"){
											this.title = this.picPlace + ": 12 feet of water";
										}
										else if (this.picTemp == "p3_2080 Flood Depth__1__Low.jpg"){
											this.title = this.picPlace + ": 9.5 feet of water";
										}
										else if (this.picTemp == "p3_2080 Flood Depth__10__High.jpg"){
											this.title = this.picPlace + ": 9 feet of water";
										}
										else if (this.picTemp == "p3_2080 Flood Depth__10__Low.jpg"){
											this.title = this.picPlace + ": 7.5 feet of water";
										}
										else{
											this.title = this.picPlace
										}		

									
									pics = "<div id='" + this.sliderpane.id + "picHeader' style='background-color:#424542; color:#fff; height:35px; font-size:1.15em; font-weight:bold; padding:8px 0px 0px 10px; cursor:move;'>" + 
									this.title + "</div><img style='display:none; height:300px; width:400px; padding: 5px;' id='" + this.sliderpane.id + "floodpic' src=''>"
									domStyle.set(this.picarea.domNode, 'display', '');
									this.picareacontent.innerHTML = pics;
									$('#' + this.sliderpane.id + 'floodpic').attr("src", this.picPath + this.picPre + this.picName);
									$('#' + this.sliderpane.id + 'floodpic').show();	
									var p = new ConstrainedMoveable(
										dom.byId(this.picarea.id), {
										handle: dom.byId(this.sliderpane.id + "picHeader"),	
										within: true
									});
								}
							}
						}));						
																	
					}));
					
				},
				
				updateUnique: function(val,group) {
			   
					array.forEach(this.controls[group].options, lang.hitch(this,function(option, i){
			   
						option.selected = false;
			   
					}));

					this.controls[group].options[val].selected = true;
					
					this.findInvalids();
					
					this.updateMap();
					
					
				},
				
				
				findInvalids: function() {
				
				
					clist = [];
				
					array.forEach(this.groupindex, lang.hitch(this,function(cat, cgi){
						
						ccontrol = this.controls[cat]
						
						okvals = [];
						
						needtoChange = false;
						
						array.forEach(ccontrol.options, lang.hitch(this,function(option, i){
			   
							if (option.selected == true) {
							
								clist.push(option.value)
								
								if (option.value == "Current Flood Depth"){
									$('#' + this.sliderpane.id + 'climate').slideUp();
									$('#' + this.sliderpane.id + 'hclimate').slideUp();
									$('#' + this.sliderpane.id + 'himpacts').css("margin-top","-15px");
									$('#' + this.sliderpane.id + 'hphotos').html("<b>4. View flood depth photos: " + this.infoPic + "</b>");
									$('#' + this.sliderpane.id + 'himpacts').html("<b>3. Impacts: " + this.infoPic + "</b>");
									$('#' + this.sliderpane.id + 'agAcres').animate({top: "235px"},500);
									$('#' + this.sliderpane.id + 'peopleDis').animate({top: "295px"},500);
								} 
								if (option.value == "2040 Flood Depth" || option.value == "2080 Flood Depth"){
									$('#' + this.sliderpane.id + 'climate').slideDown();
									$('#' + this.sliderpane.id + 'hclimate').slideDown();
									$('#' + this.sliderpane.id + 'himpacts').css("margin-top","0px");
									$('#' + this.sliderpane.id + 'hphotos').html("<b>5. View flood depth photos: " + this.infoPic + "</b>");
									$('#' + this.sliderpane.id + 'himpacts').html("<b>4. Impacts: " + this.infoPic + "</b>");
									$('#' + this.sliderpane.id + 'agAcres').animate({top: "295px"},500);
									$('#' + this.sliderpane.id + 'peopleDis').animate({top: "355px"},500);
								}
								
							}
							

							tlist = clist.slice(0,cgi);
							tlist.push(option.value);
							
							checker = tlist.join("__");
							
							enabled = false
							
							for (key in this.layerlist) {
							
								n = key.indexOf(checker);
							
								if (n==0) {
								
									enabled = true;
								
								}
							
							}
							
							option.enabled = enabled;
							
							cdom = dom.byId(this.sliderpane.id + "_lvoption_" + cat + "_" + i)
							
						/*	if (enabled) {
								domStyle.set(cdom,"color","#000");
								
								okvals.push(i);
							} else {
								domStyle.set(cdom,"color","#bbb");
								
							}
						*/	
							if ((enabled == false) && (option.selected == true)) {
							
								needtoChange = true;
							
							} 
							
						}));						
						
						if ((needtoChange == true) && (okvals.length > 0)) {
						
							if (ccontrol.control == "slider") {
							
								cwidget = registry.byId(this.sliderpane.id + "_slider_" + cat)
								cwidget.set('value',okvals[0]);
							
							} else {
							
								//cwidgets = registry.findWidgets(ccontrol.node)
							
								cwidget = registry.byId(this.sliderpane.id + "_radio_" + cat + "_" + okvals[0])
							
								cwidget.set('value',true);
							
							}
						
						//alert('changeit');
						
						}
					
						
							
					}));
				
					
				
				},
				
				zoomToActive: function() {
				
					this.map.setExtent(this.currentLayer.fullExtent, true);				
				
				},
				
				changeOpacity: function(e) {
					
					this.currentLayer.setOpacity(1 - e)
				
				},
				
				render: function() {
					
					mymap = dom.byId(this.map.id);
					
					a = dojoquery(mymap).parent();
					b = makeid();
					
					this.picarea = new ContentPane({
					  id: b,
					  style:"z-index:8; position:absolute; right:105px; top:60px; width:410px; height:346px; background-color:#FFF; border-style:solid; border-width:4px; border-color:#444; border-radius:5px; display: none;",
					  innerHTML: "<div class='picareacloser' style='float:right !important;'><a href='#' style='color:#cecfce'>✖</a></div><div class='picareacontent'>no content yet</div>"
					});
					
					dom.byId(a[0]).appendChild(this.picarea.domNode)
					
					pa = dojoquery(this.picarea.domNode).children(".picareacloser");
					this.picAreaCloser = pa[0];

					pac = dojoquery(this.picarea.domNode).children(".picareacontent");
					this.picareacontent = pac[0];
					
					on(this.picAreaCloser, "click", lang.hitch(this,function(e){
						//dijit.byId(this.cbcontrol.id).set('checked', false);
						domStyle.set(this.picarea.domNode, 'display', 'none');
						dijit.byId(this.sliderpane.id + "i5").set('checked', false);
						dijit.byId(this.sliderpane.id + "sib").set('checked', false);
						dijit.byId(this.sliderpane.id + "hf").set('checked', false);
						console.log(this.controls)
						array.forEach(this.controls[9].options, lang.hitch(this,function(option, i){
							option.selected = false;
						}));
						
						this.pt1 = "n";
						this.pt2 = "n";
						this.pt3 = "n";
						
						this.pntSym1.url = "plugins/flood_risk_explorer/images/pp.png";
						this.pntSym2.url = "plugins/flood_risk_explorer/images/pp.png";
						this.pntSym3.url = "plugins/flood_risk_explorer/images/pp.png";
						this.ts1.setText("");
						this.ts2.setText("");
						this.ts3.setText("");
						this.map.graphics.refresh();
						//$('#' + this.sliderpane.id + 'ppDiv').slideUp();
					}));
					
					
					
					
				/*	new ConstrainedMoveable(
						document.getElementById("dijit_layout_ContentPane_2"), {
					//	handle: $(".picareacontent")[0],
					//	within: true
					});
				*/	
					this.infoarea = new ContentPane({
					  style:"z-index:10000; !important;position:absolute !important;left:320px !important;top:65px !important;width:350px !important;background-color:#FFF !important;padding:10px !important;border-style:solid;border-width:4px;border-color:#444;border-radius:5px;display: none",
					  innerHTML: "<div class='infoareacloser' style='float:right !important'><a href='#'>✖</a></div><div class='infoareacontent' style='padding-top:0px'>no content yet</div>"
					});
					
					dom.byId(a[0]).appendChild(this.infoarea.domNode)
										
					ina = dojoquery(this.infoarea.domNode).children(".infoareacloser");
					this.infoAreaCloser = ina[0];

					inac = dojoquery(this.infoarea.domNode).children(".infoareacontent");
					this.infoareacontent = inac[0];
					
					on(this.infoAreaCloser, "click", lang.hitch(this,function(e){
						domStyle.set(this.infoarea.domNode, 'display', 'none');
					}));
					
					this.sliderpane = new ContentPane({
					  //style:"height:" + this.sph + "px !important"
					});
					
					parser.parse();
					
					dom.byId(this.container).appendChild(this.sliderpane.domNode);
					
					this.buttonpane = new ContentPane({
					  style:"border-top-style:groove !important; height:80px;overflow: hidden !important;background-color:#F3F3F3 !important;padding:10px !important;"
					});
					
					dom.byId(this.container).appendChild(this.buttonpane.domNode);	

					if (this.layerVizObject.methods != undefined) {
						methodsButton = new Button({
							label: "Methods",
							style:  "float:right !important; margin-right:-7px !important; margin-top:-7px !important;",
							onClick: lang.hitch(this,function(){window.open(this.layerVizObject.methods)})  //function(){window.open(this.layerVizObject.methods)}
							});	
						this.buttonpane.domNode.appendChild(methodsButton.domNode);
					}					
					
							
							nslidernodetitle = domConstruct.create("span", {innerHTML: " Layer Properties: "});
							this.buttonpane.domNode.appendChild(nslidernodetitle);
							/*
							zoombutton = domConstruct.create("a", {class: "pluginLayer-extent-zoom", href: "#", title: "Zoom to Extent"});
							this.buttonpane.domNode.appendChild(zoombutton);
							on(zoombutton, "click", lang.hitch(this, this.zoomToActive));
							*/
							nslidernode = domConstruct.create("div");
							this.buttonpane.domNode.appendChild(nslidernode); 
							
							labelsnode = domConstruct.create("ol", {"data-dojo-type":"dijit/form/HorizontalRuleLabels", container:"bottomDecoration", style:"height:0.25em;padding-top: 10px !important;color:black !important", innerHTML: "<li>Opaque</li><li>Transparent</li>"})
							nslidernode.appendChild(labelsnode);
							
							slider = new HorizontalSlider({
								value: 0,
								minimum: 0,
								maximum: 1,
								showButtons:false,
								title: "Change the layer transparency",
								//intermediateChanges: true,
								//discreteValues: entry.options.length,
								onChange: lang.hitch(this,this.changeOpacity),
								style: "width:150px;margin-top:10px;margin-bottom:20px;margin-left:20px; background-color:#F3F3F3 !important"
							}, nslidernode);
							
							parser.parse()
					
					
					array.forEach(this.controls, lang.hitch(this,function(entry, groupid){
						
						this.infoPic = "<a style='color:black;' href='#' title='" + 'Click for more information.' + "'><img src='data:image/png;base64,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'></a>"
										
						if (entry.type == "header") {
							if (entry.name =="hclimate"){
								nslidernodeheader = domConstruct.create("div", {id: this.sliderpane.id + entry.name, style:"margin-top:0px;margin-bottom:10px;display:none;", innerHTML: "<b>" + entry.text + ": " + this.infoPic + "</b>"});
							}else{
								nslidernodeheader = domConstruct.create("div", {id: this.sliderpane.id + entry.name, style:"margin-top:0px;margin-bottom:10px;", innerHTML: "<b>" + entry.text + ": " + this.infoPic + "</b>"});
							}
							
										
							on(nslidernodeheader, "click", lang.hitch(this,function(e){
								domStyle.set(this.infoarea.domNode, 'display', '');
								this.infoareacontent.innerHTML = entry.help;
							}));
									
							this.sliderpane.domNode.appendChild(nslidernodeheader);	
							
						} 
						
						if (entry.type == "text") {

							nslidernodeheader = domConstruct.create("div", {style:"margin-top:10px;margin-bottom:10px", innerHTML: entry.text});
							this.sliderpane.domNode.appendChild(nslidernodeheader);	
							
						} 
						
						
						if (entry.type == "group") {		
						
							if ( entry.control == "radio" ) {
								
								if (entry.name == "climate"){
								ncontrolsnode = domConstruct.create("div", {id: this.sliderpane.id + entry.name, style:"display:none"});
								}else{
								ncontrolsnode = domConstruct.create("div", {id: this.sliderpane.id + entry.name});
								}
								this.sliderpane.domNode.appendChild(ncontrolsnode);
							   
								if (entry.title != undefined) {
									ncontrolsnodetitle = domConstruct.create("div", {innerHTML: entry.title});
									ncontrolsnode.appendChild(ncontrolsnodetitle);
								}
								
								array.forEach(entry.options, lang.hitch(this,function(option, i){
									rorc = RadioButton;
									ncontrolnode = domConstruct.create("div", {style:"float:left;"});
									ncontrolsnode.appendChild(ncontrolnode); 
									parser.parse();
								
									ncontrol = new rorc({
										name: this.map.id + groupid,
										id: this.sliderpane.id + "_radio_" + groupid + "_" + i,
										value: option.value,
										index: this.map.id + groupid,
										title: option.text,
										checked: option.selected,
										onClick: lang.hitch(this,function(e) { 
											if(e) {
												this.updateUnique(i, groupid);
												this.updatePhotos(i, groupid);
											}
										})
									}, ncontrolnode);

									if (option.help != undefined) {
										nslidernodeheader = domConstruct.create("div", {style:"display:inline;padding-top:3px;margin-right:12px;", innerHTML: "<span style='color:#000' id='" + this.sliderpane.id + "_lvoption_" + groupid + "_" + i + "'>" + " " + option.text + "  " + this.infoPic + "</span>"});
									} else {
										nslidernodeheader = domConstruct.create("div", {style:"display:inline;margin-right:12px;", innerHTML: "<span style='color:#000' id='" + this.sliderpane.id + "_lvoption_" + groupid + "_" + i + "'> " + option.text + "</span>"});									
									}
																
									on(nslidernodeheader, "click", lang.hitch(this,function(e){
										domStyle.set(this.infoarea.domNode, 'display', '');
										this.infoareacontent.innerHTML = option.help;
									}));
									
									ncontrolsnode.appendChild(nslidernodeheader);
									parser.parse()	
								})); 
							}
							
							if ( entry.control == "radioPhotos" ) {
									/*cb = CheckBox;
									cbcontrolnode = domConstruct.create("div");
									ncontrolsnode.appendChild(cbcontrolnode); 
									parser.parse();
									
									this.cbcontrol = new cb({
										name: "photoCheckBox",
										value: "selected",
										id: this.sliderpane.id + "_pcb",
										checked: false,
										onClick: lang.hitch(this,function(e) { 
											if(e.target.checked === true) {
												$('#' + this.sliderpane.id + 'ppDiv').slideDown();
												this.showGraphics();
											} else{
												$('#' + this.sliderpane.id + 'ppDiv').slideUp();
												this.hideGraphics();
											}
										})
									}, cbcontrolnode);
									
									cblabel = domConstruct.create("div", {style:"display:inline;padding-left:2px;padding-top:3px;margin-right:12px;", innerHTML: "Show photo points: <br>"});
									
									on(cblabel, "click", lang.hitch(this,function(e){
											domStyle.set(this.infoarea.domNode, 'display', '');
											this.infoareacontent.innerHTML = entry.help;
									}));
									
									ncontrolsnode.appendChild(cblabel);
									*/
									ncontrolnode = domConstruct.create("div");
									ncontrolsnode.appendChild(ncontrolnode); 
									parser.parse();
									
									parentnode = domConstruct.create("div", {id:this.sliderpane.id + "ppDiv", style:"margin-top:5px"});
									ncontrolsnode.appendChild(parentnode); 
									parser.parse();
									
									array.forEach(entry.options, lang.hitch(this,function(option, i){
										rorc = RadioButton;
										ncontrolnode = domConstruct.create("div");
										parentnode.appendChild(ncontrolnode); 
										parser.parse();
								
										ncontrol = new rorc({
											name: this.map.id + "_" + groupid,
											id: this.sliderpane.id + option.id,
											value: option.value,
											index: this.map.id + "_" + groupid,
											title: option.text,
											checked: option.selected,
											onChange: lang.hitch(this,function(e) { 
												if(e) {
													this.updatePhotos(i, groupid)
												}
											})
										}, ncontrolnode);
										
									//	app.spid = this.sliderpane.id
										
									//	if (option.help != undefined) {
											nslidernodeheader = domConstruct.create("div", {style:"display:inline;padding-top:3px;margin-right:12px;", innerHTML: "<span style='color:#000;' id='" + this.sliderpane.id + "_lvoption_" + groupid + "_" + i + "'>" + " " + option.text + "</span><br>"});
									//	} else {
									//		nslidernodeheader = domConstruct.create("div", {style:"display:inline-block;margin-right:12px;", innerHTML: "<span style='color:#000' id='" + this.sliderpane.id + "_lvoption_" + groupid + "_" + i + "'> " + option.text + "</span><br>"});									
									//	}
									
										parentnode.appendChild(nslidernodeheader);
									
										parser.parse()	
									})); 
							
							}	
							
							nslidernodeheader = domConstruct.create("br");
							this.sliderpane.domNode.appendChild(nslidernodeheader);
							
						}					
						
						
						ncontrolsnode = domConstruct.create("div");
						this.sliderpane.domNode.appendChild(ncontrolsnode);
						if (entry.title != undefined) {
							ncontrolsnodetitle = domConstruct.create("div", {innerHTML: entry.title});
							ncontrolsnode.appendChild(ncontrolsnodetitle);
						}
								
						
						if (entry.type == "bars") {
							
							this.his10 = entry.his10;
							this.his100 = entry.his100;
							this.f2040_10L = entry.f2040_10L;
							this.f2040_10H = entry.f2040_10H;
							this.f2040_100L = entry.f2040_100L;
							this.f2040_100H = entry.f2040_100H;
							this.f2080_10L = entry.f2080_10L;
							this.f2080_10H = entry.f2080_10H;
							this.f2080_100L = entry.f2080_100L;
							this.f2080_100H = entry.f2080_100H;
							
							html = 	'<div id="'+ this.sliderpane.id +'lossTitle" style="margin-bottom:2px;">Total Estimated Loss ($M)</div>' + 
									'<div style="width:200px; height:15px; margin-bottom:-7px;" class="bars" id="' + this.sliderpane.id + 'lossBar"></div>' +
									'<img style="margin-left:0px;" src="plugins/flood_risk_explorer/ticks_6.png" alt="ticks below bar">' +
									'<div class="tickLabels"><span>0</span><span style="margin-left:28px">50</span><span style="margin-left:24px">100</span><span style="margin-left:22px">150</span><span style="margin-left:21px">200</span><span style="margin-left:15px">250</span></div>' +
									'<div style="margin-bottom:2px; margin-top:10px"><span id="'+ this.sliderpane.id +'acresTitle">Ag Acres Flooded (1,000s)</span><span id="'+ this.sliderpane.id +'acresMore" style="color:blue; font-weight:bold; cursor:pointer;"> - More</span></div>' +
									'<div style="width:200px; height:15px; margin-bottom:-7px;" class="bars" id="' + this.sliderpane.id + 'acresBar"></div>' +
									'<img style="margin-left:0px;" src="plugins/flood_risk_explorer/ticks_4.png" alt="ticks below bar">' +
									'<div class="tickLabels"><span>0</span><span style="margin-left:54px">10</span><span style="margin-left:55px">20</span><span style="margin-left:47px">30</span></div>' +
									'<div style="margin-bottom:2px; margin-top:10px"><span id="'+ this.sliderpane.id +'peopleTitle"># People Displaced (1,000s)</span><span id="'+ this.sliderpane.id +'peopleMore" style="color:blue; font-weight:bold; cursor:pointer;"> - More</span></div> ' +
									'<div style="width:200px; height:15px; margin-bottom:-7px;" class="bars" id="' + this.sliderpane.id + 'peopleBar"></div>' +
									'<img style="margin-left:0px;" src="plugins/flood_risk_explorer/ticks_4.png" alt="ticks below bar">' +
									'<div style="margin-bottom:10px" class="tickLabels"><span>0</span><span style="margin-left:57px">1</span><span style="margin-left:60px">2</span><span style="margin-left:59px">3</span></div>' 

							nslidernodeheader = domConstruct.create("div", {style:"margin-top:10px;margin-bottom:10px", innerHTML: html});
							this.sliderpane.domNode.appendChild(nslidernodeheader);	
							
							$("#" + this.sliderpane.id + "lossBar, #" + this.sliderpane.id + "acresBar, #" + this.sliderpane.id + "peopleBar").progressbar({
								value: 0.0001
							});
							$("#" + this.sliderpane.id + "lossBar").css({ 'background': '#ecefde', '-moz-box-shadow': '3px 3px 5px #888', '-webkit-box-shadow': '3px 3px 5px #888', 'box-shadow': '3px 3px 5px #888', 'border': '1px solid #424542' });
							$("#" + this.sliderpane.id + "lossBar > div").css({ 'background': '#c8841d', 'border': '1px solid #424542' });
							$("#" + this.sliderpane.id + "acresBar").css({ 'background': '#ecefde', '-moz-box-shadow': '3px 3px 5px #888', '-webkit-box-shadow': '3px 3px 5px #888', 'box-shadow': '3px 3px 5px #888', 'border': '1px solid #424542' });
							$("#" + this.sliderpane.id + "acresBar > div").css({ 'background': '#408cb4', 'border': '1px solid #424542' });
							$("#" + this.sliderpane.id + "peopleBar").css({ 'background': '#ecefde', '-moz-box-shadow': '3px 3px 5px #888', '-webkit-box-shadow': '3px 3px 5px #888', 'box-shadow': '3px 3px 5px #888', 'border': '1px solid #424542' });
							$("#" + this.sliderpane.id + "peopleBar > div").css({ 'background': '#8fb440', 'border': '1px solid #424542' });
							
							//remove corners from all
							$(".bars, .bars > div").removeClass('ui-corner-all');
							$(".bars > div").removeClass('ui-corner-left');
							
							$("#" + this.sliderpane.id + "lossBar > .ui-progressbar-value").animate({width: this.his10[0]}, 500);
							$("#" + this.sliderpane.id + "acresBar > .ui-progressbar-value").animate({width: this.his10[1]}, 500);
							$("#" + this.sliderpane.id + "peopleBar > .ui-progressbar-value").animate({width: this.his10[2]}, 500);
							$("#" + this.sliderpane.id + "lossTitle").html(this.his10[3]);
							$("#" + this.sliderpane.id + "acresTitle").html(this.his10[4]);
							$("#" + this.sliderpane.id + "peopleTitle").html(this.his10[5]);
							
							//ag acres breakdown box
							this.his10bd = entry.his10bd;
							this.his100bd = entry.his100bd;
							this.f2040_10Lbd = entry.f2040_10Lbd;
							this.f2040_10Hbd = entry.f2040_10Hbd;
							this.f2040_100Lbd = entry.f2040_100Lbd;
							this.f2040_100Hbd = entry.f2040_100Hbd;
							this.f2080_10Lbd = entry.f2080_10Lbd;
							this.f2080_10Hbd = entry.f2080_10Hbd;
							this.f2080_100Lbd = entry.f2080_100Lbd;
							this.f2080_100Hbd = entry.f2080_100Hbd;
							
							acresHtml = '<div class="acresMainBar">' +
											'<span class="acreBars" id="' + this.sliderpane.id + 'fallow" style="top:2px; left:2px; overflow:hidden; text-indent:-30px; background-color:#e0f3db;">' +
												'<em class="acreBars" id="' + this.sliderpane.id + 'forage" style="background-color:#a8ddb5; border-top:1px solid #424542;"></em>' +
												'<em class="acreBars" id="' + this.sliderpane.id + 'grainSeed" style="background-color:#7bccc4; border-top:1px solid #424542;"></em>' +
												'<em class="acreBars" id="' + this.sliderpane.id + 'marketCrops" style="background-color:#43a2ca; border-top:1px solid #424542;"></em>' +
												'<em class="acreBars" id="' + this.sliderpane.id + 'treeFarm" style="background-color:#0868ac; border-top:1px solid #424542;"></em>' +
											'</span>' +
										'</div>' +
										'<div id="' + this.sliderpane.id + 'acresMax" style="margin-left:5px; margin-top:5px;"><b>Breakdown of Inundated Acres</b> <span id="' + this.sliderpane.id + 'acresMaxNum" style="display:none; font-weight:bold">14,987</span></div>' +
										'<div id="'+ this.sliderpane.id +'acresLess" style="position:absolute; top:5px; right:5px; color:blue; font-weight:bold; cursor:pointer;">Hide</div>' +
										'<div id="' + this.sliderpane.id + 'acresLabel" style="position:absolute; top:27px; left:27px; height:200px; width:250px;">' + 
											'<div id="' + this.sliderpane.id + 'falDiv" style="position:absolute; bottom:90%;">- <span id="' + this.sliderpane.id + 'fallowAcres" style="font-weight:bold"></span> Acres Fallow</div>' +
											'<div id="' + this.sliderpane.id + 'forDiv" style="position:absolute; bottom: 55%;">- <span id="' + this.sliderpane.id + 'forageAcres" style="font-weight:bold"></span> Acres Forage/Pasture</div>' + 
											'<div id="' + this.sliderpane.id + 'graDiv" style="position:absolute; bottom: 25%;">- <span id="' + this.sliderpane.id + 'grainAcres" style="font-weight:bold"></span> Acres Grain or Seed Crop</div>' +
 											'<div id="' + this.sliderpane.id + 'marDiv" style="position:absolute; bottom: 18%;">- <span id="' + this.sliderpane.id + 'marketAcres" style="font-weight:bold"></span> Acres Market Crops/Produce</div>' +
											'<div id="' + this.sliderpane.id + 'treDiv" style="position:absolute; bottom: 5%;">- <span id="' + this.sliderpane.id + 'treeAcres" style="font-weight:bold"></span> Acres Tree Farm/Nursery</div>' +
										'</div>'
							
							acresbdBox = domConstruct.create("div", {id: this.sliderpane.id + "agAcres", class: "agAcres", 
								innerHTML: acresHtml});
							this.sliderpane.domNode.appendChild(acresbdBox);	
							
							$('#' + this.sliderpane.id + 'forage').css({bottom : "31%", height: "56%"});
							$('#' + this.sliderpane.id + 'grainSeed').css({bottom : "27%", height: "4%"});   
							$('#' + this.sliderpane.id + 'marketCrops').css({bottom : "17%", height: "10%"});
							$('#' + this.sliderpane.id + 'treeFarm').css({bottom : "0%", height: "17%"});
							
							$('#' + this.sliderpane.id + 'acresMaxNum').html("14,987")
							$('#' + this.sliderpane.id + 'fallowAcres').html("1,788");
							$('#' + this.sliderpane.id + 'forageAcres').html("8,428");
							$('#' + this.sliderpane.id + 'grainAcres').html("653");
							$('#' + this.sliderpane.id + 'marketAcres').html("1,566");
							$('#' + this.sliderpane.id + 'treeAcres').html("2,552");
							
							var showAcres = dojo.byId(this.sliderpane.id + 'acresMore');
							dojo.connect(showAcres, "onclick", lang.hitch(this,function() {
								if ($("#" + this.sliderpane.id + "agAcres").is(":hidden")){
									$("#" + this.sliderpane.id + "agAcres").animate({width:'toggle'},500);
								}
								if ($("#" + this.sliderpane.id + "peopleDis").is(":visible")){
									$("#" + this.sliderpane.id + "peopleDis").animate({width:'toggle'},500);
								}
							}));
							var hideAcres = dojo.byId(this.sliderpane.id + 'acresLess');
							dojo.connect(hideAcres, "onclick", lang.hitch(this,function() {
								$("#" + this.sliderpane.id + "agAcres").animate({width:'toggle'}, 500)
							}));
							
							// displaced people breakdown box
							peopleHtml = '<div class="peopleMainBar">' +
											'<span class="peopleBars" id="' + this.sliderpane.id + 'peopleTemp" style="top:2px; left:2px; overflow:hidden; text-indent:-30px; background-color:#d9f0a3;">' +
												'<em class="peopleBars" id="' + this.sliderpane.id + 'peoplePerm" style="background-color:#78c679; border-top:1px solid #424542;"></em>' +
											'</span>' +
										'</div>' +
										'<div id="' + this.sliderpane.id + 'peopleMax" style="margin-left:5px; margin-top:5px;"><b>Breakdown of Displaced People</b></div>' +
										'<div id="'+ this.sliderpane.id +'peopleLess" style="position:absolute; top:5px; right:5px; color:blue; font-weight:bold; cursor:pointer;">Hide</div>' +
										'<div id="' + this.sliderpane.id + 'peopleLabel" style="position:absolute; top:27px; left:27px; height:130px; width:250px;">' + 
											'<div id="' + this.sliderpane.id + 'ptempDiv" style="position:absolute; bottom:65%;">- <span id="' + this.sliderpane.id + 'ptempNum" style="font-weight:bold"></span> People <b>Less Likely</b> To Need<br><span style="margin-left:8px">Temporary Public Shelter</span></div>' +
											'<div id="' + this.sliderpane.id + 'ppermDiv" style="position:absolute; bottom:15%;">- <span id="' + this.sliderpane.id + 'ppermNum" style="font-weight:bold"></span> People <b>Likely</b> To Need<br><span style="margin-left:8px">Temporary Public Shelter</span></div>' + 
										'</div>'
										
							peoplebdBox = domConstruct.create("div", {id: this.sliderpane.id + "peopleDis", class: "peopleDis", 
								innerHTML: peopleHtml});
							this.sliderpane.domNode.appendChild(peoplebdBox);	

							$('#' + this.sliderpane.id + 'peoplePerm').css({bottom : "0%", height: "57%"});		
							
							$('#' + this.sliderpane.id + 'ptempNum').html("1,298");
							$('#' + this.sliderpane.id + 'ppermNum').html("1,702");
							
							var showPeople = dojo.byId(this.sliderpane.id + 'peopleMore');
							dojo.connect(showPeople, "onclick", lang.hitch(this,function() {
								if ($("#" + this.sliderpane.id + "peopleDis").is(":hidden")){
									$("#" + this.sliderpane.id + "peopleDis").animate({width:'toggle'},500);
								}
								if ($("#" + this.sliderpane.id + "agAcres").is(":visible")){
									$("#" + this.sliderpane.id + "agAcres").animate({width:'toggle'},500);
								}
							}));
							var hidePeople = dojo.byId(this.sliderpane.id + 'peopleLess');
							dojo.connect(hidePeople, "onclick", lang.hitch(this,function() {
								$("#" + this.sliderpane.id + "peopleDis").animate({width:'toggle'}, 500)
							}));
						}
					}));
					
					this.showGraphics();
					this.currentLayer = new ArcGISDynamicMapServiceLayer(this.layerVizObject.url);
					
					this.map.addLayer(this.currentLayer);
					
					dojo.connect(this.currentLayer, "onLoad", lang.hitch(this,function(e){
					
											this.findInvalids();
											this.map.setExtent(this.currentLayer.fullExtent, true);
											this.updateMap();
											
											//alert(this.currentLayer.name)
											
											}));


					this.resize();
				
				},

			   
	//		   identify: function(point, screenPoint, processResults) {
							

						
	//		   },
				
			   showHelp: function () {
			   
									helpDialog = new Dialog({
									
										title: "My Dialog",
										content: "Test content.",
										style: "width: 300px"
									
									});	

									helpDialog.show();
									
			   },
				
               getState: function () { 
			   			   
				state = this.controls;
			   
				return state;
	
			   
				},
				
				
               setState: function (state) { 
				
				this.controls = state;
				
				this.render();
				
				
				},
           });
       });
	   
function makeid(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}	   
