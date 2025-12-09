import { createClient } from '@supabase/supabase-js'

const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php"

async function fetchImageForAuthor(name) {
    try {
        const url = `${WIKIPEDIA_API}?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=600&origin=*`
        const response = await fetch(url)
        const data = await response.json()
        const pages = data.query.pages
        const pageId = Object.keys(pages)[0]
        if (pageId === "-1") return null
        const page = pages[pageId]
        if (page.thumbnail && page.thumbnail.source) {
            return page.thumbnail.source
        }
        return null
    } catch (error) {
        return null
    }
}

const fetchOriginal = async (name) => {
    try {
        const url = `${WIKIPEDIA_API}?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&piprop=original&origin=*`
        const response = await fetch(url)
        const data = await response.json()
        const pages = data.query.pages
        const pageId = Object.keys(pages)[0]
        if (pageId === "-1") return null
        return pages[pageId].original ? pages[pageId].original.source : null
    } catch (e) { return null }
}

const logSplit = (label, url) => {
    console.log(label)
    if (!url) { console.log("NULL"); return; }
    for (let i = 0; i < url.length; i += 50) {
        console.log(url.substring(i, i + 50));
    }
}

async function run() {
    logSplit("HEMINGWAY THUMB:", await fetchImageForAuthor("Ernest Hemingway"))
    logSplit("HEMINGWAY ORIG:", await fetchOriginal("Ernest Hemingway"))
    logSplit("POUND THUMB:", await fetchImageForAuthor("Ezra Pound"))
    logSplit("POUND ORIG:", await fetchOriginal("Ezra Pound"))
}

run()
