const fs = require('fs').promises;
const path = require('path');
const RESOURCES_FILE = path.join('utils', 'library.json');
async function viewBook(req, res) {
    try {
        const data = await fs.readFile(RESOURCES_FILE, 'utf8');
        let allResources;
        try {
            allResources = JSON.parse(data); // May throw syntax error
        } catch (parseError) {
            console.error('JSON parse failed:', parseError.message);
            return res.status(500).json({ message: 'Data file is corrupted.' });
            //handle Corrupted JSON
        }
        return res.status(200).json(allResources.books || []);
    } catch (error) {
        // Handle case where file does not exist yet
        if (error.code === 'ENOENT') {
            return res.status(200).json([]); // return empty list if no file
        }
        return res.status(500).json({ message: error.message });
    }
}
module.exports = { viewBook };