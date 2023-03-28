<div class="fluid-row" id="header">
    <div id="column">
        <div class = "blocks">
            <img src='https://user-images.githubusercontent.com/68694598/199020684-ce109cc6-d426-470c-aada-e42ed0f2cf42.png' height='auto' width='165' align='right'>
        </div>
    </div>
    <h2 class="title toc-ignore">IDENTIFICAÇÃO DE ÁREAS APTAS PARA O PLANTIO DE MINIFLORESTAS E DESENVOLVIMENTO DE INTERFACE DE VISUALIZAÇÃO</h2>
</div>

Mapeamento e análise de espaços livres intraquadra a partir de escolas públicas do município de São Paulo, automatizando a identificação de áreas aptas para o plantio de miniflorestas de Mata Atlântica, realizados por integrantes de:

* [__FORMIGAS-DE-EMBAÚBA__](https://www.instagram.com/formigasdeembauba/)
* [__LAB. QUAPÁ__](http://quapa.fau.usp.br/wordpress/)
* [__MAPBIOMAS__](https://mapbiomas.org/)

---


<h2>ORGANIZAÇÃO DO REPOSITÓRIO</h2>

* O branch ['versão-1'](https://github.com/labquapa/formigas-de-embauba/tree/vers%C3%A3o-1) contém o mapeamento e aplicativo originais, sobre os quais foi desenvolvido um artigo, submetido e aceito no SBSR 2023. Foi utilizado pela formigas-de-embaúba, que identificou diversos pontos a serem modificados.<br>
    * A pasta 'mapeamento' contém os códigos que foram desenvolvidos e executados no Google Earth Engine (GEE) para obter os dados que são utilizados no aplicativo. <br>
    * A pasta 'interface' possui o código que dá origem ao aplicativo. Neste código, há todos os dados que foram obtidos/coletados acessíveis como assets abertos no GEE.

* O main branch ['versão-2'](https://github.com/labquapa/formigas-de-embauba) se refere à segunda versão da interface, que foi utilizada por voluntários da formigas-de-embaúba para verificação das áreas identificadas como aptas antes do contato com as escolas. É considerada a versão final da interface. <br>

    * A pasta 'mapeamento' contém os códigos que foram desenvolvidos e executados no Google Earth Engine (GEE) para obter os dados que são utilizados no aplicativo. <br>
    * A pasta 'interface' possui o código que dá origem ao aplicativo. Neste código, há todos os dados que foram obtidos/coletados acessíveis como assets abertos no GEE.

---


<h2>DADOS COLETADOS</h2>
Para o mapeamento das áreas aptas, foram reunidas as seguintes informações:

<br>
<br>

| DADO          | ORIGEM        | ANO |
| :------------:|:-------------:| :---:|
| Lotes das escolas públicas de São Paulo | [Departamento de Urbanismo da Secretaria Municipal de Desenvolvimento Urbano (SMDU/DEURB)](https://gestaourbana.prefeitura.sp.gov.br/marco-regulatorio/planos-regionais/arquivos/)| 2016 | 
| Altura de vegetação (VHM) | [LiDAR  pré-processado e disponibilizados na plataforma Kaggle](https://www.kaggle.com/datasets/andasampa/height-model?select=0-VHM-sao-paulo-city.tif) | 2017 |
| Altura de edificações (BHM) | [LiDAR pré-processado e disponibilizados na plataforma Kaggle](https://www.kaggle.com/datasets/andasampa/height-model?select=0-BHM-sao-paulo-city.tif) | 2017 |
| Modelo digital de terreno (MDT) |[LiDAR pré-processado e disponibilizados na plataforma Kaggle](https://www.kaggle.com/datasets/andasampa/dtm-dsm-sao-paulo?select=MDT_sampa-ZSTD.tif) | 2017 |
| Pontos das escolas públicas de São Paulo | [Dados georreferenciados dos equipamentos de educação localizados no município de São Paulo - GeoSampa](https://geosampa.prefeitura.sp.gov.br/PaginasPublicas/_SBC.aspx) | 2018 |
| Áreas públicas, quadras e lotes | [Polígonos georreferenciados no município de São Paulo - GeoSampa](https://geosampa.prefeitura.sp.gov.br/PaginasPublicas/_SBC.aspx) | 2019 |
| Listagem das escolas públicas de São Paulo  |  [microdados do censo escolar da educação básica de 2021](https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar)| 2021 |
|Imagens de satélite mensais de resolução espacial de 4,77 m | [Dados da Planet & NICFI para o monitoramento de florestas tropicais](https://developers.google.com/earth-engine/datasets/catalog/projects_planet-nicfi_assets_basemaps_americas) | 2021 |
|Uso e Cobertura da Terra| [MapBiomas](https://mapbiomas.org/)| 2022 |

<!-- 
1. Listagem das escolas, obtida a partir dos [microdados do censo escolar da educação básica de 2021](https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar) realizados pelo Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira (INEP).
2. [Lotes das escolas públicas de São Paulo](https://gestaourbana.prefeitura.sp.gov.br/marco-regulatorio/planos-regionais/arquivos/), identificados em mapeamento realizado pelo Departamento de Urbanismo da Secretaria Municipal de Desenvolvimento Urbano (SMDU/DEURB) da Prefeitura Municipal de São Paulo (PMSP). 
3. Pontos das escolas, obtidos a partir dos dados georreferenciados de 2018 dos equipamentos de educação localizados no município de São Paulo, disponibilizados no repositório [GeoSampa](https://geosampa.prefeitura.sp.gov.br/PaginasPublicas/_SBC.aspx) da PMSP. 
4. Áreas públicas, quadras e lotes, conforme dado de 2019 disponibilizado no [GeoSampa](https://geosampa.prefeitura.sp.gov.br/PaginasPublicas/_SBC.aspx).
5. [Imagens de satélite mensais do ano de 2021 de resolução espacial de 4,77 m](https://developers.google.com/earth-engine/datasets/catalog/projects_planet-nicfi_assets_basemaps_americas), dados da Planet & NICFI para o monitoramento de florestas tropicais, disponibilizados no GEE. 
6. Dados de altura de vegetação [(VHM)](https://www.kaggle.com/datasets/andasampa/height-model?select=0-VHM-sao-paulo-city.tif), de altura de edificações [(BHM)](https://www.kaggle.com/datasets/andasampa/height-model?select=0-BHM-sao-paulo-city.tif) e modelo digital de terreno [(MDT)](https://www.kaggle.com/datasets/andasampa/dtm-dsm-sao-paulo?select=MDT_sampa-ZSTD.tif), obtidos a partir de dados LiDAR de 2017 e disponibilizados na plataforma Kaggle, com resolução espacial de 50cm.  
7. Dados de Uso e Cobertura da Terra da Coleção 7 do MapBiomas, disponibilizada em 2022 na plataforma do [MapBiomas](https://mapbiomas.org/). 
 -->
 
---


<h2>INTERFACES DESENVOLVIDAS</h2>

|![Versão 1](https://user-images.githubusercontent.com/115759359/228312825-68c25c7e-46ed-4cc0-9bf5-49831c3e1c59.png)  |  ![Versão 2](https://user-images.githubusercontent.com/115759359/228312338-91fec50e-d054-4ebd-b308-67e093f9b628.png)|
|:-------------------------:|:-------------------------:|
|[`Versão 1 da Interface`](https://formigas.users.earthengine.app/view/formigas-de-embauba)   |  [`Versão Final da Interface`](https://formigas.users.earthengine.app/view/miniflorestas)|


 
