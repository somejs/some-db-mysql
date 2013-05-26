var mysql= require('mysql');


var Mapper= module.exports= function(options) {
    options = options || {};


    Object.defineProperty(this, 'host', {
        enumerable: true,
        value: options.host
    });

    Object.defineProperty(this, 'user', {
        value: options.user
    });

    Object.defineProperty(this, 'password', {
        value: options.password
    });

    Object.defineProperty(this, 'database', {
        enumerable: true,
        value: options.database
    });

    this.pool= mysql.createPool({
        host     : this.host,
        user     : this.user,
        password : this.password,
        database : this.database
    });
}






function generateQuery(condition) {
    sqlQuery= []
    statement= Object.keys(condition)[0]
    ifStatement= statement.toUpperCase()

    if (ifStatement == 'OR' || ifStatement == 'AND' || ifStatement == 'XOR' || ifStatement == '!') {
        Object.keys(condition[statement]).map(function(key) {
            value= condition[statement][key]
            sqlQuery.push(key + ' = ' + mysql.escape(value))
        })
        sqlQuery= sqlQuery.join(' ' + ifStatement + ' ')
    } else {
        if (Object.keys(condition).length > 1) {
            return null
        } else {
            value= condition[statement]
            sqlQuery= statement + ' = ' + mysql.escape(value)
        }
    }

    return sqlQuery
}






Mapper.prototype.test= function() {
    this.pool.getConnection(function(err, connection) {
        connection.query('SELECT 1 + 1 AS solution', function(err, rows) {
            if (err) {
                done(err)
            } else {
                done('The solution is: ', rows[0].solution)
            }
            connection.end();
        });
    });
}




Mapper.prototype.save= function(schema, table, done) {
    data= {}
    Object.keys(schema).map(function(key) {
        data[key]= schema[key]
    })


    this.pool.getConnection(function(err, connection) {
        if (schema.id) {
            connection.query('UPDATE ?? SET ? WHERE id = ?', [table,data,schema.id], function(err, result) {
                if (err) {
                    done(err)
                } else {
                    done(null);
                }
                connection.end();
            })
        } else {
            connection.query('INSERT INTO ?? SET ?', [table,data], function(err, result) {
                if (err) {
                    done(err)
                } else {
                    done(null);
                }
                connection.end();
            })
        }
    });
}





Mapper.prototype.load= function(Schema, table, id, done) {
    fields= Object.keys(Schema.properties).join(',')

    this.pool.getConnection(function(err, connection) {
        connection.query('SELECT '+fields+' FROM ?? WHERE id = ? LIMIT 1', [table,id], function(err, result) {
            if (err) {
                done(err,null)
            } else {
                if (result.length > 0) {
                    newModel= new Schema(result[0])
                    done(null,newModel)
                } else {
                    done(null,null)
                }
            }
            connection.end();
        })
    });
}




Mapper.prototype.find= function(Schema, table, condition, done) {
    fields= Object.keys(Schema.properties).join(',')
    
    params= generateQuery(condition)
    

    this.pool.getConnection(function(err, connection) {
        connection.query('SELECT '+fields+' FROM ?? WHERE '+params, [table], function(err, result) {
            if (err) {
                done(err,null)
            } else {
                if (result.length > 0) {
                    out= []
                    for (var i = 0 ; i < result.length; i++) {
                        out.push(new Schema(result[i]))
                    }
                    done(null,out)
                } else {
                    done(null,null)
                }
            }
            connection.end();
        })
    });
}




Mapper.prototype.delete= function(schema, table, done) {
    if (schema.id) {
        this.pool.getConnection(function(err, connection) {
            connection.query('DELETE FROM ?? WHERE id = ?', [table,schema.id], function(err, result) {
                if (err) {
                    done(err)
                } else {
                    done(null)
                }
                connection.end();
            })
        });
    } else {
        done('id undefined')
    }
}



