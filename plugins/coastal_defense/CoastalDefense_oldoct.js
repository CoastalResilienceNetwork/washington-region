//Module CoastalDefense.js

define([
	    "dojo/_base/declare",
		"use!underscore", 	
	    "dojo/json", 
		"use!tv4", 
		"dojo/store/Memory", 
		"dijit/form/ComboBox", 
		"jquery", 
		"jquery_ui",
		"dijit/form/Button",
		"dijit/form/DropDownButton",
		"dijit/DropDownMenu", 
		"dijit/MenuItem",
		"dijit/Menu",
		"dijit/layout/ContentPane",
		"dijit/layout/TabContainer",
		"dijit/Tooltip",
		"dijit/TooltipDialog",
		"dijit/Dialog",
		"dijit/popup",
		"dojo/on",
		"dojo/_base/array",
		"dojo/_base/lang",
		"dojo/dom",
		"dojo/dom-class",
		"dojo/dom-style",
		"dojo/_base/window",
		"dojo/dom-construct",
		"dojo/dom-geometry",
		"dijit/form/RadioButton",
		"dojo/parser",
		"dijit/form/NumberTextBox",
		"dijit/registry",
		"dijit/layout/BorderContainer",
		"dojox/layout/TableContainer",
		"dijit/TitlePane",
		"dijit/form/CheckBox",
		"dijit/form/HorizontalSlider",
		"dojox/form/RangeSlider",
	   	"dojox/charting/Chart",
		"dojox/charting/axis2d/Default",
		"dojox/charting/plot2d/Lines",
		"dojox/charting/plot2d/Areas",
		"dojox/charting/widget/Legend",
	     "dojox/charting/themes/Claro",
		 "dojo/number",

		//"esri/request",
		"esri/layers/FeatureLayer"
		], 


	function (declare,
			_, 
			//Ext,
			JSON, 
			tv4, 
			Memory, 
			ComboBox, 
			$, 
			ui,
			Button,
			DropDownButton, 
			DropDownMenu, 
			MenuItem,
			Menu,
			ContentPane,
			TabContainer,
			Tooltip,
			TooltipDialog,
			Dialog,
			popup,
			on,
			array,
			lang,
			dom,
			domClass,
			domStyle,
			win,
			domConstruct,
			domGeom,
			RadioButton,
			parser,
			NumberTextBox,
			registry,
			BorderContainer,
			TableContainer,
			TitlePane,
			CheckBox,
			HorizontalSlider,
			RangeSlider,
			Chart,
			Default,
			Lines,
			Areas,
			Legend,
			theme,
			number,
			//ESRIRequest,
			FeatureLayer
		  ) 
		
		{
		
		
		
		var cdTool = function(container, map, app, configFile){
			
	    	_map = map;
			_app = app;
			_container = container;
			
			
			var self = this;
			//console.log(this);	
			this.parameters = {};
			
			this.toolUnits = {
				
				feet: {	
					multiplier: 3.281,
					unitText: '(ft)',
					unitTextFull: 'Feet'
				},
				
				meters: {	
					multiplier: 1,
					unitText: '(m)',
					unitTextFull: 'Meters'
				},
				
				
			
			}
			
			this.parameters.windowOpen = false;
			
			//console.log(this);	
			
			this.initialize = function(){
				
				this.parameters.windowOpen = true;
				
				
				_data = this.parseConfigData(configFile);
			
				//console.log(this);
				this.showIntro(this);
				
				this.parameters.layersLoaded = false;
				
				//this.addLaodingDiv();
				
				//console.log(_data);
				
				
			}
			
			this.showIntro = function(){
		
					var self = this; 
	  			    //Set the size of the parent div in the application
					$(_container).parent().width(835);  //(835);
					$(_container).parent().height(550);

				
					//console.log($(_container).parent().width());
					//console.log($(_container).parent().height());
					

					//Add Button to select region
					var menu = new DropDownMenu({ style: "display: none;"});
					domClass.add(menu.domNode, "claro");
					
					_.each(_data, function(value, key){
						
						self.key = key;
						
						//console.log(value.location);	
						//console.log(key);
						menuItem1 = new MenuItem({
							label: value.location,
							onClick: function(){self.showStartWindow(this.label, key, self)}
						});
						menu.addChild(menuItem1);
					});
	
					
					this.button = new DropDownButton({
						label: "Choose a Location to Begin",
						name: "startButton",
						dropDown: menu,
						id: "startButton"
					});
					
					dom.byId(_container).appendChild(this.button.domNode);
					
					domClass.add(this.button.domNode, "claro");
					
	 			   	//Position Button
					var btnInfo = domGeom.position('startButton', false);
					//console.log(btnInfo);
					
					
					//Add image
					var introTxt = "<img src='plugins/coastal_defense/images/WaveAttenuation_20130520_FINAL_Crop.png' alt='Wave Attenuation Figure' id='waveImg'> <br/>";

					this.introPanel = domConstruct.create("div", { innerHTML: introTxt });
					dom.byId(_container).appendChild(this.introPanel);
					
			}; //end showIntro
			
			this.showStartWindow = function(delta, key){
				
				this.parameters.delta = delta;
				this.parameters.deltaKey = key;
				this.parameters.currentWindow = 1;
				
				var self = this;
				
				//console.log(this);
			
				$(_container).parent().width(400);  //(835);
				$(_container).parent().height(215);
				
				domStyle.set(this.introPanel, "display", "none");
				domStyle.set(this.button.domNode, "display", "none");
				
				//Load GIS Layers
				if (!this.parameters.layersLoaded){
					var layers = this.loadLayers(this);
					var extent = this.setExtent(this);
				}

				//Write HTML for panel
				
				var profileMarker = '<svg overflow="hidden" width="30" height="30"><defs></defs>'
				profileMarker += '<circle fill="rgb(255, 255, 0)" fill-opacity="1" stroke="rgb(78, 78, 78)" stroke-opacity="1" stroke-width="1.3333333333333333" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" cx="0" cy="0" r="2.6666666666666665" fill-rule="evenodd" stroke-dasharray="none" dojoGfxStrokeStyle="solid" transform="matrix(1.00000000,0.00000000,0.00000000,1.00000000,15.00000000,15.00000000)"></circle></svg>'

				// var mapLegend = "<div id='mapLegend'>";
				// mapLegend += "<table id='mapLegTable1'><tr>";
				// mapLegend += "<td class= 'legTableCells_Narrow'><div>" + profileMarker + "</div></td><td><span class = 'legText'>Profile Location</span></td>";
				// mapLegend += "<td class= 'legTableCells'><div id='marshLegend0'></div></td><td><span class = 'legText'>Current Marsh</span></td>";
				// mapLegend += "<td class= 'legTableCells'><div id='dikeLegend0'></div></td><td><span class = 'legText'>Current Dike</span></td>";
				// mapLegend += "</tr></table></div>";

				var html =  ' <div class="txtBox"><b><u>To Begin</u></b><br/>'
				html += '<br> 1. Select units for distance:'  ;
				html +=  "<input type='radio' data-dojo-type='dijit/form/RadioButton' name='cr_units' id='cr_meters' class='radioBtn txtBox' checked/> <label for='cr_meters' class='inlineLabel'>Meters</label>";
				html +=  "<input type='radio' data-dojo-type='dijit/form/RadioButton' name='cr_units' id='cr_feet' class='radioBtn txtBox'/> <label for='cr_feet' class='inlineLabel'>Feet</label>";
				html += '<br><br> 2. Click a location on the map within Skagit Bay.  <br><br>After you select a point, you will enter the marsh characteristics along the cross-shore profile for a future scenario. </div>'  ;

				//html += '<div class="txtBox"><br/><b>Map Legend:</b><br/></div>';  // + mapLegend;
				//console.log(this);
				this.startPanel = domConstruct.create("div", { innerHTML: html, id:"startDiv"});

				dom.byId(_container).appendChild(this.startPanel);
				

				this.clickhandle = dojo.connect(_map,"onClick", function(evt) {self.processPoint(evt,self)}, this);
				//console.log(this);
				
				
			} //end showStartWindow
			
			this.processPoint = function(evt, self){
				
				//console.log(this);
				
				dojo.disconnect(this.clickhandle);
				
				//Get Units Choice
				if (dojo.byId('cr_meters').checked == true){
					this.currentUnits = this.toolUnits.meters
				}else{
					this.currentUnits = this.toolUnits.feet
				}
				
				//console.log(this.currentUnits);
				
				domStyle.set(this.startPanel, "display", "none");
				var showLoadingMsg = this.profileLoadingMsg();
				
				//console.log(evt.mapPoint);
				
				var pointSymbol = new esri.symbol.SimpleMarkerSymbol();
				var graphic = new esri.Graphic({"geometry":{"x":evt.mapPoint.x,"y":evt.mapPoint.y,"spatialReference" : {"wkid" : 102100}}},pointSymbol);
				//this.map.graphics.add(graphic).show();

				var features= [];
				features.push(graphic);

				var featureSet = new esri.tasks.FeatureSet();
				featureSet.features = features;
				
				
			
	
				//var point = {"geometry":{"x":evt.mapPoint.x,"y":evt.mapPoint.y,"spatialReference" : {"wkid" : 102100}}};
				
				////console.log(point);
				   
				var params = { "ClickLocation":featureSet}; 
				// 
				//console.log(params);
				
				
				//console.log(this);
				//gp = new esri.tasks.Geoprocessor("http://dev.network.coastalresilience.org/ArcGIS/rest/services/Puget_Sound/PS_NSWaves/GPServer/FindClosestPoint", this);
				//gp = new esri.tasks.Geoprocessor("http://54.244.29.137:6080/arcgis/rest/services/PugetSound_CoastalDefense/FindClosestPoint/GPServer/FindClosestPoint", this);
				gp = new esri.tasks.Geoprocessor("http://10.1.5.21:6080/arcgis/rest/services/PugetSound_CoastalDefense/FindClosestPoint/GPServer/FindClosestPoint", this);

				
				gp.execute(params, this.closestPoint, function(error) {//console.log(error)}, this);
			
	
				
			} //end processPoint
						
			this.closestPoint = function(results, messages){
				
				
				//console.log(results);
				//console.log(self);
				
				
				
				self.parameters.profileNum = results[0].value;
				var landX = results[1].value;
				var landY = results[2].value;
				self.parameters.profLat = results[5].value;
				self.parameters.profLon = results[4].value;
				
				self.parameters.profLat = new Number(self.parameters.profLat+'').toFixed(4);
				self.parameters.profLat = parseFloat(self.parameters.profLat);
		
				self.parameters.profLon = new Number(self.parameters.profLon+'').toFixed(4);
				self.parameters.profLon = parseFloat(self.parameters.profLon);
		
				//console.log(self.parameters.profLat);
				//console.log(self.parameters.profLon);
		
				var mp = new esri.geometry.Point;
				mp.x = landX - 1650;
				mp.y = landY;
				mp.spatialReference = {"wkid": 102100};
		
				//console.log(mp);
				_map.centerAndZoom(mp, 15);
	
				//Read in Data from Profile 
				params = {"Profile" : self.parameters.profileNum};
				//console.log(params);
				//gp = new esri.tasks.Geoprocessor("http://dev.network.coastalresilience.org/ArcGIS/rest/services/Puget_Sound/PS_NSWaves/GPServer/readProfile_marsh", this);
				//gp = new esri.tasks.Geoprocessor("http://54.244.29.137:6080/arcgis/rest/services/PugetSound_CoastalDefense/readProfile_marsh/GPServer/readProfile_marsh", this);
				gp = new esri.tasks.Geoprocessor("http://10.1.5.21:6080/arcgis/rest/services/PugetSound_CoastalDefense/readProfile/GPServer/readProfile_marsh", this);
		

				gp.execute(params, self.profileData, function(error) {//console.log(error)});
				
			}
			
			this.profileData = function(results, messages){
				
				//console.log(results);
				//console.log(results[0].value);
				////console.log(this);
				//self.parameters.shoreDist = eval('(' + results[0].value + ')'); // * thing.unitConversion;
				//self.parameters.profileElevation = eval('(' + results[1].value + ')'); // * thing.unitConversion;
				
				self.parameters.shoreDist = results[0].value; // * thing.unitConversion;
				self.parameters.profileElevation = results[1].value; // * thing.unitConversion;
		
				_.each(self.parameters.shoreDist, function(value, key){
					
					self.parameters.shoreDist[key] = number.round(value * self.currentUnits.multiplier, 0);

				});
				
				_.each(self.parameters.profileElevation, function(value, key){
					
					self.parameters.profileElevation[key] = number.round(value * self.currentUnits.multiplier, 2);

				});
			
				//console.log(self.parameters.shoreDist);

		
				//Locations of feature locations will be read from file
				//Locations will be defined by distance from shore - negative is seaward
				//Multiply by uniConversion for ft vs meters
		
				//console.log(eval('(' + results[4].value + ')'));

				self.parameters.marshSeaEdge = number.round( eval('(' + results[2].value + ')') * self.currentUnits.multiplier, 0);
				self.parameters.marshLandEdge = number.round( eval('(' + results[3].value + ')') * self.currentUnits.multiplier, 0);		
				self.parameters.eelSeaEdge = number.round( eval('(' + results[4].value + ')') * self.currentUnits.multiplier, 0);
				self.parameters.eelLandEdge = number.round( eval('(' + results[5].value + ')') * self.currentUnits.multiplier, 0);
				self.parameters.dikeCrest = number.round( eval('(' + results[6].value + ')') * self.currentUnits.multiplier, 0);
				self.parameters.dikeHeight = number.round( eval('(' + results[7].value + ')') * self.currentUnits.multiplier, 0);
				self.parameters.dikeAngle = number.round( eval('(' + results[8].value + ')') * self.currentUnits.multiplier, 0);
				self.parameters.toeHeight = number.round( eval('(' + results[9].value + ')') * self.currentUnits.multiplier, 0);
	
				self.parameters.marshSeaEdge_Fut = number.round( self.parameters.marshSeaEdge * self.currentUnits.multiplier, 0);
				self.parameters.marshLandEdge_Fut = number.round( self.parameters.marshLandEdge * self.currentUnits.multiplier, 0);
				
				//Check for feet vs meters
				
				
				var start = self.startTool();
				
				
			}
			
			this.profileLoadingMsg = function(){
				
				var msgHTML = "<br><center>Please wait a moment for the profile data to load...<br/><br/><br/><img src='plugins/coastal_defense/images/loading.gif'></center>"
				this.profileMsgDiv = domConstruct.create("div", { innerHTML: msgHTML, id:"profileMsgDiv"});
				
				dom.byId(_container).appendChild(this.profileMsgDiv);
				
			}
			
			this.profileProcessingMsg = function(){
				
				var msgHTML = "<br><center>Please wait a moment for the profile to process on the server...<br/><br/><br/><img src='plugins/coastal_defense/images/loading.gif'></center>"
				this.processMsgDiv = domConstruct.create("div", { innerHTML: msgHTML, id:"processMsgDiv"});
				
				dom.byId(_container).appendChild(this.processMsgDiv);
				
			}
				
			this.startTool = function(){

				//console.log(this);
				
				//console.log(this.parameters.profileNum);
				//console.log(this.parameters.delta);
				//console.log(this.parameters.deltaKey);
				//console.log(_map)
				
				//console.log(this.profileMsgDiv);
				
				//Clear Window
				
				domStyle.set(this.profileMsgDiv, "display", "none");
				
				//Resize container window
				$(_container).parent().width(825);  //(835);
				$(_container).parent().height(575);
				
				//Create Border Container 
				this.cd_borderContainer = new BorderContainer({style: "height: 560px; width: 825px; padding: 0px; overflow: hidden;"});
				
				//console.log(this.cd_borderContainer);
				
				//Build Panels
				
				this.helpPanel = new ContentPane({
					id: 'cd_helpPanel',
					region: 'left',	 
					style:"width: 195px; border: none"
					//content: _data[this.deltaKey].help.help 
				});
				
				this.cd_borderContainer.addChild(this.helpPanel);
				
				//Top portion of help panel for text; bottom for map layers
				this.helpPanelText = new ContentPane({
					id: 'cd_helpPanelText',
					content: _data[this.parameters.deltaKey].help.help 
				});
				
				this.helpPanel.addChild(this.helpPanelText);
				
				this.mainPanel = new ContentPane({
					id: 'cd_mainPanel',
					region: "center",
				 	style:"height:570px; width:630px !important; border-width: 0px 0px 0px 1px; overflow: hidden;"  //" overflow: hidden; " ,
				});
				
				this.cd_borderContainer.addChild(this.mainPanel);

				
				//console.log(this.mainPanel);
				//console.log(this);
				
			
				dom.byId(_container).appendChild(this.cd_borderContainer.domNode);
				this.cd_borderContainer.startup()
				

				//console.log('testStartTool');
				//Create Sub-Panels
				
				var layerPanel = this.addLayerPanel(this);
				var wavePanel = this.createWavePanel(this);
				var waterPanel = this.createWaterPanel(this);
				var habitatPanel = this.createHabitatPanel(this);
				var structurePanel = this.createStructurePanel(this);
				//console.log('doneCreateStructure');
				var sliderHelp = this.createSliderHelp(this); 
				//console.log('doneCreateSliderHelp');
				var plotPanel = this.createProfilePlot(this.mainPanel);
				//console.log('doneCreateProfilePlot');
				var sliders = this.addSliders(this);
				//console.log('doneAddSliders');
				var marshTextListers = this.addMarshTextListeners(this);
				//console.log('doneMarshTextListeners');
				var buttons = this.addButtonsToInputPanel(this);
				//console.log('doneButtons');
				var helpText = this.setupHelp(this);
				var mapUpdate = this.updateMap(this);
				
				this.parameters.currentWindow = 2;
				
				//console.log(this.parameters.currentWindow);
				
				
				//parser.parse();
				//this.mainPanel.domNode.appendChild(wavePanel.domNode);
				//console.log('doneStartTool');
					
			};
			
			this.loadLayers = function(){
				
				//console.log(this);
				//console.log(_data);
				//console.log(_data[this.parameters.deltaKey].layers);
				//Land points for profiles
				this.profileLandPoints = new esri.layers.ArcGISTiledMapServiceLayer(_data[this.parameters.deltaKey].layers.profileLandPoints, {
					id: 'cd_ProfileLocations', //'Profile Land Points',
					outFields: ["*"],
					visible: true
					});	
					
				//Profile points
				this.profilePoints = new FeatureLayer(_data[this.parameters.deltaKey].layers.profilePoints, {
					id: 'cd_ProfilePoints', //'Profile Points',
					outFields: ["*"],
					visible: false
					});	

				//Profile points
				this.marshLayer = new esri.layers.ArcGISTiledMapServiceLayer(_data[this.parameters.deltaKey].layers.marshLayer, {
					id: 'cd_MarshLayer', //'Profile Land Points',
					outFields: ["*"],
					visible: true
					});
	
					
				//Profile points
				this.dikeLayer = new esri.layers.ArcGISTiledMapServiceLayer(_data[this.parameters.deltaKey].layers.dikeLayer, {
					id: 'cd_dikeLayer', //'Profile Land Points',
					outFields: ["*"],
				
					visible: true
					});			
					
				this.contours = new esri.layers.ArcGISTiledMapServiceLayer(_data[this.parameters.deltaKey].layers.demBins, {
					id: 'cd_Elevations',
					visible: false,
					opacity: 0.6
					});		
					
				// this.contours = new esri.layers.ArcGISDynamicMapServiceLayer("http://dev.network.coastalresilience.org/ArcGIS/rest/services/Puget_Sound/Skagit_Basedata/MapServer", {
				// 	id: 'cd_Elevations',
				// 	visible: false
				// 	});			
				
				_map.addLayers([this.profileLandPoints, this.profilePoints, this.marshLayer, this.dikeLayer]);
				_map.addLayer(this.contours);
				//this.contours.setVisibleLayers([3]);
				
				this.parameters.layersLoaded = true;
					
			}
			
			this.setExtent = function(){
				
				//console.log(_data[this.parameters.deltaKey].extent);
				
				newExtent = new esri.geometry.Extent({
					"ymax": _data[this.parameters.deltaKey].extent[0],
					"xmax": _data[this.parameters.deltaKey].extent[1],
					"ymin": _data[this.parameters.deltaKey].extent[2],
					"xmin": _data[this.parameters.deltaKey].extent[3],
					"spatialReference": {
						"wkid": 102100
					}
				});
		
				_map.setExtent(newExtent);
				
				
			} //end setExtent
						
			this.createWavePanel = function(){
				
				//Create content pane for wave parameters
				var wavePanel = new ContentPane({
				  style:"height:140px; width:165px; border: 1px; overflow: hidden;" , 
				  id: "wavePanel", 
				  title: "Waves / Winds"
				});
				
				
				
				//-- Direct or wind radio buttons -- //
				
				//Write HTML
				var radioHTML = "<input type='radio' name='waveDef' id='waveRadio1' class='radioBtn'/> <label for='waveRadio1' class='inlineLabel radioBtn'>Wave Height/Period</label><br />"
				radioHTML += "<input type='radio' name='waveDef' id='waveRadio2' class='radioBtn'/> <label for='waveRadio2'class='inlineLabel radioBtn' >Wind Condition</label><br />"
				
				
				var waveRadioDiv = domConstruct.create("div", { innerHTML: radioHTML, id:"radioDiv"});

				wavePanel.domNode.appendChild(waveRadioDiv);
							
	
				

				//-- Wave Height and Period Number Text Inputs -- //
				
				//Create Table Div
				var waveDiv = new dojox.layout.TableContainer(
				{
				  cols: 1,
				  id: "waveTable",
				  customClass:"labelsAndValues",
				  //"labelWidth": "85px"
				}, dojo.byId("waveTest"));
			
	
				//console.log(waveDiv);
				
				
				
				//Add Text Boxes
				var inputWidth = "width: 30px;";
				var inputHeight = "" ; //"height: 30px;";
				var inputMargin = "margin: 2px;";


				var waveValue = number.round(_data[this.parameters.deltaKey].waveHeightPeriod[0] * this.currentUnits.multiplier, 0);
				var periodValue = _data[this.parameters.deltaKey].waveHeightPeriod[1];
				
				var waveHeightBox = new NumberTextBox({
					  name: "waveHeight",
					  id: "waveHeight",
					  label:  "Wave Height " + this.currentUnits.unitText + ":",
					  value: waveValue,
					  required: true,
					  style: inputWidth + inputHeight + inputMargin,
					 //class: textInput
					  //constraints: {pattern: "0.######"}
				}, "waveHeight");	

				var wavePeriodBox = new NumberTextBox({
					  name: "wavePeriod",
					  id: "wavePeriod",
					  label:  "Wave Period (s):",
					  value: periodValue,
					  required: true,
					  style: inputWidth + inputHeight + inputMargin, 
					  //class: textInput
					  //constraints: {pattern: "0.######"}
				}, "wavePeriod");
				
				waveDiv.addChild(waveHeightBox);
				waveDiv.addChild(wavePeriodBox);
				
				
			
				waveDiv.startup();
				
				
				wavePanel.domNode.appendChild(waveDiv.domNode);
				
				
				// -- Combobox for wind condition -- //


 				var windComboLabel = domConstruct.create("div", {innerHTML: "Wind Condition:", id:"windComboLabel"});
				wavePanel.domNode.appendChild(windComboLabel);	

				var windMenu = new DropDownMenu({ style: "display: none;"});
				domClass.add(windMenu.domNode, "claro");
		
				_.each(_data[this.parameters.deltaKey].winds, function(value, key){
					menuItem1 = new MenuItem({
						label: value.name,
						onClick: function(){self.updateWaveBtn(this.label)}
					});
				
					windMenu.addChild(menuItem1);
				});

				
				this.windButton = new DropDownButton({
					label: "Most Common",
					name: "windButton",
					dropDown: windMenu,
					id: "windButton"
					
				});
			
				
 				wavePanel.domNode.appendChild(this.windButton.domNode);	
				
				
				// -- Create Title Pane to place container -- //
				var tp = new TitlePane({
					title:"Waves/Winds", 
					content: wavePanel.domNode,
					style:"width:165px;",
					toggleable: false,
					isLayoutContainer: true
				});
				
				this.mainPanel.domNode.appendChild(tp.domNode);  //(wavePanel.domNode);
				
				
				
				// -- Add dojo widgets after adding wavePanel to main panel so that html exists for dojo code to reference -- //
				
				//Radio Buttons
				var waveDirect = new RadioButton({
				    checked: true,
				    value: "waves",
				    name: "waveDef",
					style: "height: 20px;"
				}, "waveRadio1");
				
				var waveWind = new RadioButton({
				    checked: false,
				    value: "winds",
				    name: "waveDef",
					style: "height: 20px;"
				}, "waveRadio2");
				
				
				dojo.connect(dijit.byId("waveRadio1"), "onChange", function(isChecked){
				    if(isChecked){
				        domStyle.set(waveDiv.domNode, "display", "block");
				    } else{
				    	domStyle.set(waveDiv.domNode, "display", "none");
				    }
				});
				
	
			} //End wave parameter panel
						
			this.updateWaveBtn = function(label){
				
				this.parameters.waveBtnLabel = label;
				this.windButton.set("label",label);
			
	
			}
			
			this.createWaterPanel = function(){
				
				var self = this;
				
				//Create content pane for wave parameters
				var waterPanel = new ContentPane({
				  style:"height:152px; width:165px; border: 1px; overflow: hidden;" , 
				  id: "waterPanel"
				});


				//Create Water Level Drop down button
				
 				var waterComboLabel = domConstruct.create("div", {innerHTML: "Water Level:", id:"waterComboLabel", class:"btnLabels"});
				waterPanel.domNode.appendChild(waterComboLabel);	

				var waterMenu = new DropDownMenu({ style: "display: none;"});
				domClass.add(waterMenu.domNode, "claro");
			
				_.each(_data[this.parameters.deltaKey].waterLevel, function(value, key){
					var menuItem1 = new MenuItem({
						label: value.name,
						onClick: function(){self.updateWaterBtn(this.label, key)}
					});
					waterMenu.addChild(menuItem1);
				});

				
				this.waterButton = new DropDownButton({
					label: "Mean Higher High Water",
					name: "waterButton",
					dropDown: waterMenu,
					id: "waterButton",
					
				});
				
				this.parameters.waterLevelKey = 3;  //Pre-set mhhw as the default and assign key - may want to include default values in json file at some point
			
				
 				waterPanel.domNode.appendChild(this.waterButton.domNode);					
				
				
				//Create Stormsurge Drop down button
				
 				var surgeComboLabel = domConstruct.create("div", {innerHTML: "Storm Surge:", id:"surgeComboLabel", class:"btnLabels"});
				waterPanel.domNode.appendChild(surgeComboLabel);	

				var surgeMenu = new DropDownMenu({ style: "display: none;"});
				domClass.add(surgeMenu.domNode, "claro");
			
				_.each(_data[this.parameters.deltaKey].stormSurge, function(value, key){
					var menuItem1 = new MenuItem({
						label: value.name,
						onClick: function(){self.updateSurgeBtn(this.label, key)}
					});
					surgeMenu.addChild(menuItem1);
				});

				
				this.surgeButton = new DropDownButton({
					label: "Low",
					name: "surgeButton",
					dropDown: surgeMenu,
					id: "surgeButton",
					
				});
				
				this.parameters.surgeLevelKey = 0;  //Pre-set mhhw as the default and assign key - may want to include default values in json file at some point
			
				
 				waterPanel.domNode.appendChild(this.surgeButton.domNode);					
				
				
				
				// -- Create Title Pane to place container -- //
				var waterTp = new TitlePane({
					title:"Water Level/Surge", 
					id: "waterTitlePane",
					content: waterPanel.domNode,
					style: "width:170px;",
					toggleable: false,
					isLayoutContainer: true
				});
				
				this.mainPanel.domNode.appendChild(waterTp.domNode);  //(wavePanel.domNode);
				
			}
		
			this.updateWaterBtn = function(label, key){
				this.parameters.waterLevelKey = key;
				this.parameters.waterLevelLabel = label;
				this.waterButton.set("label",label);
				
				//console.log(this.parameters.waterLevelKey);
				
				
			}
			
			this.updateSurgeBtn = function(label, key){
				this.parameters.surgeLevelKey = key;
				this.parameters.surgeLevelLabel = label;
				
				this.surgeButton.set("label",label);
				
				//console.log(this.parameters.surgeLevelKey);
				
				
			}
			
			this.createHabitatPanel = function(){
				
				//Create content pane for wave parameters
				var habitatPanel = new ContentPane({
				  style:"height:150px; width:175px; border: 1px; overflow: hidden;" , 
				  id: "cd_habitatPanel"
				});
				
				//-- Create Marsh Checkbox -- //
				
				//console.log(this.parameters.marshLandEdge);
				//Check to see if there is marsh in the current profile
				if (this.parameters.marshLandEdge == -999999){		
					this.parameters.marshLandEdge = 0;
					this.parameters.marshSeaEdge = 0;
					this.parameters.marshCheck = false;
				} else {
					this.parameters.marshCheck = true;
					
				}
								
				//Checkbox Widget
				var marshCheckbox1 = new CheckBox({
				    id: "cd_marsh",
				    checked: this.parameters.marshCheck,
				    value: "marsh",
				    name: "cd_marsh",
				    style: "height: 20px; padding: 2px",
			            label: "Marsh:",
				   showLabel: true
				}, "cd_marsh_checkbox");
				
				habitatPanel.domNode.appendChild(marshCheckbox1.domNode);

				marshCheckbox1.domNode.appendChild(dojo.create("label", {"for" : "cd_marsh_checkbox"}));  

				
				//Create Table Div for text boxes
				var habitatDiv = new dojox.layout.TableContainer(
				{
				  cols: 1,
				  id: "cd_habitatTable",
				  customClass:"labelsAndValues",
				  //"labelWidth": "85px"
				}, dojo.byId("habitatTable"));
				
				//Add Text Boxes
				var inputWidth = "width: 65px;";
				var inputHeight = "" ; //"height: 30px;";
				var inputMargin = "margin: 2px;";
				var textColor = "color: green;";

				

				this.shoreEdgeBox = new NumberTextBox({
					  name: "cd_shoreEdgeBox",
					  id: "cd_shoreEdgeBox",
					  label:  "Shore Edge " + this.currentUnits.unitText + ":",
					  value: this.parameters.marshLandEdge,
					  required: true,
					  style: inputWidth + inputHeight + inputMargin + textColor
					  
				      //constraints: {pattern: "0.######"}
				}, "cd_shoreEdgeBox");	

				this.seaEdgeBox = new NumberTextBox({
					  name: "cd_seaEdgeBox",
					  id: "cd_seaEdgeBox",
					  label:  "Sea Edge " + this.currentUnits.unitText + ":",
					  value: this.parameters.marshSeaEdge,
					  required: true,
					  style: inputWidth + inputHeight + inputMargin,
					 //class: textInput
				      //constraints: {pattern: "0.######"}
				}, "cd_seaEdgeBox");
				
				

	
				//Create drop down button for density
 				//var marshDensityComboLabel = domConstruct.create("div", {innerHTML: "Density:", id:"marshDensityComboLabel"});
				//habitatPanel.domNode.appendChild(marshDensityComboLabel);	

				var marshDensityMenu = new DropDownMenu({ style: "display: none;"});
				domClass.add(marshDensityMenu.domNode, "claro");
						
				_.each(_data[this.parameters.deltaKey].marshDensity, function(value, key){
					var menuItem1 = new MenuItem({
						label: value.name,
						onClick: function(){self.updateMarshDensityBtn(this.label, key)}
					});
					marshDensityMenu.addChild(menuItem1);
				});
				
				
				this.marshDensityButton = new DropDownButton({
					label: "Density:",
					name: "cd_marshDensityButton",
					dropDown: marshDensityMenu,

					id: "cd_marshDensityButton",
					
				});
				
				this.parameters.marshDensityKey = 1;  //Pre-set mhhw as the default and assign key - may want to include default values in json file at some point
						
				//habitatPanel.domNode.appendChild(this.marshDensityButton.domNode);
				// habitatDiv.addChild(this.marshDensityButton);
				// habitatDiv.startup();
				
				
				///////////////////
				
				habitatDiv.addChild(marshCheckbox1);
				habitatDiv.addChild(this.shoreEdgeBox);
				habitatDiv.addChild(this.seaEdgeBox);
				habitatDiv.addChild(this.marshDensityButton);
				
	
				habitatDiv.startup();
								
				habitatPanel.domNode.appendChild(habitatDiv.domNode);
				
				
				
				// -- Create Title Pane to place container -- //
				var habitatTp = new TitlePane({
					title:"Habitat", 
					id: "cd_habitatTitlePane",
					content: habitatPanel.domNode,
					style: "width:185px;",
					toggleable: false,
					isLayoutContainer: true
				});
				
				this.mainPanel.domNode.appendChild(habitatTp.domNode);  //(wavePanel.domNode);
				
				this.marshDensityButton.set("label","Medium");
				//console.log(_data[this.parameters.deltaKey].marshDensity[this.parameters.marshDensityKey].value);

				
				this.addCheckboxDisableListener();
				
				
			} //End createHabitatPanel
						
			this.updateMarshDensityBtn = function(label, key){
				this.parameters.marshDensityKey = key;
				this.parameters.marshDensityLabel = label;
				this.marshDensityButton.set("label",label);
				
			
				//console.log(this.parameters.marshDensityKey);
				//console.log(_data[this.parameters.deltaKey].marshDensity[this.parameters.marshDensityKey].value);
			}
			
			this.createStructurePanel = function(){
				
				//Create content pane 
				var structurePanel = new ContentPane({
				  style:"height:150px; width:100px; border: 1px; overflow: hidden;" , 
				  id: "cd_structurePanel"
				});
				
				//-- Create Structure Checkbox -- //
				
				//Check to see if there is dike in the current profile
				if (this.parameters.dikeCrest == -999999){		
					this.parameters.dikeCheck = false;
				} else {
					this.parameters.dikeCheck = true;
					
				}
								
				//Checkbox Widget
				var dikeCheckbox = new CheckBox({
				    id: "cd_dike",
				    checked: this.parameters.dikeCheck,
					disabled: true,
				    value: "dike",
				    name: "cd_dike",
				    style: "height: 20px; padding: 2px",
	            	label: "Dikes:",
				   	showLabel: true
				}, "cd_dike_checkbox");
				
				structurePanel.domNode.appendChild(dikeCheckbox.domNode);
			
			
				dikeCheckbox.domNode.appendChild(dojo.create("label", {"for" : "cd_dike_checkbox"}));  
			
				
				//Create Table Div 
				var structureDiv = new dojox.layout.TableContainer({
				  cols: 1,
				  id: "cd_structureTable",
				  customClass:"labelsAndValues",
				  //"labelWidth": "85px"
				}, dojo.byId("structureTable"));
				
				//Add Text Boxes

				var inputWidth = "width: 30px;";
				var inputHeight = "" ; //"height: 30px;";
				var inputMargin = "margin: 2px;";
			
				
			
				var slopeBox = new NumberTextBox({
					  name: "cd_slopeBox",
					  id: "cd_slopeBox",
					  label:  "Slope:",
					  value: "0.25",
					  required: true,
					  style: inputWidth + inputHeight + inputMargin,
					 //class: textInput
				      //constraints: {pattern: "0.######"}
				}, "cd_slopeBox");	
			
				var heightBox = new NumberTextBox({
					  name: "cd_heightBox",
					  id: "cd_heightBox",
					  label:  "Height " + this.currentUnits.unitText + ":",
					  value: number.round(2 * this.currentUnits.multiplier, 0),
					  required: true,
					  style: inputWidth + inputHeight + inputMargin,
					 //class: textInput
				      //constraints: {pattern: "0.######"}
				}, "cd_heightBox");
				
				
				structureDiv.addChild(dikeCheckbox);
			 	structureDiv.addChild(slopeBox);
			 	structureDiv.addChild(heightBox);
	
			 	structureDiv.startup();
			 	
			 	structurePanel.domNode.appendChild(structureDiv.domNode);

				// -- Create Title Pane to place container -- //
				var structureTp = new TitlePane({
					title:"Structures", 
					id: "cd_structureTitlePane",
					content: structurePanel.domNode,
					style: "width:100px;",
					toggleable: false,
					isLayoutContainer: true
				});

			 	this.mainPanel.domNode.appendChild(structureTp.domNode);  //(wavePanel.domNode);
	
			} //End createStructurePanel
			
			this.createSliderHelp = function(){
				
				var sliderHTML = '<div id="cd_sliderInputText" class="marshText"> <b> * Use the green sliders to change the marsh extent for the future scenario * </b> <div>'
				var sliderHelpDiv = domConstruct.create("div", {id:"cd_sliderHelp", innerHTML: sliderHTML});
				
				var mainPanel = dom.byId("cd_mainPanel");
				
				mainPanel.appendChild(sliderHelpDiv); 
				
			
			}
			
			this.createProfilePlot = function(){
				
				 var self = this;
				 //Place data into object for plotting
				 
				 //Profile Elevations
				 var profileData = [];
				 _.each(this.parameters.profileElevation, function(value, key){
					 
					 ////console.log(this);
					 ////console.log(this.parameters.shoreDist);
					 
					 var item = {
					 	
						 x: self.parameters.shoreDist[key],
						 y: value
					 }
					 
					 profileData.push(item);
				 });
					 
				 //console.log(profileData);
				 
				 //Marsh Extent
				 this.parameters.marshExtent = [
				 	{x: this.parameters.marshSeaEdge, y: 2},
				 	{x: this.parameters.marshLandEdge, y: 2}
				 
				 ]
				 
				 //console.log(this.parameters.marshExtent);
				 
				 //Dike Position
				 var dikePosition = [
				 	{x: this.parameters.dikeCrest, y: -2},
					{x: this.parameters.dikeCrest, y: 2}
				 
				 ]
				 
				var plotDivHTML = "<div id='cd_plotDiv' style= 'height: 230px;'></div><div id = 'cd_legendParent'> <div id='cd_legendDiv' class='cd_legend'></div></div>";
				var plotDiv = domConstruct.create("div", {id:"cd_chartDiv", innerHTML: plotDivHTML});
				var mainPanel = dom.byId("cd_mainPanel");
				
				mainPanel.appendChild(plotDiv); 
				
				
				//Set Some Plotting Parameters
				var xTitle = 'Distance From Shore ' + this.currentUnits.unitText;
				var yTitle = ' Height (' + this.currentUnits.unitTextFull + ' Above MSL)';
				axisFonts = '14pt';
				
				//Create Plot
				profileChart = new Chart('cd_plotDiv');
			    profileChart.addPlot("profile", {type: Areas});
				profileChart.addPlot("profileLines", {type: Lines});
			    profileChart.addAxis("x", {title: xTitle, font: axisFonts, titleOrientation: 'away', titleGap: 10 });
			    profileChart.addAxis("y", {vertical: true, title: yTitle, font: axisFonts});   //, min: -2, max: 2});
			
				
				
				//Add profile elevations
			    profileChart.addSeries("Profile Elevation", profileData,
					{plot: "profileLines", stroke: {color:"orange"}});  
					 
					 
					 
				profileChart.render();
				
				//Add marsh extent
				
				
				maxTick = _.max(this.parameters.profileElevation);
				minTick = _.min(this.parameters.profileElevation);
				
				//console.log(maxTick);
				
				 this.parameters.marshExtent = [
				 	{x: this.parameters.marshSeaEdge, y: maxTick},
				 	{x: this.parameters.marshLandEdge, y: maxTick}
 
				 ]
				
				
				if(this.parameters.marshCheck == true){
				    profileChart.addSeries("Current Marsh Extent", this.parameters.marshExtent,
						{plot: "profile", stroke: {color:"rgba(148, 175, 0, 0.4)"}, fill: "rgba(148, 175, 0, 0.4)"});
				}
				
				//Add Dike Position		
				

				var dikePosition = [
					{x: this.parameters.dikeCrest, y: minTick},
					{x: this.parameters.dikeCrest, y: maxTick}

				]
			 		
				if(this.parameters.dikeCheck == true){
				    profileChart.addSeries("Dike Position", dikePosition,
						{plot: "profileLines", stroke: {color:"rgba(250, 0, 0, 1)"}});
				}
			
	
				profileChart.render();
				
				
				//Add Legend
				
				var legend = new Legend({ id: "cd_profileLegend", class: "cd_profileLegend", chart: profileChart, layoutAlign: "Right"}, "cd_legendDiv");
				 
				//console.log(legend);
				
				
				//Add Fill under profile elevation, but do not include in legend
			    profileChart.addSeries("Profile Elevation", profileData,
					{plot: "profile", stroke: {color:"orange"}, fill: "rgba(255, 165, 0, 0.1)"}); 
				
				profileChart.render();
				
				

			}
			
			this.positionProfileLegend = function(){
				var chartDiv = dom.byId("cd_plotDiv");
				var plotDiv = _.last(chartDiv.children)
				plotDiv = plotDiv.childNodes[2]

				//console.log(plotDiv);
				var plotX = plotDiv.x.baseVal.value
				
				var legDiv = dom.byId("cd_legendParent");
				
				//console.log(legDiv);
				
				var legLeft = plotX + 'px';
				//domStyle.set(legDiv, "left", plotX +'px', "position", "absolute", "display","none");
				domStyle.set(legDiv, "left", legLeft);
			}
			
			this.addSliders = function() {
				
				var self = this;
				
				//Find location of plotting area to Place Slider Above Plot
				var chartDiv = dom.byId("cd_plotDiv");
				var plotDiv = _.last(chartDiv.children)
				plotDiv = plotDiv.childNodes[2]
					
				var chartPosition = dojo.position(plotDiv);
				var plotWidth = plotDiv.width.baseVal.value + 24 //chartPosition.w //   domGeom.position(plotDiv).w;
				var plotX = plotDiv.x.baseVal.value - 12//  domGeom.position(plotDiv).x;
				var plotY = plotDiv.y.baseVal.value - 13 //  domGeom.position(plotDiv).y;

				
				var profileSliderDiv  = domConstruct.create("div", {id:"cd_sliderDiv"});
				var mainPanel = dom.byId("cd_mainPanel");
				chartDiv.appendChild(profileSliderDiv); 
				
				var sliderStyle = "width: " + plotWidth + "px !important; left: " + plotX + "px !important; top: " + plotY + "px !important; position: absolute !important";
				
			    this.rangeSlider = new dojox.form.HorizontalRangeSlider({
					name: "rangeSlider",
					value: [this.parameters.marshSeaEdge,this.parameters.marshLandEdge],
					minimum: this.parameters.shoreDist[0],
					maximum: _.last(this.parameters.shoreDist),
					intermediateChanges: false,
					showButtons:false,
					style: sliderStyle,
					onChange: function(value){
						self.setSliderBounds(value);
						
						self.parameters.marshSeaEdge_Fut = number.round(value[0],0);
						dojo.byId("cd_seaEdgeBox").value = number.round(value[0],0);
						
						self.parameters.marshLandEdge_Fut = number.round(value[1], 0);
					  	dojo.byId("cd_shoreEdgeBox").value = number.round(value[1], 0);
						
					}
			    }, profileSliderDiv);
							  

				//Format slider thumbs based on checked value of marsh checkbox
				var sliderHandles = dom.byId(this.rangeSlider.sliderHandle.children[0]);
				var sliderHandleMax = dom.byId(this.rangeSlider.sliderHandleMax.children[0]);
				var sliderBar = dom.byId(this.rangeSlider.sliderBarContainer.children[1]);	
				
				//console.log(sliderHandles);
				
				var marshCheckbox = registry.byId("cd_marsh");
				
				if (marshCheckbox.checked == true){	
				
					
					domClass.remove(sliderHandles, "sliderHandleDeactivated");
					domClass.remove(sliderHandleMax, "sliderHandleDeactivated");
					domClass.remove(sliderBar, "sliderBarDeactivated");
					
					domClass.add(sliderHandles, "sliderHandleActivated");
					domClass.add(sliderHandleMax, "sliderHandleActivated");
					domClass.add(sliderBar, "sliderBarActivated");
					// domStyle.set(sliderHandles, "background-image", "url('images/dojo_marsh_sliderThumbs.png')!important");
// 					domStyle.set(sliderHandleMax, "background-image", "url('plugins/coastal_defense/images/dojo_marsh_sliderThumbs.png')!important");
// 					domStyle.set(sliderBar, "background-color", "rgba(148, 175, 0, 0.4)!important");
				} else {
					
					domClass.remove(sliderHandles, "sliderHandleActivated");
					domClass.remove(sliderHandleMax, "sliderHandleActivated");
					domClass.remove(sliderBar, "sliderBarActivated");
					
					domClass.add(sliderHandles, "sliderHandleDeactivated");
					domClass.add(sliderHandleMax, "sliderHandleDeactivated");
					domClass.add(sliderBar, "sliderBarDeactivated");
					
					// domStyle.set(sliderHandles, "background-image", "url('plugins/coastal_defense/images/dojo_marsh_sliderThumbs_deactivated.png')!important");
					// domStyle.set(sliderHandleMax, "background-image", "url('plugins/coastal_defense/images/dojo_marsh_sliderThumbs_deactivated.png')!important");
					// domStyle.set(sliderBar, "background-color", "white!important");
					
				}
				
				
				
				var sliderBarRemaining = dom.byId(this.rangeSlider.remainingBar);
				domStyle.set(sliderBarRemaining, "background-color", "white !important;");
				
				
				this.addCheckboxListerForSliders();
				
				
			}
			
			this.setSliderBounds = function(value){
				
				//console.log(value, dojo.byId("cd_seaEdgeBox").value, dojo.byId("cd_shoreEdgeBox").value);


				//Check to make sure marsh does not extend past dike
				if ((value[0] > this.parameters.dikeCrest) && (this.parameters.dikeCrest > -999999)){
					
					this.rangeSlider.value[0] = this.parameters.dikeCrest;
					
					alert('Marsh extent limited by dike');
					
				} 
				
				if ((value[1] > this.parameters.dikeCrest) && (this.parameters.dikeCrest > -999999)){
					
					
					var seaEdge = this.rangeSlider.value[0];
					var shoreEdge = Math.round(this.parameters.dikeCrest, 0)-1;
					
					this.rangeSlider.set('value', [seaEdge, shoreEdge]); 
					
					alert('Marsh extent limited by dike');
					
					
					
					
					//var myDialog = new Dialog({
					//	//title: "My Dialog",
					//	content: "Marsh extent limited by dike.",
					//	style: "width: 300px",
					//	
					//    }).show();
	
				}
				
				//Check for marsh range relative to msl
				
				//Find index of current slider position in profile array
				var dist_0 = number.round((value[0]/_data[this.parameters.deltaKey].profilePointSpacing),0) * _data[this.parameters.deltaKey].profilePointSpacing;
				var dist_1 = number.round((value[1]/_data[this.parameters.deltaKey].profilePointSpacing), 0) * _data[this.parameters.deltaKey].profilePointSpacing;
				
				var elev_0 = this.parameters.profileElevation[this.parameters.shoreDist.indexOf(dist_0)];
				var elev_1 = this.parameters.profileElevation[this.parameters.shoreDist.indexOf(dist_1)];
				
				//console.log(dist_0, elev_0);
				//console.log(dist_1, elev_1);
				
				//Sometimes the marsh polygon layer does not line up exactly with the min and max boundaries
				var marshmin = Math.min(_data[this.parameters.deltaKey].marshBoundary[0], this.parameters.marshSeaEdge)  
				var marshmax = Math.max(_data[this.parameters.deltaKey].marshBoundary[1], this.parameters.marshLandEdge)
				
				
				if (value[0] < 0){
	
					var shoreEdge = this.rangeSlider.value[1];
					
					//this.rangeSlider.value[0] = 0;  //marshmin;
					
					this.rangeSlider.set('value', [0, shoreEdge]); 
					
					alert("Marsh extent is limited by mean sea level");
	
				} 
				
				//NOTE: Top limit of marsh needs more work - currently not working, but most cases will be limited by dike before elevation.
				
				if (elev_1 > marshmax){

					this.rangeSlider.value[1] = marshmax;
					
					alert("Marsh extent cannot extent beyond " + marshmax + " above mean sea level");
					
				} 
				
			}
			
			this.addMarshTextListeners = function(){
				
				var self = this;
				
				dojo.connect(dijit.byId("cd_shoreEdgeBox"), "onChange", function(){
					
					var seaEdge = self.rangeSlider.value[0];
					var marshEdge = dijit.byId("cd_shoreEdgeBox").value;
					
					self.rangeSlider.set('value', [seaEdge, marshEdge]);
				});

				dojo.connect(dijit.byId("cd_seaEdgeBox"), "onChange", function(){

					var marshEdge = self.rangeSlider.value[1];
					var seaEdge = dijit.byId("cd_seaEdgeBox").value;
					
					self.rangeSlider.set('value', [seaEdge, marshEdge]);
				});	
			}
		
			this.createTooltips = function(){
				
				this.dikeTooltip = new dijit.TooltipDialog({
					id: 'dikeTooltip',
					//style: "width: 300px;",
					content: "Marsh extent is limited by dike.",
				});
				
				this.marshHighTooltip = new dijit.TooltipDialog({
					id: 'marshHighTooltip',
					//style: "width: 300px;",
					content: "Marsh must be below" + _data[this.parameters.deltaKey].marshBoundary[1] + " above MSL."
				});
				
				this.marshLowTooltip = new dijit.TooltipDialog({
					id: 'marshLowTooltip',
					//style: "width: 300px;",
					content: "Marsh must be above " + _data[this.parameters.deltaKey].marshBoundary[0] + " MSL.",
				});
	
			}
			
			this.setupHelp = function(){
				
				var self = this;
				
										
				this.waveRadio1_handle = dojo.connect(dijit.byId("waveRadio1"), "onClick", function(){
					self.helpPanelText.set('content', _data[self.parameters.deltaKey].help.windWave)
				});
			
				this.waveRadio2_handle = dojo.connect(dijit.byId("waveRadio2"), "onClick", function(){
					self.helpPanelText.set('content', _data[self.parameters.deltaKey].help.windWave)
				});
			
				this.waveHeight_handle = dojo.connect(dijit.byId("waveHeight"), "onClick", function(){
					self.helpPanelText.set('content', _data[self.parameters.deltaKey].help.windWave)
				});
			
				this.wavePeriod_handle = dojo.connect(dijit.byId("wavePeriod"), "onClick", function(){
					self.helpPanelText.set('content', _data[self.parameters.deltaKey].help.windWave)
				});
			
				this.windButton_handle = dojo.connect(dijit.byId("windButton"), "onClick", function(){
					self.helpPanelText.set('content', _data[self.parameters.deltaKey].help.windWave)
				});
			
				this.wwaterButton_handle = dojo.connect(dijit.byId("waterButton"), "onClick", function(){
					self.helpPanelText.set('content', _data[self.parameters.deltaKey].help.waterLevel)
				});
			
				this.surgeButton_handle = dojo.connect(dijit.byId("surgeButton"), "onClick", function(){
					self.helpPanelText.set('content', _data[self.parameters.deltaKey].help.stormSurge)
				});
			
				this.marsh_handle = dojo.connect(dijit.byId("cd_marsh"), "onClick", function(){
					self.helpPanelText.set('content', _data[self.parameters.deltaKey].help.habitat)
				});
			
				this.shoreEdge_handle = dojo.connect(dijit.byId("cd_shoreEdgeBox"), "onClick", function(){
					self.helpPanelText.set('content', _data[self.parameters.deltaKey].help.habitat)
				});
			
				this.seaEdge_handle = dojo.connect(dijit.byId("cd_seaEdgeBox"), "onClick", function(){
					self.helpPanelText.set('content', _data[self.parameters.deltaKey].help.habitat)
				});
			
				this.density_handle = dojo.connect(dijit.byId("cd_marshDensityButton"), "onClick", function(){
					self.helpPanelText.set('content', _data[self.parameters.deltaKey].help.habitatDensity)
				});
			
				this.dike_handle = dojo.connect(dijit.byId("cd_dike"), "onClick", function(){
					self.helpPanelText.set('content', _data[self.parameters.deltaKey].help.dikes)
				});
			
				this.slope_handle = dojo.connect(dijit.byId("cd_slopeBox"), "onClick", function(){
					self.helpPanelText.set('content', _data[self.parameters.deltaKey].help.dikeSlope)
				});
			
				this.height_handle = dojo.connect(dijit.byId("cd_heightBox"), "onClick", function(){
					self.helpPanelText.set('content', _data[self.parameters.deltaKey].help.dikeHeight)
				});
				
				
			}
			
			this.addLayerPanel = function(){
				
				//Create content pane 
				var layerPanel = new ContentPane({
				  //style:"height:150px; width:100px; border: 1px; overflow: hidden;" , 
				  id: "cd_layerPanel"
				});
				
				
				var layerHTML = "<input type='checkbox' checked data-dojo-type='dijit/form/CheckBox' name='cd_profileLocationsCheckbox' id='cd_profileLocationsCheckbox' class='radioBtn'/> <label for='cd_profileLocationsCheckbox' class='inlineLabel radioBtn'>Profile Locations</label><br />"
				    layerHTML += "<input type='checkbox' checked data-dojo-type='dijit/form/CheckBox' name='cd_marshExtentCheckbox' id='cd_marshExtentCheckbox' class='radioBtn'/> <label for='cd_marshExtentCheckbox' class='inlineLabel radioBtn'>Current Marsh Extent</label><br />"
				    layerHTML += "<input type='checkbox' checked data-dojo-type='dijit/form/CheckBox' name='cd_dikeCheckbox' id='cd_dikeCheckbox' class='radioBtn'/> <label for='cd_dikeCheckbox' class='inlineLabel radioBtn'>Dike Structures</label><br />"
				    layerHTML += "<input type='checkbox' data-dojo-type='dijit/form/CheckBox' name='cd_elevationCheckbox' id='cd_elevationCheckbox' class='radioBtn'/> <label for='cd_elevationCheckbox' class='inlineLabel radioBtn'>Elevation Contours</label><br />"

				var layerCheckboxDiv = domConstruct.create("div", { innerHTML: layerHTML, id:"cd_layerCheckboxDiv"});

				layerPanel.domNode.appendChild(layerCheckboxDiv);
				
				

				
			
				var LayerTp = new TitlePane({
					title:"GIS Base Layers", 
					id: "cd_GISBaseLayers",
					content: layerPanel.domNode,
					//style: "top: 200px; position: relative;",
					toggleable: false,
					isLayoutContainer: true
				});
			
				this.helpPanel.domNode.appendChild(LayerTp.domNode);
				
				
				//Set up listeners
				
				var self = this;
				
				dojo.connect(registry.byId("cd_profileLocationsCheckbox"), "onClick", function(){
					registry.byId("cd_profileLocationsCheckbox").get('checked')? self.profileLandPoints.show() : self.profileLandPoints.hide() ;	
				});
				
				dojo.connect(registry.byId("cd_marshExtentCheckbox"), "onClick", function(){
					registry.byId("cd_marshExtentCheckbox").get('checked')? self.marshLayer.show() : self.marshLayer.hide() ;	
				});
				
				dojo.connect(registry.byId("cd_dikeCheckbox"), "onClick", function(){
					registry.byId("cd_dikeCheckbox").get('checked')? self.dikeLayer.show() : self.dikeLayer.hide() ;	
				});
				
				dojo.connect(registry.byId("cd_elevationCheckbox"), "onClick", function(){
					registry.byId("cd_elevationCheckbox").get('checked')? self.contours.show() : self.contours.hide() ;	
				});
				
				 
				
				
			}
		
			this.addCheckboxListerForSliders = function() {
				
				var marshCheckbox = registry.byId("cd_marsh");
				//console.log(marshCheckbox);
				
				
				var sliderHandles = dom.byId(this.rangeSlider.sliderHandle.children[0]);
				//console.log('test');
				//console.log(sliderHandles);
				var sliderHandleMax = dom.byId(this.rangeSlider.sliderHandleMax.children[0]);
				var sliderBar = dom.byId(this.rangeSlider.sliderBarContainer.children[1]);
				
				//console.log(dojo.byId(this.rangeSlider));
				
							
				marshCheckbox.on("change", function(isChecked){
				    if(isChecked){
						domClass.remove(sliderHandles, "sliderHandleDeactivated");
						domClass.remove(sliderHandleMax, "sliderHandleDeactivated");
						domClass.remove(sliderBar, "sliderBarDeactivated");
					
						domClass.add(sliderHandles, "sliderHandleActivated");
						domClass.add(sliderHandleMax, "sliderHandleActivated");
						domClass.add(sliderBar, "sliderBarActivated");

				    }else{
				    	
						domClass.remove(sliderHandles, "sliderHandleActivated");
						domClass.remove(sliderHandleMax, "sliderHandleActivated");
						domClass.remove(sliderBar, "sliderBarActivated");
					
						domClass.add(sliderHandles, "sliderHandleDeactivated");
						domClass.add(sliderHandleMax, "sliderHandleDeactivated");
						domClass.add(sliderBar, "sliderBarDeactivated");


				    }
				}, true);
			}
	
			this.addCheckboxDisableListener = function(){
				
				var marshCheckbox = registry.byId("cd_marsh");
				//console.log(marshCheckbox)
				
				
				var shoreEdgeBox = registry.byId("cd_shoreEdgeBox");
				var seaEdgeBox = registry.byId("cd_seaEdgeBox");
				var densityButton = registry.byId("cd_marshDensityButton");
				
							
				marshCheckbox.on("change", function(isChecked){
				    if(isChecked){
						shoreEdgeBox.set('disabled' ,false);
						seaEdgeBox.set('disabled' ,false);
						densityButton.set('disabled' ,false);
				    }else{
 				      	shoreEdgeBox.set('disabled' ,true);
						seaEdgeBox.set('disabled' ,true);
						densityButton.set('disabled', true)

				    }
				}, true);
				
			}
			
			this.addButtonsToInputPanel = function(){
				
				//console.log(this);
				var mainPanel = dom.byId("cd_plotDiv");
	
				var inputButtonDiv  = domConstruct.create("div", {id:"cd_inputButtonDiv", style: "top: 40px; position: relative; border-top: 1px solid #ddd; padding: 10px"});
				mainPanel.appendChild(inputButtonDiv)	
					
				var self = this;
				
			    var scenarioButton = new Button({
			        label: "Run Scenario",
					id: "cd_scenarioBtn",
			        onClick: function(){self.runScenario(this)}
			    });
				
			    var newProfileButton = new Button({
			        label: "Select New Profile",
					id: "cd_newProfileBtn",
			        onClick: function(){self.newProfileButtonHandler(self)}
			    });
				
			    var updateMapButton = new Button({
			        label: "UpdateMap",
					id: "cd_updateMapBtn",
			        onClick: function(){self.updateMap(self)}
			    });
				
				//console.log(scenarioButton);
				inputButtonDiv.appendChild(scenarioButton.domNode)
				inputButtonDiv.appendChild(newProfileButton.domNode)
				inputButtonDiv.appendChild(updateMapButton.domNode)
				
			    var scenarioBtnTooltip = new Tooltip({
			        connectId: ["cd_scenarioBtn"],
			        label: "Run Model"
			    });
				
				
			    var newProfileBtnTooltip = new Tooltip({
			        connectId: ["cd_newProfileBtn"],
			        label: "Start Over in a New Location"
			    });
				
			    updateMapButtonTooltip = new Tooltip({
			        connectId: ["cd_updateMapBtn"],
			        label: "Update Marsh Extent on Map with Values From Sliders"
			    });
				
				domClass.add(updateMapButtonTooltip.domNode, "claro");
				dojo.addClass(dojo.body(), 'claro'); 
				//domClass.add(inputButtonDiv.domNode, "claro");
				// 
				// domClass.add(newProfileButton.domNode, "claro");
				
				
			}
			
			this.runScenario = function(){
				
				domStyle.set(this.cd_borderContainer.domNode, "display", "none");
				var showProcessingMsg = this.profileProcessingMsg();
				
				//console.log(this);
				// Get Wave/Wind Data
				var waveRadio = dojo.byId('waveRadio1').checked;
				
				if(waveRadio == true){
					var waves = 'Direct';
				} else{
					var waves = 'WindWave';
				}
				
				
				var wHeight = dojo.number.parse(dojo.byId('waveHeight').value); 
				var wPeriod = dojo.number.parse(dojo.byId('wavePeriod').value);
				var winds = this.windButton.label;
				
				//Water Level and Surge Data
				var wl = _data[this.parameters.deltaKey].waterLevel[this.parameters.waterLevelKey].value;	
				var surge = _data[this.parameters.deltaKey].stormSurge[this.parameters.surgeLevelKey].value;
				//console.log(winds,wl, surge );
				
				//Habitat Data  
				var marshCheckbox = dojo.byId('cd_marsh').checked;
				if (marshCheckbox == true){
					this.parameters.marshCheck_Fut = true;
					this.parameters.marshSeaEdge_Fut = dojo.number.parse(dojo.byId('cd_seaEdgeBox').value); 
					this.parameters.marshLandEdge_Fut = dojo.number.parse(dojo.byId('cd_shoreEdgeBox').value);
				} else {
					this.parameters.marshCheck_Fut = false;
					this.parameters.marshSeaEdge_Fut = 0; 
					this.parameters.marshLandEdge_Fut = 0;	
				}
				
				var marshDensity = _data[this.parameters.deltaKey].marshDensity[this.parameters.marshDensityKey].value;
				
				// -- NOTE: Marsh Height and stem diameter are hard coded in python code -- //
				
				//console.log(marshCheckbox, this.parameters.marshSeaEdge_Fut, this.parameters.marshLandEdge_Fut, marshDensity);
				
				//Structure Data
				var dikes = dojo.byId('cd_dike').checked;
				var dikeCheck
				(dikes) ?  dikeCheck=1:  dikeCheck=0;
				
				var dikeSlope = dojo.number.parse(dojo.byId('cd_slopeBox').value); 
				var dikeHeight = dojo.number.parse(dojo.byId('cd_heightBox').value);
				
				var dikeCrest = dojo.number.parse(this.parameters.dikeCrest);
				var dikeToeHeight = dojo.number.parse(this.parameters.toeHeight);
				//console.log(dikes, dikeCheck, dikeSlope, dikeHeight, dikeCrest, dikeToeHeight);
				
				//console.log(this.parameters.profileNum);
				
			    var params = { 
					"Profile_Number": this.parameters.profileNum,
					"Waves" : waves,
					"Wave_Height" : number.round(wHeight / this.currentUnits.multiplier,0),
					"Wave_Period": wPeriod,
					"Wind" : winds,
					"Water_Level": wl,
					"Storm_Surge": surge,
					"Eelgrass_Sea_Edge": 0,
					"Eelgrass_Land_Edge": 0,
					"Eelgrass_Density": 0,
					"Eelgrass_Plant_Height": 0,
					"Eelgrass_Stem_Diameter": 0,
					"Marsh_Sea_Edge": number.round(this.parameters.marshSeaEdge_Fut / this.currentUnits.multiplier,0),
					"Marsh_Land_Edge": number.round(this.parameters.marshLandEdge_Fut / this.currentUnits.multiplier,0),
					"Marsh_Density": marshDensity,
					"Marsh_Plant_Height": 0,
					"Marsh_Stem_Diameter": 0,
					"Dike_Check" : dikeCheck,
					"Dike_Crest": number.round(dikeCrest / this.currentUnits.multiplier,0),
					"Dike_Slope": dikeSlope,
					"Dike_Height": number.round(dikeHeight / this.currentUnits.multiplier,0),
					"Toe_Height": number.round(dikeToeHeight / this.currentUnits.multiplier,0),
					"Profile_Lat" : this.parameters.profLat,
					"Profile_Lon" : this.parameters.profLon,
					
			
				};
		
				//console.log(params);
				
				
				//gp = new esri.tasks.Geoprocessor("http://dev.network.coastalresilience.org/ArcGIS/rest/services/Puget_Sound/PS_NSWaves/GPServer/generateProfile_plugin", this);
				//gp = new esri.tasks.Geoprocessor("http://54.244.29.137:6080/arcgis/rest/services/PugetSound_CoastalDefense/generateProfile_Plugin/GPServer/generateProfile_plugin", this);
				gp = new esri.tasks.Geoprocessor("http://10.1.5.21:6080/arcgis/rest/services/PugetSound_CoastalDefense/generateProfilePlugin/GPServer/generateProfile_plugin", this);


				gp.execute(params, this.profileResults, function(error) {
		
					Ext.MessageBox.alert('profile Error', "profile Error, please try again.");
					//console.log(messages);
					//console.log(error);
		
					}
				); //End gp.execute
				
				
			}
			
			this.profileResults = function(results, messages){
				
				//console.log(results);
				//console.log(messages);
				
			    // Get Data
	    		
				self.results = {};
				
				//Detailed Results Link
				self.results.detailedResults = results[0].value;
				
			    //Wave Heights
				////console.log(results[1]);
			    self.results.waveHeightVeg_cur = results[1].value;  //eval('(' + results[1].value + ')');
			    self.results.waveHeightNoveg_cur = results[2].value;  //eval('(' + results[2].value + ')');
	    
			    self.results.waveHeightVeg_fut = results[3].value;  //eval('(' + results[3].value + ')');
			    self.results.waveHeightNoveg_fut = results[4].value;  //eval('(' + results[4].value + ')');
				
				
				_.each(self.results.waveHeightVeg_cur, function(value, key){					
					self.results.waveHeightVeg_cur[key] = value * self.currentUnits.multiplier;
				});
				
				
				_.each(self.results.waveHeightNoveg_cur, function(value, key){					
					self.results.waveHeightNoveg_cur[key] = value * self.currentUnits.multiplier;
				});	
				
				
				_.each(self.results.waveHeightVeg_fut, function(value, key){					
					self.results.waveHeightVeg_fut[key] = value * self.currentUnits.multiplier;
				});	
				
				
				_.each(self.results.waveHeightNoveg_fut, function(value, key){					
					self.results.waveHeightNoveg_fut[key] = value * self.currentUnits.multiplier;
				});				


			    //X Axis - distance from MSL
			    self.results.Xveg_cur = results[5].value;  //eval('(' + results[5].value + ')');
			    self.results.Xveg_fut = results[6].value;  //eval('(' + results[6].value + ')');
				
				_.each(self.results.Xveg_cur, function(value, key){					
					self.results.Xveg_cur[key] = value * self.currentUnits.multiplier;
				});	
				
				
				_.each(self.results.Xveg_fut, function(value, key){					
					self.results.Xveg_fut[key] = value * self.currentUnits.multiplier;
				});	


		        //Profile Height
		        self.results.ProfileHeight_cur = results[7].value;   //eval('(' + results[7].value + ')');
				
				_.each(self.results.ProfileHeight_cur, function(value, key){					
					self.results.ProfileHeight_cur[key] = value * self.currentUnits.multiplier;
				});	
				
				
				//console.log('test');
				
		        // Overtopping Output
		        self.results.dikemsg = results[8].value;
		        self.results.dikemsgMA = results[9].value;
				self.results.dikemsgNo = results[10].value;
				
				
				//console.log(self.results.waveHeightVeg_cur);
				//console.log(self.results.waveHeightNoveg_cur);
				//console.log(self.results.waveHeightVeg_fut);
				//console.log(self.results.waveHeightNoveg_fut);
				//console.log(self.results.Xveg_cur);
				//console.log(self.results.Xveg_fut);
				//console.log(self.results.ProfileHeight_cur);
				//console.log(self.results.dikemsg);
				//console.log(self.results.dikemsgMA);
				
				var resultsPanel = self.createResultsPanel(self);
				
			}
			
			this.createResultsPanel = function(){
				
				//console.log(this);
				
				//Hide Msg
				domStyle.set(this.processMsgDiv, "display", "none");
				
				//Create Border Container for Results
				this.cd_resultsBorderContainer = new BorderContainer({id: "cd_resultsBorderPanel", style: "height: 560px; width: 795px; margin: 10px; padding: 0px; overflow: hidden;"});
				
				//console.log(this.cd_resultsBorderContainer);
				
				dom.byId(_container).appendChild(this.cd_resultsBorderContainer.domNode);
				this.cd_resultsBorderContainer.startup()
				
				domClass.add(this.cd_resultsBorderContainer, "tundra");
				
				//Create Tab Panel for Results Plots
				this.resultsTabContainer = new TabContainer({
							id: "resultsTabContainer",
							style: "width: 800px; height: 380px; padding: 0px; border: none; overflow: hidden;",
							doLayout: true,
							//tabStrip: true,
							region:"top"
						 }, "cd_resultsTabContainer");

				var tabPanelStyle = "width: 800px; margin: 0px; overflow: hidden;" //height: 340px;
			    
				this.waveHeightPanel = new ContentPane({
			         title: "Wave Height",
					 id: "cd_waveHeightPanel",
					 style: tabPanelStyle
			    });
				
			    this.resultsTabContainer.addChild(this.waveHeightPanel);
			    
				this.waveChangePanel = new ContentPane({
			         title: "Wave Reduction",
					 id: "cd_waveChangePanel",
					 style: tabPanelStyle
			    });
				
			    this.resultsTabContainer.addChild(this.waveChangePanel);
				
				this.resultsTabContainer.startup();
				
				this.cd_resultsBorderContainer.addChild(this.resultsTabContainer);
				
				
				
				//Create Bottom Panel for levee overflow
				this.leveePanel = new ContentPane({
					id: 'cd_leveePanel',
					region: 'center',	 
					style:"height: 145px!important; border: none; overflow: hidden;"
				});
				
				this.cd_resultsBorderContainer.addChild(this.leveePanel);
				
				
				this.plotResults(this);
				this.addLeveeInfo(this);
				this.addButtonsToResultsPanel(this);
				
				this.parameters.currentWindow = 3;
				
			}
			
			this.plotResults = function(){
				
				var self = this;
				
				 //Wave Heights
				 waveHeightVeg_cur_plotting = [];
				 waveHeightNoveg_cur_plotting = [];
				 waveHeightVeg_fut_plotting = [];
				 waveHeightNoveg_fut_plotting = [];
				 
		         HChange_cur = [];
		         HChange_fut = [];
				 
				 
				 _.each(this.results.Xveg_cur, function(value, key){

				 
					 //Wave Height with Veg Current
					 var item = {
				 	
						 x: value,
						 y: self.results.waveHeightVeg_cur[key]
					 }
				 
					 waveHeightVeg_cur_plotting.push(item);
					 
					 
					 //Wave Height without Veg Current
					 var item = {
				 	
						 x: value,
						 y: self.results.waveHeightNoveg_cur[key]
					 }
				 
					 waveHeightNoveg_cur_plotting.push(item);					 
					 
					 
					 //Wave Height with Veg Future
					 var item = {
				 	
						 x: value,
						 y: self.results.waveHeightVeg_fut[key]
					 }
				 
					 waveHeightVeg_fut_plotting.push(item);
					 
					 
					 //Wave Height without Veg Future
					 var item = {
				 	
						 x: value,
						 y: self.results.waveHeightNoveg_fut[key]
					 }
				 
					 waveHeightNoveg_fut_plotting.push(item);	
					 
					 //Current Change Due to Habitat
					 var tmp = self.results.waveHeightVeg_cur[key] / self.results.waveHeightNoveg_cur[key] * 100;
					 
					 
					 var item = {
					 				 	
 						 x: value,
 						 y: tmp
					 }	
					 
					 HChange_cur.push(item);
					 
					 //Future Change Due to Habitat
					 var tmp = self.results.waveHeightVeg_fut[key] / self.results.waveHeightNoveg_fut[key] * 100;
					 var item = {
					 				 	
 						 x: value,
 						 y: tmp
					 }					 					 
					 
					 HChange_fut.push(item);
					 
				 });
				 
				 
				 //console.log(waveHeightVeg_cur_plotting);
				 //console.log(waveHeightNoveg_cur_plotting);
				 //console.log(waveHeightVeg_fut_plotting);
				 //console.log(waveHeightNoveg_fut_plotting);
				 
				 //console.log(waveHeightNoveg_fut_plotting);
				 //console.log(waveHeightNoveg_fut_plotting);

				
				
				//Set Some Plotting Parameters
				var xTitle = 'Distance From Shore ' + this.currentUnits.unitText;
				var yTitle = 'Height (' + this.currentUnits.unitTextFull + ' Above MSL)';
				axisFonts = '14pt';
				
				//Create Plot
				
				var plotDivHTML = "<div id='cd_waveHeight' style= 'height: 250px;'></div><div id = 'cd_waveHeight_legendParent'> <div id='cd_waveHeight_legendDiv' class='cd_legend'></div></div>";
				var plotDiv = domConstruct.create("div", {id:"cd_waveHeight_chartDiv", innerHTML: plotDivHTML});
				var waveHeightPanel = dom.byId("cd_waveHeightPanel");
				
				waveHeightPanel.appendChild(plotDiv); 
				
				this.waveHeightChart = new Chart('cd_waveHeight', {title: 'Modeled Wave Heights', titleGap: 15});
				this.waveHeightChart.addPlot("waveHeight", {type: Lines});
				this.waveHeightChart.addPlot("marsh", {type: Areas});
				this.waveHeightChart.addAxis("x", {title: xTitle, font: axisFonts, titleOrientation: 'away', titleGap: 10 });
				this.waveHeightChart.addAxis("y", {vertical: true, title: yTitle, font: axisFonts});   //, min: -2, max: 2});
							
				
				this.waveHeightChart.addSeries("Current Scenario", waveHeightVeg_cur_plotting,
					{plot: "waveHeight", tension:"S", stroke: {color:"#1589FF", width: 3}});  
					
				this.waveHeightChart.addSeries("Future Scenario", waveHeightVeg_fut_plotting,
					{plot: "waveHeight", tension:"S", stroke: {color:"#ffd700", width: 3}}); 
					
				this.waveHeightChart.addSeries("No Vegetation", waveHeightNoveg_cur_plotting,
					{plot: "waveHeight", tension:"S", stroke: {color:"#000000", width: 3}}); 
					
				
				this.waveHeightChart.render();
				
				//Get y axis min and max
				var ymin = this.waveHeightChart.axes.y.getTicks().major[0].value;
				var ymax = Math.max(_.last(self.waveHeightChart.axes.y.getTicks().major).value, _.last(self.waveHeightChart.axes.y.getTicks().minor).value );
				
				// var ymin = _.min(_.min(self.results.waveHeightNoveg_fut), _.min(self.results.waveHeightNoveg_cur), _.min(self.results.waveHeightVeg_fut), _.min(self.results.waveHeightVeg_cur));
				// var ymax = _.max(_.max(self.results.waveHeightNoveg_fut), _.max(self.results.waveHeightNoveg_cur), _.max(self.results.waveHeightVeg_fut), _.max(self.results.waveHeightVeg_cur));
				
				
				//console.log(ymin);
				//console.log(ymax);
				
				//Dike Position
				var dikePosition = [
					{x: this.parameters.dikeCrest, y: ymin},
					{x: this.parameters.dikeCrest, y: ymax}
				
				]
				
				if(this.parameters.dikeCheck == true){
				    this.waveHeightChart.addSeries("Dike Position", dikePosition,
						{plot: "waveHeight", stroke: {color:"rgba(250, 0, 0, 1)", width: 3}});
				}
				
				//Marsh Extent
				var marshExtent = [
					{x: this.parameters.marshSeaEdge, y: ymax},
					{x: this.parameters.marshLandEdge, y: ymax}
				]
				
				var ymaxFut = ymax * 0.7;
				
				var marshExtent_Fut = [
					{x: this.parameters.marshSeaEdge_Fut, y: ymaxFut},
					{x: this.parameters.marshLandEdge_Fut, y: ymaxFut}
				
				]
				//console.log(marshExtent);
				//console.log(marshExtent_Fut);
				
				if(this.parameters.marshCheck == true){
				    this.waveHeightChart.addSeries("Current Marsh Extent", marshExtent,
						{plot: "marsh", stroke: {color:"rgba(0,127,0,0)"}, fill: "rgba(0,127,0,0.3)"});
				}
				
				if(this.parameters.marshCheck_Fut == true){
				    this.waveHeightChart.addSeries("Future Marsh Extent", marshExtent_Fut,
						{plot: "marsh", stroke: {color:"rgba(0,127,0,0)"}, fill: "rgba(0,127,0,1)"});
				}
				
				//console.log(this);
				
				this.waveHeightChart.render();
				
				//console.log(this);
				
				var legend = new Legend({ id: "cd_waveHeightLegend", class: "cd_waveHeightLegend", chart: this.waveHeightChart, layoutAlign: "Right"}, "cd_waveHeight_legendDiv");
				
				//console.log(this);
				
				//Add figure description
				var heightHTML = "<div class = 'resultsTxt'> The plot above shows modeled wave heights for current (blue) and future (yellow) habitat scenarios.  The black line shows modeled wave heights in the absence of habitat.<br/></div>"
	 		   	var plotDiv = domConstruct.create("div", {id:"cd_waveHeightDescription", innerHTML: heightHTML});
				waveHeightPanel.appendChild(plotDiv);
				
				
				var changeHTML = "<div class= 'resultsTxt'> The plot above compares wave heights in the current (blue) and future (yellow) habitat scenarios to wave heights with all habitat removed.  The y-axis shows wave height as a percent of the scenario with no habitat. The presence of habitat along the profile reduces wave height.<br/></div>"
				
				//console.log(this);
				
				//-- Wave Change Plot -- //
				
				var changePlotDivHTML = "<div id='cd_waveChange' style= 'height: 250px;'></div><div id = 'cd_waveChange_legendParent'> <div id='cd_waveChange_legendDiv' class='cd_legend'></div></div>";
				var changePlotDiv = domConstruct.create("div", {id:"cd_waveChange_chartDiv", innerHTML: changePlotDivHTML});
				var waveChangePanel = dom.byId("cd_waveChangePanel");
				
				//Make the div visible so that the chart will plot with the correct dimensions
				domClass.remove("cd_waveChangePanel", "dijitHidden");
				domClass.add("cd_waveChangePanel", "dijitVisible");
			
				
				waveChangePanel.appendChild(changePlotDiv); 
				
				var yTitle = 'Percent of No Habitat Scenario';
				
				this.waveChangeChart = new Chart('cd_waveChange', {title: "Wave Reduction Due to Habitat", titleGap: 15});
				this.waveChangeChart.addPlot("waveChange", {type: Lines});
				this.waveChangeChart.addPlot("marshChange", {type: Areas});
				this.waveChangeChart.addAxis("x", {title: xTitle, font: axisFonts, titleOrientation: 'away', titleGap: 10 });
				this.waveChangeChart.addAxis("y", {vertical: true, title: yTitle, font: axisFonts});   //, min: -2, max: 2});
				
				
				this.waveChangeChart.addSeries("Current Scenario", HChange_cur,
					{plot: "waveChange", tension:"S", stroke: {color:"#1589FF", width: 3}});  
					
				this.waveChangeChart.addSeries("Future Scenario", HChange_fut,
					{plot: "waveChange", tension:"S", stroke: {color:"#ffd700", width: 3}}); 
				
				
				this.waveChangeChart.render();
				
				//Get y axis min and max
				var ymin = this.waveChangeChart.axes.y.getTicks().major[0].value;
				var ymax = Math.max(_.last(this.waveChangeChart.axes.y.getTicks().major).value, _.last(this.waveChangeChart.axes.y.getTicks().minor).value );
				
				// var ymin = _.min(_.min(self.results.waveHeightNoveg_fut), _.min(self.results.waveHeightNoveg_cur), _.min(self.results.waveHeightVeg_fut), _.min(self.results.waveHeightVeg_cur));
				// var ymax = _.max(_.max(self.results.waveHeightNoveg_fut), _.max(self.results.waveHeightNoveg_cur), _.max(self.results.waveHeightVeg_fut), _.max(self.results.waveHeightVeg_cur));
				
				//console.log(ymin);
				//console.log(ymax);
				
				//Dike Position
				var dikePosition_ChangePlot = [
					{x: this.parameters.dikeCrest, y: ymin},
					{x: this.parameters.dikeCrest, y: ymax}
				
				]
				
				
				if(this.parameters.dikeCheck == true){
				    this.waveChangeChart.addSeries("Dike Position", dikePosition_ChangePlot,
						{plot: "waveChange", stroke: {color:"rgba(250, 0, 0, 1)", width: 3}});
				}
				
				//Marsh Extent
				var marshExtent_ChangePlot = [
					{x: this.parameters.marshSeaEdge, y: ymax},
					{x: this.parameters.marshLandEdge, y: ymax}
				]
				
				
				var ymaxFut = ymax * 0.7;
				
				var marshExtent_Fut_ChangePlot = [
					{x: this.parameters.marshSeaEdge_Fut, y: ymaxFut},
					{x: this.parameters.marshLandEdge_Fut, y: ymaxFut}
				
				]
				
					
				if(this.parameters.marshCheck == true){
				    this.waveChangeChart.addSeries("Current Marsh Extent", marshExtent_ChangePlot,
						{plot: "marshChange", stroke: {color:"rgba(0,127,0,0)"}, fill: "rgba(0,127,0,0.3)"});
				}
			
				if(this.parameters.marshCheck_Fut == true){
				    this.waveChangeChart.addSeries("Future Marsh Extent", marshExtent_Fut_ChangePlot,
						{plot: "marshChange", stroke: {color:"rgba(0,127,0,0)"}, fill: "rgba(0,127,0,1)"});
				}
				
				
				this.waveChangeChart.render();
				
				var legend = new Legend({ id: "cd_waveChangeLegend", class: "cd_waveHeightLegend", chart: this.waveChangeChart, layoutAlign: "Right"}, "cd_waveChange_legendDiv");
				
				
				
				//Add figure description
				var changeHTML = "<div class= 'resultsTxt'> The plot above compares wave heights in the current (blue) and future (yellow) habitat scenarios to wave heights with all habitat removed.  The y-axis shows wave height as a percent of the scenario with no habitat. The presence of habitat along the profile reduces wave height.<br/></div>"
	 		   	var plotDiv = domConstruct.create("div", {id:"cd_waveChangeDescription", innerHTML: changeHTML});
				waveChangePanel.appendChild(plotDiv);
				
				
				var changeHTML = "<div class= 'resultsTxt'> The plot above compares wave heights in the current (blue) and future (yellow) habitat scenarios to wave heights with all habitat removed.  The y-axis shows wave height as a percent of the scenario with no habitat. The presence of habitat along the profile reduces wave height.<br/></div>"
				
				
				domClass.remove("cd_waveChangePanel", "dijitVisible");
				domClass.add("cd_waveChangePanel", "dijitHidden");
	
			}
			
			this.addLeveeInfo = function(){
				
				//console.log(this);
				var leveeHTML = "<div><b><u>Levee Overtopping</u></b></div>";
				leveeHTML += "<div class= 'leveeTxt'>" + this.results.dikemsg + "</div>";
				leveeHTML += "<div class= 'leveeTxt'>" + this.results.dikemsgMA + "</div>";
				leveeHTML += "<div class= 'leveeTxt'>" + this.results.dikemsgNo + "</div>";

			 	leveeMsg = domConstruct.create("div", {id:"cd_leveeMsg", innerHTML: leveeHTML});
				this.leveePanel.set('content', leveeMsg);
			}
			
			this.addButtonsToResultsPanel = function(){
				
				var self = this;
				
				var leveePanel = dom.byId("cd_leveePanel");

				var resultButtonDiv  = domConstruct.create("div", {id:"cd_resultButtonDiv", style: "top: 5px; position: relative; border-top: 1px solid #ddd; padding: 10px"});
				leveePanel.appendChild(resultButtonDiv)	
				
			    var detailedResultsButton = new Button({
			        label: "View Detailed Results",
					id: "cd_resultsBtn",
			        onClick: function(){window.open(self.results.detailedResults)}
			    });
				
			    var differentScenarioButton = new Button({
			        label: "Run Different Scenario",
					id: "cd_newDifferentScenarioBtn",
			        onClick: function(){self.differentScenarioBtnHandler(self)}
			    });
				
			    var newProfileResultsButton = new Button({
			        label: "Select New Profile",
					id: "cd_newProfileResultsBtn",
			        onClick: function(){self.newProfileButtonHandler(self)}
			    });
				
				//console.log(detailedResultsButton);
				resultButtonDiv.appendChild(detailedResultsButton.domNode);
				resultButtonDiv.appendChild(differentScenarioButton.domNode);
				resultButtonDiv.appendChild(newProfileResultsButton.domNode);
				

			    var detailedResultsBtnTooltip = new Tooltip({
			        connectId: ["cd_resultsBtn"],
			        label: "Open Detailed Results in a New Browser Tab"
			    });
				
			    var profileResultsBtnTooltip = new Tooltip({
			        connectId: ["cd_newDifferentScenarioBtn"],
			        label: "Run a Different Scenario for the Current Profile"
			    });
				
			    var newProfileBtnTooltip = new Tooltip({
			        connectId: ["cd_newProfileResultsBtn"],
			        label: "Start Over in a New Location"
			    });
				
				domClass.add(detailedResultsBtnTooltip.domNode, "claro");
				domClass.add(profileResultsBtnTooltip.domNode, "claro");
				domClass.add(newProfileBtnTooltip.domNode, "claro");
				
			}
			
			this.differentScenarioBtnHandler = function(){
				
				if (_.isObject(this.cd_resultsBorderContainer)){
					this.cd_resultsBorderContainer.destroyRecursive();
				}
				
				domStyle.set(this.cd_borderContainer.domNode, "display", "block");
				
			}
			
			this.newProfileButtonHandler = function(){
				
				this.cd_borderContainer.destroyRecursive();
				
				if (_.isObject(this.cd_resultsBorderContainer)){
					this.cd_resultsBorderContainer.destroyRecursive();
				}
				
				dojo.destroy(this.startPanel);

				this.showStartWindow(this.parameters.delta, this.parameters.deltaKey);
				
				this.contours.hide();
				
			}
			
			this.updateMap = function(){
				
				//console.log(this);
				
				//Get profile and marsh boundaries
				var profileStart = this.parameters.shoreDist[0];
				var profileEnd = _.last(this.parameters.shoreDist);
				

				var marshStart = this.parameters.marshSeaEdge_Fut;
				var marshEnd = this.parameters.marshLandEdge_Fut;
				
				arguments = [profileStart, profileEnd, marshStart, marshEnd];
				
				//console.log(arguments);
				
				
				try{
				 	this.habExtentLayer.clear();
				}catch (err) {
			
				}
		
		
				dojo.connect(this.profilePoints, "onSelectionComplete", this.addGraphics);
				
				
				this.habExtentLayer = new esri.layers.GraphicsLayer();
				
				//console.log(this.habExtentLayer);
		
				//Generate Query
				var habQuery = new esri.tasks.Query();
				habQuery.outFields = ['Pt_ID'];
				habQuery.returnGeometry = true;
				habQuery.where += ''
		
				for (var i = 0; i < arguments.length; i++){
			
					if (i > 0){
						habQuery.where += ' OR '
					}
					habQuery.where += '(Profile_ID = ' + this.parameters.profileNum + ' AND Pt_ID = ' + arguments[i] + ')';

					//console.log(habQuery.where);
				}
		
				this.profilePoints.selectFeatures(habQuery, esri.layers.FeatureLayer.SELECTION_NEW);
				this.profilePoints.clearSelection()
		
				//thing.habExtentLayer.add(dikeGraphic);
				_map.addLayer(this.habExtentLayer);
				
				//console.log(this.habExtentLayer);
				
				
			}
			
			this.addGraphics =  function(){
				
				//console.log(this);
				
				var selection = self.profilePoints.getSelectedFeatures();
			
				//console.log(selection);

				var habitatPoints = [];
		
				for (var i=0; i < selection.length; i++){
		
					habitatPoints.push(new esri.geometry.Point(selection[i].geometry.x, selection[i].geometry.y, new esri.SpatialReference({"wkid": 102100})));
				}
		
				//console.log(habitatPoints);

			
				//Define symbols
	
				//marsh			
				var marshSymbol = new esri.symbol.PictureMarkerSymbol({				
					url: "http://dev.network.coastalresilience.org/PS/images/GeneralMarsh.png",
					height: 20,
					width: 20,
					type: "esriPMS"
			
				});
				
					
				//dike			
				var dikeSymbol = new esri.symbol.PictureMarkerSymbol({
			
					url: "http://dev.network.coastalresilience.org/PS/images/symbol-water-dam-3.png",
					height: 20,
					width: 20,
					type: "esriPMS"				
				});
	

	
				//Create Lines
		
				//profile line
				var line = {
					geometry:{
						"paths":[[[habitatPoints[0].x,habitatPoints[0].y],[habitatPoints[3].x,habitatPoints[3].y]]],
						"spatialReference":{"wkid":102100}},
						"symbol":{"color": new dojo.Color([255,165,0]),"width":1,"type":"esriSLS","style":"esriSLSSolid"}};
				var profileLine = new esri.Graphic(line);
				self.habExtentLayer.add(profileLine);

	
	
		
				//marsh line
				if (dojo.byId('cd_marsh').checked == true){
					var line = {
						geometry:{
							"paths":[[[habitatPoints[1].x, habitatPoints[1].y],[habitatPoints[2].x,habitatPoints[2].y]]],
							"spatialReference":{"wkid":102100}},
							"symbol":{"color": new dojo.Color("#339933"),"width":2,"type":"esriSLS","style":"esriSLSSolid"}};
			
					var marshLine = new esri.Graphic(line);
					self.habExtentLayer.add(marshLine);		
			
			
					//add symbol
					var x = (habitatPoints[1].x + habitatPoints[2].x) / 2;
					var y = (habitatPoints[1].y + habitatPoints[2].y) / 2;
			
					var marshPoint = new esri.geometry.Point(x, y, new esri.SpatialReference({"wkid": 102100}));
					var marshGraphic = new esri.Graphic(marshPoint, marshSymbol);
			
					self.habExtentLayer.add(marshGraphic);

				}
			


		
			} //end addGraphics
			
			this.getPanelParameters = function(){
				
				
				this.parameters.waveRadio = dojo.byId('waveRadio1').checked;
				
				if(this.parameters.waveRadio == true){
					this.parameters.waves = 'Direct';
				} else{
					this.parameters.waves = 'WindWave';
				}
				
				this.parameters.wHeight = dojo.number.parse(dojo.byId('waveHeight').value); 
				this.parameters.wPeriod = dojo.number.parse(dojo.byId('wavePeriod').value);
				this.parameters.waveBtnLabel = this.windButton.label;
				
				//Water Level and Surge Data
				this.parameters.waterLevelLabel = _data[this.parameters.deltaKey].waterLevel[this.parameters.waterLevelKey].name;	
				this.parameters.surgeLevelLabel = _data[this.parameters.deltaKey].stormSurge[this.parameters.surgeLevelKey].name;
				
				this.parameters.marshDensityLabel = _data[this.parameters.deltaKey].marshDensity[this.parameters.marshDensityKey].name;

				this.parameters.marshCheck = dojo.byId('cd_marsh').checked;
				this.parameters.dikeCheck = dojo.byId('cd_dike').checked;
				
				
			}
			
			this.resetState = function(){
				
				//console.log(this);
				//console.log(this.parameters);
				
				//console.log(this.parameters.currentWindow);
				
				var currentWindow = this.parameters.currentWindow;
				var marshCheck = this.parameters.marshCheck;
				

				
				this.showStartWindow(this.parameters.delta, this.parameters.deltaKey);
				
				//console.log('test');
				//dojo.disconnect(this.clickhandle);
				//console.log('test');
				
				if (currentWindow > 1 ){
					

					domStyle.set(this.startPanel, "display", "none");
					this.profileLoadingMsg();

				
					this.startTool();
					
					//Set input panel values
					this.updateWaveBtn(this.parameters.waveBtnLabel);
					this.updateWaterBtn(this.parameters.waterLevelLabel, this.parameters.waterLevelKey);
					this.updateSurgeBtn(this.parameters.surgeLevelLabel, this.parameters.surgeLevelKey);
					this.updateMarshDensityBtn(this.parameters.marshDensityLabel, this.parameters.marshDensityKey);
				
					if (this.parameters.waveRadio == true){
						dijit.byId("waveRadio1").set('checked', true);
						dijit.byId("waveRadio2").set('checked', false);
					} else{
						dijit.byId("waveRadio1").set('checked', false);
						dijit.byId("waveRadio2").set('checked', true);			
					
					}
				
					dojo.byId("waveHeight").value = this.parameters.wHeight;
				
					dojo.byId("wavePeriod").value = this.parameters.wPeriod;
				
					dijit.byId("cd_marsh").set('checked', marshCheck);
					dojo.byId("cd_seaEdgeBox").value = this.parameters.marshSeaEdge_Fut;
					dojo.byId("cd_shoreEdgeBox").value = this.parameters.marshLandEdge_Fut;
					
					dijit.byId("cd_dike").set('checked', this.parameters.dikeCheck);
					dojo.byId("cd_slopeBox").value = this.parameters.dikeAngle;
					dojo.byId("cd_heightBox").value = this.parameters.dikeHeight;
					
					this.rangeSlider.set('value', [this.parameters.marshSeaEdge_Fut, this.parameters.marshLandEdge_Fut]);

					//console.log('test');
				}


				
				
			}
			
			this.addLaodingDiv = function(){
				
				var loadingDiv  = domConstruct.create("div", {id:"cd_loadingDiv", html: '<img id="loadingImg" src="images/loading2.gif" style="position:absolute; right:50%; top: 50%;  z-index:100; display: none;" /' });
				
				
				dojo.body().appendChild(inputButtonDiv)	
				this.hideLoading();
								
			}
			
			this.showLoading =  function(){
		
				var loading = dojo.byId("loadingImg");
				esri.show(loading);	
	
			}
	
			this.hideLoading = function(){
	
				var loading = dojo.byId("loadingImg");
				esri.hide(loading);	
	
			}
	
			this.parseConfigData = function(configFile) {
				// Parse and validate config data to get URLs of layer sources
				var errorMessage;
				try {
				    var data = JSON.parse(configFile),
				        schema = layerConfigSchema,
				        valid = tv4.validate(data, schema);
				    if (valid) {
				        return data;
				    } else {
				        errorMessage = tv4.error.message + " (data path: " + tv4.error.dataPath + ")";
				    }
				} catch (e) {
				    errorMessage = e.message;
				}
				_app.error("", "Error in config file layers.json: " + errorMessage);
				return null;
			}

			var layerConfigSchema = {
			        $schema: 'http://json-schema.org/draft-04/schema#',
			        title: 'Coastal Defense Config Schema',
			        type: 'array',
			        items: {
			            type: 'object',
			            additionalProperties: false,
			            properties: {
					location: {type: 'string'},
					layers: {type: 'object',
							additionalProperties: false,
							properties:{
								profileLandPoints: {type: 'string'},
								profilePoints: {type: 'string'},
								marshLayer: {type: 'string'},
								dikeLayer: {type: 'string'},
								demBins: {type: 'string'}
						 
							}

					}, // end layers
					extent: {type: 'array',
							items: { type: 'number'},
							minItems: 4,
							maxItems: 4
	
					},
					profilePointSpacing: {type: 'number'},
					waveHeightPeriod: {type: 'array',
							items: {type: 'number'},
							minItems: 2,
							maxItems: 2
					},
					winds: {type: 'array',
							items: {type: 'object',
									additionalProperties: false,
									properties:{value: {type: 'string'},name: {type: 'string'}}
							}
					},
					waterLevel: {type: 'array',
							items: {type: 'object',
									additionalProperties: false,
									properties:{value: {type: 'number'},name: {type: 'string'},id: {type: 'string'}}
							}
					},
					stormSurge: {type: 'array',
							items: {type: 'object',
									additionalProperties: false,
									properties:{value: {type: 'number'},name: {type: 'string'},id: {type: 'string'}}
							}
					},
					marshDensity: {type: 'array',
							items: {type: 'object',
									additionalProperties: false,
									properties:{value: {type: 'number'},name: {type: 'string'},id: {type: 'string'}}
							}
					},
					marshBoundary: {type: 'array',
							items: { type: 'number'},
							minItems: 2,
							maxItems: 2
	
					},
					help: {type: 'object',
							additionalProperties: false,
							properties:{
								help: {type: 'string'},
								windWave: {type: 'string'},
								waterLevel: {type: 'string'},
								stormSurge: {type: 'string'},
								habitat: {type: 'string'},
								habitatDensity: {type: 'string'},
								dikes: {type: 'string'},
								dikeSlope: {type: 'string'},
								dikeHeight: {type: 'string'}
						 
							}

					}, // end help
				 } //Close Properties
			    }  // Close Items
			} //end layerconfigschema		
				

				
			
		} ;// End cdTool
		return cdTool;	
		
	} //end anonymous function

); //End define
