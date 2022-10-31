var R4_FINAL_1m = ee.Image("users/formigas/MSP/OUTPUT/Classified_final_r4_1m"); //////******* ASSET FINAL
var quadras = ee.FeatureCollection("users/formigas/MSP/INPUT/GEOSAMPA/SIRGAS_NOVAS_QUADRAS");
var SPBBox = ee.FeatureCollection("users/formigas/MSP/INPUT/SPBBox");
var escolas = ee.FeatureCollection("users/formigas/pts_escolasCorr")

//1) Criar buffers
  var recBuffer = function(feature) {
    var point = feature
    var buffer = point.buffer(500);
    var recBuffer = buffer.bounds();

   return recBuffer
  };

  var buffers = escolas.map(recBuffer)
  print(buffers)
  //Map.addLayer(buffers, {}, "buffers");

//2) Separar classes por declividade
var R4_FINAL_1 = R4_FINAL_1m.eq(1); // Áreas não pavimentadas com declividade menor ou igual a 20%
var R4_FINAL_2 = R4_FINAL_1m.eq(2); // Áreas pavimentadas com declividade menor ou igual a 20%
//Map.addLayer(R4_FINAL_1);
//Map.addLayer(R4_FINAL_2);

// Junção das classes
//var R4_FINAL_20 = ee.ImageCollection([R4_FINAL_1,R4_FINAL_2]);
var R4_FINAL_MENOR20 = R4_FINAL_1.add(R4_FINAL_2).selfMask().clip(quadras).clip(buffers);
Map.addLayer(R4_FINAL_MENOR20,{},'R4_FINAL_MENOR20');

var R4_FINAL_100 = R4_FINAL_1m.eq(100); // Áreas não pavimentadas com declividade maior do que 20%
var R4_FINAL_200 = R4_FINAL_1m.eq(200); // Áreas pavimentadas com declividade maior do que 20%
//Map.addLayer(R4_FINAL_100);
//Map.addLayer(R4_FINAL_200);

// Junção das classes
//var R4_FINAL_200 = ee.ImageCollection([R4_FINAL_100,R4_FINAL_200]);
var R4_FINAL_MAIOR20 = R4_FINAL_100.add(R4_FINAL_200).selfMask().clip(quadras).clip(buffers);
//R4_FINAL_MAIOR20 = R4_FINAL_MAIOR20.mosaic().clip(quadras);
Map.addLayer(R4_FINAL_MAIOR20, {}, 'R4_FINAL_MAIOR20');

// Exportação imagens
Export.image.toAsset({image:R4_FINAL_MENOR20, 
                      description:'R4_FINAL_MENOR20', 
                      assetId: 'users/formigas/MSP/OUTPUT/R4_FINAL_MENOR20',
                      region:SPBBox, 
                      scale:1, 
                      maxPixels:30000000000});

Export.image.toAsset({image:R4_FINAL_MAIOR20, 
                      description:'R4_FINAL_MAIOR20', 
                      assetId: 'users/formigas/MSP/OUTPUT/R4_FINAL_MAIOR20',
                      region:SPBBox, 
                      scale:1, 
                      maxPixels:30000000000});


var image = ee.Image("users/formigas/MSP/OUTPUT/R4_FINAL_MENOR20");
//Map.addLayer(image)
var image2 = ee.Image("users/formigas/MSP/OUTPUT/R4_FINAL_MAIOR20");



var R4_FINAL_NPMENOR20 =  R4_FINAL_1m.eq(1).selfMask().clip(quadras).clip(buffers) // Áreas não pavimentadas com declividade menor ou igual a 20%
Map.addLayer(R4_FINAL_NPMENOR20,{},'R4_FINAL_NPMENOR20')

// Exportação imagem
Export.image.toAsset({image:R4_FINAL_NPMENOR20, 
                      description:'R4_FINAL_VEG_MENOR20', 
                      assetId: 'users/formigas/MSP/OUTPUT/R4_FINAL_NPMENOR20',
                      region:SPBBox, 
                      scale:1, 
                      maxPixels:30000000000});

var image3 = ee.Image("users/formigas/MSP/OUTPUT/R4_FINAL_NPMENOR20");
