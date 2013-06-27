"use strict";

// -------------------------------------------------- Sync ---------------------------------------------------- //
// Overriding Backbone's sync method. Replace the default RESTful services-based implementation
// with a simple local database approach.
/*
 * 
    method – the CRUD method ("create", "read", "update", or "delete")
    model – the model to be saved (or collection to be read)
    options – success and error callbacks, and all other jQuery request options
*/

Backbone.sync = function(method, model, options) {
  var dao = new model.dao(directory.db);

  if (method === "read") {
      if (model.attributes) {
        if ( (model.attributes.taxonConceptId)) {
          dao.findByTaxonConceptId(model.attributes.taxonConceptId, function(data) {
              options.success(data);
          });
        }
        else if (model.attributes.taxonName) {
            dao.taxonName(model.taxonName, function(data) {
                options.success(data);
            });
        } 
        else if (model.attributes.collectionid) {
            dao.findByGalleryId(model.attributes.collectionid, function(data) {
                options.success(data);
            });
        }
        else if (model.attributes.fk_collectionid) {
            dao.findByGalleryId(model.attributes.fk_collection, function(data) {
                options.success(data);
            });
        }
        else if (model.attributes.pseudo) {
            dao.findByPseudo(model.attributes.pseudo, function(data) {
                options.success(data);
            });
        }
        else if (model.attributes.Tprofil_PK_Id) {
            dao.findById(model.attributes.Tprofil_PK_Id, function(data) {
                options.success(data);
            });
        }
        else {
            dao.findAll(function(data) {
                options.success(data);
            });
        }
      }
      else {
          dao.findAll(function(data) {
              options.success(data);
          });
      }
  }
  else if (method === "create") {
    if (model.attributes) {
        if ( (model.attributes.pseudo)) {
           dao.updatePseudoProfile(model, function(data) {
              options.success(data);
            });
        } 
        else if (model.attributes.fk_gallery) {
            dao.createScore(model, function(data) {
              options.success(data);
            });
        }
    }
    else {
      dao.createScore(model, function(data) {
       options.success(data);
      });
    }
  }
    
  else if (method === "update") {
      dao.updateGalleryActive(model, function(data) {
        options.success(data);  
      });
   }
 };



// -------------------------------------------------- DAO ---------------------------------------------------- //
// The Taxon Data Access Object (DAO). Encapsulates logic (in this case SQL statements) to access data.
directory.dao.TaxonDAO = function(db) {
    this.db = db;
};

directory.dao.GalleryDAO = function(db) {
    this.db = db;
};

directory.dao.ItemDAO = function(db) {
    this.db = db;
};

directory.dao.ProfilDAO = function(db) {
    this.db = db;
};
  
directory.dao.ScoreDAO= function(db) {
    this.db = db;
};

_.extend(
directory.dao.TaxonDAO.prototype, {

    findByName: function(key, callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT fk_collectionid , pageid , taxonConceptId, taxonName , flathierarchy, preferredCommonNames , textDesc_objectid , textDesc_title , textDesc_credits , textDesc_description, iucnStatus , image_objectid , image_title, image_credits , image_fileName " +
                    "FROM Ttaxons " +
                    "WHERE preferredCommonNames || taxonName LIKE ?  LIMIT 20";

                tx.executeSql(sql, ['%' + key + '%'], function(tx, results) {
                    var len = results.rows.length,
                        taxons = [],
                        i = 0;
                    for (; i < len; i = i + 1) {
                        taxons[i] = results.rows.item(i);
                    }
                    callback(taxons);
                });
            },
            function(tx, error) {
                console.log(tx);
            }
        );
    },

    findByTaxonConceptId: function(id, callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT fk_collectionid , pageid , taxonConceptId, taxonName , flathierarchy, preferredCommonNames , textDesc_objectid , textDesc_title , textDesc_credits , textDesc_description, iucnStatus , image_objectid , image_title, image_credits , image_fileName " +
                    "FROM Ttaxons " +
                    "WHERE taxonConceptId=?";
                tx.executeSql(sql, [id], function(tx, results) {
                    callback(results.rows.length === 1 ? results.rows.item(0) : null);
                });
            },
            function(tx, error) {
                console.log(tx);
            }
        );
    },
    
   findAllByCollectionid: function(id,callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT fk_collectionid , pageid , taxonConceptId, taxonName , flathierarchy, preferredCommonNames , textDesc_objectid , textDesc_title , textDesc_credits , textDesc_description, iucnStatus , image_objectid , image_title, image_credits , image_fileName " +
                    "FROM Ttaxons " +
                    "WHERE ','||fk_collectionid||',' LIKE ?";
             
                tx.executeSql(sql,['%,' +id+',%' ], function(tx, results) {
                    var len = results.rows.length,
                        taxons = [],
                        i = 0;
                    for (; i < len; i = i + 1) {
                        taxons[i] = results.rows.item(i);
                    }
                    callback(taxons);
                });
            },
            function(tx, error) {
                console.log(tx);
            }
        );
    },

    findAll: function(callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT fk_collectionid , pageid , taxonConceptId, taxonName , flathierarchy, preferredCommonNames , textDesc_objectid , textDesc_title , textDesc_credits , textDesc_description, iucnStatus , image_objectid , image_title, image_credits , image_fileName " +
                     "FROM Ttaxons LIMIT 10" +
             
                tx.executeSql(sql,[], function(tx, results) {
                    var len = results.rows.length,
                        galleries = [],
                        i = 0;
                    for (; i < len; i = i + 1) {
                        galleries[i] = results.rows.item(i);
                    }
                    callback(galleries);
                });
            },
            function(tx, error) {
                console.log(tx);
            }
        );
    },
    
    // Populate Taxon table with sample data
    populate: function(callback) {
        directory.db.transaction(
            function(tx) {
            },
            function(tx, error) {
                console.log(tx);
            },
            function(tx) {
                callback();
            }
        );
    }
}
);

