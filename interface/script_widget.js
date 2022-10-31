 
// WIDGET - Formigas de Embaúba

// DESCRIÇÃO: Ferramenta para auxiliar a análise de possíveis áreas de plantio de miniflorestas
// AUTORES: MapBiomas - Áreas Urbanizadas
// CONTATO: Júlia Cansado, Mayumi Hirye e Talita Micheleti (mapbiomasurb@gmail.com)

// VERSÃO: 1.0 - Acesso à classificação preliminar + camadas vetoriais + logo
//         1.1 - Divisão por Nível de Informação + Tipo de Escola
//         1.2 - Visualização Polígonos + Limpar Mapa (1 Teste APP)
//         1.3 - Busca de escola por nome + zoom
//         1.4 - Informações MapBiomas + remoção zoom 
//         1.5 - Áreas por escola - clique
//         1.6 - Outras informações por clique
//         1.7 - Ajuste botão visualização de gráficos/ dados MapBiomas / diagramação gráficos
//         1.8 - Inclusão classificação final / legenda MapBiomasAg em função do ano do MapBiomas
//         1.9 - Gráfico por seleção
//         2.0 - RMSP e Raster Atualizado


var year = 2021 // DEFINE ANO DA IMAGEM MAPBIOMAS
 
 
 
//1) INSERIR CAMADAS DE INFORMAÇÕES NECESSÁRIAS
var MDT = ee.Image('users/formigas/MSP/OUTPUT/MDTPERCENT');
//Map.addLayer(MDT, {"opacity":1,"bands":["percent"],"min":2.5304599866673674,"max":93.67004145678956,"gamma":1},"MDT")

var RMSP = ee.FeatureCollection('users/formigas/MSP/INPUT/RMSP');

var classMenor20 = ee.Image('users/formigas/MSP/OUTPUT/R4_FINAL_MENOR20_FILTER190');
classMenor20 = classMenor20.visualize({"opacity":1,"bands":["labels"],"palette":["1D986C"]});
var classMaior20 = ee.Image('users/formigas/MSP/OUTPUT/R4_FINAL_MAIOR20_FILTER190');
classMaior20 = classMaior20.visualize({"opacity":1,"bands":["labels"],"palette":["2FC19A"]});
var classNPMenor20 = ee.Image('users/formigas/MSP/OUTPUT/R4_FINAL_NPMENOR20_FILTER190');
classNPMenor20 = classNPMenor20.visualize({"opacity":1,"bands":["labels"],"palette":["2fff6f"]});

var areasPublicas = ee.FeatureCollection('users/formigas/MSP/INPUT/GEOSAMPA/SIRGAS_CadastroAreasPublicas');
//var pontosEscolas = ee.FeatureCollection('users/formigas/MSP/MIDPUT/SIRGAS_ESCOLASPUB_INEP_GS_FILTRADAS_QU_LO');
var pontosEscolas = ee.FeatureCollection('users/formigas/MSP/OUTPUT/TabelaLotesCorrTODOSA2809QU');
//Map.addLayer(pontosEscolas,{},"pontos")
var graphInputMAIOR = ee.FeatureCollection('users/formigas/MSP/OUTPUT/graphInputMAIOR20_2909').select(['BUFFER','LOTE', 'QUADRA','AP','eq_nome','eq_esfera']);
var graphInputMENOR = ee.FeatureCollection('users/formigas/MSP/OUTPUT/graphInputMENOR20_2909').select(['BUFFER','LOTE', 'QUADRA','AP','eq_nome','eq_esfera']);
var graphInputNPMENOR = ee.FeatureCollection('users/formigas/MSP/OUTPUT/graphInputNPMENOR20_29092').select(['BUFFER','LOTE', 'QUADRA','AP','eq_nome','eq_esfera']);
var lotesEscolas = ee.FeatureCollection('users/formigas/MSP/MIDPUT/LOTES_CORR_ORIGEM');
//Map.addLayer(lotesEscolas,{},"Lotes");
var geometriaLotes = ee.FeatureCollection('users/formigas/MSP/MIDPUT/LOTES_ESCOLAS_GEOMETRIA2909');
var geometriaQuadras = ee.FeatureCollection('users/formigas/MSP/MIDPUT/QUADRAS_ESCOLAS_GEOMETRIA2909');
var buffers = ee.FeatureCollection('users/formigas/MSP/MIDPUT/buffers2909');
//Map.addLayer(buffers,{},"buffers")

