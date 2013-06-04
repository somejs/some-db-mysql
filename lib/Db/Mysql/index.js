var mysql=  require('mysql'),
    Query= new require('sql-query').Query('mysql');




var Db= module.exports= function(options) {
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






Db.prototype.test= function() {
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





Db.prototype.save= function(schema, table, done) {
    data= {}
    Object.keys(schema).map(function(key) {
        data[key]= schema[key]
    })


    if (schema.id) {
        sql= Query.update().into(table).set(data).where({id:schema.id}).build()
    } else {
        sql= Query.insert().into(table).set(data).build()
    }


    Db.query.call(this, sql, function(err, result) {
        if (err) {
            done(err)
        } else {
            done(null);
        }
    })
}





Db.prototype.remove= function(schema, table, done) {
    if (schema.id) {
        sql= Query.remove().from(table).where({id: schema.id}).build()

        Db.query.call(this, sql, function(err, result) {
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





Db.prototype.findOne= function(Schema, table, condition, done) {
    fields= Object.keys(Schema.properties)
    sql= Query.select().from(table).select(fields).where(condition).limit(1).build()

    Db.query.call(this, sql, function(err, result) {
        if (err) {
            done(err)
        } else {
            if (result.length > 0) {
                newModel= new Schema(result[0])
                done(null,newModel)
            } else {
                done(null,null)
            }
        }
    })
}





Db.prototype.find= function(Schema, table, condition, done) {
    fields= Object.keys(Schema.properties)
    sql= Query.select().from(table).select(fields).where(condition).build()

    Db.query.call(this, sql, function(err, result) {
        if (err) {
            done(err)
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
    })
}






Db.query= function(sql, done) {
    this.pool.getConnection(function(err, connection) {
        connection.query(sql, function(err, result) {
            if (err) {
                done(err,null)
            } else {
                done(null,result)
            }
            connection.end();
        })
    });
}