_.extend(
directory.dao.GalleryDAO.prototype, {
    updateGalleryActive: function(model, callback) {
        this.db.transaction(
            function(tx) {
                var sql = "UPDATE Tgallery SET active= ? WHERE collectionid = ? ";
                tx.executeSql(sql, [model.get('active'), model.get('collectionid')]);
            },
            function(tx, error) {
                console.log(tx);
            }
        );
    },
    findByName: function(key, callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT collectionid , name, description, logo, level, ordre, active " +
                    "FROM Tgallery " +
                    "WHERE name LIKE ?  LIMIT 20";

                tx.executeSql(sql, ['%' + key + '%'], function(tx, results) {
                    var len = results.rows.length,
                        galleries = [],
                        i = 0;
                    for (; i < len; i = i + 1) {
                        galleries[i] = results.rows.item(i);
                    }
                    callback(galleries);
                });
            },
            function(tx, error) {
                console.log(tx);
            }
        );
    },

    findByGalleryId: function(id, callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT Tgallery_PK_Id, collectionid , name, description, logo, level, ordre, active "+
                    "FROM Tgallery " +
                    "WHERE collectionid = ? ";
                tx.executeSql(sql, [id], function(tx, results) {
                    callback(results.rows.length === 1 ? results.rows.item(0) : null);
                });
            },
            function(tx, error) {
                console.log(tx);
            }
        );
    },
    
    findAll: function(callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT Tgallery_PK_Id, collectionid , name, description, logo,level , ordre, active " +
                    "FROM Tgallery ORDER BY level, ordre ";
             
                tx.executeSql(sql,[], function(tx, results) {
                    var len = results.rows.length,
                        galleries = [],
                        i = 0;
                    for (; i < len; i = i + 1) {
                        galleries[i] = results.rows.item(i);
                    }
                    callback(galleries);
                });
            },
            function(tx, error) {
                console.log(tx);
            }
        );
    },
   
    populate: function(callback) {},
}
);

_.extend(
directory.dao.ItemDAO.prototype, {

    findByGalleryId: function(id, callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT *"+
                    "FROM Titems " +
                    "WHERE fk_collectionid = ? AND NOT INat = '' ";
                tx.executeSql(sql,[id], function(tx, results) {
                    var len = results.rows.length,
                        items = [],
                        i = 0;
                    for (; i < len; i = i + 1) {
                        items[i] = results.rows.item(i);
                    }
                    callback(items);
                });
            },
            function(tx, error) {
                console.log(tx);
            }
        );
    },
    
    findAll: function(callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT * FROM Titems LIMIT 50";
                    
                tx.executeSql(sql,[], function(tx, results) {
                    var len = results.rows.length,
                        items = [],
                        i = 0;
                    for (; i < len; i = i + 1) {
                        items[i] = results.rows.item(i);
                    }
                    callback(items);
                });
            },
            function(tx, error) {
                console.log(tx);
            }
        );
    },
   
    populate: function(callback) {},
}
);


