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




Mapper.prototype.test= function() {
    this.pool.getConnection(function(err, connection) {
        connection.query('SELECT 1 + 1 AS solution', function(err, rows) {
            if (err) {
                done(err)
            } else {
                console.log('The solution is: ', rows[0].solution);
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
            connection.query('UPDATE ' + table + ' SET ? WHERE id = ' + schema.id, data, function(err, result) {
                if (err) {
                    done(err)
                } else {
                    done(null);
                }
            })
        } else {
            connection.query('INSERT INTO ' + table + ' SET ?', data, function(err, result) {
                if (err) {
                    done(err)
                } else {
                    done(null);
                }
            })
        }
    });
}




Mapper.prototype.load= function(Schema, table, id, done) {
    fields= Object.keys(Schema.properties).join(',')

    this.pool.getConnection(function(err, connection) {
        connection.query('SELECT ' + fields + ' FROM ' + table + ' WHERE id = ' + id, function(err, result) {
            if (err) {
                done(err,null)
            } else {
                if (result.length > 0) {
                    newModel= new Schema
                    Object.keys(Schema.properties).map(function(key) {
                        newModel[key]= result[0][key]
                    })

                    done(null,newModel)
                } else {
                    done(null,null)
                }
            }
        })
    });
}



Mapper.prototype.delete= function(schema, table, done) {
    this.pool.getConnection(function(err, connection) {
        connection.query('DELETE FROM ' + table + ' WHERE id = ' + schema.id, function(err, result) {
            if (err) {
                done(err)
            } else {
                done(null)
            }
        })
    });
}