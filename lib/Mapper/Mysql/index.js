var mysql=  require('mysql'),
    Query= new require('sql-query').Query('mysql');




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

    Object.defineProperty(this, 'schema', {
        value: options.schema
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
                console.log(err)
            } else {
                console.log('The solution is:', rows[0].solution)
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


    if (schema.id) {
        sql= Query.update().into(table).set(data).where({id:schema.id}).build()
    } else {
        sql= Query.insert().into(table).set(data).build()
    }

    saveOrRemove.call(this, schema, table, sql, function(err, result) {
        if (err) {
            done(err)
        } else {
            done(null);
        }
    })
}





Mapper.prototype.remove= function(schema, table, done) {
    if (schema.id) {
        sql= Query.remove().from(table).where({id: schema.id}).build()

        saveOrRemove.call(this, schema, table, sql, function(err, result) {
            if (err) {
                done(err)
            } else {
                done(null);
            }
        })
    } else {
        done('id undefined')
    }
}





Mapper.prototype.findOne= function(Schema, table, id, done) {
    fields= Object.keys(Schema.properties)
    sql= Query.select().from(table).select(fields).where({id: id}).limit(1).build()

    findElem.call(this, Schema, table, sql, function(err,model) {
        if (err) {
            done(err,null)
        } else {
            done(null,model)
        }
    })
}





Mapper.prototype.find= function(Schema, table, condition, done) {
    fields= Object.keys(Schema.properties)
    sql= Query.select().from(table).select(fields).where(condition).build()

    findArray.call(this, Schema, table, sql, function(err,models) {
        if (err) {
            done(err,null)
        } else {
            done(null,models)
        }
    })
}









function saveOrRemove(schema, table, sql, done) {
    this.pool.getConnection(function(err, connection) {
        connection.query(sql, function(err, result) {
            if (err) {
                done(err)
            } else {
                done(null);
            }
            connection.end();
        })
    });
}






function findElem(Schema, table, id, sql, done) {
    this.pool.getConnection(function(err, connection) {
        connection.query(sql, function(err, result) {
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






function findArray(Schema, table, condition, sql, done) {
    this.pool.getConnection(function(err, connection) {
        connection.query(sql, function(err, result) {
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