_.extend(
directory.dao.ProfilDAO.prototype, {
/***
 *   defaults: {
    "Tprofil_PK_Id":null,
    "pseudo":"", 
    "avatar":"",
    "creationDate":new Date()
  },
 * ***/
  updatePseudoProfile: function(model, callback) {
        this.db.transaction(
            function(tx) {
                var sql = "UPDATE Tprofil SET pseudo= ? WHERE Tprofil_PK_Id = ? ";
                tx.executeSql(sql, [model.get('pseudo'), model.get('Tprofil_PK_Id')]);
            },
            function(tx, error) {
                console.log(tx);
            }
        );
    },

    findByPseudo: function(key, callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT * " +
                    "FROM Tprofil " +
                    "WHERE pseudo = ?  LIMIT 20";

                tx.executeSql(sql, [key], function(tx, results) {
                    var len = results.rows.length, profils = [], i = 0;
                    for (; i < len; i = i + 1) {
                        profils[i] = results.rows.item(i);
                    }
                    callback(profils);
                });
            },
            function(tx, error) {
                console.log(tx);
            }
        );
    },

    findById: function(id, callback) {
        this.db.transaction(
            function(tx) {
                var sql =  "SELECT * " +
                    "FROM Tprofil " +
                    "WHERE Tprofil_PK_Id=?";
                tx.executeSql(sql, [id], function(tx, results) {
                    callback(results.rows.length === 1 ? results.rows.item(0) : null);
                });
            },
            function(tx, error) {
                console.log(tx);
            }
        );
    },
    
    findAll: function(callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT * FROM Tprofil LIMIT 10" ;
             
                tx.executeSql(sql,[], function(tx, results) {
                    var len = results.rows.length, profils = [], i = 0;
                    for (; i < len; i = i + 1) {
                        profils[i] = results.rows.item(i);
                    }
                    callback(profils);
                });
            },
            function(tx, error) {
                console.log(tx);
            }
        );
    },
    
    // Populate Taxon table with sample data
    populate: function(callback) {
        
    }
}
);

_.extend(
directory.dao.ScoreDAO.prototype, {
/***
 *   defaults: {
    "Tprofil_PK_Id":null,
    "pseudo":"", 
    "avatar":"",
    "creationDate":new Date()
  },
 * ***/
    createScore: function(model, callback) {
        this.db.transaction(
            function(tx) {
                var sql = 'INSERT INTO  Tscore (fk_profil ,fk_gallery, gameDate , nbQuestionTotal, nbAnswerGood, nbAnswerGoodSequence, score) ' +
                          ' VALUES (?, ?, ?, ?, ?, ?,?) ';
                tx.executeSql(sql, [model.get('fk_profil'), model.get('fk_gallery'),model.get('gameDate'), model.get('nbQuestionTotal'), model.get('nbAnswerGood'),model.get('nbAnswerGoodSequence'),model.get('score')]);
            },
            function(tx, error) {
                console.log(tx);
            }
        );
    },
        updateScore: function(model, callback) {
        this.db.transaction(
            function(tx) {
                var sql = "UPDATE Tscore SET * WHERE fk_gallery = ? ";
                tx.executeSql(sql, [model.get('fk_gallery')]);
            },
            function(tx, error) {
                console.log(tx);
            }
        );
    },
   
    findAllScoreByProfilId: function(key, callback) {
        this.db.transaction(
            function(tx) {
                var sql = 'SELECT fk_gallery, MAX(score) AS score_max, gameDate FROM Tscore WHERE fk_profil = ? GROUP BY fk_gallery ';
                tx.executeSql(sql, [key], function(tx, results) {
                    var len = results.rows.length,
                        score = [],
                        i = 0;
                    for (; i < len; i = i + 1) {
                        score[i] = results.rows.item(i);
                    }
                    callback(score);
                });
            },
            function(tx, error) {
                console.log(tx);
            }
        );
    },
   
   findScoreMaxByGallery: function(callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT fk_gallery, MAX(score) AS score_max FROM Tscore GROUP BY fk_gallery";
                tx.executeSql(sql,[], function(tx, results) {
                    var len = results.rows.length,
                        items = [];
                    for (var i = 0; i < len; i++) {
                        items[i] = results.rows.item(i);
                    }
                    callback(items);
                });
            },
            function(tx, error) {
                console.log(tx);
            }
        );
    },
    
     findScoreMaxByGalleryId: function(id,callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT MAX(score) AS score_max FROM Tscore WHERE fk_gallery = ?";
                tx.executeSql(sql,[id], function(tx, results) {
                    var len = results.rows.length,
                        items = [];
                    for (var i = 0; i < len; i++) {
                        items[i] = results.rows.item(i);
                    }
                    callback(items);
                });
            },
            function(tx, error) {
                console.log(tx);
            }
        );
    },
    
     findAll: function(callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT * FROM Tscore ORDER BY Tscore_PK_Id DESC" ;
             
                tx.executeSql(sql,[], function(tx, results) {
                    var len = results.rows.length, profils = [], i = 0;
                    for (; i < len; i = i + 1) {
                        profils[i] = results.rows.item(i);
                    }
                    callback(profils);
                });
            },
            function(tx, error) {
                console.log(tx);
            }
        );
    },
    
    // Populate Taxon table with sample data
    populate: function(callback) {
        
    }
}
);
