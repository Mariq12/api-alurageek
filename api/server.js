const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const bodyParser = require('body-parser');

// Middleware para parsear el body de las solicitudes POST
server.use(bodyParser.json());

// Reescribir rutas para tener una API RESTful
server.use(jsonServer.rewriter({
    '/api/*': '/$1',
    '/product/:resource/:id/show': '/:resource/:id'
}));

// Middleware para habilitar CORS (Cross-Origin Resource Sharing)
server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Middleware para habilitar operaciones DELETE
server.delete('/api/:resource/:id', (req, res, next) => {
    const resource = req.params.resource;
    const id = parseInt(req.params.id);
    const data = router.db.get(resource).value();

    if (!data) {
        return res.status(404).json({ message: 'Resource not found' });
    }

    const item = data.find(item => item.id === id);
    if (!item) {
        return res.status(404).json({ message: 'Item not found' });
    }

    router.db.get(resource).remove({ id }).write();
    res.status(200).json({ message: 'Item deleted successfully' });
});

// Middleware para habilitar operaciones POST
server.post('/api/:resource', (req, res, next) => {
    const resource = req.params.resource;
    const newItem = req.body;

    const data = router.db.get(resource).value();
    if (!data) {
        return res.status(404).json({ message: 'Resource not found' });
    }

    newItem.id = Date.now(); // Asignar un ID único
    router.db.get(resource).push(newItem).write();
    res.status(201).json(newItem);
});

// Middleware para habilitar operaciones GET
server.get('/api/:resource', (req, res, next) => {
    const resource = req.params.resource;
    const data = router.db.get(resource).value();
    if (!data) {
        return res.status(404).json({ message: 'Resource not found' });
    }

    res.status(200).json(data);
});

// Use default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Use router middleware (json-server)
server.use(router);

server.listen(3000, () => {
    console.log('JSON Server is running');
});

module.exports = server;
