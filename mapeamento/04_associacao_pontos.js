var image1 = ee.Image("users/formigas/MSP/OUTPUT/REV_A_LIVRE_TOTAL_FILTER140");
var image2 = ee.Image("users/formigas/MSP/OUTPUT/REV_A_LIVRE_NPMENOR20_FILTER140");
var image3 = ee.Image("users/formigas/MSP/OUTPUT/REV_A_LIVRE_NPTOTAL_FILTER140");
var SPBBox = ee.FeatureCollection("users/formigas/MSP/INPUT/SPBBox");
var ptsEscolas = ee.FeatureCollection("users/formigas/MSP/MIDPUT/REV_C/PtsEscolas_Nome_rC");
var lotes = ee.FeatureCollection("users/formigas/MSP/MIDPUT/REV_C/LotesEscolas_rC");

var testeLot = lotes.first().geometry()
var inter = lotes.filterBounds(ptsEscolas.first().geometry())
print(inter)
Map.addLayer(inter)
Map.centerObject(inter,15)

// FUNÇÃO DE CORTE DO RASTER, TRANSFORMAÇÃO EM VETOR, CÁLCULO DE ÁREA, FILTRO E EXPORTAÇÃO
//------------------------------------------------------------------
var vectorExport = function(image,geometry,description) {


var rasterClip = image.clip(geometry);
 
var vectors = rasterClip.reduceToVectors({
  reducer: ee.Reducer.countEvery(),
  geometry: geometry,
  scale: 1, 
  geometryType: "polygon", 
  eightConnected: true,
  bestEffort: false, 
  maxPixels: 4e9
});

//área total do lote
var areaGeom = function (geometry) {
  var calcAreaGeom = geometry.geometry().area(0.5);
  var setAreaGeom = geometry.set("ArM2_LOTE_DA_" + description, calcAreaGeom);
  return setAreaGeom;
};

var geomComArea = geometry.map(areaGeom);

//área da mancha e adição de propriedades
var areaMancha = function(feat) {
  var calcAreaMancha = feat.geometry().area(0.5);
  var associarGeom = geomComArea.filterBounds(feat.geometry())
  var noLote = associarGeom.first().get('t_NoLote');
  var areaGeom = associarGeom.first().get("ArM2_LOTE_DA_" + description)
  var setArea = feat.set('ArM2_' + description, calcAreaMancha)
                    .set("ArM2_LOTE_DA_" + description,areaGeom)
                    .set('t_NoLote', noLote);
  return setArea;
};

var vectorArea = vectors.map(areaMancha);
vectorArea = vectorArea.filter(ee.Filter.gte('ArM2_' + description, 140));





Export.table.toAsset({
  collection: vectorArea, 
  description: description,
  assetId: "users/formigas/MSP/OUTPUT/REV_C/REV_C_AREA_" + description
});

};
//------------------------------------------------------------------

// Cortar rasters de acordo com os pontos de escolas
//Map.addLayer(ptsEscolas);

//1) Lotes 
// FILTRO LOTES
var lotesArea = function(lote) {
  var area = lote.geometry().area();
  return lote.set('Área Lote', area);
};

var lotesFilt = lotes.map(lotesArea);
lotesFilt = lotesFilt.filter(ee.Filter.lte('Área Lote', 150000));

var LOTE_1EXPORT = vectorExport(image1,lotes,'MANCHA_ALT');
var LOTE_2EXPORT = vectorExport(image2,lotes,'MANCHA_NPMEN20');
var LOTE_3EXPORT = vectorExport(image3,lotes,'MANCHA_NPTOTAL');
