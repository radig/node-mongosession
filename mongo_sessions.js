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
 * Carregamento das classes necessárias a comunicação com MongoDB
 * Utiliza o módulo mongodb-native para conexão (instalar via NPM).
 */ 
var Db = require('mongodb').Db,
	Connection = require('mongodb').Connection,
	Server = require('mongodb').Server,
	BSON = require('mongodb').BSONNative;

/**
 * Classe para validação de sessão no banco de dados
 * 
 * Faz a conexão no banco de dados (no caso MongoDB),
 * acessa coleção/tabela de sessções e busca pelo ID
 * informado (normalmente a sessão corrente).
 * 
 */
var MongoSession = exports.MongoSession = function() {
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
	
	this.conn = null;
	
	this.value = null;
	
	/**
	 * Efetua conexão com banco de dados que contém
	 * dados da sessão.
	 * 
	 * Conexão fica aberta, disponível para verificação
	 * da sessão.
	 */
	this.connect = function() {
		self = this;
		
		self.conn = new Db(self.settings.db.database, new Server(self.settings.db.host, self.settings.db.port, {}), {native_parser:true});
		
		self.conn.open(function(err, db) {
			if(db === null)
			{
				console.log("Session: Não foi possível abrir o BD.");
				console.log(err);
				
				return false;
			}
			
			self.db = db;
		});
	};
	
	/**
	 * Método responsável por retornar um determinado valor da sessão
	 * salva no banco.
	 *  
	 * Recebe como parâmetro o id da sessão (session) e o campo que deverá
	 * ser retornado (field).
	 */
	this.check = function(session, field) {
		self = this;
		
		// caso conexão ainda não tenha sido estabelecida, tenta estabeler uma
		if(self.db === null) {
			self.connect();
			
			// caso não haja sucesso, retorna false e printa mensagem no console
			if(self.db === null) {
				console.log("Session: É preciso conectar ao Banco antes de utilizar seus dados.");
				return false;
			}
		}
		
		self.db.collection(this.settings.db.collection, function(err, collection) {
			if(collection === null)
			{
				console.log("Session: Não é possível acessar a coleção.");
				console.log(err);
					
				return false;
			}
			
			collection.findOne({'_id': session}, function(err, doc) {
				if(doc != 'undefined') {
					self.value = doc[field];
				}
			});
		});
		
		return self.value;
	};
};