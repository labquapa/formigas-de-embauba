//DADOS FORMATADOS PARA GERAÇÃO DE GRÁFICOS NA INTERFACE

var class_NPMENOR = ee.FeatureCollection('users/formigas/MSP/OUTPUT/REV_C/REV_C_AREA_MANCHA_NPMEN20');


var class_NPMENOR_GraphInput = class_NPMENOR.map(function(mancha){
    var nLote = mancha.get('t_NoLote');
    var ponto = pontosEscolas.filter(ee.Filter.eq('t_NoLote',nLote)).first();
    var p1 = ponto.get('ArM2_TOTAL_MANCHA_ALT');
    var p2 = ponto.get('ArM2_TOTAL_MANCHA_NPTOTAL');
    var p3 = ponto.get('ArM2_TOTAL_MANCHA_NPMEN20');
    var p4 = ponto.get('TipoNome');
    var p5 = ponto.get('eq_dre');
    var p6 = ponto.get('eq_distr');
    var p7 = mancha.get('ArM2_LOTE_DA_MANCHA_NPMEN20');
    var p8 = mancha.get('ArM2_MANCHA_NPMEN20');
    
    return mancha.set('Áreas Livres', p1)
                .set('Áreas Livres Não Pavimentadas', p2)
                .set('Áreas Livres NPs', p2)
                .set('Áreas Livres Não Pavimentadas com Declividade inferior a 20%', p3)
                .set('Áreas Livres NPs < 20%', p3)
                .set('TipoNome', p4)
                .set('DRE', p5)
                .set('Distrito', p6)
                .set('Área Lote', p7)
                .set('Área Mancha',p8);
});

Export.table.toAsset(class_NPMENOR_GraphInput,'NPMENOR_GI','users/formigas/MSP/OUTPUT/REV_C/manchasGraphInputGERAL')
