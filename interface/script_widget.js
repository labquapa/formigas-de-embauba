 
// WIDGET - Formigas de Embaúba

// DESCRIÇÃO: Ferramenta para auxiliar a análise de possíveis áreas de plantação de miniflorestas
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

//         2.0 - RMSP e Raster Atualizado + filtro integrado + check para vetores
//         2.2 - Gráficos + Download de pontos
//         2.3 - Desenho de pontos/polígonos

 
//1) INSERIR CAMADAS DE INFORMAÇÕES NECESSÁRIAS
var MDT = ee.Image('users/formigas/MSP/OUTPUT/MDTPERCENT');
//Map.addLayer(MDT, {"opacity":1,"bands":["percent"],"min":2.5304599866673674,"max":93.67004145678956,"gamma":1},"MDT")

var RMSP = ee.FeatureCollection('users/formigas/MSP/INPUT/RMSP');

var class_NPMENOR = ee.FeatureCollection('users/formigas/MSP/OUTPUT/REV_C/REV_C_AREA_MANCHA_NPMEN20');
//class_NPMENOR = class_NPMENOR.style({"color":"219667"});

var class_NPTOTAL = ee.FeatureCollection('users/formigas/MSP/OUTPUT/REV_C/REV_C_AREA_MANCHA_NPTOTAL');
//class_NPTOTAL = class_NPTOTAL.style({"color":"ffc53aff"});

var class_ALT = ee.FeatureCollection('users/formigas/MSP/OUTPUT/REV_C/REV_C_AREA_MANCHA_ALT');
//class_ALT = class_ALT.style({"color":"e06d06ff"});


//var pontosEscolas = ee.FeatureCollection('users/formigas/MSP/OUTPUT/REV_C/REV_C_TABELA_10-02_View');
var pontosEscolas = ee.FeatureCollection('users/formigas/MSP/OUTPUT/REV_C/REV_C_TABELA_10-02');

var manchasGraphInput = ee.FeatureCollection('users/formigas/MSP/OUTPUT/REV_C/manchasGraphInputGERAL');
//Export.table.toDrive(manchasGraphInput,"Tabela","Earth Engine")
var lotesEscolas = ee.FeatureCollection('users/formigas/MSP/MIDPUT/REV_C/LotesEscolas_rC');
///lotesEscolas = lotesEscolas.style({color:/*'ffffff'*/'f0ffe9ff', fillColor: 'f0ffe900', lineType: 'dotted'});


var logoFormigas = ee.Image('users/formigas/MSP/INPUT/formigas-logo');

var logoMapBiomas = ee.Image('users/formigas/MSP/INPUT/mapbiomas-logo');

var legenda1 = ee.Image('users/formigas/MSP/INPUT/legendaCol7');

var legenda2 = ee.Image('users/formigas/MSP/INPUT/legendaAg');



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
    style: {height: '96px', width: '300px',padding :'0px 0px 0px 5px'}
    });
var layoutPanel = ui.Panel.Layout.flow('vertical');

//ESTILOS DE TEXTO


var BOLD_STYLE = {
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#000000',
  padding: '0px 0px 0px 0px',
  maxWidth: '300px',
 // textAlign: 'center'
};

var ESCOLAS_STYLE = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#1D986C',
  padding: '0px 0px 0px 20px',
  maxWidth: '300px',
  textAlign: 'center'
};

