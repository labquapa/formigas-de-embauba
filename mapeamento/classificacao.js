var year = 2021;
print ("Year", year);
var yearMinus1 = ee.Number(year).subtract(1).getInfo();

  
var calcEstat = function(featCol, column){
    var stat = featCol.reduceColumns(ee.Reducer.stdDev(),[column]).combine(
        featCol.reduceColumns(ee.Reducer.mean(),[column]));
    return stat;
  };
  
var calcZScore = function(feat, column, dict){
    var zscore = feat.getNumber(column).subtract(dict.get("stdDev")).divide(dict.get("mean"));
    return feat.set('zscore_'+column, zscore);
  }; 

var calcNDVI = function(image){
   var firstNDVI = image.normalizedDifference(['N', 'R']).rename('NDVI');
   var finalNDVI = (firstNDVI.add(1)).multiply(1000);
   var intImage = finalNDVI.toUint16(); //
   return intImage;
  };

var getFeatureSpace = function(image, samples){
    samples = image.sampleRegions({
      collection:samples,
      scale:30,
      geometries:true,
      tileScale:16
    });
    return ee.FeatureCollection(samples);
  };

var calcClassifier = function(nTree, image, nameClass, samples) {
    return ee.Classifier.smileRandomForest({
                    numberOfTrees:nTree,
                    seed:24})
                    .train({
                      features: samples,  
                      classProperty: nameClass, 
                      inputProperties: image.bandNames()})
                      .setOutputMode('CLASSIFICATION');
  };


var viz_Planet = {"bands":["R","G","B"],"min":64,"max":5454,"gamma":1.8};
var ndvi_intervalos =
    '<RasterSymbolizer>' +
      '<ColorMap type="intervals" extended="false" >' +
       '<ColorMapEntry color="#ffffff" quantity="1000" label="0-1000"/>' + // branco --> branco
       '<ColorMapEntry color="#ffffff" quantity="1200" label="1000-1200" />' + // amarelo #ffff00 --> branco
       '<ColorMapEntry color="#EDDD18" quantity="1400" label="1200-1400" />' + // verde claro #ccffcf --> amarelo 
       '<ColorMapEntry color="#DD0E0E" quantity="2000" label="1400-2000" />' + // verde escuro #008a1c --> vermelho
     '</ColorMap>' +
    '</RasterSymbolizer>';
var viz_amostras = {bands:["class"],max:4,min:0,palette:["a5a705","00da26","2b7605","000000","4d4d4d"], opacity:0.5};
var class_intervalos =
    '<RasterSymbolizer>' +
      '<ColorMap type="intervals" extended="false" >' +
       '<ColorMapEntry color="#e4ffd0" quantity="0.5" label="0-0.5"/>' + // verde claro
       '<ColorMapEntry color="#9ba327" quantity="0.6" label="0.5-0.6" />' + // ocre
       '<ColorMapEntry color="#9f891c" quantity="0.7" label="0.6-0.7" />' + // ocre escuro
       '<ColorMapEntry color="#525252" quantity="1" label="0.7-1" />' + // cinza
     '</ColorMap>' +
    '</RasterSymbolizer>';
var classfinal_intervalos =
    '<RasterSymbolizer>' +
      '<ColorMap type="intervals" extended="false" >' +
       '<ColorMapEntry color="#18de00" quantity="1.1" label="1: Não pavimentado com delividade menor que 20%"/>' + // verde claro #18de00
       '<ColorMapEntry color="#9f891c" quantity="2.1" label="1: Não pavimentado com delividade menor que 20%" />' + // ocre claro #9f891c
       '<ColorMapEntry color="#006e08" quantity="100.1" label="100: Não pavimentado com delividade maior que 20%" />' + // verde escuro #006e08
       '<ColorMapEntry color="#797a31" quantity="200.1" label="200: Pavimentado com delividade maior que 20%" />' + // ocre escuro #797a31
     '</ColorMap>' +
    '</RasterSymbolizer>';



//******************************* (0) Informações auxiliares
var BBox = ee.FeatureCollection("users/formigas/MSP/INPUT/SP");
Map.addLayer(BBox, {}, "BBox", false);

var BHM = ee.Image("users/formigas/MSP/INPUT/HeightModel/BHM");
Map.addLayer(BHM, {}, "BHM", false);

var VHM = ee.Image("users/formigas/MSP/INPUT/HeightModel/VHM");
Map.addLayer(VHM, {}, "VHM", false);

var DECLIV = ee.Image("users/formigas/MSP/OUTPUT/MDTPERCENT");
var DECLIVmask = DECLIV.select("percent").gt(20).remap([0,1],[1,100]);
Map.addLayer(DECLIVmask, {}, "DECLIVmask", false);

var Col7 = ee.Image("projects/mapbiomas-workspace/public/collection7/mapbiomas_collection70_integration_v2");
var Col7_ano = Col7.select("classification_"+year);
var Col7_ano_agua = Col7_ano.updateMask(Col7_ano.eq(33));
Map.addLayer(Col7_ano_agua, {}, "Col7_ano_agua", false);