var MapBiomasImage = ee.Image('projects/mapbiomas-workspace/public/collection7/mapbiomas_collection70_integration_v2').clip(RMSP);
var MapBiomasImageVis = MapBiomasImage.visualize({"opacity":0.5,"bands":["classification_" + year],"max":49,"palette":["ffffff","129912","1f4423","006400","00ff00","687537","76a5af","29eee4","77a605","ad4413","bbfcac","45c2a5","b8af4f","f1c232","ffffb2","ffd966","f6b26b","f99f40","e974ed","d5a6bd","c27ba0","fff3bf","ea9999","dd7e6b","aa0000","ff3d3d","0000ff","d5d5e5","dd497f","665a3a","af2a2a","1f0478","968c46","0000ff","4fd3ff","645617","f3b4f1","02106f","02106f","e075ad","982c9e","e787f8","cca0d4","d082de","cd49e4","e04cfa","cca0d4","d082de","cd49e4","6b9932"]});
var MapBiomasClassesAg = MapBiomasImage.remap({ from: [1,3,4,5,49,10,11,12,32,29,50,13,14,15,18,19,39,20,40,62,41,36,46,47,48,9,21,22,23,24,30,25,26,33,31],
                                     to: [1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,3,3,3,3,3,4,4,4], bandName:"classification_" + year})
var MapBiomasClassesAgVis = MapBiomasClassesAg.visualize({"opacity":0.5,"palette":["129912","bbfcac","ea9999","0000ff"]});

var logoFormigas = ee.Image('users/formigas/MSP/INPUT/formigas-logo');
var logoMapBiomas = ee.Image('users/formigas/MSP/INPUT/mapbiomas-logo');

var legenda1 = ee.Image('users/formigas/MSP/INPUT/legendaCol7');
var legenda2 = ee.Image('users/formigas/MSP/INPUT/legendaAg');



// PROPRIEDADE CODESMEC NUMBER
var tranString = function(loteEscola) {
  var string = loteEscola.get('CODESCMEC');
  var number = ee.Number.parse(string);
  return loteEscola.set('CODESCMEC_N',number);
};

var lotesEscolasNum = lotesEscolas.map(tranString);
//print(lotesEscolasNum)



//2) Organização Widget
// Definição Mapa Base 
//Map.setCenter(-46.636, -23.6345,11); // Centro e zoom
Map.setOptions({mapTypeId: 'SATELLITE'}); // Satélite de fundo

//Logo Formigas
var logo = logoFormigas.visualize({
    bands:  ['b1', 'b2', 'b3'],
    min: 0,
    max: 255
    });
var thumb = ui.Thumbnail({
    image: logo,
    params: {
        dimensions: '642x291',
        format: 'png'
        },
    style: {height: '96px', width: '300px',padding :'0px 10px 0px 0px'}
    });
var layoutPanel = ui.Panel.Layout.flow('vertical');


//ESTILOS DE TEXTO

var BOLD_STYLE = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#000000',
  padding: '12px 0px 0px 60px',
  maxWidth: '500px',
 // textAlign: 'center'
};

var ESCOLAS_STYLE = {
  fontSize: '14px',
  /*fontWeight: '50',*/
  color: '#1D986C',
  padding: '0px 0px 0px 15px',
  maxWidth: '300px',
  textAlign: 'center'
};

var DESCRICAO_STYLE = {
  fontSize: '14px',
  /*fontWeight: '100',*/
  color: '#000000',
  padding: '0px 0px 0px 10px',
  maxWidth: '300px',
  textAlign: 'center'
};

