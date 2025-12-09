import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

// ----------------------------------------------------
// 1. PASTE YOUR LIST OF AUTHORS HERE
// ----------------------------------------------------
const authorsList = [
    "Ezra Pound",
    "John Keats",
    "Geoffrey Chaucer",
    "Søren Kierkegaard",
    "William Gaddis",
    "Lord Byron",
    "Percy Shelley"
]

// ----------------------------------------------------
// Configuration
// ----------------------------------------------------
const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php"

async function fetchImageForAuthor(name) {
    try {
        const url = `${WIKIPEDIA_API}?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=600&origin=*`
        const response = await fetch(url)
        const data = await response.json()

        const pages = data.query.pages
        const pageId = Object.keys(pages)[0]

        if (pageId === "-1") {
            console.error(`[!] No Wikipedia page found for: ${name}`)
            return null
        }

        const page = pages[pageId]
        if (page.thumbnail && page.thumbnail.source) {
            console.error(`[+] Found image for: ${name}`)
            return page.thumbnail.source
        } else {
            console.error(`[-] No image found on page for: ${name}`)
            return null
        }
    } catch (error) {
        console.error(`[x] Error fetching ${name}:`, error.message)
        return null
    }
}

async function generateSQL() {
    console.error("-- Generating SQL for adding authors...\n")

    const values = []

    for (const name of authorsList) {
        const imageUrl = await fetchImageForAuthor(name)
        // Wikipedia API has rate limits, let's be polite (optional, but good practice)
        // await new Promise(r => setTimeout(r, 100)) 

        // Escape single quotes for SQL
        const safeName = name.replace(/'/g, "''")
        const safeUrl = imageUrl ? `'${imageUrl}'` : 'NULL'

        values.push(`('${safeName}', ${safeUrl})`)
    }

    const sql = `
    INSERT INTO authors (name, image_url)
    VALUES 
    ${values.join(',\n    ')};
  `

    console.log(sql)
}

generateSQL()
