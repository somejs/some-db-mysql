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




Mapper.prototype.save= function(table, schema, done) {
    data= {}
    Object.keys(schema).map(function(key) {
        data[key]= schema[key]
    })

    this.pool.getConnection(function(err, connection) {
        connection.query('INSERT INTO ' + table + ' SET ?', data, function(err, result) {
            if (err) {
                done(err)
            } else {
                done(null);
            }
            console.log(result)
        })
    });
}

Mapper.prototype.load= function(table, schema, done) {
    return 1
}

