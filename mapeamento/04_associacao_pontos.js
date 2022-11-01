var maior20 = ee.Image("users/formigas/MSP/OUTPUT/R4_FINAL_MAIOR20_FILTER190");
var menor20 = ee.Image("users/formigas/MSP/OUTPUT/R4_FINAL_MENOR20_FILTER190");
var npmenor20 = ee.Image("users/formigas/MSP/OUTPUT/R4_FINAL_NPMENOR20_FILTER190");

var lotesEscolas = ee.FeatureCollection('users/formigas/MSP/MIDPUT/LOTES_CORR_ORIGEM');
print(lotesEscolas.limit(10))

var quadras = ee.FeatureCollection("users/formigas/MSP/INPUT/GEOSAMPA/SIRGAS_NOVAS_QUADRAS");
//print(quadras.limit(10))
var areasPublicas = ee.FeatureCollection("users/formigas/MSP/INPUT/GEOSAMPA/SIRGAS_CadastroAreasPublicas");

var SPBBox = ee.FeatureCollection("users/formigas/MSP/INPUT/SPBBox");
var pontosEscolas = ee.FeatureCollection("users/formigas/pts_escolasCorr");
print(pontosEscolas.limit(10))
 
var teste = pontosEscolas;//.limit(10);
//print(teste, 'antes');


//Map.centerObject(teste.first(),16);


// FILTRO LOTES
var lotesArea = function(lote) {
  var area = lote.geometry().area();
  return lote.set('Área Lote', area);
};

var lotesFilt = lotesEscolas.map(lotesArea);
lotesFilt = lotesFilt.filter(ee.Filter.lte('Área Lote', 30000));
//print(lotesFilt.size())


// FILTRO QUADRAS
quadras = quadras.filterBounds(pontosEscolas);
print(quadras.size())

var quadrasArea = function(quadra) {
  var area = quadra.geometry().area();
  return quadra.set('Área Quadra', area);
};

var quadrasFilt = quadras.map(quadrasArea);
quadrasFilt = quadrasFilt.filter(ee.Filter.lte('Área Quadra', 150000));
print(quadrasFilt.size())


// PROPRIEDADE CODESMEC NUMBER
var tranString = function(loteEscola) {
  var string = loteEscola.get('CODESCMEC');
  var number = ee.Number.parse(string);
  return loteEscola.set('CODESCMEC_N',number);
};

var lotesEscolasNum = lotesFilt.map(tranString);
//print(lotesEscolasNum)

// PROPRIEDADE FLOAT 'qe_id'
var tranFloat = function(quadra) {
  var long = quadra.get('qe_id');
  var number = ee.Number(long).float();
  return quadra.set('qe_idf', number);
};

var quadrasNum = quadrasFilt.map(tranFloat);
//print(lotesEscolasNum)




var image = menor20;

var getArea1 = function(ponto){
  //var areaImage = ee.Image.pixelArea().divide(10000);
  var areaImage = ee.Image.pixelArea();
  areaImage = areaImage.multiply(image);
  
  var loteEsc = ponto.getNumber('eq_cd_mec');
  var featureLote = lotesEscolasNum.filter(ee.Filter.eq('COD_MEC', loteEsc)).geometry();


  var statLote = areaImage.reduceRegion({
                reducer: ee.Reducer.sum(),
                geometry: featureLote,
                scale: 1,
                maxPixels: 1e9
              });

  var areaLote = statLote.get('area');
  
  //ÁREA QUADRA
  var quadra_id = ponto.get('qe_id');
  var featureQuadra = quadrasNum.filter(ee.Filter.eq('qe_idf', quadra_id)).geometry();

  var statQuadra = areaImage.reduceRegion({
                reducer: ee.Reducer.sum(),
                geometry: featureQuadra,
                scale: 1,
                maxPixels: 1e9
              });
 
  var areaQuadra = statQuadra.get('area');
  
  //ÁREA BUFFER
  /*var escBuffer = ponto.get('NO_ENTIDAD');
  var featureBuffer = buffers.filter(ee.Filter.eq('NO_ENTIDAD', escBuffer)).geometry();*/
  var escbuffer = ponto.buffer(500);
  var featureBuffer = escbuffer.bounds().geometry();

  var statBuffer = areaImage.reduceRegion({
                reducer: ee.Reducer.sum(),
                geometry: featureBuffer,
                scale: 1,
                maxPixels: 1e9
              });
 
  var areaBuffer = statBuffer.get('area');

  //ÁREA PÚBLICA
  var featureAreaPublica = areasPublicas.filterBounds(featureBuffer).geometry();
  
  var statAreaPublica = areaImage.reduceRegion({
                reducer: ee.Reducer.sum(),
                geometry: featureAreaPublica,
                scale: 1,
                maxPixels: 1e9
              });
 
  var areaAreaPublica = statAreaPublica.get('area');
  
  return ponto.set('0_LOTE - Declividade < 20%', areaLote)
              .set('0_QUADRA - Declividade < 20%', areaQuadra)
              .set('0_BUFFER - Declividade < 20%', areaBuffer)
              .set('0_AP - Declividade < 20%', areaAreaPublica);
};

