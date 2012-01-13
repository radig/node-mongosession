/**
 * Copyright 2011, Radig Soluções em TI. (http://www.radig.com.br)
 *
 * Licensed under The MIT License
 * Redistributions of files must retain the above copyright notice.
 *
 * @filesource
 * @copyright     Copyright 2011, Radig Soluções em TI. (http://www.radig.com.br)
 * @link          http://www.radig.com.br
 * @package       radig
 * @subpackage    radig.sessions
 * @license       http://www.opensource.org/licenses/mit-license.php The MIT License
 */

var Db = require('mongodb').Db,
	Server = require('mongodb').Server,
	util = require('util');

/**
 * Classe para validação de sessão no banco de dados
 * 
 * Faz a conexão no banco de dados (no caso MongoDB),
 * acessa coleção/tabela de sessções e busca pelo ID
 * informado (normalmente a sessão corrente).
 * 
 */
exports.MongoSession = function(config) {
	
	this.settings = {
		host: 'localhost',
		port: 27017,
		database: 'default',
		collection: 'default',
		username: false,
		password: false
	};
	
	/**
	 * 
	 * @var Db interface com MongoDB
	 */
	this.MongoDB = null;
	
	/**
	 *
	 * @var Collection interface direta com uma coleção
	 * do MongoDB
	 */
	this.data = null;
	
	/**
	 * Efetua conexão com banco de dados que contém
	 * dados da sessão.
	 * 
	 * Conexão fica aberta, disponível para verificação
	 * da sessão.
	 */
	this.connect = function() {
		var self = this;

		self.MongoDB.open(function(err, db) {
			if(db == null && err != null) {
				util.log("Session: Não foi possível abrir o BD.");
				util.log(err);
			}
			else {
				db.collection(self.settings.collection, function(err, collection) {
					if(collection == null && err != null) {
						util.log("Session: Não é possível acessar a coleção.");
						util.log(err);
					}
					else {
						self.data = collection;
					}
				});
			}
		});
	};
	
	/**
	 * Método responsável por retornar um determinado valor da sessão
	 * salva no banco.
	 *  
	 * Recebe como parâmetro o id da sessão (session) e o campo (field) que deverá
	 * ser passado ao callback (callback).
	 * 
	 * @param obj Object Classe que contém o callback
	 * @param session String
	 * @param field String
	 * @param callback Function
	 * @param pass Object
	 */
	this.check = function(obj, session, field, callback, pass) {
		var self = this;
		
		if(self.data !== null) {
			
			self.data.findOne({'_id': session}, function(err, doc) {
				if(err) {
					util.log("Session: Não foi possível recuperar a sessão de id " + session);
					util.log(err);
				}
				else if(typeof doc !== 'undefined' && typeof doc[field] !== 'undefined') {
					self.value = doc[field];
					
					if(typeof pass === 'undefined') {
						pass = null;
					}

					callback(obj, doc[field], pass);
				}
			});
		}
	};
	
	// --------------------------------------------------------------------
	// 
	// Daqui em diante pode ser considerado o construtor do objeto.
	// Inclua tudo que deve ser executado ao instanciar a classe.
	//
	// --------------------------------------------------------------------
	
	/**
	 * Mescla recursivamente os atributos de dois objetos
	 */
	this.mergeProperties = function(destination, source) {
		var self = this;
		
		for (var property in source) {
			if (source.hasOwnProperty(property) && (source[property] != '' && source[property] !== null)) {
				
				if(typeof source[property] == 'object' && source[property] !== null) {
					destination[property] = self.mergeProperties(destination[property], source[property]);
				}
				else {
					destination[property] = source[property];
				}
			}
		}
		
		return destination;
	};
	
	/**
	 * Inicialização dos atributos
	 */
	if(typeof config != 'undefined' && config !== null) {
		this.settings = this.mergeProperties(this.settings, config);
	}
	
	this.MongoDB = new Db(this.settings.database, new Server(this.settings.host, this.settings.port, {}));
	
	this.connect();
};