
// ASSETS
//-----------------------------------------------------------------------------------

var MANCHAS_ALT = ee.FeatureCollection('users/formigas/MSP/OUTPUT/REV_C/REV_C_AREA_MANCHA_ALT');
var MANCHAS_NPTOTAL = ee.FeatureCollection('users/formigas/MSP/OUTPUT/REV_C/REV_C_AREA_MANCHA_NPTOTAL');
var MANCHAS_NPMENOR = ee.FeatureCollection('users/formigas/MSP/OUTPUT/REV_C/REV_C_AREA_MANCHA_NPMEN20');

var ptsEscolas = ee.FeatureCollection("users/formigas/MSP/MIDPUT/REV_C/PtsEscolas_Nome_rC");
print("ptsEscolas", ptsEscolas);

  
// DEFINIÇÃO FUNÇÃO
//-----------------------------------------------------------------------------------

var setAreaTotalMancha = function(pontos, poligonos, description){
  
  var lista_poligonos_com_manchas = poligonos.distinct('t_NoLote').aggregate_array('t_NoLote');
  var escolas_com_manchas = pontos.filter(ee.Filter.inList('t_NoLote',lista_poligonos_com_manchas));
  
  var lista_escolas_totais = pontos.aggregate_array('t_NoEsco');
  var lista_escolas_com_manchas = escolas_com_manchas.aggregate_array('t_NoEsco');
  var lista_escolas_sem_manchas = lista_escolas_totais.removeAll(lista_escolas_com_manchas);
  var escolas_sem_manchas = pontos.filter(ee.Filter.inList('t_NoEsco',lista_escolas_sem_manchas));

  var setProperties = escolas_com_manchas.map(function(pt){

  var feat_ID = pt.get("t_NoLote");
  //print(feat_ID);
  var manchas_ptEscola = poligonos.filter(ee.Filter.eq("t_NoLote", feat_ID));
  //print(manchas_ptEscola);
  var areaTotalManchas = manchas_ptEscola.aggregate_sum('ArM2_' + description);
  //print(areaTotalManchas);
  var areaTotalLote = manchas_ptEscola.aggregate_max("ArM2_LOTE_DA_" + description);
  //print(areaTotalLote);
  var porcentagem = areaTotalManchas.divide(areaTotalLote).multiply(100);
  //print(porcentagem);
  return pt.set("ArM2_TOTAL_" + description, areaTotalManchas)
           .set("%_" + description + '_DO_LOTE', porcentagem);

    });
    
var setEmptyProperties = escolas_sem_manchas.map(function(pt){
  return pt.set("ArM2_TOTAL_" + description, 0)
           .set("%_" + description + '_DO_LOTE', 0);
});

  return setProperties.merge(setEmptyProperties);
 };



// RODAR FUNÇÃO
//-----------------------------------------------------------------------------------

// LOTES

var set_ALT = setAreaTotalMancha(ptsEscolas, MANCHAS_ALT,'MANCHA_ALT');
print(set_ALT);
var set_NPTOTAL = setAreaTotalMancha(set_ALT, MANCHAS_NPTOTAL,'MANCHA_NPTOTAL');
print(set_NPTOTAL);
var set_NPMENOR20 = setAreaTotalMancha(set_NPTOTAL, MANCHAS_NPMENOR, 'MANCHA_NPMEN20');
print(set_NPMENOR20)

Export.table.toDrive({collection: set_NPMENOR20, description: 'REV_C_TABELA_10-02', folder: 'Earth Engine'});
Export.table.toAsset({collection: set_NPMENOR20, description: 'REV_C_TABELA_10-02', assetId: 'users/formigas/MSP/OUTPUT/REV_C/REV_C_TABELA_10-02'});