var POLIGONOS_STYLE = {
  fontSize: '14px',
  /*fontWeight: '75',*/
  color: '#000000',
  padding: '0px 0px 0px 15px',
  maxWidth: '300px',
  textAlign: 'center'
};

var CREDITOS_STYLE = {
  fontSize: '11px',
  fontWeight: '75',
  color: '#000000',
  padding: '0px 0px 0px 110px',
  maxWidth: '300px'
};

var BUSCA_STYLE = {
  fontSize: '14px',
  /*fontWeight: '50',*/
  color: '#1D986C',
  padding: '0px 0px 0px 0px',
  maxWidth: '300px',
  textAlign: 'center',
  whiteSpace: 'pre'
};

var ZOOM_STYLE = {
  fontSize: '14px',
  /*fontWeight: '50',*/
  color: '#1D986C',
  padding: '0px 0px 0px 20px',
  maxWidth: '300px',
  textAlign: 'center',
  whiteSpace: 'pre'
};

var app_description = "Áreas para possível plantação de miniflorestas em escolas públicas de SP!";
/*var texto = ui.Label({
  value: "Áreas para possível plantação de miniflorestas, conforme indicações abaixo",
  style: {fontSize: '12px', padding :'20px', position: 'top-center'}
});*/

var toolPanel = ui.Panel(thumb, layoutPanel, {width: '325px'});
toolPanel.add(ui.Label(app_description, DESCRICAO_STYLE));
ui.root.widgets().add(toolPanel);




//NÍVEL 1 - ÁREAS INTERSECTAM COM LOTE DE ESCOLA
//Pontos Escolas no lote da Escola
var imagemLotesMenor20 = classMenor20.clip(geometriaLotes);
var imagemLotesMaior20 = classMaior20.clip(geometriaLotes);
var imagemLotesNPMenor20 = classNPMenor20.clip(geometriaLotes);

//NÍVEL 2 - ÁREAS INTERSECTAM COM QUADRA DE ESCOLA
//Pontos Escolas na quadra da Escola
var imagemQuadrasMenor20 = classMenor20.clip(geometriaQuadras);
var imagemQuadrasMaior20 = classMaior20.clip(geometriaQuadras);
var imagemQuadrasNPMenor20 = classNPMenor20.clip(geometriaQuadras)

//NÍVEL 3 - ÁREAS INTERSECTAM COM ÁREAS PÚBLICAS (PRÓXIMAS DE ESCOLA)
var areasProx = areasPublicas.filterBounds(buffers);
//Map.addLayer(areasProx)
var imagemAreasPublicasMenor20 = classMenor20.clip(areasProx);
var imagemAreasPublicasMaior20 = classMaior20.clip(areasProx);
var imagemAreasPublicasNPMenor20 = classNPMenor20

//NÍVEL 4 - ÁREAS INTERSECTAM COM BUFFER
var imagemBufferMenor20 = classMenor20;
var imagemBufferMaior20 = classMaior20;
var imagemBufferNPMenor20 = classNPMenor20;



//Lista Imagens - NÍVEIS DE INFORMAÇÃO

var selector1 = ui.Select([]);

var niveisMenor20 = {
  'ÁREAS TOTAIS - DECLIVIDADE < 20%': '',
  'NÍVEL 1 - Áreas no lote da escola': imagemLotesMenor20,
  'NÍVEL 2 - Áreas na quadra da escola': imagemQuadrasMenor20,
  'NÍVEL 3 - Áreas em áreas públicas próximas à escola': imagemAreasPublicasMenor20,
  'NÍVEL 4 - Áreas em um raio de 500m da escola': imagemBufferMenor20
};


function addLayerSelectorMenor(mapToChange,defaultValue) {
 
  // This function changes the given map to show the selected image.
  function updateMap(selection) {
    mapToChange.layers().set(0, ui.Map.Layer(niveisMenor20[selection]));
  }

  // Configure a selection dropdown to allow the user to choose between images,
  // and set the map to update when a user makes a selection.
  selector1 = ui.Select({items: Object.keys(niveisMenor20), onChange: updateMap,
                          style:{width: '295px'}
  });
  selector1.setValue(Object.keys(niveisMenor20)[defaultValue], true);

  toolPanel.add(selector1);
}

