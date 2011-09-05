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

/**
 * Classe para validação de sessão no banco de dados
 * 
 * Faz a conexão no banco de dados (no caso MongoDB),
 * acessa coleção/tabela de sessções e busca pelo ID
 * informado (normalmente a sessão corrente).
 * 
 */
var MongoSession = exports.MongoSession = function(config) {
	/**
	 * Carregamento das classes necessárias a comunicação com MongoDB
	 * Utiliza o módulo mongodb-native para conexão (instalar via NPM).
	 */ 
	var Db = require('mongodb').Db,
		Server = require('mongodb').Server;
	
	this.settings = {
		db: {
			host: 'localhost',
			port: '27017',
			database: 'default',
			collection: 'default',
			username: false,
			password: false
		},
		cipher: {
			iv: '',
			key: ''
		}
	};
	
	this.db = null;

	this.value = null;
	
	this.conn = null;
	
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
	 * Efetua conexão com banco de dados que contém
	 * dados da sessão.
	 * 
	 * Conexão fica aberta, disponível para verificação
	 * da sessão.
	 */
	this.connect = function() {
		var self = this;
		
		if(self.db === null) {
			self.conn.open(function(err, db) {
				if(db === null)
				{
					console.log("Session: Não foi possível abrir o BD.");
					console.log(err);
					
					return false;
				}
				
				self.db = db;
			});
		}
	};
	
	/**
	 * Método responsável por retornar um determinado valor da sessão
	 * salva no banco.
	 *  
	 * Recebe como parâmetro o id da sessão (session) e o campo (field) que deverá
	 * será passado ao callback (callback).
	 */
	this.check = function(session, field, callback) {
		var self = this;
		
		if(self.db === null) {
			console.log("Session: É preciso conectar ao Banco antes de utilizar seus dados.");
			return false;
		}
		
		self.db.collection(this.settings.db.collection, function(err, collection) {
			if(collection === null)
			{
				console.log("Session: Não é possível acessar a coleção.");
				console.log(err);
					
				return false;
			}
			
			collection.findOne({'_id': session}, function(err, doc) {
				
				if(typeof doc != 'undefined' && typeof doc[field] != 'undefined') {
					self.value = doc[field];
					
					callback(err, doc[field]);
				}
				else {
					callback(err, null);
				}
				
			});
		});
		
		return self.value;
	};
	
	/**
	 * Inicialização dos atributos
	 */
	
	if(typeof config != 'undefined' && config !== null) {
		this.settings = this.mergeProperties(this.settings, config);
	}
	
	this.conn = new Db(this.settings.db.database, new Server(this.settings.db.host, this.settings.db.port, {}));
	
	this.connect();
};