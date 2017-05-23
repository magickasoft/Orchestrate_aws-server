var fs = require("fs");

function mkdir(path, root) {

    var dirs = path.split('/'),
            dir = dirs.shift(),
            root = (root || '') + dir + '/';

    try { fs.mkdirSync(root); }
    catch (e) {
        //dir wasn't made, something went wrong
        if(!fs.statSync(root).isDirectory()) throw new Error(e);
    }

    return !dirs.length || mkdir(dirs.join('/'), root);
}


mkdir( "D:/src/toby-balsley/project-orchestrate/public/sounds/1231231/123/ABC");