addLayerSelectorMenor(Map,0);


var selector2 = ui.Select([]);

var niveisMaior20 = {
  'ÁREAS TOTAIS - DECLIVIDADE > 20%': '',
  'NÍVEL 1 - Áreas no lote da escola': imagemLotesMaior20,
  'NÍVEL 2 - Áreas na quadra da escola': imagemQuadrasMaior20,
  'NÍVEL 3 - Áreas em áreas públicas próximas à escola': imagemAreasPublicasMaior20,
  'NÍVEL 4 - Áreas em um raio de 500m da escola': imagemBufferMaior20
};

function addLayerSelectorMaior(mapToChange,defaultValue) {
  // This function changes the given map to show the selected image.
  function updateMap(selection) {
    mapToChange.layers().set(0, ui.Map.Layer(niveisMaior20[selection]))
  }

  // Configure a selection dropdown to allow the user to choose between images,
  // and set the map to update when a user makes a selection.
  selector2 = ui.Select({items: Object.keys(niveisMaior20), onChange: updateMap,
                          style:{width: '295px'}
  });
  selector2.setValue(Object.keys(niveisMaior20)[defaultValue], true);

  toolPanel.add(selector2);
}

addLayerSelectorMaior(Map,0);

var selector3 = ui.Select([]);

var niveisNPMenor20 = {
  'ÁREAS NÃO PAVIMENTADAS - DECLIVIDADE < 20%': '',
  'NÍVEL 1 - Áreas no lote da escola': imagemLotesNPMenor20,
  'NÍVEL 2 - Áreas na quadra da escola': imagemQuadrasNPMenor20,
  'NÍVEL 3 - Áreas em áreas públicas próximas à escola': imagemAreasPublicasNPMenor20,
  'NÍVEL 4 - Áreas em um raio de 500m da escola': imagemBufferNPMenor20
};


function addLayerSelectorNPMenor(mapToChange,defaultValue) {
 
  // This function changes the given map to show the selected image.
  function updateMap(selection) {
    mapToChange.layers().set(0, ui.Map.Layer(niveisNPMenor20[selection]));
  }

  // Configure a selection dropdown to allow the user to choose between images,
  // and set the map to update when a user makes a selection.
  selector3 = ui.Select({items: Object.keys(niveisNPMenor20), onChange: updateMap,
                          style:{width: '295px'}
  });
  selector3.setValue(Object.keys(niveisNPMenor20)[defaultValue], true);

  toolPanel.add(selector3);
}

addLayerSelectorNPMenor(Map,0);



//TIPO DE ESCOLA

// JUNÇÕES - CEUs

var CEU1 = pontosEscolas.filter(ee.Filter.eq('eq_tipo','CEU EMEF'));
//print(CEU1);
var CEU2 = pontosEscolas.filter(ee.Filter.eq('eq_tipo','CEU EMEI'));
//print(CEU2);
var CEU3 = pontosEscolas.filter(ee.Filter.eq('eq_tipo','CEU CEI'));
//print(CEU3);
var CEU4 = pontosEscolas.filter(ee.Filter.eq('eq_tipo','CEU AT COM'));
//print(CEU4);
var CEU5 = pontosEscolas.filter(ee.Filter.eq('eq_tipo','CEU CEMEI'));
//print(CEU5);

