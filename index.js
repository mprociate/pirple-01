e strict';

// Gather dependencies
var url = require('url'),
    http = require('http'),
    decoder = new (require('string_decoder')).StringDecoder('utf-8');

// Instantiate the HTTP server
var httpServer = http.createServer((request, response) => {

    // Get the URL and parse it
    var parsedURL = url.parse(request.url, true);

    // Get the path (sans exterior slashes) from the URL
    var path = parsedURL.pathname.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    var queryStringObject = parsedURL.query;

    // Get the HTTP Method
    var method = request.method.toUpperCase();

    // Get the headers as an object
    var headers = request.headers;

    // Get any POST payload
    var buffer = '';
    request.addListener('data', data => { buffer += decoder.write(data); });
    request.addListener('end', () => {
        buffer += decoder.end();

        // Route request
        var handler = route({
            hello(data, callback) {
                var quotes = [
                    "Love For All, Hatred For None.",
                    "Change the world by being yourself.",
                    "Every moment is a fresh beginning.",
                    "Never regret anything that made you smile.",
                    "Die with memories, not dreams.",
                    "Aspire to inspire before we expire.",
                    "Everything you can imagine is real.",
                    "Simplicity is the ultimate sophistication.",
                    "Whatever you do, do it well.",
                    "What we think, we become.",
                    "All limitations are self-imposed.",
                    "Tough times never last but tough people do.",
                    "Problems are not stop signs, they are guidelines.",
                    "One day the people that don't even believe in you will tell everyone how they met you.",
                    "If im gonna tell a real story, im gonna start with my name.",
                    "If you tell the truth you don't have to remember anything.",
                    "Have enough courage to start and enough heart to finish.",
                    "Hate comes from intimidation, love comes from appreciation.",
                    "I could agree with you but then we'd both be wrong.",
                    "Oh the things you can find, if you don't stay behind.",
                    "Determine your priorities and focus on them.",
                    "Be so good they can't ignore you.",
                    "Dream as if you'll live forever, live as if you'll die today.",
                    "Yesterday you said tomorrow. Just do it.",
                    "I don't need it to be easy, I need it to be worth it.",
                    "Never let your emotions over power your intelligence.",
                    "Nothing lasts forever but at least we got these memories.",
                    "Don't you know your imperfections is a blessing?",
                    "Reality is wrong, dreams are for real.",
                    "To live will be an awfully big adventure.",
                    "Try to be a rainbow in someone's cloud.",
                    "There is no substitute for hard work.",
                    "What consumes your mind controls your life- Unknown",
                    "Strive for greatness.",
                    "Wanting to be someone else is a waste of who you are.",
                    "And still I rise.",
                    "The time is always right to do what is right.",
                    "Let the beauty of what you love be what you do.",
                    "May your choices reflect your hopes, not your fears.",
                    "A happy soul is the best shield for a cruel world.",
                    "White is not always light and black is not always dark.",
                    "Life becomes easier when you learn to accept the apology you never got.",
                    "Happiness depends upon ourselves.",
                    "Turn your wounds into wisdom.",
                    "Change the game, don't let the game change you.",
                    "It hurt because it mattered.",
                    "If the world was blind how many people would you impress?",
                    "I will remember and recover, not forgive and forget.",
                    "The meaning of life is to give life meaning.",
                    "The true meaning of life is to plant trees, under whose shade you do not expect to sit.",
                    "When words fail, music speaks.",
                    "Embrace the glorious mess that you are.",
                    "Normality is a paved road: it's comfortable to walk but no flowers grow.",
                    "I have nothing to lose but something to gain."
                ];

                // Only acknowledge POST (as per the assignment)
                if (method == 'POST') {
                    callback(200, { welcome: quotes[Date.now() % quotes.length] });
                } else {
                    callback(404, {});
                }
            },
            ping(data, callback) {
                callback(200);
            },
        }, path);

        // Construct the data object to supply to the handler
        var data = {
            path: path,
            queryStringObject: queryStringObject,
            method: method,
            headers: headers,
            payload: buffer,
        };

        // Invoke method
        handler(data, (statusCode, payload) => {
            // Use the supplied statusCode, or 200 if no code is provided
            statusCode = typeof statusCode == 'number' ? statusCode : 200;

            // Use the supplied payload, or an empty object
            payload = typeof payload == 'object' ? payload : {};

            // Convert payload to a string
            var json = JSON.stringify(payload);

            // Send the response
            response.setHeader('Content-Type', 'application/json');
            response.writeHead(statusCode);
            response.end(json + '\n');

            // Log the request
            console.log('Returning', statusCode, json);
        });
    });
});

// Start the HTTP server
httpServer.listen(3000, () => {
    console.log('Listening on', 3000);
});

// Define a hierarchical router
function route(actions, request) {
    var method;

    // Convert request string to an array
    request = request.split('/');

    // Nab the first element by mutating the array
    method = request.shift();

    // Verify the method makes sense
    if (actions[method]) {
        // actions[method] is defined
        if (Array.isArray(actions[method])) {
            if (request.length) {
                // Recurse to seek the ultimate method
                return route(actions[method], request.join('/'));
            } else {
                // Forbidden
                return error(403);
            }
        } else {
            if (request.length) {
                // Incomplete method
                return error(404);
            } else {
                // Method found
                return actions[method];
            }
        }
    } else {
        // Method not found
        return error(404);
    }

    // Generic error
    function error(code) {
        return (data, callback) => {
            callback(code);
        };
    }
}

