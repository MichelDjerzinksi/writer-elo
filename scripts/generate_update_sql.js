import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

// The 7 authors to fix
const authorsToFix = [
    "Ezra Pound",
    "John Keats",
    "Geoffrey Chaucer",
    "Søren Kierkegaard",
    "William Gaddis",
    "Lord Byron",
    "Percy Shelley"
]

const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php"

async function fetchOriginalImage(name) {
    try {
        // Fetch 'original' instead of thumbnail
        const url = `${WIKIPEDIA_API}?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&piprop=original&origin=*`
        const response = await fetch(url)
        const data = await response.json()

        const pages = data.query.pages
        const pageId = Object.keys(pages)[0]

        if (pageId === "-1") {
            console.error(`[!] No Wikipedia page found for: ${name}`)
            return null
        }

        const page = pages[pageId]
        if (page.original && page.original.source) {
            console.error(`[+] Found original image for: ${name}`)
            return page.original.source
        } else {
            console.error(`[-] No original image found for: ${name}`)
            return null
        }
    } catch (error) {
        console.error(`[x] Error fetching ${name}:`, error.message)
        return null
    }
}

async function generateUpdateSQL() {
    console.error("-- Fetching original images and generating UPDATE statements...\n")

    const statements = []

    for (const name of authorsToFix) {
        const imageUrl = await fetchOriginalImage(name)

        if (imageUrl) {
            // Escape single quotes for SQL
            const safeName = name.replace(/'/g, "''")
            const statement = `UPDATE authors SET image_url = '${imageUrl}' WHERE name = '${safeName}';`
            statements.push(statement)
        }
    }

    console.log("\n-- Run these commands in your Supabase SQL Editor:")
    console.log(statements.join('\n'))
}

generateUpdateSQL()