var CEI = pontosEscolas.filter(ee.Filter.eq('eq_tipo','CEI DIRET'));
//print(CEI)
Map.addLayer(CEI,{},'CEI', false);
var CEMEI = pontosEscolas.filter(ee.Filter.eq('eq_tipo','CEMEI'));
//print(CEMEI)
Map.addLayer(CEMEI,{},'CEMEI', false);
var CEU = CEU1.merge(CEU2).merge(CEU3).merge(CEU4).merge(CEU5);
//print(CEU);
Map.addLayer(CEU,{},'CEU', false);
var EE = pontosEscolas.filter(ee.Filter.eq('eq_tipo','EE'));
//print(EE);
Map.addLayer(EE,{},'EE', false);
var EF = pontosEscolas.filter(ee.Filter.eq('eq_tipo','EF'));
//print(EF);
Map.addLayer(EF,{},'EF', false);
var EMEF = pontosEscolas.filter(ee.Filter.eq('eq_tipo','EMEF'));
//print(EMEF);
Map.addLayer(EMEF,{},'EMEF', false);
var EMEFM = pontosEscolas.filter(ee.Filter.eq('eq_tipo','EMEFM'));
//print(EMEFM);
Map.addLayer(EMEFM,{},'EMEFM', false);
var EMEI = pontosEscolas.filter(ee.Filter.eq('eq_tipo','EMEI'));
//print(EMEI);
Map.addLayer(EMEI,{},'EMEI', false);

var painelEscolas1 = ui.Panel({layout: ui.Panel.Layout.flow('horizontal'), style: {padding: '0px 0px 0px 35px'}});
var painelEscolas2 = ui.Panel({layout: ui.Panel.Layout.flow('horizontal'), style: {padding: '0px 0px 0px 20px'}});

var CEICheck = ui.Checkbox('CEI', false);
CEICheck.onChange(function(checked) {
  // Shows or hides the first map layer based on the checkbox's value.
  Map.layers().get(1).setShown(checked);
});

var CEMEICheck = ui.Checkbox('CEMEI', false);
CEMEICheck.onChange(function(checked) {
  // Shows or hides the first map layer based on the checkbox's value.
  Map.layers().get(2).setShown(checked);
});

var CEUCheck = ui.Checkbox('CEU', false);
CEUCheck.onChange(function(checked) {
  // Shows or hides the first map layer based on the checkbox's value.
  Map.layers().get(3).setShown(checked);
});

var EECheck = ui.Checkbox('EE', false);
EECheck.onChange(function(checked) {
  // Shows or hides the first map layer based on the checkbox's value.
  Map.layers().get(4).setShown(checked);
});

var EFCheck = ui.Checkbox('EF', false);
EFCheck.onChange(function(checked) {
  // Shows or hides the first map layer based on the checkbox's value.
  Map.layers().get(5).setShown(checked);
});

var EMEFCheck = ui.Checkbox('EMEF', false);
EMEFCheck.onChange(function(checked) {
  // Shows or hides the first map layer based on the checkbox's value.
  Map.layers().get(6).setShown(checked);
});

var EMEFMCheck = ui.Checkbox('EMEFM', false);
EMEFMCheck.onChange(function(checked) {
  // Shows or hides the first map layer based on the checkbox's value.
  Map.layers().get(7).setShown(checked);
});

var EMEICheck = ui.Checkbox('EMEI', false);
EMEICheck.onChange(function(checked) {
  // Shows or hides the first map layer based on the checkbox's value.
  Map.layers().get(8).setShown(checked);
});

var tiposLabel = 'Pontos de escola:';
toolPanel.add(ui.Label(tiposLabel, ESCOLAS_STYLE));



painelEscolas1.add(CEICheck);
painelEscolas1.add(CEMEICheck);
painelEscolas1.add(CEUCheck);
painelEscolas1.add(EECheck);
painelEscolas2.add(EFCheck);
painelEscolas2.add(EMEFCheck);
painelEscolas2.add(EMEFMCheck);
painelEscolas2.add(EMEICheck);

toolPanel.add(painelEscolas1);
toolPanel.add(painelEscolas2);



// BUSCA TEXTUAL POR ESCOLA

var object = ui.Textbox({placeholder:'NOME ESCOLA', value:'', style:{width: '200px'}})
var teste = pontosEscolas.filter(ee.Filter.eq('eq_nome', 'CEU CEMEI VILA ALPINA')).first()
Map.centerObject(teste,11)

object.onChange(function(escolaEscolhida){
  teste = pontosEscolas.filter(ee.Filter.eq('eq_nome', escolaEscolhida)).first()
   Map.centerObject(teste, 20)
})