//******************************* (1) Get Planet Image
// After 2020-12 (Year 2021)
  var months_dry = ["06","07","08","09","10","11"];
  var list_basemap_dry = ee.List([]);
  months_dry.forEach (function(m) {
    var im = ee.Image('projects/planet-nicfi/assets/basemaps/americas/planet_medres_normalized_analytic_' + year + '-' + m + '_mosaic');
    list_basemap_dry = list_basemap_dry.add(im);});
  //print("basemap_dry Imagecollection", ee.ImageCollection(list_basemap_dry));
  var basemap_dry = ee.ImageCollection(list_basemap_dry).reduce(ee.Reducer.median()).rename(["B","G","R","N"]);
  //print("basemap_dry", basemap_dry);
  var months_wet = ["01","02","03","04","05"];
  var list_basemap_wet = ee.List([]);
  months_wet.forEach (function(m) {
    var im = ee.Image('projects/planet-nicfi/assets/basemaps/americas/planet_medres_normalized_analytic_' + year + '-' + m + '_mosaic');
    list_basemap_wet = list_basemap_wet.add(im);});
  var im_dec = ee.Image('projects/planet-nicfi/assets/basemaps/americas/planet_medres_normalized_analytic_' + yearMinus1 + '-12_mosaic');
  list_basemap_wet = list_basemap_wet.add(im_dec);
  //print("basemap_wet ImageCollection", ee.ImageCollection(list_basemap_wet));
  var basemap_wet = ee.ImageCollection(list_basemap_wet).reduce(ee.Reducer.median()).rename(["B","G","R","N"]);
  //print("basemap_wet", basemap_wet);


// Clip 
  var Planet = basemap_dry.clip(BBox);
  //print("Planet - dry", Planet);
  //Map.addLayer(Planet, visPlanet, "Planet", false);

  var Planet_wet = basemap_wet.clip(BBox);
  //Map.addLayer(Planet_wet, visPlanet, "Planet_wet", false);


// Calculate NDVI
  var NDVI = calcNDVI(Planet);
  //Map.addLayer(NDVI ,{"opacity":1,"bands":["NDVI"],"min":707,"max":1580,"gamma":1},'NDVI', false);
  //Map.addLayer(NDVI.sldStyle(ndvi_intervals), {}, "NDVI fatiado", false);

  var NDVI_wet = calcNDVI(Planet_wet).rename("NDVI_wet");
  //Map.addLayer(NDVI_wet,{"opacity":1,"bands":["NDVI_wet"],"min":707,"max":1580,"gamma":1},'NDVI_dry', false);


// Mosaic
  Planet = Planet.addBands(NDVI).addBands(NDVI_wet);
  Map.addLayer(Planet, viz_Planet, "Planet");
  var bandas = ["B","G","R","N","NDVI","NDVI_wet"];
  print("Planet bandNames", bandas);  




//******************************* (2) Prepare masks: áreas livres de edificações e cobertura arbórea com pavimentação ou sem

    //a) áreas livres de edificações e cobertura arbórea, com pavimentação | class=0
    var NDVIlt1350 = NDVI.lt(1350);
    var VHMmask = VHM.unmask().not();
    var BHMmask = BHM.unmask().not();
    var im_pav = NDVIlt1350.multiply(VHMmask).multiply(BHMmask);
    im_pav = im_pav.selfMask().rename("class");
    im_pav = im_pav.add(-1);
    Map.addLayer(im_pav,{},"im_pav", false);
    
    //b) áreas livres de edificações e cobertura arbórea, sem pavimentação | class=1
    var NDVIgte1350 = NDVI.gte(1350);
    var VHMmask = VHM.unmask().not();
    var BHMmask = BHM.unmask().not();
    var im_npav = NDVIgte1350.multiply(VHMmask).multiply(BHMmask);
    im_npav = im_npav.selfMask();
    im_npav = im_npav.select(['NDVI'],['class']);
    Map.addLayer(im_npav, {},"im_rast", false);
      
    //c) Imagem Vegetação Arbórea | class=2
    var im_arb = VHM.neq(0);
    im_arb = im_arb.add(1);
    im_arb = im_arb.select(['b1'],['class']);
    Map.addLayer(im_arb, {}, "im_arb", false);
    
    //d) Imagem Edificação | class=3
    var im_edif = ee.Image.constant(3).updateMask(BHM).rename("class");
    //print("im_edif", im_edif);
    Map.addLayer(im_edif,{},"im_edif", false);

    var im_amostras = im_pav.blend(im_npav).blend(im_arb).blend(im_edif);
    //0=área livre pavimentada 1=área livre não pavimentada 2=veg arborea 3=edif
    Map.addLayer(im_amostras,viz_amostras,"im_amostras", false);

    var im_livre = im_amostras.remap([0,1,2,3],[1,1,0,0]).selfMask()//.reproject({crs:'EPSG:4326',scale:0.5});
    //Map.addLayer(im_livre,{},"im_livre", true);
    var noise = im_livre.connectedPixelCount(4, true)//.reproject({crs:'EPSG:4326',scale:0.5});
    //Map.addLayer(noise,{},"noise", true);
    var im_livre_filtered = im_livre.where(noise.lt(4), 0).selfMask()//.reproject({crs:'EPSG:4326',scale:0.5});
    Map.addLayer(im_livre_filtered,{},"im_livre_filtered", false);
 




