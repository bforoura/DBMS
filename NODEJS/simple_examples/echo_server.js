// Simple HTTP Server that Echos Query Strings
 
const http = require('http');
const url = require('url');

const PORT = 3001;

const server = http.createServer((req, res) => {

    // 1. Parse the request URL. The 'true' argument ensures the query string
    // is parsed into a JavaScript object (parsedUrl.query).
    const parsedUrl = url.parse(req.url, true);
    const queryParameters = parsedUrl.query;

    // Log the received data to the Node.js console
    console.log('--- RECEIVED QUERY PARAMETERS ---');
    console.log(`URL Path: ${parsedUrl.pathname}`);
    console.log('Parameters:', queryParameters);
    console.log('---------------------------------');

    // Set response headers for a clean HTML response
    res.writeHead(200, {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*', // Required since the HTML file is opened directly (file://)
    });

    // Generate the HTML response to echo the data
    let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Query Echo Response</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                body { font-family: 'Inter', sans-serif; }
            </style>
        </head>
        <body class="p-8 bg-indigo-50 min-h-screen">
            <div class="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <h1 class="text-3xl font-bold text-indigo-700 mb-4">Query String Received</h1>
                <p class="mb-4 text-gray-600">The server successfully read the following data from the URL query string:</p>

                <h2 class="text-xl font-semibold mb-2">Raw Query String:</h2>
                <div class="bg-yellow-100 text-yellow-800 p-4 rounded-lg font-mono break-words mb-6">
                    ${parsedUrl.search || '(none)'}
                </div>

                <h2 class="text-xl font-semibold mb-2">Parsed JSON Object:</h2>
                <pre class="bg-gray-800 text-green-400 p-6 rounded-lg overflow-x-auto text-sm"><code>${JSON.stringify(queryParameters, null, 2)}</code></pre>

                <p class="mt-6 text-sm text-gray-500">Each key (like <code>txbox</code>, <code>color</code>, <code>fruit</code>) corresponds to a form field's <code>name</code> attribute.</p>

                <a href="http://localhost:3001/" class="mt-8 inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150">
                    ← Try Another Form Submission
                </a>
            </div>
        </body>
        </html>
    `;

    // Send the response back to the client
    res.end(htmlContent);
});

server.listen(PORT, () => {
    // FIX: Removed the unnecessary backslashes (\) that were incorrectly escaping the template literal syntax.
    console.log(`Simple Echo Server running at http://localhost:${PORT}/`);
    console.log('Ready to receive form submissions from your HTML file.');
});