M-eol - Data extractor
=========

Extract data for all eol selected collection.
For each collection : 
 - Extract taxon detail
 - Build the unified hierarchy
 - Extract Inaturalist Data
 - Create a directory with all data : 
   - Data/
        - images_taxon/
        - images_collection/
        - hierarchies/
         - 1 file per collection 
        - detail_Taxon.json
        - collection_metadata.json
        - items.json