var EscolaPanel = ui.Panel({layout:ui.Panel.Layout.flow('vertical'),
                           style: {width: '260px', position: 'bottom-left', padding: '20px'}})

var buscaEscolaLabel = ui.Label('BUSCA DE ESCOLA POR NOME:', BUSCA_STYLE)
EscolaPanel.add(buscaEscolaLabel)
EscolaPanel.add(object)
Map.add(EscolaPanel)




// GRÁFICO DE ÁREAS POR PONTO
var buttonPanel =  ui.Panel({layout:ui.Panel.Layout.flow('vertical'),
                           style: {width: '260px', position: 'bottom-left', padding: '0px 0px 0px 0px'}})
var activate = ui.Button({label:'VISUALIZAÇÃO DE GRÁFICOS', style: {width:'247px'}})
var desactivate = ui.Button({label:'DESATIVAR VISUALIZAÇÃO',style: {width:'247px'}})
var tituloBotao = ui.Label({value:'VISUALIZAÇÃO DE GRÁFICOS DE ÁREAS POR ESCOLA',style: {fontSize: '16px', fontWeight: 'bold',color: '#1D986C',padding:'30px 60px 0px 60px',textAlign:'center'}})
var instruc = ui.Label({value:'CLIQUE EM ALGUM PONTO DE ESCOLA PARA VISUALIZAR O GRÁFICO',style: {padding:'20px 50px 50px 50px',textAlign:'center'}})
var graphPanel = ui.Panel({layout:ui.Panel.Layout.flow('vertical'),
                           style: {width: '450px', height:'344px', position: 'bottom-left', padding: '0px 10px 0px 10px'}})
var labelInfo = ui.Label({style:{padding:'0px 0px 0px 50px'}})
var labelInfo2 = ui.Label({style:{padding:'0px 0px 0px 50px'}})
var titleInfo = ui.Label({style: BOLD_STYLE})
var graphInput = ee.FeatureCollection([]);


var niveisGRAPH = {
  'ESCOLHA UMA CATEGORIA': '',
  'ÁREAS TOTAIS - DECLIVIDADE < 20%': graphInputMENOR,
  'ÁREAS TOTAIS - DECLIVIDADE > 20%': graphInputMAIOR,
  'ÁREAS NÃO PAVIMENTADAS - DECLIVIDADE < 20%': graphInputNPMENOR
};

var selectorGraph = ui.Select({items: Object.keys(niveisGRAPH), placeholder:'ESCOLHA UMA CATEGORIA', style:{width: '420px', padding: '60px 10px 10px 10px', position:'top-center'}});
selectorGraph.onChange(function(selection) {
  graphInput = niveisGRAPH[selection];
});


var actfun = function(oncl) {
graphPanel.widgets().reset();
selectorGraph.setValue('ESCOLHA UMA CATEGORIA');
graphPanel.add(tituloBotao);
graphPanel.add(selectorGraph);
graphPanel.add(instruc);
graphPanel.remove(titleInfo);
graphPanel.remove(labelInfo);
buttonPanel.remove(activate);
buttonPanel.remove(desactivate);
buttonPanel.add(desactivate);


var selectedPoint = [];
//Map.addLayer(pontosAreas)
//var graphinput = pontosAreas.select(['0_AP - Declividade < 20%','0_BUFFER - Declividade < 20%','0_LOTE - Declividade < 20%','0_QUADRA - Declividade < 20%', 'eq_nome','eq_esfera'])
//var graphinput = graphInputAsset.select(['0_AP','0_BUFFER','0_LOTE', '0_QUADRA','eq_nome','eq_esfera']);

 //var pontosArea = pontosArea.style({pointSize:15})
//print(graphinput)


function handleMapClick(location) {
  graphPanel.widgets().reset();
  selectedPoint = [location.lon, location.lat];
  var click = graphInput.filterBounds(ee.Geometry.Point(selectedPoint).buffer(15));
  //var click2 = graphinput.filterBounds(ee.Geometry.Point(selectedPoint));
  //print(click)
var graf1 = ui.Chart.feature.byProperty({features: click, xProperties: ['LOTE','QUADRA','AP'], seriesProperty: 'eq_nome'});
graf1 = graf1.setChartType('BarChart');
graf1 = graf1.setOptions({
    //title: 'ÁREAS ',
    vAxis: {title: null},
    //hAxis: {title: 'ESFERA: ' + click2.get('eq_esfera').getInfo()},
    colors: ['#1D986C','#2FC19A','#2fff6f']
  });

titleInfo = titleInfo.setValue('ÁREAS PARA PLANTAÇÃO DE MINIFLORESTAS');
labelInfo = labelInfo.setValue('ESFERA ESCOLA: ' + ee.Feature(click.first()).get('eq_esfera').getInfo());
labelInfo2 = labelInfo2.setValue('ÁREA TOTAL EM UM RAIO DE 500m: ' + ee.Feature(click.first()).get('BUFFER').getInfo().toFixed(2) + ' m²');


graphPanel = graphPanel.add(titleInfo);
graphPanel = graphPanel.add(graf1);
graphPanel = graphPanel.add(labelInfo);
graphPanel = graphPanel.add(labelInfo2);
}
Map.add(graphPanel);
Map.onClick(handleMapClick);
};

