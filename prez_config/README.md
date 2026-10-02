# Prez API Config
This directory contains the config files for the IDN Prez API. These folders are mounted within the container rather than be loaded into Fuseki. This replaces the default config that comes with Prez to allow for greater control.

## Endpoints
The API endpoints defined in the [`endpoints/`](./endpoints) directory are:

(each endpoint level's path prefixed with `../` contains the last endpoint path of the level above)

<table>
<thead>
<tr>
<th>Level</th>
<th>Endpoint</th>
<th>Parent</th>
<th>Predicate</th>
<th>Class</th>
</tr>
</thead>
<tbody>
<tr>
<td>1</td>
<td><code>/catalogs</code><br/><code>/catalogs/{catalogId}</code></td>
<td></td>
<td></td>
<td><code>schema:DataCatalog</code></td>
</tr>
<tr>
<td>2</td>
<td><code>../collections</code><br/><code>../collections/{recordsCollectionId}</code></td>
<td><code>schema:DataCatalog</code></td>
<td><code>schema:hasPart</code></td>
<td><code>skos:Collection</code><br/><code>skos:ConceptScheme</code><br/><code>schema:Dataset</code><br/><code>schema:CreativeWork</code></td>
</tr>
<tr>
<td rowspan="3">3</td>
<td rowspan="3"><code>../items</code><br/><code>../items/{itemId}</code></td>
<td><code>skos:ConceptScheme</code></td>
<td><code>skos:inScheme</code></td>
<td><code>skos:Concept</code><br/><code>skos:Collection</code></td>
</tr>
<tr>
<td><code>skos:Collection</code></td>
<td><code>skos:member</code></td>
<td><code>skos:Concept</code></td>
</tr>
<tr>
<td><code>schema:Dataset</code></td>
<td><code>rdfs:member</code></td>
<td><code>geo:FeatureCollection</code></td>
</tr>
<tr>
<td>4</td>
<td><code>../features</code><br/><code>../features/{featureId}</code></td>
<td><code>geo:FeatureCollection</code></td>
<td><code>rdfs:member</code></td>
<td><code>geo:Feature</code></td>
</tr>
</tbody>
</table>

## Profiles
The profiles defined in the [`profiles/`](./profiles) directory are:

- **Index Profile** - `prez:Index`
  - The top-level system profile where default profiles for classes are defined
- **Catalogue Items** - `prez:CatalogItemsProfile`
    - The main listing profile for the catalogue's children, returning:
        - `schema:additionalType`
        - `schema:status`
        - `schema:keywords`
- **Vocabulary Metadata Profile** - `prez:VocabProfile`
  - For nicely displaying metadata for vocabularies
- **ATNS Entity presentation profile** - `prez:AtnsEntityProfile`
    - Presents an ATNS entity with embedded reference metadata, preserved incoming and outgoing relationship rows, and spatial feature details for an on-demand map, while omitting source deletion flags.
- **ODRL Agreement presentation profile** - `prez:OdrlAgreementProfile`
    - Presents an ODRL Agreement with its named Permission rules, actions, parties, targets and available target geometry.
- **RiC-O Record presentation profile** - `prez:RiCORecordProfile`
    - Presents a RiC-O Record and the descriptive metadata of its analogue, digital, derived or otherwise identified Instantiations on the same page.
- **Spatial List Profile** - `prez:SpatialListProfile`
  - A listing profile for spatial features
- **Spatial Object Profile** - `prez:SpatialObjectProfile`
  - An item profile for spatial features
- **Members** - `<https://w3id.org/profile/mem>`
    - A fallback listing profile that returns no extra metadata
- **Alternates Profile** - `altr-ext:alt-profile`
    - For returning all alternative profile options for an endpoint
- **Profiles Profile** - `prez:ProfileProfile`
    - For returning metadata for Profiles
- **Open Profile** - `prez:OpenProfile`
    - A fallback profile for items that returns all metadata
- **CQL List Profile** - `prez:CQLListProfile`
    - A profile defining the metadata returned when using CQL queries

### Facet Profiles
These profiles can be used for filtering on list pages, including search. There is one facet profile defined in the profiles file:

- IDN Facet Profile - `prez:FacetProfile` (`"idn-facet"`)
  - `rdf:type`
  - `schema:additionalType`
  - `schema:status`
  - `schema:keywords`

## Prefixes
Defined in the [`prefixes/`](./prefixes) directory, the following custom prefixes are defined:

- `pid:` - `<https://data.idnau.org/pid/>`
- `vocab:` - `<https://data.idnau.org/pid/vocab/>`
