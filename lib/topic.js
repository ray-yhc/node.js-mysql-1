var http = require('http');
var url = require('url');
var qs = require('querystring');

var template = require('./template.js');
var db = require('./db');

exports.home = (request, response) => {
    db.query('SELECT * FROM topic', (error, topics, fields) => {
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template.list(topics);
        var html = template.HTML(
            title,
            list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`
        );
        response.writeHead(200);
        response.end(html);
    });
};

exports.page = (request, response) => {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    db.query('SELECT id,title FROM topic', (error, topics, fields) => {
        if (error) {
            throw error;
        }
        db.query(
            'SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?',
            [queryData.id],
            (error2, aTopic, fields) => {
                if (error2) {
                    throw error;
                }
                var title = aTopic[0].title;
                var description = aTopic[0].description;
                var list = template.list(topics);
                var html = template.HTML(
                    title,
                    list,
                    `<h2>${title}</h2>${description} <br></br>by ${aTopic[0].name}`,
                    `<a href="/create">create</a>
                <a href="/update?id=${queryData.id}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${queryData.id}">
                  <input type="submit" value="delete">
                </form>`
                );
                response.writeHead(200);
                response.end(html);
            }
        );
    });
};

exports.create = (request, response) => {
    db.query('SELECT * FROM topic', (error, topics, fields) => {
        db.query('SELECT *FROM author', (error2, authors) => {
            var title = 'WEB - create';
            var list = template.list(topics);
            var html = template.HTML(
                title,
                list,
                `<form action="/create_process" method="post">
                <p><input type="text" name="title" placeholder="title"></p>
                <p>
                  <textarea name="description" placeholder="description"></textarea>
                </p><p>${template.authorSelect(authors)}
                </p>
                <p>
                  <input type="submit">
                </p>
              </form>`,
                '<a href="/create">create</a>'
            );
            response.writeHead(200);
            response.end(html);
        });
    });
};

exports.create_process = (request, response) => {
    var body = '';
    request.on('data', function(data) {
        body = body + data;
    });
    request.on('end', function() {
        var post = qs.parse(body);
        db.query(
            'INSERT INTO topic(title,description,created,author_id) VALUES(?,?,Now(),?);',
            [post.title, post.description, post.author],
            (error, result) => {
                if (error) {
                    throw error;
                }
                console.log(result);
                response.writeHead(302, { Location: `/?id=${result.insertId}` });
                response.end();
            }
        );
    });
};

exports.update = (request, response) => {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    db.query('SELECT * FROM topic', (error, topics, fields) => {
        if (error) {
            throw error;
        }
        db.query('SELECT * FROM topic WHERE id=?', [queryData.id], (error2, aTopic, fields) => {
            if (error2) {
                throw error;
            }
            db.query('SELECT *FROM author', (error3, authors) => {
                var title = aTopic[0].title;
                var description = aTopic[0].description;
                var list = template.list(topics);
                var html = template.HTML(
                    title,
                    list,
                    `<form action="/update_process" method="post">
                  <input type="hidden" name="id" value="${queryData.id}">
                  <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                  <p>
                    <textarea name="description" placeholder="description">${description}</textarea>
                  </p><p>${template.authorSelect(authors, aTopic[0].author_id)}
                    </p>
                  <p>
                    <input type="submit">
                  </p>
                </form>`,
                    `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        });
    });
};

exports.update_process = (request, response) => {
    var body = '';
    request.on('data', function(data) {
        body = body + data;
    });
    request.on('end', function() {
        var post = qs.parse(body);
        db.query(
            'UPDATE topic SET title=?,description=?,author_id=? WHERE id=?',
            [post.title, post.description,post.author, post.id],
            (error, result) => {
                if (error) {
                    throw error;
                }
                response.writeHead(302, { Location: `/?id=${post.id}` });
                response.end();
            }
        );
    });
};

exports.delete_process = (request, response) => {
    var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            console.log(post.title);
            db.query('DELETE FROM topic WHERE id=?', [post.id], (error, result) => {
                if (error) {
                    throw error;
                }
                response.writeHead(302, { Location: `/` });
                response.end();
            });
        });
};