Map.add(buttonPanel);
buttonPanel.add(activate);
var actingactivate = activate.onClick(actfun);

var desactfun = function(onclick) {
buttonPanel.remove(desactivate);
buttonPanel.remove(activate);
buttonPanel.add(activate);

Map.remove(graphPanel);

};

desactivate.onClick(desactfun);


/*// ZOOM



var zoomLabel = 'ZOOM:'
var zoom = ui.Slider({min:10, max:20, value:Map.getZoom(), step: 0.2, style: {minWidth: '295px', padding: '0px 0px 0px 20px'}})
zoom.onChange(function(slide) {
  Map.centerObject(teste, slide)
});


//toolPanel.add(painelZoom);
toolPanel.add(ui.Label(zoomLabel, ZOOM_STYLE))
toolPanel.add(zoom)*/





//Lista de Polígonos 
var painelPoligonos1 = ui.Panel({layout: ui.Panel.Layout.flow('horizontal'), style: {padding: '0px 0px 0px 35px'}});
var painelPoligonos2 = ui.Panel({layout: ui.Panel.Layout.flow('horizontal'), style: {padding: '0px 0px 0px 15px'}});


Map.addLayer(geometriaLotes,{opacity:0.5},'lotes Escolas',false);
Map.addLayer(geometriaQuadras,{opacity:0.5},'quadras Escolas',false);
Map.addLayer(areasProx,{opacity:0.5},'areas publicas',false);
Map.addLayer(buffers,{opacity:0.5},'buffers',false);

var lotes = ui.Button({label: 'Visualizar lotes'/*, 
                       style*/});
                       
lotes.onClick(function(clicked) {
  Map.layers().get(9).setShown(true);
});

var quadras = ui.Button({label: 'Visualizar Quadras'/*, 
                       style*/});
                       
quadras.onClick(function(clicked) {
  Map.layers().get(10).setShown(true);
});

var areasPub = ui.Button({label: 'Visualizar Áreas Públicas' /*, 
                       style*/});
                       
areasPub.onClick(function(clicked) {
  Map.layers().get(11).setShown(true);
});

var buff = ui.Button({label: 'Visualizar Buffers'/*, 
                       style*/});
                       
buff.onClick(function(clicked) {
  Map.layers().get(12).setShown(true);
});

var poligonosLabel = 'Polígonos:';
toolPanel.add(ui.Label(poligonosLabel, POLIGONOS_STYLE));

painelPoligonos1.add(lotes);
painelPoligonos1.add(quadras);
painelPoligonos2.add(areasPub);
painelPoligonos2.add(buff);

toolPanel.add(painelPoligonos1);
toolPanel.add(painelPoligonos2);





// MapBiomas

