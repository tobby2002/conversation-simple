var SimpleAPI;

SimpleAPI = (function() {

    var qs = require('querystring');

    /**
     * API Object model
     * @author Loreto Parisi (loretoparisi at gmail dot com)
     */
    function SimpleAPI(host,port,timeout,ssl,debug,json) {

        this.host=host;
        this.port=port;
        this.timeout=timeout;
        /** true to use ssl - defaults to true */
        this.ssl=ssl || true;
        /** true to console log */
        this.debug=debug;
        /** true to parse response as json - defaults to true */
        this.json= (typeof(json)!='undefined')?json:true;
        this.requestUrl='';
        if(ssl) { // use ssl
            this.http = require('https');
        } else { // go unsafe, debug only please
            this.http = require('http');
        }
    }

    /**
     * HTTP GET
     * @author Loreto Parisi (loretoparisi at gmail dot com)
     */
    SimpleAPI.prototype.Get = function(path, headers, params, success, error, timeout) {

        var self=this;
        if(params) {
            var queryString=qs.stringify(params);
            if( queryString ) {
                path+="?"+queryString;
            }
        }
        var options = {
            headers : headers,
            hostname: this.host,
            path: path,
            method: 'GET'
        };
        if(this.port && this.port!='80') { // port only if ! 80
            options['port']=this.port;
        }
        if(self.debug) {
            console.log( "SimpleAPI.Get", headers, params, options );
        }
        var request=this.http.get(options, function(response) {

            if(self.debug) { // debug
                console.log( JSON.stringify(response.headers) );
            }

            // Continuously update stream with data
            var body = '';
            response.on('data', function(d) {
                body += d;
            });
            response.on('end', function() {
                try {
                    if(self.json) {
                        var jsonResponse=JSON.parse(body);
                        if(success) return success( jsonResponse );
                    }
                    else {
                        if(success) return success( body );
                    }
                } catch(ex) { // bad json
                    if(error) return error( ex.toString() );
                }
            });
        });
        request.on('socket', function (socket) {
            socket.setTimeout( self.timeout );
            socket.on('timeout', function() {
                request.abort();
                if(timeout) return timeout( new Error('request timed out') );
            });
        });
        request.on('error', function (e) {
            // General error, i.e.
            //  - ECONNRESET - server closed the socket unexpectedly
            //  - ECONNREFUSED - server did not listen
            //  - HPE_INVALID_VERSION
            //  - HPE_INVALID_STATUS
            //  - ... (other HPE_* codes) - server returned garbage
            console.log(e);
            if(error) return error(e);
        });
        request.on('timeout', function () {
            // Timeout happend. Server received request, but not handled it
            // (i.e. doesn't send any response or it took to long).
            // You don't know what happend.
            // It will emit 'error' message as well (with ECONNRESET code).
            req.abort();
            if(timeout) return timeout( new Error('request timed out') );
        });

        self.requestUrl = (this.ssl?'https':'http') + '://' + request._headers['host'] + request.path;
        if(self.debug) {
            console.log("SimpleAPI.Post",self.requestUrl);
        }
        request.end();
    } //RequestGet

    /**
     * HTTP POST
     * @author Loreto Parisi (loretoparisi at gmail dot com)
     */
    SimpleAPI.prototype.Post = function(path, headers, params, body, success, error, timeout) {
        var self=this;

        if(params) {
            var queryString=qs.stringify(params);
            if( queryString ) {
                path+="?"+queryString;
            }
        }
        var bodyString=JSON.stringify(body)
        var _headers = {
            'Content-Length': Buffer.byteLength(bodyString)
        };
        for (var attrname in headers) { _headers[attrname] = headers[attrname]; }

        var options = {
            headers : _headers,
            hostname: this.host,
            path: path,
            method: 'POST',
            qs : qs.stringify(params)
        };
        if(this.port && this.port!='80') { // port only if ! 80
            options['port']=this.port;
        }
        if(self.debug) {
            console.log( "SimpleAPI.Post\n%s\n%s", JSON.stringify(_headers,null,2), JSON.stringify(options,null,2) );
        }
        if(self.debug) {
            console.log("SimpleAPI.Post body\n%s", JSON.stringify(body,null,2) );
        }
        var request=this.http.request(options, function(response) {

            if(self.debug) { // debug
                console.log( JSON.stringify(response.headers) );
            }

            // Continuously update stream with data
            var body = '';
            response.on('data', function(d) {
                body += d;
            });
            response.on('end', function() {
                try {
                    console.log("END", body);
                    var jsonResponse=JSON.parse(body);
                    if(success) return success( jsonResponse );
                } catch(ex) { // bad json
                    if(error) return error(ex.toString());
                }
            });

        });

        request.on('socket', function (socket) {
            socket.setTimeout( self.timeout );
            socket.on('timeout', function() {
                request.abort();
                if(timeout) return timeout( new Error('request timed out') );
            });
        });
        request.on('error', function (e) {
            // General error, i.e.
            //  - ECONNRESET - server closed the socket unexpectedly
            //  - ECONNREFUSED - server did not listen
            //  - HPE_INVALID_VERSION
            //  - HPE_INVALID_STATUS
            //  - ... (other HPE_* codes) - server returned garbage
            console.log(e);
            if(error) return error(e);
        });
        request.on('timeout', function () {
            // Timeout happend. Server received request, but not handled it
            // (i.e. doesn't send any response or it took to long).
            // You don't know what happend.
            // It will emit 'error' message as well (with ECONNRESET code).
            req.abort();
            if(timeout) return timeout( new Error('request timed out') );
        });

        self.requestUrl = (this.ssl?'https':'http') + '://' + request._headers['host'] + request.path;
        if(self.debug) {
            console.log("SimpleAPI.Post",self.requestUrl);
        }

        request.write( bodyString );
        request.end();

    } //RequestPost

    return SimpleAPI;

})();

module.exports = SimpleAPI