//******************************* (3) Create samples dataset 
      var maskPAV = im_amostras.eq(0).selfMask();
      //Map.addLayer(maskPAV, {}, "maskPAV", false);
      var ptsPAV = maskPAV.sample({region: BBox, 
                                             scale:5,
                                             numPixels: 600000, 
                                             seed: 24, 
                                             dropNulls: true, 
                                             tileScale: 1, 
                                             geometries: true});
      ptsPAV = ptsPAV.limit(3000);
      Map.addLayer(ptsPAV,{}, "ptsPAV", false);
      print("size of ptsPAV", ptsPAV.size());
      //print("first ptsPAV", ptsPAV.first());


      var maskNPAV = im_amostras.eq(1).selfMask();
      //Map.addLayer(maskRAST, {}, "maskRAST", false);
      var ptsNPAV = maskNPAV.sample({region: BBox, 
                                             scale:5,
                                             numPixels: 600000, 
                                             seed: 24, 
                                             dropNulls: true, 
                                             tileScale: 1, 
                                             geometries: true});
      ptsNPAV = ptsNPAV.limit(3000);
      Map.addLayer(ptsNPAV,{}, "ptsNPAV", false);
      print("size of ptsNPAV", ptsNPAV.size());
      //print("first ptsNPAV", ptsNPAV.first());


      var amost = ptsPAV.remap([1],[0],"class").merge(ptsNPAV.remap([1],[1],"class"));
      print("Size of amost", amost.size());
      //print("First of amost", amost.first());
      //print("Distinct Classes of amost", amost.aggregate_count_distinct("class"));
      Map.addLayer(amost, {}, "amost", false);
  


  
  
//******************************* (4) Classify

//Treinar amostras
  var amost_trein = getFeatureSpace(Planet, amost);
  //print("size of amost_trein", amost_trein.size());
  //print("first of amost_trein", amost_trein.first());
  //print("amost_trein class 0", amost_trein.filter(ee.Filter.eq("class",0)));
  //print("amost_trein class 1", amost_trein.filter(ee.Filter.eq("class",1)));
  //print("amost_trein", amost_trein.aggregate_count("B"));
  
  var class0 = amost_trein.filter(ee.Filter.eq("class",0));
  var class1 = amost_trein.filter(ee.Filter.eq("class",1));

  bandas.map(function(banda){
    class0 = class0.map(function(feat){return calcZScore(feat, banda, calcEstat(class0,banda))});
    class1 = class1.map(function(feat){return calcZScore(feat, banda, calcEstat(class1,banda))});
  });
    
  //print(class0, "class0")
  //print(class1, "class1")
  
  amost_trein = class0.merge(class1);
  //print("First of amost_trein", amost_trein.first());
  print("Size of amost_trein antes de filtrar outliers", amost_trein.size());
  
  bandas.map(function(banda){
    amost_trein = amost_trein.filter(ee.Filter.and(ee.Filter.gte("zscore_"+banda,-2),ee.Filter.lte("zscore_"+banda,2)));
  });
  
  print("Size of amost_trein depois de filtrar outliers", amost_trein.size());
  //print("First of amost_trein depois de filtrar outliers", amost_trein.first());

  
//Rodar a classificação
var classifier = ee.Classifier.smileRandomForest({
                    numberOfTrees:500,
                    seed:24})
                    .train({
                      features: amost_trein,  
                      classProperty:"class", 
                      inputProperties: bandas})
                      .setOutputMode('PROBABILITY');

//  print ("classifier explain PROB", classifier.explain());
  
var classified = Planet.mask(im_livre_filtered).classify(classifier); 
//  print("classified PROB", classified);
Map.addLayer(classified.sldStyle(class_intervalos), {}, "classified PROB fatiado", false);
Map.addLayer(classified, {}, "classified PROB", false);

Export.image.toAsset({image: classified, 
                      description: "classified_PROB", 
                      assetId:"users/formigas/MSP/OUTPUT/ClassifiedProb_r4_filterSamples", 
                      region: BBox, 
                      scale: 1, 
                      maxPixels: 15e9});  

var classified_final = classified.gt(0.3).remap([0,1],[2,1])
                                          .multiply(DECLIVmask)
                                          .where(Col7_ano_agua.eq(33), 0)
                                          .selfMask();

Map.addLayer(classified_final, {}, "classified_final", true);
Map.addLayer(classified_final.sldStyle(classfinal_intervalos), {}, "classified_final", true);

Export.image.toAsset({image: classified_final, 
                      description: "classified_final", 
                      assetId:"users/formigas/MSP/OUTPUT/Classified_final_r4", 
                      region: BBox, 
                      scale: 1, 
                      maxPixels: 15e9});  