//var MapBiomasButton = ui.Button({label: 'Ma'})
var thumbDados = ui.Thumbnail({
    image: logoMapBiomas,
    params: {
        dimensions: '642x291',
        format: 'png'
        },
    style: {height: '55px', width: '200px',padding :'20px 0px 0px 0px'}
    });

var thumbOr = ui.Thumbnail({
    image: legenda1,
    params: {
        dimensions: '883x2505',
        format: 'png'
        },
    style: {height: '520px', width: '200px',padding :'0px 0px 0px 0px'}
    });
    
var thumbAg = ui.Thumbnail({
    image: legenda2,
    params: {
        dimensions: '860x303',
        format: 'png'
        },
    style: {height: '70px', width: '200px',padding :'0px 0px 0px 0px'}
    });
  

var colecoesMapBiomas = {
  'DADOS MAPBIOMAS': ['',thumbDados],
  'MAPBIOMAS COLEÇÃO 7.0': [MapBiomasImageVis, thumbOr],
  'MAPBIOMAS CLASSES AGREGADAS': [MapBiomasClassesAgVis, thumbAg],
};

var legendaPanel = ui.Panel();
var selectorMap = ui.Select({items: Object.keys(colecoesMapBiomas), value: 'DADOS MAPBIOMAS', style:{width:'295px', padding: '20px 0px 0px 0px'}});

selectorMap.onChange(function (selection) {
  Map.layers().set(0, ui.Map.Layer(colecoesMapBiomas[selection][0]));
  Map.remove(legendaPanel);
    
var thumb = colecoesMapBiomas[selection][1];
  

  legendaPanel = ui.Panel({widgets: thumb, layout:ui.Panel.Layout.flow('vertical'),
                           style: {width: '260px', height: '120px', position: 'bottom-left', padding: '20px'}});
  
  Map.add(legendaPanel);
  

});

toolPanel.add(selectorMap);





// LIMPAR MAPA

var limparMapa = ui.Button({label: 'LIMPAR MAPA', 
                       style: {padding: '20px 0px 0px 0px', width: '295px'}});
                       
limparMapa.onClick(function(clicked) {
  //DESLIGA TODOS OS LAYERS
  Map.layers().get(0).setShown(false);
  Map.layers().get(1).setShown(false);
  Map.layers().get(2).setShown(false);
  Map.layers().get(3).setShown(false);
  Map.layers().get(4).setShown(false);
  Map.layers().get(5).setShown(false);
  Map.layers().get(6).setShown(false);
  Map.layers().get(7).setShown(false);
  Map.layers().get(8).setShown(false);
  Map.layers().get(9).setShown(false);
  Map.layers().get(10).setShown(false);
  Map.layers().get(11).setShown(false);
  Map.layers().get(12).setShown(false);
  
  //DESATIVA TODAS AS CHECKBOXS
  CEICheck.setValue(false);
  CEMEICheck.setValue(false);
  CEUCheck.setValue(false);
  EECheck.setValue(false);
  EFCheck.setValue(false);
  EMEFCheck.setValue(false);
  EMEFMCheck.setValue(false);
  EMEICheck.setValue(false);
  
  //RESETA SELECTORS
  selector1.setValue('ÁREAS TOTAIS - DECLIVIDADE < 20%');
  selector2.setValue('ÁREAS TOTAIS - DECLIVIDADE > 20%');
  selector3.setValue('ÁREAS NÃO PAVIMENTADAS - DECLIVIDADE < 20%');
  selectorMap.setValue('DADOS MAPBIOMAS');
  
  Map.remove(legendaPanel);
});

toolPanel.add(limparMapa);







// CRÉDITOS

/*var creditos = '© MapBiomas';
toolPanel.add(ui.Label({value: creditos, 
                        style: CREDITOS_STYLE}));*/

var creditosMap = ui.Thumbnail({
    image: logoMapBiomas,
    params: {
        dimensions: '642x291',
        format: 'png'
        },
    style: {height: '40px', width: '225px',padding :'10px 0px 0px 85px', stretch: 'horizontal'}
    });

toolPanel.add(creditosMap);

//Map.addLayer(table)