var DESCRICAO_STYLE = {
  fontSize: '12px',
  /*fontWeight: '100',*/
  color: '#000000',
  padding: '0px 0px 0px 0px',
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

var MENOR_STYLE = {
  fontSize: '11px',
  fontWeight: '75',
  color: '#000000',
  padding: '0px 0px 0px 0px',
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

var app_description = "Áreas potenciais para o plantio de miniflorestas de Mata Atlântica em escolas da rede pública de SP!";
/*var texto = ui.Label({
  value: "Áreas para possível plantação de miniflorestas, conforme indicações abaixo",
  style: {fontSize: '12px', padding :'20px', position: 'top-center'}
});*/

var toolPanel = ui.Panel(thumb, layoutPanel, {width: '325px'});
toolPanel.add(ui.Label(app_description, DESCRICAO_STYLE));
ui.root.widgets().add(toolPanel);




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

// JUNÇÕES - CEIs
var CEI1 = pontosEscolas.filter(ee.Filter.eq('eq_tipo','CEI DIRET'));
//print(CEI1);
var CEI2 = pontosEscolas.filter(ee.Filter.eq('eq_tipo','CEI INDIR'));
//print(CEI2);



// FILTRAGEM PONTOS POR TIPO DE ESCOLA

var CEI_pontos = CEI1.merge(CEI2);
//print(CEI_pontos);
var CEI_list = CEI_pontos.aggregate_array('t_NoLote');
print(CEI_list);

var CEI = lotesEscolas.filter(ee.Filter.inList('t_NoLote',CEI_list))
          .style({color:/*'ffffff'*/'f0ffe9ff', fillColor: 'f0ffe900', lineType: 'dotted'});
Map.addLayer(CEI,{},'CEI - 3', false);

var areas_CEI_ALT = class_ALT.filter(ee.Filter.inList('t_NoLote',CEI_list));
var areas_CEI_NPTOTAL = class_NPTOTAL.filter(ee.Filter.inList('t_NoLote',CEI_list));
var areas_CEI_NPMENOR = class_NPMENOR.filter(ee.Filter.inList('t_NoLote',CEI_list));
Map.addLayer(areas_CEI_ALT,{"color":"e06d06ff"},'CEI alt', false);
Map.addLayer(areas_CEI_NPTOTAL,{"color":"ffc53aff"},'CEI nptotal', false);
Map.addLayer(areas_CEI_NPMENOR,{"color":"219667"},'CEI npmenor20', false);



var CEMEI_pontos = pontosEscolas.filter(ee.Filter.eq('eq_tipo','CEMEI'));
//print(CEMEI);
var CEMEI_list = CEMEI_pontos.aggregate_array('t_NoLote');

var CEMEI = lotesEscolas.filter(ee.Filter.inList('t_NoLote',CEMEI_list))
                        .style({color:/*'ffffff'*/'f0ffe9ff', fillColor: 'f0ffe900', lineType: 'dotted'});
Map.addLayer(CEMEI,{},'CEMEI - 4', false);

var areas_CEMEI_ALT = class_ALT.filter(ee.Filter.inList('t_NoLote',CEMEI_list));
var areas_CEMEI_NPTOTAL = class_NPTOTAL.filter(ee.Filter.inList('t_NoLote',CEMEI_list));
var areas_CEMEI_NPMENOR = class_NPMENOR.filter(ee.Filter.inList('t_NoLote',CEMEI_list));
Map.addLayer(areas_CEMEI_ALT,{"color":"e06d06ff"},'CEMEI alt', false);
Map.addLayer(areas_CEMEI_NPTOTAL,{"color":"ffc53aff"},'CEMEI nptotal', false);
Map.addLayer(areas_CEMEI_NPMENOR,{"color":"219667"},'CEMEI npmenor20', false);



var CEU_pontos = CEU1.merge(CEU2).merge(CEU3).merge(CEU4).merge(CEU5);
//print(CEU); 
var CEU_list = CEU_pontos.aggregate_array('t_NoLote');

var CEU = lotesEscolas.filter(ee.Filter.inList('t_NoLote',CEU_list))
                      .style({color:/*'ffffff'*/'f0ffe9ff', fillColor: 'f0ffe900', lineType: 'dotted'});
Map.addLayer(CEU,{},'CEU - 5', false);

var areas_CEU_ALT = class_ALT.filter(ee.Filter.inList('t_NoLote',CEU_list));
var areas_CEU_NPTOTAL = class_NPTOTAL.filter(ee.Filter.inList('t_NoLote',CEU_list));
var areas_CEU_NPMENOR = class_NPMENOR.filter(ee.Filter.inList('t_NoLote',CEU_list));
Map.addLayer(areas_CEU_ALT,{"color":"e06d06ff"},'CEU alt', false);
Map.addLayer(areas_CEU_NPTOTAL,{"color":"ffc53aff"},'CEU nptotal', false);
Map.addLayer(areas_CEU_NPMENOR,{"color":"219667"},'CEU npmenor20', false);



var EE_pontos = pontosEscolas.filter(ee.Filter.eq('eq_tipo','EE'));
//print(EE);
var EE_list = EE_pontos.aggregate_array('t_NoLote');

var EE = lotesEscolas.filter(ee.Filter.inList('t_NoLote',EE_list))
                     .style({color:/*'ffffff'*/'f0ffe9ff', fillColor: 'f0ffe900', lineType: 'dotted'});
Map.addLayer(EE,{},'EE - 6', false);

var areas_EE_ALT = class_ALT.filter(ee.Filter.inList('t_NoLote',CEI_list));
var areas_EE_NPTOTAL = class_NPTOTAL.filter(ee.Filter.inList('t_NoLote',EE_list));
var areas_EE_NPMENOR = class_NPMENOR.filter(ee.Filter.inList('t_NoLote',EE_list));
Map.addLayer(areas_EE_ALT,{"color":"e06d06ff"},'EE alt', false);
Map.addLayer(areas_EE_NPTOTAL,{"color":"ffc53aff"},'EE nptotal', false);
Map.addLayer(areas_EE_NPMENOR,{"color":"219667"},'EE npmenor20', false);




var EMEF_pontos = pontosEscolas.filter(ee.Filter.eq('eq_tipo','EMEF'));
//print(EMEF);
var EMEF_list = EMEF_pontos.aggregate_array('t_NoLote');

var EMEF = lotesEscolas.filter(ee.Filter.inList('t_NoLote',EMEF_list))
                       .style({color:/*'ffffff'*/'f0ffe9ff', fillColor: 'f0ffe900', lineType: 'dotted'});
Map.addLayer(EMEF,{},'EMEF - 7',false);

var areas_EMEF_ALT = class_ALT.filter(ee.Filter.inList('t_NoLote',EMEF_list));
var areas_EMEF_NPTOTAL = class_NPTOTAL.filter(ee.Filter.inList('t_NoLote',EMEF_list));
var areas_EMEF_NPMENOR = class_NPMENOR.filter(ee.Filter.inList('t_NoLote',EMEF_list));
Map.addLayer(areas_EMEF_ALT,{"color":"e06d06ff"},'EMEF alt', false);
Map.addLayer(areas_EMEF_NPTOTAL,{"color":"ffc53aff"},'EMEF nptotal', false);
Map.addLayer(areas_EMEF_NPMENOR,{"color":"219667"},'EMEF npmenor20', false);



var EMEFM_pontos = pontosEscolas.filter(ee.Filter.eq('eq_tipo','EMEFM'));
//print(EMEFM);
var EMEFM_list = EMEFM_pontos.aggregate_array('t_NoLote');

var EMEFM = lotesEscolas.filter(ee.Filter.inList('t_NoLote',EMEFM_list))
                        .style({color:/*'ffffff'*/'f0ffe9ff', fillColor: 'f0ffe900', lineType: 'dotted'});
Map.addLayer(EMEFM,{},'EMEFM - 8', false);

var areas_EMEFM_ALT = class_ALT.filter(ee.Filter.inList('t_NoLote',EMEFM_list));
var areas_EMEFM_NPTOTAL = class_NPTOTAL.filter(ee.Filter.inList('t_NoLote',EMEFM_list));
var areas_EMEFM_NPMENOR = class_NPMENOR.filter(ee.Filter.inList('t_NoLote',EMEFM_list));
Map.addLayer(areas_EMEFM_ALT,{"color":"e06d06ff"},'EMEFM alt', false);
Map.addLayer(areas_EMEFM_NPTOTAL,{"color":"ffc53aff"},'EMEFM nptotal', false);
Map.addLayer(areas_EMEFM_NPMENOR,{"color":"219667"},'EMEFM npmenor20', false);



var EMEI_pontos = pontosEscolas.filter(ee.Filter.eq('eq_tipo','EMEI'));
//print(EMEI);
var EMEI_list = EMEI_pontos.aggregate_array('t_NoLote');

var EMEI = lotesEscolas.filter(ee.Filter.inList('t_NoLote',EMEI_list))
                       .style({color:/*'ffffff'*/'f0ffe9ff', fillColor: 'f0ffe900', lineType: 'dotted'});
Map.addLayer(EMEI,{},'EMEI - 9', false);

var areas_EMEI_ALT = class_ALT.filter(ee.Filter.inList('t_NoLote',EMEI_list));
var areas_EMEI_NPTOTAL = class_NPTOTAL.filter(ee.Filter.inList('t_NoLote',EMEI_list));
var areas_EMEI_NPMENOR = class_NPMENOR.filter(ee.Filter.inList('t_NoLote',EMEI_list));
Map.addLayer(areas_EMEI_ALT,{"color":"e06d06ff"},'EMEI alt', false);
Map.addLayer(areas_EMEI_NPTOTAL,{"color":"ffc53aff"},'EMEI nptotal', false);
Map.addLayer(areas_EMEI_NPMENOR,{"color":"219667"},'EMEI npmenor20', false);


var painelEscolas1 = ui.Panel({layout: ui.Panel.Layout.flow('horizontal'), style: {padding: '0px 0px 0px 35px'}});
var painelEscolas2 = ui.Panel({layout: ui.Panel.Layout.flow('horizontal'), style: {padding: '0px 0px 0px 45px'}});


var CEICheck = ui.Checkbox('CEI', false);
CEICheck.onChange(function(checked) {
  //Desliga todos os pontos
  Map.layers().get(0).setShown(false);
  Map.layers().get(4).setShown(false);
  Map.layers().get(8).setShown(false);
  Map.layers().get(12).setShown(false);
  Map.layers().get(16).setShown(false);
  Map.layers().get(20).setShown(false);
  Map.layers().get(24).setShown(false);
  
  //Desliga todos os polígonos CEI
  Map.layers().get(1).setShown(false);
  Map.layers().get(2).setShown(false);
  Map.layers().get(3).setShown(false);
  
  // Mostra pontos de escolas selecionadas --> mostrar lotes
  Map.layers().get(0).setShown(checked);
  Map.layers().get(4).setShown(CEMEICheck.getValue());
  Map.layers().get(8).setShown(CEUCheck.getValue());
  Map.layers().get(12).setShown(EECheck.getValue());
  Map.layers().get(16).setShown(EMEFCheck.getValue());
  Map.layers().get(20).setShown(EMEFMCheck.getValue());
  Map.layers().get(24).setShown(EMEICheck.getValue());

  // Boolean Cond
  var ALT_true = ee.Algorithms.If(CHECK_ALT.getValue(), true, 'not_show');
  var NPTOTAL_true = ee.Algorithms.If(CHECK_NPTOTAL.getValue(), true, 'not_show');
  var NPMENOR_true = ee.Algorithms.If(CHECK_NPMENOR.getValue(), true, 'not_show');
  
  // Boolean 2 checked
  var Check_ALT_bool = ee.Algorithms.IsEqual(ALT_true.getInfo(),checked);
  var Check_NPTOTAL_bool = ee.Algorithms.IsEqual(NPTOTAL_true.getInfo(),checked);
  var Check_NPMENOR_bool = ee.Algorithms.IsEqual(NPMENOR_true.getInfo(),checked);

  //Mostra polígonos CEI selecionados
  Map.layers().get(1).setShown(Check_ALT_bool.getInfo());
  Map.layers().get(2).setShown(Check_NPTOTAL_bool.getInfo());
  Map.layers().get(3).setShown(Check_NPMENOR_bool.getInfo());
});

var CEMEICheck = ui.Checkbox('CEMEI', false);
CEMEICheck.onChange(function(checked) {
  //Desliga todos os pontos
  Map.layers().get(0).setShown(false);
  Map.layers().get(4).setShown(false);
  Map.layers().get(8).setShown(false);
  Map.layers().get(12).setShown(false);
  Map.layers().get(16).setShown(false);
  Map.layers().get(20).setShown(false);
  Map.layers().get(24).setShown(false);
  
  //Desliga todos os polígonos CEMEI
  Map.layers().get(5).setShown(false);
  Map.layers().get(6).setShown(false);
  Map.layers().get(7).setShown(false);
  
  // Shows or hides the points layers based on the checkbox's value.
  Map.layers().get(0).setShown(CEICheck.getValue());
  Map.layers().get(4).setShown(checked);
  Map.layers().get(8).setShown(CEUCheck.getValue());
  Map.layers().get(12).setShown(EECheck.getValue());
  Map.layers().get(16).setShown(EMEFCheck.getValue());
  Map.layers().get(20).setShown(EMEFMCheck.getValue());
  Map.layers().get(24).setShown(EMEICheck.getValue());
  
  // Boolean Cond
  var ALT_true = ee.Algorithms.If(CHECK_ALT.getValue(), true, 'not_show');
  var NPTOTAL_true = ee.Algorithms.If(CHECK_NPTOTAL.getValue(), true, 'not_show');
  var NPMENOR_true = ee.Algorithms.If(CHECK_NPMENOR.getValue(), true, 'not_show');
  
  // Boolean 2 checked
  var Check_ALT_bool = ee.Algorithms.IsEqual(ALT_true.getInfo(),checked);
  var Check_NPTOTAL_bool = ee.Algorithms.IsEqual(NPTOTAL_true.getInfo(),checked);
  var Check_NPMENOR_bool = ee.Algorithms.IsEqual(NPMENOR_true.getInfo(),checked);

  //Mostra polígonos CEI selecionados
  Map.layers().get(5).setShown(Check_ALT_bool.getInfo());
  Map.layers().get(6).setShown(Check_NPTOTAL_bool.getInfo());
  Map.layers().get(7).setShown(Check_NPMENOR_bool.getInfo());
});

var CEUCheck = ui.Checkbox('CEU', false);
CEUCheck.onChange(function(checked) {
  //Desliga todos os pontos
  Map.layers().get(0).setShown(false);
  Map.layers().get(4).setShown(false);
  Map.layers().get(8).setShown(false);
  Map.layers().get(12).setShown(false);
  Map.layers().get(16).setShown(false);
  Map.layers().get(20).setShown(false);
  Map.layers().get(24).setShown(false);
  
  //Desliga todos os polígonos CEMEI
  Map.layers().get(9).setShown(false);
  Map.layers().get(10).setShown(false);
  Map.layers().get(11).setShown(false);
  
  // Shows or hides the first map layer based on the checkbox's value.
  Map.layers().get(0).setShown(CEICheck.getValue());
  Map.layers().get(4).setShown(CEMEICheck.getValue());
  Map.layers().get(8).setShown(checked);
  Map.layers().get(12).setShown(EECheck.getValue());
  Map.layers().get(16).setShown(EMEFCheck.getValue());
  Map.layers().get(20).setShown(EMEFMCheck.getValue());
  Map.layers().get(24).setShown(EMEICheck.getValue());

  // Boolean Cond
  var ALT_true = ee.Algorithms.If(CHECK_ALT.getValue(), true, 'not_show');
  var NPTOTAL_true = ee.Algorithms.If(CHECK_NPTOTAL.getValue(), true, 'not_show');
  var NPMENOR_true = ee.Algorithms.If(CHECK_NPMENOR.getValue(), true, 'not_show');
  
  // Boolean 2 checked
  var Check_ALT_bool = ee.Algorithms.IsEqual(ALT_true.getInfo(),checked);
  var Check_NPTOTAL_bool = ee.Algorithms.IsEqual(NPTOTAL_true.getInfo(),checked);
  var Check_NPMENOR_bool = ee.Algorithms.IsEqual(NPMENOR_true.getInfo(),checked);

  //Mostra polígonos CEI selecionados
  Map.layers().get(9).setShown(Check_ALT_bool.getInfo());
  Map.layers().get(10).setShown(Check_NPTOTAL_bool.getInfo());
  Map.layers().get(11).setShown(Check_NPMENOR_bool.getInfo());
});

var EECheck = ui.Checkbox('EE', false);
EECheck.onChange(function(checked) {
  //Desliga todos os pontos
  Map.layers().get(0).setShown(false);
  Map.layers().get(4).setShown(false);
  Map.layers().get(8).setShown(false);
  Map.layers().get(12).setShown(false);
  Map.layers().get(16).setShown(false);
  Map.layers().get(20).setShown(false);
  Map.layers().get(24).setShown(false);
  
  //Desliga todos os polígonos CEMEI
  Map.layers().get(13).setShown(false);
  Map.layers().get(14).setShown(false);
  Map.layers().get(15).setShown(false);
  
  // Shows or hides the first map layer based on the checkbox's value.
  Map.layers().get(0).setShown(CEICheck.getValue());
  Map.layers().get(4).setShown(CEMEICheck.getValue());
  Map.layers().get(8).setShown(CEUCheck.getValue());
  Map.layers().get(12).setShown(checked);
  Map.layers().get(16).setShown(EMEFCheck.getValue());
  Map.layers().get(20).setShown(EMEFMCheck.getValue());
  Map.layers().get(24).setShown(EMEICheck.getValue());
  
  // Boolean Cond
  var ALT_true = ee.Algorithms.If(CHECK_ALT.getValue(), true, 'not_show');
  var NPTOTAL_true = ee.Algorithms.If(CHECK_NPTOTAL.getValue(), true, 'not_show');
  var NPMENOR_true = ee.Algorithms.If(CHECK_NPMENOR.getValue(), true, 'not_show');
  
  // Boolean 2 checked
  var Check_ALT_bool = ee.Algorithms.IsEqual(ALT_true.getInfo(),checked);
  var Check_NPTOTAL_bool = ee.Algorithms.IsEqual(NPTOTAL_true.getInfo(),checked);
  var Check_NPMENOR_bool = ee.Algorithms.IsEqual(NPMENOR_true.getInfo(),checked);

  //Mostra polígonos CEI selecionados
  Map.layers().get(13).setShown(Check_ALT_bool.getInfo());
  Map.layers().get(14).setShown(Check_NPTOTAL_bool.getInfo());
  Map.layers().get(15).setShown(Check_NPMENOR_bool.getInfo());
});

var EMEFCheck = ui.Checkbox('EMEF', false);
EMEFCheck.onChange(function(checked) {
  //Desliga todos os pontos
  Map.layers().get(0).setShown(false);
  Map.layers().get(4).setShown(false);
  Map.layers().get(8).setShown(false);
  Map.layers().get(12).setShown(false);
  Map.layers().get(16).setShown(false);
  Map.layers().get(20).setShown(false);
  Map.layers().get(24).setShown(false);
  
  //Desliga todos os polígonos CEMEI
  Map.layers().get(17).setShown(false);
  Map.layers().get(18).setShown(false);
  Map.layers().get(19).setShown(false);
  
  // Shows or hides the first map layer based on the checkbox's value.
  Map.layers().get(0).setShown(CEICheck.getValue());
  Map.layers().get(4).setShown(CEMEICheck.getValue());
  Map.layers().get(8).setShown(CEUCheck.getValue());
  Map.layers().get(12).setShown(EECheck.getValue());
  Map.layers().get(16).setShown(checked);
  Map.layers().get(20).setShown(EMEFMCheck.getValue());
  Map.layers().get(24).setShown(EMEICheck.getValue());

  // Boolean Cond
  var ALT_true = ee.Algorithms.If(CHECK_ALT.getValue(), true, 'not_show');
  var NPTOTAL_true = ee.Algorithms.If(CHECK_NPTOTAL.getValue(), true, 'not_show');
  var NPMENOR_true = ee.Algorithms.If(CHECK_NPMENOR.getValue(), true, 'not_show');
  
  // Boolean 2 checked
  var Check_ALT_bool = ee.Algorithms.IsEqual(ALT_true.getInfo(),checked);
  var Check_NPTOTAL_bool = ee.Algorithms.IsEqual(NPTOTAL_true.getInfo(),checked);
  var Check_NPMENOR_bool = ee.Algorithms.IsEqual(NPMENOR_true.getInfo(),checked);

  //Mostra polígonos CEI selecionados
  Map.layers().get(17).setShown(Check_ALT_bool.getInfo());
  Map.layers().get(18).setShown(Check_NPTOTAL_bool.getInfo());
  Map.layers().get(19).setShown(Check_NPMENOR_bool.getInfo());
});

var EMEFMCheck = ui.Checkbox('EMEFM', false);
EMEFMCheck.onChange(function(checked) {
  //Desliga todos os pontos
  Map.layers().get(0).setShown(false);
  Map.layers().get(4).setShown(false);
  Map.layers().get(8).setShown(false);
  Map.layers().get(12).setShown(false);
  Map.layers().get(16).setShown(false);
  Map.layers().get(20).setShown(false);
  Map.layers().get(24).setShown(false);
  
  //Desliga todos os polígonos CEMEI
  Map.layers().get(21).setShown(false);
  Map.layers().get(22).setShown(false);
  Map.layers().get(23).setShown(false);
  
  // Shows or hides the first map layer based on the checkbox's value.
  Map.layers().get(0).setShown(CEICheck.getValue());
  Map.layers().get(4).setShown(CEMEICheck.getValue());
  Map.layers().get(8).setShown(CEUCheck.getValue());
  Map.layers().get(12).setShown(EECheck.getValue());
  Map.layers().get(16).setShown(EMEFCheck.getValue());
  Map.layers().get(20).setShown(checked);
  Map.layers().get(24).setShown(EMEICheck.getValue());
  
  // Boolean Cond
  var ALT_true = ee.Algorithms.If(CHECK_ALT.getValue(), true, 'not_show');
  var NPTOTAL_true = ee.Algorithms.If(CHECK_NPTOTAL.getValue(), true, 'not_show');
  var NPMENOR_true = ee.Algorithms.If(CHECK_NPMENOR.getValue(), true, 'not_show');
  
  // Boolean 2 checked
  var Check_ALT_bool = ee.Algorithms.IsEqual(ALT_true.getInfo(),checked);
  var Check_NPTOTAL_bool = ee.Algorithms.IsEqual(NPTOTAL_true.getInfo(),checked);
  var Check_NPMENOR_bool = ee.Algorithms.IsEqual(NPMENOR_true.getInfo(),checked);

  //Mostra polígonos CEI selecionados
  Map.layers().get(21).setShown(Check_ALT_bool.getInfo());
  Map.layers().get(22).setShown(Check_NPTOTAL_bool.getInfo());
  Map.layers().get(23).setShown(Check_NPMENOR_bool.getInfo());
});

var EMEICheck = ui.Checkbox('EMEI', false);
EMEICheck.onChange(function(checked) {
  //Desliga todos os pontos
  Map.layers().get(0).setShown(false);
  Map.layers().get(4).setShown(false);
  Map.layers().get(8).setShown(false);
  Map.layers().get(12).setShown(false);
  Map.layers().get(16).setShown(false);
  Map.layers().get(20).setShown(false);
  Map.layers().get(24).setShown(false);
  
  //Desliga todos os polígonos EMEI
  Map.layers().get(25).setShown(false);
  Map.layers().get(26).setShown(false);
  Map.layers().get(27).setShown(false);
  
  // Shows or hides the first map layer based on the checkbox's value.
  Map.layers().get(0).setShown(CEICheck.getValue());
  Map.layers().get(4).setShown(CEMEICheck.getValue());
  Map.layers().get(8).setShown(CEUCheck.getValue());
  Map.layers().get(12).setShown(EECheck.getValue());
  Map.layers().get(16).setShown(EMEFCheck.getValue());
  Map.layers().get(20).setShown(EMEFMCheck.getValue());
  Map.layers().get(24).setShown(checked);

  // Boolean Cond
  var ALT_true = ee.Algorithms.If(CHECK_ALT.getValue(), true, 'not_show');
  var NPTOTAL_true = ee.Algorithms.If(CHECK_NPTOTAL.getValue(), true, 'not_show');
  var NPMENOR_true = ee.Algorithms.If(CHECK_NPMENOR.getValue(), true, 'not_show');
  
  // Boolean 2 checked
  var Check_ALT_bool = ee.Algorithms.IsEqual(ALT_true.getInfo(),checked);
  var Check_NPTOTAL_bool = ee.Algorithms.IsEqual(NPTOTAL_true.getInfo(),checked);
  var Check_NPMENOR_bool = ee.Algorithms.IsEqual(NPMENOR_true.getInfo(),checked);

  //Mostra polígonos CEI selecionados
  Map.layers().get(25).setShown(Check_ALT_bool.getInfo());
  Map.layers().get(26).setShown(Check_NPTOTAL_bool.getInfo());
  Map.layers().get(27).setShown(Check_NPMENOR_bool.getInfo());
});

var tiposLabel = 'TIPOS DE ESCOLA:';
toolPanel.add(ui.Label(tiposLabel, ESCOLAS_STYLE));



painelEscolas1.add(CEICheck);
painelEscolas1.add(CEMEICheck);
painelEscolas1.add(CEUCheck);
painelEscolas1.add(EECheck);
painelEscolas2.add(EMEFCheck);
painelEscolas2.add(EMEFMCheck);
painelEscolas2.add(EMEICheck);

toolPanel.add(painelEscolas1);
toolPanel.add(painelEscolas2);




// TIPOS DE ÁREA

var tiposLabelArea = 'TIPOS DE ÁREA:';
toolPanel.add(ui.Label(tiposLabelArea, ESCOLAS_STYLE));

//MAP ADD LAYER - ORDEM DE FEATURES
//Map.addLayer(class_ALT,{},'0',false);
//Map.addLayer(class_NPTOTAL,{},'1',false);
//Map.addLayer(class_NPMENOR,{},'2',false);



//PAINEL PARA ESCOLHA DO RASTER 1
var painelRasters1 = ui.Panel({layout: ui.Panel.Layout.flow('horizontal',true), style: {padding: '0px 15px 0px 20px'}});
var painelLEGRasters1 = ui.Panel({layout: ui.Panel.Layout.flow('vertical'), style: {padding: '0px 15px 0px 20px'/*, textAlign: 'center'*/}});

//CHECK 1 - ÁREAS APTAS
var CHECK_NPMENOR = ui.Checkbox({label: '',style:{backgroundColor: '219667'}});

CHECK_NPMENOR.onChange(function(checked) {
  // Desliga todos os pontos
  Map.layers().get(0).setShown(false);
  Map.layers().get(4).setShown(false);
  Map.layers().get(8).setShown(false);
  Map.layers().get(12).setShown(false);
  Map.layers().get(16).setShown(false);
  Map.layers().get(20).setShown(false);
  Map.layers().get(24).setShown(false);
  
  // Desliga todos os poligonos
  Map.layers().get(3).setShown(false);
  Map.layers().get(7).setShown(false);
  Map.layers().get(11).setShown(false);
  Map.layers().get(15).setShown(false);
  Map.layers().get(19).setShown(false);
  Map.layers().get(23).setShown(false);
  Map.layers().get(27).setShown(false);
  
  // Liga pontos selecionados
  Map.layers().get(0).setShown(CEICheck.getValue());
  Map.layers().get(4).setShown(CEMEICheck.getValue());
  Map.layers().get(8).setShown(CEUCheck.getValue());
  Map.layers().get(12).setShown(EECheck.getValue());
  Map.layers().get(16).setShown(EMEFCheck.getValue());
  Map.layers().get(20).setShown(EMEFMCheck.getValue());
  Map.layers().get(24).setShown(EMEICheck.getValue());
  
  // Boolean escola checked
  var check_CEI_bool = ee.Algorithms.IsEqual(CEICheck.getValue(),true)
  var check_CEMEI_bool = ee.Algorithms.IsEqual(CEMEICheck.getValue(),true)
  var check_CEU_bool = ee.Algorithms.IsEqual(CEUCheck.getValue(),true)
  var check_EE_bool = ee.Algorithms.IsEqual(EECheck.getValue(),true)
  var check_EMEF_bool = ee.Algorithms.IsEqual(EMEFCheck.getValue(),true)
  var check_EMEFM_bool = ee.Algorithms.IsEqual(EMEFMCheck.getValue(),true)
  var check_EMEI_bool = ee.Algorithms.IsEqual(EMEICheck.getValue(),true)
  
  // Boolean 2 checked
  var CEI_bool = ee.Algorithms.IsEqual(check_CEI_bool.getInfo(),checked)
  var CEMEI_bool = ee.Algorithms.IsEqual(check_CEMEI_bool.getInfo(),checked)
  var CEU_bool = ee.Algorithms.IsEqual(check_CEU_bool.getInfo(),checked)
  var EE_bool = ee.Algorithms.IsEqual(check_EE_bool.getInfo(),checked)
  var EMEF_bool = ee.Algorithms.IsEqual(check_EMEF_bool.getInfo(),checked)
  var EMEFM_bool = ee.Algorithms.IsEqual(check_EMEFM_bool.getInfo(),checked)
  var EMEI_bool = ee.Algorithms.IsEqual(check_EMEI_bool.getInfo(),checked)
  
  // Liga poligonos dos pontos selecionados
  Map.layers().get(3).setShown(CEI_bool.getInfo());
  Map.layers().get(7).setShown(CEMEI_bool.getInfo());
  Map.layers().get(11).setShown(CEU_bool.getInfo());
  Map.layers().get(15).setShown(EE_bool.getInfo());
  Map.layers().get(19).setShown(EMEF_bool.getInfo());
  Map.layers().get(23).setShown(EMEFM_bool.getInfo());
  Map.layers().get(27).setShown(EMEI_bool.getInfo());
  
});

var ANPMENOR_label = ui.Label('ÁREAS LIVRES NÃO PAVIMENTADAS, COM DECLIVIDADE INFERIOR A 20%',{
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#000000',
  padding: '0px 0px 0px 0px',
  maxWidth: '220px',
 // textAlign: 'center'
});

//LEG CHECK1 - ÁREAS LIVRES
var legCHECK1 = ui.Label({value:'Áreas Aptas para miniflorestas', style: DESCRICAO_STYLE});

painelRasters1.add(CHECK_NPMENOR);
painelRasters1.add(ANPMENOR_label);
painelLEGRasters1.add(legCHECK1);
toolPanel.add(painelRasters1);
toolPanel.add(painelLEGRasters1);



//PAINEL PARA ESCOLHA DO RASTER 2
var painelRasters2 = ui.Panel({layout: ui.Panel.Layout.flow('horizontal',true), style: {padding: '0px 20px 0px 20px'}});
var painelLEGRasters2 = ui.Panel({layout: ui.Panel.Layout.flow('vertical'), style: {padding: '0px 20px 0px 20px'}});

//CHECK 2 - ÁREAS LIVRES NÃO PAVIMENTADAS
var CHECK_NPTOTAL = ui.Checkbox({label: '',style:{backgroundColor: "ffc53aff"}});

CHECK_NPTOTAL.onChange(function(checked) {
  // Desliga todos os pontos
  Map.layers().get(0).setShown(false);
  Map.layers().get(4).setShown(false);
  Map.layers().get(8).setShown(false);
  Map.layers().get(12).setShown(false);
  Map.layers().get(16).setShown(false);
  Map.layers().get(20).setShown(false);
  Map.layers().get(24).setShown(false);
  
  // Desliga todos os poligonos
  Map.layers().get(2).setShown(false);
  Map.layers().get(6).setShown(false);
  Map.layers().get(10).setShown(false);
  Map.layers().get(14).setShown(false);
  Map.layers().get(18).setShown(false);
  Map.layers().get(22).setShown(false);
  Map.layers().get(26).setShown(false);
  
  // Liga pontos selecionados
  Map.layers().get(0).setShown(CEICheck.getValue());
  Map.layers().get(4).setShown(CEMEICheck.getValue());
  Map.layers().get(8).setShown(CEUCheck.getValue());
  Map.layers().get(12).setShown(EECheck.getValue());
  Map.layers().get(16).setShown(EMEFCheck.getValue());
  Map.layers().get(20).setShown(EMEFMCheck.getValue());
  Map.layers().get(24).setShown(EMEICheck.getValue());
  
  // Boolean 2 checked
  var CEI_bool = ee.Algorithms.IsEqual(CEICheck.getValue(),checked)
  var CEMEI_bool = ee.Algorithms.IsEqual(CEMEICheck.getValue(),checked)
  var CEU_bool = ee.Algorithms.IsEqual(CEUCheck.getValue(),checked)
  var EE_bool = ee.Algorithms.IsEqual(EECheck.getValue(),checked)
  var EMEF_bool = ee.Algorithms.IsEqual(EMEFCheck.getValue(),checked)
  var EMEFM_bool = ee.Algorithms.IsEqual(EMEFMCheck.getValue(),checked)
  var EMEI_bool = ee.Algorithms.IsEqual(EMEICheck.getValue(),checked)
  
  // Liga poligonos dos pontos selecionados
  Map.layers().get(2).setShown(CEI_bool.getInfo());
  Map.layers().get(6).setShown(CEMEI_bool.getInfo());
  Map.layers().get(10).setShown(CEU_bool.getInfo());
  Map.layers().get(14).setShown(EE_bool.getInfo());
  Map.layers().get(18).setShown(EMEF_bool.getInfo());
  Map.layers().get(22).setShown(EMEFM_bool.getInfo());
  Map.layers().get(26).setShown(EMEI_bool.getInfo());
  
});

var NPTOTAL_label = ui.Label('ÁREAS LIVRES NÃO PAVIMENTADAS',BOLD_STYLE);

//LEG CHECK2 - ÁREAS NÃO PAVIMENTADAS
var legCHECK2 = ui.Label({value:'Áreas livres sem pavimento ou calçamento', style: DESCRICAO_STYLE});

painelRasters2.add(CHECK_NPTOTAL);
painelRasters2.add(NPTOTAL_label);
painelRasters2.add(legCHECK2);
toolPanel.add(painelRasters2);



//PAINEL PARA ESCOLHA DO RASTER 3
var painelRasters3 = ui.Panel({layout: ui.Panel.Layout.flow('horizontal',true), style: {padding: '0px 20px 0px 20px'}});
var painelLEGRasters3 = ui.Panel({layout: ui.Panel.Layout.flow('vertical'), style: {padding: '0px 20px 0px 20px'}});

//CHECK 3 - ÁREAS LIVRES
var CHECK_ALT = ui.Checkbox({label: '',style:{backgroundColor: 'e06d06ff'}});

CHECK_ALT.onChange(function(checked) {
  // Desliga todos os pontos
  Map.layers().get(0).setShown(false);
  Map.layers().get(4).setShown(false);
  Map.layers().get(8).setShown(false);
  Map.layers().get(12).setShown(false);
  Map.layers().get(16).setShown(false);
  Map.layers().get(20).setShown(false);
  Map.layers().get(24).setShown(false);
  
  // Desliga todos os poligonos
  Map.layers().get(1).setShown(false);
  Map.layers().get(5).setShown(false);
  Map.layers().get(9).setShown(false);
  Map.layers().get(13).setShown(false);
  Map.layers().get(17).setShown(false);
  Map.layers().get(21).setShown(false);
  Map.layers().get(25).setShown(false);
  
  // Liga pontos selecionados
  Map.layers().get(0).setShown(CEICheck.getValue());
  Map.layers().get(4).setShown(CEMEICheck.getValue());
  Map.layers().get(8).setShown(CEUCheck.getValue());
  Map.layers().get(12).setShown(EECheck.getValue());
  Map.layers().get(16).setShown(EMEFCheck.getValue());
  Map.layers().get(20).setShown(EMEFMCheck.getValue());
  Map.layers().get(24).setShown(EMEICheck.getValue());
  
  // Boolean 2 checked
  var CEI_bool = ee.Algorithms.IsEqual(CEICheck.getValue(),checked)
  var CEMEI_bool = ee.Algorithms.IsEqual(CEMEICheck.getValue(),checked)
  var CEU_bool = ee.Algorithms.IsEqual(CEUCheck.getValue(),checked)
  var EE_bool = ee.Algorithms.IsEqual(EECheck.getValue(),checked)
  var EMEF_bool = ee.Algorithms.IsEqual(EMEFCheck.getValue(),checked)
  var EMEFM_bool = ee.Algorithms.IsEqual(EMEFMCheck.getValue(),checked)
  var EMEI_bool = ee.Algorithms.IsEqual(EMEICheck.getValue(),checked)
  
  // Liga poligonos dos pontos selecionados
  Map.layers().get(1).setShown(CEI_bool.getInfo());
  Map.layers().get(5).setShown(CEMEI_bool.getInfo());
  Map.layers().get(9).setShown(CEU_bool.getInfo());
  Map.layers().get(13).setShown(EE_bool.getInfo());
  Map.layers().get(17).setShown(EMEF_bool.getInfo());
  Map.layers().get(21).setShown(EMEFM_bool.getInfo());
  Map.layers().get(25).setShown(EMEI_bool.getInfo());
  
    
});

var A_label = ui.Label('ÁREAS LIVRES',BOLD_STYLE);

//LEG CHECK3 - ÁREAS LIVRES
var legCHECK3 = ui.Label({value:'Áreas sem edificação e sem cobertura arbórea', style: DESCRICAO_STYLE});

painelRasters3.add(CHECK_ALT);
painelRasters3.add(A_label);
painelLEGRasters3.add(legCHECK3);
toolPanel.add(painelRasters3);
toolPanel.add(painelLEGRasters3);





// BUSCA TEXTUAL POR ESCOLA

var object = ui.Textbox({placeholder:'NOME ESCOLA', value:'', style:{width: '200px'}});
var teste = pontosEscolas.filter(ee.Filter.eq('eq_nome', 'CEU CEMEI VILA ALPINA')).first();
Map.centerObject(teste,11);

object.onChange(function(escolaEscolhida){
  teste = pontosEscolas.filter(ee.Filter.eq('TipoNome', escolaEscolhida)).first();
   Map.centerObject(teste, 20);
});


var EscolaPanel = ui.Panel({layout:ui.Panel.Layout.flow('vertical'),
                           style: {width: '260px', position: 'bottom-left', padding: '20px'}});

var buscaEscolaLabel = ui.Label('BUSCA DE ESCOLA POR NOME:', BUSCA_STYLE);
EscolaPanel.add(buscaEscolaLabel);
EscolaPanel.add(object);
Map.add(EscolaPanel);





// MapBiomas

var year = ''; // DEFINE IMAGEM MAPBIOMAS

var ANO_DADOS_MAPBIOMAS = {
  '2021': 2021,
  '2020': 2020,
  '2019': 2019,
  '2018': 2018,
  '2017': 2017,
  '2016': 2016,
  '2015': 2015,
  '2014': 2014,
  '2013': 2013,
  '2012': 2012,
  '2010': 2010,
  '2009': 2009,
  '2008': 2008,
  '2007': 2007,
  '2006': 2006,
  '2005': 2005,
  '2004': 2004,
  '2003': 2003,
  '2002': 2002,
  '2001': 2001,
  '2000': 2000
};


var selectorYear = ui.Select({items: Object.keys(ANO_DADOS_MAPBIOMAS), style:{width:'90px', padding: '5px 0px 0px 0px'}});
selectorYear.onChange(function(selection) {
  year = ANO_DADOS_MAPBIOMAS[selection];

  print(year)
});
 
 selectorYear.setValue('2021',false);
 print(selectorYear.getValue())


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
  


  var MapBiomasImage = ee.Image('projects/mapbiomas-workspace/public/collection7/mapbiomas_collection70_integration_v2').clip(RMSP);
  print(MapBiomasImage)
  // var Teste = MapBiomasImage.visualize({"opacity":0.5,"bands":["classification_2000"],"max":49,"palette":["ffffff","129912","1f4423","006400","00ff00","687537","76a5af","29eee4","77a605","ad4413","bbfcac","45c2a5","b8af4f","f1c232","ffffb2","ffd966","f6b26b","f99f40","e974ed","d5a6bd","c27ba0","fff3bf","ea9999","dd7e6b","aa0000","ff3d3d","0000ff","d5d5e5","dd497f","665a3a","af2a2a","1f0478","968c46","0000ff","4fd3ff","645617","f3b4f1","02106f","02106f","e075ad","982c9e","e787f8","cca0d4","d082de","cd49e4","e04cfa","cca0d4","d082de","cd49e4","6b9932"]});
  // Map.addLayer(Teste)
  // var Teste2 = MapBiomasImage.visualize({"opacity":0.5,"bands":["classification_2021"],"max":49,"palette":["ffffff","129912","1f4423","006400","00ff00","687537","76a5af","29eee4","77a605","ad4413","bbfcac","45c2a5","b8af4f","f1c232","ffffb2","ffd966","f6b26b","f99f40","e974ed","d5a6bd","c27ba0","fff3bf","ea9999","dd7e6b","aa0000","ff3d3d","0000ff","d5d5e5","dd497f","665a3a","af2a2a","1f0478","968c46","0000ff","4fd3ff","645617","f3b4f1","02106f","02106f","e075ad","982c9e","e787f8","cca0d4","d082de","cd49e4","e04cfa","cca0d4","d082de","cd49e4","6b9932"]});
  // Map.addLayer(Teste2)

var colecoesMapBiomas = {
  'MAPBIOMAS COLEÇÃO 7.0': ['1', thumbOr],
  'MAPBIOMAS CLASSES AGREGADAS': ['2', thumbAg],
};

var selectorPanelLayout = ui.Panel.Layout.flow('horizontal');
var selectorPanel = ui.Panel({layout: selectorPanelLayout});
var selectorMap = ui.Select({items: Object.keys(colecoesMapBiomas), placeholder: 'DADOS MAPBIOMAS', style:{width:'185px', padding: '5px 0px 0px 13px'}});

var legendaPanel = ui.Panel({layout:ui.Panel.Layout.flow('vertical'),
                           style: {width: '260px', height: '120px', position: 'bottom-left', padding: '20px'}});

selectorMap.onChange(function (selection) {
  var yearMap = selectorYear.getValue();
  print(yearMap)
  var MapBiomasImageVis = MapBiomasImage.visualize({"opacity":0.5,"bands":["classification_" + yearMap],"max":49,"palette":["ffffff","129912","1f4423","006400","00ff00","687537","76a5af","29eee4","77a605","ad4413","bbfcac","45c2a5","b8af4f","f1c232","ffffb2","ffd966","f6b26b","f99f40","e974ed","d5a6bd","c27ba0","fff3bf","ea9999","dd7e6b","aa0000","ff3d3d","0000ff","d5d5e5","dd497f","665a3a","af2a2a","1f0478","968c46","0000ff","4fd3ff","645617","f3b4f1","02106f","02106f","e075ad","982c9e","e787f8","cca0d4","d082de","cd49e4","e04cfa","cca0d4","d082de","cd49e4","6b9932"]});
  var MapBiomasClassesAg = MapBiomasImage.remap({ from: [1,3,4,5,49,9,
                                                       10,11,12,32,29,50,13,14,15,
                                                       18,19,39,20,40,62,41,36,46,47,48, //agricultura
                                                       21, //mosaico de usos
                                                       22,23,24,30,25,
                                                       26,33,31],
                                     to: [1,1,1,1,1,1,
                                          2,2,2,2,2,2,2,2,2,
                                          5,5,5,5,5,5,5,5,5,5,5,
                                          6,
                                          3,3,3,3,3,
                                          4,4,4], bandName:"classification_" + yearMap});
  var MapBiomasClassesAgVis = MapBiomasClassesAg.visualize({"opacity":0.5,"palette":["129912",/*"bbfcac",*/"00ff00","ea9999","0000ff","e974ed","fff3bf"]});
  
  var Dictionary = { 
    '1': MapBiomasImageVis, 
    '2': MapBiomasClassesAgVis
  };
  
  Map.layers().get(0).setShown(false);
  
  Map.layers().set(0, ui.Map.Layer(Dictionary[colecoesMapBiomas[selection][0]]));
  // Map.layers().set(0, ui.Map.Layer(mapa.getMap()));
  
  legendaPanel.clear();
  Map.remove(legendaPanel);
    
  var thumb = colecoesMapBiomas[selection][1];

  legendaPanel.add(thumb);
  Map.add(legendaPanel);
  

});

selectorPanel.add(selectorMap);
selectorPanel.add(selectorYear);
toolPanel.add(selectorPanel);





// LIMPAR MAPA

var limparMapa = ui.Button({label: 'LIMPAR MAPA', 
                       style:{width:'295px', padding: '10px 0px 0px 13px'}});
                       
limparMapa.onClick(function(clicked) {
  
  //DESATIVA TODAS AS CHECKBOXS
  CEICheck.setValue(false);
  CEMEICheck.setValue(false);
  CEUCheck.setValue(false);
  EECheck.setValue(false);
  EMEFCheck.setValue(false);
  EMEFMCheck.setValue(false);
  EMEICheck.setValue(false);
  
  CHECK_NPMENOR.setValue(false);
  CHECK_NPTOTAL.setValue(false);
  CHECK_ALT.setValue(false);
  
  
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
  Map.layers().get(13).setShown(false);
  Map.layers().get(14).setShown(false);
  Map.layers().get(15).setShown(false);
  Map.layers().get(16).setShown(false);
  Map.layers().get(17).setShown(false);
  Map.layers().get(18).setShown(false);
  Map.layers().get(19).setShown(false);
  Map.layers().get(20).setShown(false);
  Map.layers().get(21).setShown(false);
  Map.layers().get(22).setShown(false);
  Map.layers().get(23).setShown(false);
  Map.layers().get(24).setShown(false);
  Map.layers().get(25).setShown(false);
  Map.layers().get(26).setShown(false);
  Map.layers().get(27).setShown(false);
  //Map.layers().get(28).setShown(false);
  
  //RESETA SELECTORS
  selectorMap.setDisabled();
  
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




// BOTÃO DE DOWNLOAD DE PONTOS

var drawingTools = Map.drawingTools();
drawingTools.setShown(false);
var dummyGeometry =
    ui.Map.GeometryLayer({geometries: null, name: 'geometry', color: '23cba7'});

drawingTools.layers().add(dummyGeometry);

function drawPolygon() {
  drawingTools.setShape('polygon');
  drawingTools.draw();
}
 
function drawPoint() {
  drawingTools.setShape('point');
  drawingTools.draw();
}


var symbol = {
  rectangle: '⬛',
  polygon: '🔺',
  point: '📍',
};


var download_panel = ui.Panel({style: {width:'260px', position: 'bottom-left', padding: '0px'}});

    var download_points = ui.Button({
      label:'MARCAR ÁREAS',
      style:{color: '219667',width:'247px'},
      onClick:function(){
        
        download_panel.clear();
        
        var instr = ui.Label({
          value: 'Desenhe de acordo com a característica da área'
          ,style: {textAlign:'center'}
        });
        
        download_panel.add(instr);
        
        var desenhar = ui.Button({
        label: symbol.polygon + ' - Polígonos para descartar',
        onClick: drawPolygon,
        style: {stretch: 'horizontal'}
         })
        var desenhar2 = ui.Button({
        label: symbol.point + ' - Pontos para marcar potencial',
        onClick: drawPoint,
        style: {stretch: 'horizontal'}
        })
        
        download_panel.add(desenhar);
        download_panel.add(desenhar2);
         
        var butt2 = ui.Button({label:'Clique aqui para gerar o link de download',
          style:{width:'247px'},
          onClick: function(){
            var aoi = drawingTools.layers().get(0).getEeObject();
            var aoiFc = ee.FeatureCollection(aoi);
            
            ee.String(ee.Date(Date.now()).format('y-M-d-h-m-s','America/Sao_Paulo'))
                                         .split('-')
                                         .map(function(str){
         return ee.String(ee.Algorithms.If({
           condition:ee.String(str).length().eq(1),
           trueCase:ee.String('0').cat(str),
           falseCase:str
          }));
       })
       .evaluate(function(date){
          
          date = date[0] + date[1] + date[2]  + '_' + date[3] + date[4] + date[5];
          
          var filename = 'poligonos_' + date;
          var link = ee.FeatureCollection(aoiFc).getDownloadURL({
            format:'csv',
            // selectors:,
            filename:filename,
            // callback:
          });
          
          download_panel.clear();
          
          var label = ui.Label({
            value:'📥: ' + filename,
            style:{textAlign:'center', padding: '0px 0px 0px 22px'},
            targetUrl:link,
            // imageUrl:
          });
          
          var formul= ui.Label({
            value:'Baixe o arquivo e submeta no formulário deste link'
            ,style: {textAlign:'center'}
          });
          
          formul.setUrl('https://forms.gle/4D2kEC2beyvb751B9');
          download_panel.add(label);
          download_panel.add(formul);
         
        });
    }});
    download_panel.add(butt2);
    
}});
    
    download_panel.add(download_points);
    Map.add(download_panel);





// GRÁFICO DE ÁREAS POR MANCHA
var buttonPanel =  ui.Panel({layout:ui.Panel.Layout.flow('vertical'),
                           style: {width: '260px', position: 'bottom-left', padding: '0px 0px 0px 0px'}})
var activate = ui.Button({label:'VISUALIZAÇÃO DE GRÁFICOS', style: {width:'247px'}})
var desactivate = ui.Button({label:'DESATIVAR VISUALIZAÇÃO',style: {width:'247px'}})
var tituloBotao = ui.Label({value:'VISUALIZAÇÃO DE GRÁFICOS DE ÁREAS POR MANCHA',style: {fontSize: '16px', fontWeight: 'bold',color: '#1D986C',padding:'30px 60px 0px 60px',textAlign:'center'}})
var instruc = ui.Label({value:'CLIQUE EM ALGUMA MANCHA DE ÁREA LIVRE NÃO PAVIMENTADA COM DECLIVIDADE INFERIOR A 20% PARA VISUALIZAR O GRÁFICO',style: {padding:'50px 50px 0px 50px',textAlign:'center'}})
var instruc2 = ui.Label({value:'(ÁREAS APTAS/MANCHAS VERDES)',style: {color: '#219667',padding:'0px 50px 0px 90px',textAlign:'center'}})

var graphPanel = ui.Panel({layout:ui.Panel.Layout.flow('vertical'),
                           style: {width: '450px', height:'344px', position: 'bottom-left', padding: '0px 10px 0px 10px'}})
var labelInfo = ui.Label({style:{padding:'0px 0px 0px 50px'}})
var labelInfo2 = ui.Label({style:{padding:'0px 0px 0px 50px'}})
var labelInfo3 = ui.Label({style:{padding:'0px 0px 0px 50px'}})

var titleInfo = ui.Label({style:{fontSize: '14px', fontWeight: 'bold',textAlign: 'center',padding:'10px 0px 0px 60px'}})

var graphInput = manchasGraphInput;



var actfun = function(oncl) {
graphPanel.widgets().reset();
graphPanel.add(tituloBotao);
graphPanel.add(instruc);
graphPanel.add(instruc2);
graphPanel.remove(titleInfo);
graphPanel.remove(labelInfo);
buttonPanel.remove(activate);
buttonPanel.remove(desactivate);
buttonPanel.add(desactivate);


var selectedPoint = [];

function handleMapClick(location) {
  graphPanel.widgets().reset();
  selectedPoint = [location.lon, location.lat];
  var click1 = ee.Geometry.Point(selectedPoint).buffer(15);
  var click2 = graphInput.filterBounds(click1)//.first();

// var graf1 = ui.Chart.feature.byProperty({features: click2, xProperties:['Áreas Livres',
//                                               'Áreas Livres Não Pavimentadas com Declividade inferior a 20%',
//                                               'Áreas Livres Não Pavimentadas', 'Área Mancha'], seriesProperty: 'TipoNome'});

var graf1 = ui.Chart.feature.byProperty({features: click2, xProperties:['Áreas Livres',
                                              'Áreas Livres NPs < 20%',
                                              'Áreas Livres NPs', 'Área Mancha'], seriesProperty: 'TipoNome'});

graf1 = graf1.setChartType('BarChart');
graf1 = graf1.setOptions({
    vAxis: {title: null},
    colors: [/*'#e06d06','#ffc53a',*/'#219667']
  });

titleInfo = titleInfo.setValue('ÁREAS PARA O PLANTIO DE MINIFLORESTAS');
labelInfo = labelInfo.setValue('DRE ESCOLA: ' + ee.Feature(click2.first()).get('DRE').getInfo());
labelInfo2 = labelInfo2.setValue('DISTRITO ESCOLA: ' + ee.Feature(click2.first()).get('Distrito').getInfo());

// labelInfo = labelInfo.setValue('DRE ESCOLA: ' + ee.Feature(click2.first()).get('eq_dre').getInfo());
// labelInfo2 = labelInfo2.setValue('DISTRITO ESCOLA: ' + ee.Feature(click2.first()).get('eq_dre').getInfo());

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

