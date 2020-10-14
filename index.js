const glob = require('glob')
const path = require('path')
const fs = require('fs')

const srcDir = path.resolve(__dirname, 'src')
const buildDir = path.resolve(__dirname, 'build')

const extensions = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg',
}

function compile(file) {
    const extension = path.extname(file)
    const mimeType = extensions[extension] || 'application/octet-stream'
    const contentSrc = fs.readFileSync(file)
    return `module.exports = 'data:${mimeType};base64,${contentSrc.toString('base64')}'`
}

module.exports.attachHooks = function () {
    Object.keys(extensions).forEach(extension => {
        require.extensions[extension] = function dataUrlHook(m, file) {
            return m._compile(compile(file), file);
        }
    })
}

if (require.main === module) {
    const globString = `**/*.{${Object.keys(extensions).map(s => s.substr(1)).join(',')}}`
    glob.sync(path.join(srcDir, globString)).forEach(fileSrc => {
        const contentBuild = compile(fileSrc)
        const fileRelative = path.relative(srcDir, fileSrc)
        const fileBuild = path.join(buildDir, fileRelative) + '.js'
        fs.mkdirSync(path.dirname(fileBuild), { recursive: true })
        fs.writeFileSync(fileBuild, contentBuild)
    })
}