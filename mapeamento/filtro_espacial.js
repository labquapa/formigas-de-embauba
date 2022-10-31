// Filtro - áreas próximas a 200 m²

var image = ee.Image("users/formigas/MSP/OUTPUT/R4_FINAL_MAIOR20");
var image2 = ee.Image("users/formigas/MSP/OUTPUT/R4_FINAL_MENOR20");
var image3 = ee.Image("users/formigas/MSP/OUTPUT/R4_FINAL_NPMENOR20");
var SPBBox = ee.FeatureCollection("users/formigas/MSP/INPUT/SPBBox");

//Map.addLayer(image);
//Map.addLayer(image2);
//Map.addLayer(image3);

// Criação de funções para o cálculo de área

var defArea = function(image) {

var objectId = image.connectedComponents({
    connectedness: ee.Kernel.square(1),
    maxSize: 1000
});
print(objectId)

var pixelscon = objectId.select("labels").connectedPixelCount({maxSize: 500, eightConnected:true});
//Map.addLayer(pixelscon,{}, "pixels count")
var imagemFilt = pixelscon.where(pixelscon.lt(150), 0);
//Map.addLayer(imagemFilt.selfMask())

var areasInteresse = imagemFilt.selfMask();
//Map.addLayer(areasdeInteresse,{}, "areas de interesse")

var pixelArea = ee.Image.pixelArea();
var objectArea = areasInteresse.multiply(pixelArea);
objectArea = objectArea.gte(190)//.selfMask();

return objectArea;
};

var interesseMAIOR20 = defArea(image);
var interesseMENOR20 = defArea(image2);
var interesseNPMENOR20 = defArea(image3);

//Map.addLayer(interesseMAIOR20);
//Map.addLayer(interesseMENOR20);
//Map.addLayer(interesseVEGMENOR20);


// Exportação imagens filtradas
Export.image.toAsset({image: interesseMAIOR20, 
                      description: "AreasInteresse", 
                      assetId:"users/formigas/MSP/OUTPUT/R4_FINAL_MAIOR20_FILTER190", 
                      region: SPBBox, 
                      scale: 1, 
                      maxPixels: 4e9});

Export.image.toAsset({image: interesseMENOR20, 
                      description: "AreasInteresse", 
                      assetId:"users/formigas/MSP/OUTPUT/R4_FINAL_MENOR20_FILTER190", 
                      region: SPBBox, 
                      scale: 1, 
                      maxPixels: 4e9});

Export.image.toAsset({image: interesseNPMENOR20, 
                      description: "AreasInteresse", 
                      assetId:"users/formigas/MSP/OUTPUT/R4_FINAL_NPMENOR20_FILTER190", 
                      region: SPBBox, 
                      scale: 1, 
                      maxPixels: 4e9});