var prim = teste.map(getArea1);








var image = maior20;

var getArea2 = function(ponto){
  //var areaImage = ee.Image.pixelArea().divide(10000);
  var areaImage = ee.Image.pixelArea();
  areaImage = areaImage.multiply(image);
  
  var loteEsc = ponto.getNumber('eq_cd_mec');
  var featureLote = lotesEscolasNum.filter(ee.Filter.eq('COD_MEC', loteEsc)).geometry();


  var statLote = areaImage.reduceRegion({
                reducer: ee.Reducer.sum(),
                geometry: featureLote,
                scale: 1,
                maxPixels: 1e9
              });

  var areaLote = statLote.get('area');
  
  //ÁREA QUADRA
  var quadra_id = ponto.get('qe_id');
  //print(quadra_id)
  var featureQuadra = quadrasNum.filter(ee.Filter.eq('qe_idf', quadra_id)).geometry();


  var statQuadra = areaImage.reduceRegion({
                reducer: ee.Reducer.sum(),
                geometry: featureQuadra,
                scale: 1,
                maxPixels: 1e9
              });
 
  var areaQuadra = statQuadra.get('area');
  
  //ÁREA BUFFER
  /*var escBuffer = ponto.get('NO_ENTIDAD');
  var featureBuffer = buffers.filter(ee.Filter.eq('NO_ENTIDAD', escBuffer)).geometry();*/
  var escbuffer = ponto.buffer(500);
  var featureBuffer = escbuffer.bounds().geometry();

  var statBuffer = areaImage.reduceRegion({
                reducer: ee.Reducer.sum(),
                geometry: featureBuffer,
                scale: 1,
                maxPixels: 1e9
              });
 
  var areaBuffer = statBuffer.get('area');

  //ÁREA PÚBLICA
  var featureAreaPublica = areasPublicas.filterBounds(featureBuffer).geometry();
  
  var statAreaPublica = areaImage.reduceRegion({
                reducer: ee.Reducer.sum(),
                geometry: featureAreaPublica,
                scale: 1,
                maxPixels: 1e9
              });
 
  var areaAreaPublica = statAreaPublica.get('area');
  
  return ponto.set('1_LOTE - Declividade > 20%', areaLote)
              .set('1_QUADRA - Declividade > 20%', areaQuadra)
              .set('1_BUFFER - Declividade > 20%', areaBuffer)
              .set('1_AP - Declividade > 20%', areaAreaPublica);
};

var seg = prim.map(getArea2);

 


var image = npmenor20;

var getArea3 = function(ponto){
  //var areaImage = ee.Image.pixelArea().divide(10000);
  var areaImage = ee.Image.pixelArea();
  areaImage = areaImage.multiply(image);
  
  var loteEsc = ponto.getNumber('eq_cd_mec');
  var featureLote = lotesEscolasNum.filter(ee.Filter.eq('COD_MEC', loteEsc)).geometry();


  var statLote = areaImage.reduceRegion({
                reducer: ee.Reducer.sum(),
                geometry: featureLote,
                scale: 1,
                maxPixels: 1e9
              });

  var areaLote = statLote.get('area');
  
  //ÁREA QUADRA
  var quadra_id = ponto.get('qe_id');
  //print(quadra_id)
  var featureQuadra = quadrasNum.filter(ee.Filter.eq('qe_idf', quadra_id)).geometry();

  var statQuadra = areaImage.reduceRegion({
                reducer: ee.Reducer.sum(),
                geometry: featureQuadra,
                scale: 1,
                maxPixels: 1e9
              });
 
  var areaQuadra = statQuadra.get('area');
  
  //ÁREA BUFFER
  /*var escBuffer = ponto.get('NO_ENTIDAD');
  var featureBuffer = buffers.filter(ee.Filter.eq('NO_ENTIDAD', escBuffer)).geometry();*/
  var escbuffer = ponto.buffer(500);
  var featureBuffer = escbuffer.bounds().geometry();


  var statBuffer = areaImage.reduceRegion({
                reducer: ee.Reducer.sum(),
                geometry: featureBuffer,
                scale: 1,
                maxPixels: 1e9
              });
 
  var areaBuffer = statBuffer.get('area');

  //ÁREA PÚBLICA
  var featureAreaPublica = areasPublicas.filterBounds(featureBuffer).geometry();
  
  var statAreaPublica = areaImage.reduceRegion({
                reducer: ee.Reducer.sum(),
                geometry: featureAreaPublica,
                scale: 1,
                maxPixels: 1e9
              });
 
  var areaAreaPublica = statAreaPublica.get('area');
  
  return ponto.set('2_LOTE - NP Declividade < 20%', areaLote)
              .set('2_QUADRA - NP Declividade < 20%', areaQuadra)
              .set('2_BUFFER - NP Declividade < 20%', areaBuffer)
              .set('2_AP - NP Declividade < 20%', areaAreaPublica);
};

var ter = seg.map(getArea3);

Export.table.toAsset(ter,'TabelaFINAL','users/formigas/MSP/OUTPUT/TabelaFINAL');
Export.table.toDrive(ter,'TabelaFINAL','Earth Engine');
